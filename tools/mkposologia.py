#!/usr/bin/env python3
"""Gera data/posologia.json (dose minima, recomendada e maxima por faixa etaria) a partir de tools/posologia/p*.py.

Cada parte define P = {id: {faixa: B(...)|NR(..)|"="|IDO(..)|None, "nota": "...", "ficha": F(..)}}.
ids: os de data/dose.json (itens da base ICAM) ou de EXTRAS (medicamentos adicionais, em tools/posologia/x*.py).
Conteudo compilado por IA a partir das monografias do catalogo e de formularios: exige revisao farmaceutica.
"""
import glob,importlib.util,json,os,sys
H=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(H)
sys.path.insert(0,os.path.join(H,'posologia'))
BANDAS={'pre':'Prematuro (< 37 sem)','neo':'Neonato (0–28 dias)','lac':'Lactente (29 dias – 23 meses)','cri':'Criança (2–11 anos)','adl':'Adolescente (12–17 anos)','adu':'Adulto (18–64 anos)','ido':'Idoso (≥ 65 anos)'}
ORDEM=list(BANDAS)
UNID={'mg/kg','mg','mcg/kg','mcg','UI/kg','UI','mL/kg','mL','mg/m2','mEq/kg','mEq','g','g/kg','mmol','mmol/kg','mg/kg/dia','mg/dia','mcg/kg/min','mg/kg/h','mcg/kg/h','UI/kg/h','mL/h','mL/kg/h','mEq/kg/h','g/kg/dia','mcg/min','mg/h','UI/h','mg/min','mL/kg/dia','mcg/m2','mcg/kg/dia','mcg/dia','UI/dia','mL/dia','mEq/kg/dia','mEq/dia','UI/kg/dia'}
INTERV={1,2,3,4,6,8,12,24,36,48,72,168}
def carregar(pasta):
    out={}
    for f in sorted(glob.glob(os.path.join(H,'posologia',pasta))):
        spec=importlib.util.spec_from_file_location(os.path.basename(f)[:-3],f);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        for k,v in m.P.items():
            if k in out: raise SystemExit('id duplicado: %s (%s)'%(k,f))
            out[k]=v
    return out
