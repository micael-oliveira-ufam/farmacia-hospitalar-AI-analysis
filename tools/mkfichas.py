#!/usr/bin/env python3
"""Fichas da lista da Policlinica Codajas a partir do rotulo FDA (openFDA/DailyMed): trechos literais, secao e link.
Uso: python3 tools/mkfichas.py --fda /tmp/tox/fda   (le o JSON bruto de tools/tox/fda_fetch.py; grava data/codajas_fichas.json)"""
import json,os,re,sys,unicodedata
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(R,'tools'))
from codajas_map import LOTE1
def norm(t): return unicodedata.normalize('NFD',t.lower()).encode('ascii','ignore').decode()
def sid(en): return norm(re.sub(r'[()]','',en)).replace(' ','_')
def clean(t):
    t=re.sub(r'\s+',' ',t).strip()
    t=re.sub(r'^\d+(\.\d+)*\s+[A-Z][A-Z &/,\-]{5,}?(?=\s+[A-Z][a-z]|\s*[·:])\s*[·:]?\s*','',t)   # "2 DOSAGE & ADMINISTRATION · ..."
    t=re.sub(r'^\d+(\.\d+)*\s+(Mechanism of Action|Indications and Usage|Dosage and Administration|Clinical Pharmacology)\s*','',t,flags=re.I)
    return t
def cut(t,n):
    t=clean(t)
    if len(t)<=n: return t
    c=t[:n];i=max(c.rfind('. '),c.rfind('; '))
    return (c[:i+1] if i>n*0.5 else c.rstrip())+' […]'
SEC=[('indic','indications_and_usage','Indications and Usage',700),('dose','dosage_and_administration','Dosage and Administration',1500),
     ('moa','mechanism_of_action','Mechanism of Action',700),('moa','clinical_pharmacology','Clinical Pharmacology',700),('boxed','boxed_warning','Boxed Warning',600)]
NOTAS={'golimumab':'O rótulo disponível é do SIMPONI ARIA (via intravenosa); o item da lista é seringa subcutânea (SIMPONI), cuja dose é diferente. Consulte a bula do produto dispensado.',
 'adalimumab':'O rótulo exibido é de um biossimilar (IDACIO); a posologia é a do adalimumabe, mas confira a bula do produto dispensado.'}
def main():
    a=sys.argv[1:];fda=a[a.index('--fda')+1] if '--fda' in a else '/tmp/tox/fda'
    cod=json.load(open(os.path.join(R,'data','codajas.json'),encoding='utf8'))['itens']
    out={}
    for z in LOTE1:
        fn=os.path.join(fda,re.sub(r'[^a-z0-9]+','_',z['en'].lower())+'.json')
        its=[x for x in cod if all(k in norm(x['name']) for k in z['kw']) and not any(k in norm(x['name']) for k in z.get('excl',[]))]
        f=dict(en=z['en'],pt=z['pt'],itens=[x['name'].strip() for x in sorted(its,key=lambda x:-x['activeUsers'])],usuarios=sum(x['activeUsers'] for x in its))
        if os.path.exists(fn):
            toks=z['en'].split(' and ');combo=len(toks)>1
            labs=[x for x in json.load(open(fn))['res'] if 'dosage_and_administration' in x and 'indications_and_usage' in x
                  and all(any(t.split()[0] in g.lower() for g in x.get('gn',[])) for t in toks)
                  and (combo or (len({g.lower() for g in x.get('gn',[])})==1 and not re.search(r' and |/|,|\+',' '.join(x.get('gn',[])).lower())))]
            if labs:
                L=labs[0];f['label']=dict(t=(L.get('bn') or [z['en']])[0],gn=(L.get('gn') or [z['en']])[0],eff=L.get('effective_time',''),
                    u='https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid='+L['set_id'])
                for k,fld,nome,n in SEC:
                    if fld in L and (k not in f):
                        t=L[fld][0] if isinstance(L[fld],list) else L[fld]
                        if clean(t): f[k]=dict(s=nome,q=cut(t,n))
        if z['en'] in NOTAS: f['nota']=NOTAS[z['en']]
        out[sid(z['en'])]=f
    json.dump(dict(fonte='Rótulos FDA (openFDA / DailyMed). Trechos literais em inglês; consulte a seção completa pelo link.',itens=out),
              open(os.path.join(R,'data','codajas_fichas.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
    print(len(out),'fichas;',sum('label' in v for v in out.values()),'com rótulo;',sum(len(v['itens']) for v in out.values()),'itens da lista')
main()
