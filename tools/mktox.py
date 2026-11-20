#!/usr/bin/env python3
"""Gera data/toxicidade.json: nivel de hepatotoxicidade (0-4) e de nefrotoxicidade (0-3) por substancia, com a fonte, o link e o
trecho exato de onde cada informacao foi extraida.
 Hepatica: escore de verossimilhanca do LiverTox (NIH/NIDDK), categorias A-E. Capitulo sem escore -> sem nivel.
 Renal: (a) revisao Pazhayattil & Shirali 2014 (tools/tox/nefro_lit.py; citacoes verificadas literalmente) e
        (b) rotulos FDA via openFDA/DailyMed (caixa preta = 3, Advertencias/Precaucoes = 2, Reacoes adversas = 1); vale o maior.
Uso: python3 tools/mktox.py [--lt lt_all.json] [--fda dir_cache_openfda] [--paz PMC4270362.xml]
 (as opcoes regeneram os caches em tools/tox/cache/; sem elas usa os caches ja versionados)."""
import glob,json,os,re,sys
H=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(H)
sys.path.insert(0,os.path.join(H,'tox'))
from livertox_map import M as LTMAP,SEM_REGISTRO
from nefro_lit import LIT
CACHE=os.path.join(H,'tox','cache');os.makedirs(CACHE,exist_ok=True)
def norm(s): return re.sub(r'[^a-z0-9]+',' ',s.lower()).strip()
ALIAS={'b complex vitamins':'vitamin b complex','insulin isophane nph':'insulin human regular'}
def sid(en):
    n=norm(re.sub(r'[()]','',en));return ALIAS.get(n,n).replace(' ','_')
def args():
    a=sys.argv[1:];return {k[2:]:a[i+1] for i,k in enumerate(a) if k.startswith('--') and i+1<len(a)}
def universo():
    c=json.load(open(os.path.join(ROOT,'data','catalog.json'),encoding='utf8'))
    d=json.load(open(os.path.join(ROOT,'data','dose.json'),encoding='utf8'))['itens']
    p=json.load(open(os.path.join(ROOT,'data','posologia.json'),encoding='utf8'))
    U={}
    def add(en,key):
        if en: U.setdefault(en.strip(),[]).append(key)
    for k,v in c['mono'].items(): add(v.get('en'),k)
    for x in d:
        en=next((c['mono'][m]['en'] for m in x['mono'] if m in c['mono'] and c['mono'][m].get('en')),None) or p['itens'].get(x['id'],{}).get('f',{}).get('en')
        add(en,x['id'])
    for e in p['extras']: add(p['itens'][e['id']].get('f',{}).get('en'),e['id'])
    sys.path.insert(0,os.path.join(ROOT,'tools'))
    from codajas_map import LOTE1
    for z in LOTE1: add(z['en'],'cod_'+norm(z['en']).replace(' ','_'))
    return U,c
# ---------- LiverTox ----------
def cache_lt(lt_path):
    A=json.load(open(lt_path));use=set()
    for en,l in LTMAP.items(): use.update(ch for ch,_ in l)
    for en in U_:
        if en not in LTMAP and en not in SEM_REGISTRO:
            n=norm(re.sub(r'\(.*?\)','',en))
            for k,v in A.items():
                if norm(v['t'])==n: use.add(k);break
    out={k:A[k] for k in sorted(use) if k in A}
    json.dump(out,open(os.path.join(CACHE,'livertox.json'),'w'),ensure_ascii=False,separators=(',',':'));return out
LV={'A':4,'B':3,'C':2,'D':1,'E':0}
def lt_for(en,LT):
    ch=LTMAP.get(en)
    if en in SEM_REGISTRO: return None
    if ch is None:
        n=norm(re.sub(r'\(.*?\)','',en));k=next((k for k,v in LT.items() if norm(v['t'])==n),None)
        ch=[(k,None)] if k else None
    if not ch: return None
    srcs=[];best=None
    for cid,kw in ch:
        v=LT.get(cid)
        if not v: continue
        occ=v['ls']
        pick=None
        if occ:
            toks=[t for t in norm(en).split() if len(t)>4]
            if kw: pick=next((o for o in occ if kw.lower() in o['q'].lower()),None)
            if not pick and len(occ)>1: pick=next((o for o in occ if any(t in o['q'].lower() for t in toks)),None)
            pick=pick or occ[0]
        escopo='fármaco' if norm(v['t']).split()[0] in norm(en) or norm(en).split()[0] in norm(v['t']) else 'classe'
        s=dict(r='LTX',t=v['t'],u='https://www.ncbi.nlm.nih.gov/books/n/livertox/%s/'%cid,sec='Hepatotoxicity',e=escopo)
        if pick: s['q']=pick['l'];s['s']=pick['s'];s['m']=pick['m']
        else: s['q']=v['h'] or '';s['sem']=True
        srcs.append(s)
        if pick and (best is None or LV[pick['s'][0]]>LV[best['s'][0]]): best=dict(s=pick['s'],m=pick['m'])
    if not srcs: return None
    l=(LV[best['s'][0]] if best else None); m=(best or {}).get('m','')
    cap=bool(m) and l is not None and l>2   # [H]/[HD]: so em dose alta/circunstancia -> teto 'Alto', sinalizado
    return dict(l=(2 if cap else l),s=(best or {}).get('s'),m=m,src=srcs,**({'cap':1} if cap else {}))