def main(strict=True):
    dose={x['id']:x for x in json.load(open(os.path.join(ROOT,'data','dose.json'),encoding='utf8'))['itens']}
    P=carregar('p*.py');X=carregar('x*.py')
    # fichas farmacologicas (mecanismo etc.) em f*.py: FICHA = {id: F(...)}
    for f in sorted(glob.glob(os.path.join(H,'posologia','f*.py'))):
        spec=importlib.util.spec_from_file_location(os.path.basename(f)[:-3],f);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        for k,v in m.FICHA.items():
            if k in P: P[k]['ficha']=v
            elif k in X: X[k]['ficha']=v
            else: print('aviso: ficha sem medicamento:',k)
    erros=[];avisos=[];out={}
    for k in list(P)+list(X):
        if k in X and k in dose: erros.append('extra com id da base: '+k)
    for k in P:
        if k not in dose: erros.append('id desconhecido em p*: '+k)
    for k,rec in list(P.items())+list(X.items()):
        d=dose.get(k);bands={};
        for faixa in ORDEM:
            v=rec.get(faixa,'__ausente__')
            if v=='__ausente__':
                if faixa in('lac','cri','adl') and 'ped' in rec: v=rec['ped']
                elif faixa in('lac','cri','adl') and d and d['min'] is not None: v='='
                else: continue
            if v=='=':
                if not(d and d['min'] is not None and d['max'] is not None): erros.append('%s.%s "=" sem faixa em dose.json'%(k,faixa));continue
                iv=[h for h in (1,2,3,4,6,8,12,24,48) if (d['imin'] is None or h>=d['imin']) and (d['imax'] is None or h<=d['imax'])] or [d['imin'] or d['imax'] or 8]
                dmax=d['dia']
                v={'a':d['min'],'r':round((d['min']+d['max'])/2,4),'b':d['max'],'u':'mg/kg','i':iv,'d':dmax,'n':(d['obs'] or '') if faixa=='lac' else '','cap':None,'capd':d['abs']}
            elif isinstance(v,dict) and 'ido_f' in v:
                ad=bands.get('adu') or (rec.get('adu') if isinstance(rec.get('adu'),dict) else None)
                if not ad or 'a' not in ad: erros.append('%s.ido depende de adu valido'%k);continue
                f=v['ido_f'];sc=lambda x:None if x is None else round(x*f,4)
                v={'a':sc(ad['a']),'r':sc(ad['r']),'b':sc(ad['b']),'u':ad['u'],'i':ad['i'],'d':sc(ad['d']),'cap':sc(ad.get('cap')),'capd':sc(ad.get('capd')),'n':v['n'] or ('Mesma dose do adulto.' if f==1 else 'Dose do adulto × %g.'%f)}
            elif v is None: v={'nr':'Sem dose estabelecida na base para esta faixa: consulte a referência.'}
            if 'nr' in v or 'desc' in v: bands[faixa]=v;continue
            u=v['u']
            if u not in UNID: erros.append('%s.%s unidade invalida: %s'%(k,faixa,u))
            a,r,b=v['a'],v['r'],v['b']
            if None in(a,r,b): erros.append('%s.%s min/rec/max incompleto'%(k,faixa))
            elif not(0<=a<=r+1e-9<=b+1e-9): erros.append('%s.%s ordem min<=rec<=max violada: %s %s %s'%(k,faixa,a,r,b))
            for h in v['i'] or []:
                if h not in INTERV: erros.append('%s.%s intervalo invalido: %s'%(k,faixa,h))
            if v['d'] is not None and b is not None and v['i'] and ('/min' not in u and '/h' not in u):
                n=24/min(v['i'])
                if '/dia' not in u and b*1<=v['d'] and b*n<v['d']*0.2: avisos.append('%s.%s: teto diario muito acima de max x doses/dia'%(k,faixa))
            bands[faixa]=v
        if not bands: erros.append('%s sem faixas'%k)
        out[k]={'b':bands}
        if rec.get('nota'): out[k]['nota']=rec['nota']
        if rec.get('ficha'): out[k]['f']=rec['ficha']
        if k in X: out[k]['x']=1
    # extras: metadados para entrar na lista de dose
    ext=[]
    for k,rec in X.items():
        meta=rec.get('meta')
        if not meta: erros.append('extra sem meta: '+k);continue
        ext.append(dict(meta,id=k))
    if erros:
        print('ERROS (%d):'%len(erros));[print(' -',e) for e in erros[:60]]
        if strict: sys.exit(1)
    def comp(v):
        if 'nr' in v: return {'nr':v['nr']}
        if 'desc' in v: return {'desc':v['desc']}
        o=[v['a'],v['r'],v['b'],v['u'],v['i'],v['d'],v['n'],v.get('cap'),v.get('capd')]
        while o and o[-1] is None: o.pop()
        return o
    js={'fonte':'Posologia por faixa etária compilada por IA a partir das monografias do catálogo e de formulários nacionais e internacionais; revisão farmacêutica obrigatória, com atenção redobrada em neonatos, prematuros e idosos.','bandas':BANDAS,
        'itens':{k:dict(v,b={f:comp(x) for f,x in v['b'].items()}) for k,v in out.items()},'extras':ext}
    json.dump(js,open(os.path.join(ROOT,'data','posologia.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
    cov={f:sum(1 for v in out.values() if f in v['b'] and 'nr' not in v['b'][f] and 'desc' not in v['b'][f]) for f in ORDEM}
    print(len(out),'medicamentos (%d da base, %d adicionais)'%(len(P),len(X)),'| cobertura por faixa:',cov)
    for a in avisos[:20]: print('aviso:',a)
    print(os.path.getsize(os.path.join(ROOT,'data','posologia.json'))//1024,'KB')
if __name__=='__main__': main(strict='--lenient' not in sys.argv)