# ---------- rotulos FDA ----------
HEP_B=re.compile(r'hepatotox|hepatic failure|liver failure|liver injury|hepatic injury|hepatic necrosis|hepatitis|liver damage|hepatic toxicity|fulminant',re.I)
NEF_S=re.compile(r'nephrotox|(?<![a-z])renal toxicity|acute kidney injury|(?<![a-z])acute renal failure|interstitial nephritis|tubular necrosis|crystalluria|(?<![a-z])renal damage|kidney damage|(?<![a-z])renal tubular (?:acidosis|necrosis|damage|injury|toxicity)',re.I)
NEF_A=re.compile(NEF_S.pattern+r'|(?<![a-z])renal failure|kidney injury|nephritis|nephropathy|(?<![a-z])renal insufficiency',re.I)
POP=re.compile(r'(patients|subjects|those) with (severe |pre-existing |preexisting |impaired )?(renal|kidney|hepatic|liver) (failure|insufficiency|impairment|dysfunction)',re.I)
EXC=re.compile(r'tubular secretion|nephrotoxic (?:agents|drugs|medic|products|antibiotics)|other nephrotoxic|potentiate the nephrotoxic|creatine phosphokinase|hemolysis|hepatic coma|propylene glycol|magnesium toxicity|EDTA|information for patients|hypotension|concomitant administration|used concurrently|concurrent(?:ly)? (?:use|administration)|drugs that (?:inhibit|affect)|calcium channel|CYP3A4|serum sickness|drug interactions|tacrolimus|aminoglycosides:|tolvaptan|esmolol|methotrexate such as',re.I)
def snip(s,rx,n=260):
    m=rx.search(s); a=max(0,m.start()-n//2) if len(s)>n else 0
    r=s[a:a+n].strip(); return ('…' if a>0 else '')+r+('…' if a+n<len(s) else '')
def sents(t): return re.split(r'(?<=[.!?])\s+(?=[A-Z0-9])',re.sub(r'\s+',' ',t))
# revisao manual: o rotulo so menciona rim em interacao, pre-condicao ou outro produto (ex.: diluente) - nao e sinal do proprio farmaco
NEF_OVR={'dextrose_glucose','sodium_chloride','amlodipine','dexamethasone','fluconazole','carbamazepine','hydralazine'}
# capitulos LiverTox sem escore: nivel inferido do texto do proprio capitulo (sinalizado na interface como 'inferido')
HEP_INF={'heparin':1,'methadone':0,'ipratropium':0,'tobramycin':0,'neomycin_bacitracin':0,'artemether_and_lumefantrine':1}
def fda_ev(en,fdir):
    fn=os.path.join(fdir,re.sub(r'[^a-z0-9]+','_',en.lower())+'.json')
    if not os.path.exists(fn): return None
    d=json.load(open(fn));toks=[t for t in re.split(r'\s+AND\s+',d['q']) if t]
    labs=[x for x in d['res'] if (len({g.lower() for g in x.get('gn',[])})==1 or ' and ' in en) and all(any(t.lower().split()[0] in g.lower() for g in x.get('gn',[])) for t in toks)] if d['res'] else []
    out=dict(rotulos=len(labs),n=None,h=None)
    if not labs: return out
    def scan(rx,fields_lv):
        best=None
        for x in labs:
            for fld,lv,nome in fields_lv:
                for txt in x.get(fld,[]):
                    for s in sents(txt):
                        if rx.search(s) and not (rx is not HEP_B and EXC.search(s)) and not (POP.search(s) and not re.search(r'nephrotox|hepatotox|liver injury|acute|failure has|cases of',s,re.I)):
                            c=dict(l=lv,sec=nome,q=snip(s,rx),id=x['set_id'],t=(x.get('bn') or x.get('gn') or [''])[0].title())
                            if best is None or lv>best['l']: best=c
                            break
                    else: continue
                    break
        return best or dict(l=0)
    out['n']=scan(NEF_S,[('boxed_warning',3,'BOXED WARNING'),('warnings_and_cautions',2,'WARNINGS AND PRECAUTIONS'),('warnings',2,'WARNINGS'),('precautions',2,'PRECAUTIONS')])
    if out['n']['l']==0: out['n']=scan(NEF_A,[('adverse_reactions',1,'ADVERSE REACTIONS')])
    out['h']=scan(HEP_B,[('boxed_warning',3,'BOXED WARNING'),('warnings_and_cautions',2,'WARNINGS AND PRECAUTIONS'),('warnings',2,'WARNINGS'),('precautions',2,'PRECAUTIONS'),('adverse_reactions',1,'ADVERSE REACTIONS')])
    return out
def cache_fda(fdir):
    out={en:fda_ev(en,fdir) for en in U_};out={k:v for k,v in out.items() if v}
    json.dump(out,open(os.path.join(CACHE,'fda.json'),'w'),ensure_ascii=False,separators=(',',':'));return out
# ---------- literatura renal ----------
def cache_paz(xml):
    import html
    s=open(xml,encoding='utf8').read()
    body=re.search(r'<body>(.*)</body>',s,re.S).group(1)
    def tx(x): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',x))).replace('–','-').replace('’',"'").strip()
    full=tx(body);secs=set(tx(t) for t in re.findall(r'<title>(.*?)</title>',body,re.S));bad=[]
    for e in LIT:
        if tx(e['sec']) not in secs: bad.append(('secao',e['sec']))
        if tx(e['quote']) not in full: bad.append(('citacao',e['quote']))
    if bad: raise SystemExit('citacoes nao encontradas no texto da revisao: %s'%bad)
    json.dump({'ok':True,'n':len(LIT)},open(os.path.join(CACHE,'paz_ok.json'),'w'));print('revisao: %d citacoes verificadas literalmente'%len(LIT))
REF=dict(
 LTX=dict(t='LiverTox: Clinical and Research Information on Drug-Induced Liver Injury. Bethesda (MD): National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK/NIH); 2012–. Capítulo de cada fármaco (secção "Hepatotoxicity", linha "Likelihood score").',u='https://www.ncbi.nlm.nih.gov/books/NBK547852/'),
 LTXC=dict(t='LiverTox. Categorization of the Likelihood of Drug Induced Liver Injury (categorias A–E do "Likelihood score").',u='https://www.ncbi.nlm.nih.gov/books/n/livertox/DrugCategory/'),
 PAZ=dict(t='Pazhayattil GS, Shirali AC. Drug-induced impairment of renal function. Int J Nephrol Renovasc Dis. 2014;7:457–468. doi:10.2147/IJNRD.S39747. PMID 25540591.',u='https://pmc.ncbi.nlm.nih.gov/articles/PMC4270362/'),
 FDA=dict(t='U.S. FDA. Rótulos de medicamentos (Structured Product Labeling), via openFDA e DailyMed (NLM). Seção e frase indicadas em cada item.',u='https://dailymed.nlm.nih.gov/dailymed/'))
ESCALAS=dict(
 hep=[dict(n=0,nome='Improvável',crit='LiverTox categoria E (causa improvável de lesão hepática clinicamente aparente) ou E* (não comprovada, suspeita)'),
      dict(n=1,nome='Baixo',crit='LiverTox categoria D (possível; menos de 3 casos publicados)'),
      dict(n=2,nome='Moderado',crit='LiverTox categoria C (provável; menos de 12 casos, sem padrão característico)'),
      dict(n=3,nome='Alto',crit='LiverTox categoria B (muito provável; 12 a 50 casos)'),
      dict(n=4,nome='Muito alto',crit='LiverTox categoria A (bem estabelecida; mais de 50 casos). Modificadores [H]/[HD]: só em dose alta ou circunstância descrita.')],
 nef=[dict(n=0,nome='Sem sinal',crit='Sem referência de nefrotoxicidade nas fontes consultadas (rótulo FDA e revisão). Não é prova de segurança renal.'),
      dict(n=1,nome='Baixo',crit='Nefrotoxicidade rara (revisão) ou citada apenas em Reações Adversas do rótulo FDA'),
      dict(n=2,nome='Moderado',crit='Mecanismo bem descrito e risco condicional (revisão) ou tópico dedicado em Advertências/Precauções do rótulo FDA'),
      dict(n=3,nome='Alto',crit='Incidência alta ou dose-dependente declarada (revisão) ou Alerta em Caixa (boxed warning) do rótulo FDA para toxicidade renal')])
def main():
    global U_
    U_,cat=universo();a=args()
    if 'lt' in a: cache_lt(a['lt'])
    if 'fda' in a: cache_fda(a['fda'])
    if 'paz' in a: cache_paz(a['paz'])
    LT=json.load(open(os.path.join(CACHE,'livertox.json')));FD=json.load(open(os.path.join(CACHE,'fda.json')))
    paz_ok=os.path.exists(os.path.join(CACHE,'paz_ok.json'))
    LITBY={}
    for e in LIT:
        for s in e['subs']: LITBY[s]=e
    itens={};idx={}
    for en,keys in sorted(U_.items()):
        i=sid(en);it=itens.setdefault(i,dict(en=en))
        for k in keys: idx[k]=i
        # hepatico
        h=lt_for(en,LT);f=FD.get(en) or {}
        fh=f.get('h') or {}
        if h and h.get('l') is None and i in HEP_INF: h['l']=HEP_INF[i];h['inf']=1
        if h is None and f.get('rotulos'):
            h=dict(l=fh.get('l',0),s=None,m='',src=[],fda=True)
        if h is not None:
            if fh.get('l',0)>0 or (h.get('fda')):
                if fh.get('id'): h.setdefault('src',[]).append(dict(r='FDA',t=fh['t'],u='https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=%s'%fh['id'],sec=fh['sec'],q=fh['q']))
            if fh.get('l')==3: h['cx']=1
            if h.get('fda') and fh.get('l',0)==0: h['src']=[dict(r='FDA',t='Rótulo(s) FDA consultado(s)',u='https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=%s'%re.sub(r'\W+','+',en),sec='BOXED WARNING / WARNINGS / ADVERSE REACTIONS',q='Nenhuma frase sobre hepatotoxicidade encontrada.',sem=True)]
            it['h']=h
        # renal
        k=None;srcs=[];lv=None
        lit=LITBY.get(en)
        if lit:
            lv=lit['n'];srcs.append(dict(r='PAZ',t='Pazhayattil & Shirali, 2014',u=REF['PAZ']['u'],sec='Seção "%s"'%lit['sec'],q=lit['quote'],mec=lit['mec'],ok=paz_ok))
        fn=f.get('n') or {}
        ovr=i in NEF_OVR
        if ovr: fn={}
        if f.get('rotulos'):
            if fn.get('l',0)>0:
                srcs.append(dict(r='FDA',t=fn['t'],u='https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=%s'%fn['id'],sec=fn['sec'],q=fn['q']))
                lv=max(lv if lv is not None else 0,fn['l'])
            elif lv is None: lv=0;srcs.append(dict(r='FDA',t='Rótulo(s) FDA consultado(s)',u='https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=%s'%re.sub(r'\W+','+',en),sec='BOXED WARNING / WARNINGS / ADVERSE REACTIONS',q=('Revisão manual: as menções a rim no rótulo se referem a interação, pré-condição do paciente ou outro produto (diluente), não a efeito próprio do fármaco.' if ovr else 'Nenhuma frase sobre nefrotoxicidade encontrada.'),sem=True))
        if lv is not None: it['k']=dict(l=lv,src=srcs)
        elif srcs: it['k']=dict(l=None,src=srcs)
    # observacoes antigas do catalogo (nao verificadas)
    for mk,s in cat['safety'].items():
        i=idx.get(mk)
        if not i: continue
        obs=[]
        if s.get('nefN'): obs.append(('k',s['nefN']))
        if s.get('hepN'): obs.append(('h',s['hepN']))
        for o,t in obs: itens[i].setdefault('obs',{}).setdefault(o,t)
    js=dict(fonte='Níveis de hepatotoxicidade (LiverTox) e nefrotoxicidade (revisão e rótulos FDA) com a fonte, o link e o trecho de cada informação. Compilação assistida por IA: revisão farmacêutica obrigatória.',escalas=ESCALAS,refs=REF,itens=itens,idx=idx)
    json.dump(js,open(os.path.join(ROOT,'data','toxicidade.json'),'w'),ensure_ascii=False,separators=(',',':'))
    from collections import Counter
    print(len(itens),'substâncias;',len(idx),'chaves; hep:',sorted(Counter(v.get('h',{}).get('l','—') for v in itens.values()).items(),key=str),'nef:',sorted(Counter(v.get('k',{}).get('l','—') for v in itens.values()).items(),key=str))
    print(os.path.getsize(os.path.join(ROOT,'data','toxicidade.json'))//1024,'KB')
if __name__=='__main__': main()
