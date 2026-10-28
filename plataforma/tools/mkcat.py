import os,json,subprocess,sys
H=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(H); SRC=os.path.join(H,'source','all2.js')
sys.path.insert(0,H)
def js(expr):
    code="const fs=require('fs');const f=new Function(fs.readFileSync(process.argv[1],'utf8')+';return %s');console.log(JSON.stringify(f()))"%expr
    return json.loads(subprocess.check_output(['node','-e',code,SRC]))
from en import EN
import classes
d=js("{M,S,ITEMS,SEC,MATERIAIS}")
refs=json.load(open(os.path.join(ROOT,'data','refs.json'),encoding='utf8'))
used=set()
for k,m in d['M'].items():
    m['en']=EN[k]; used|=set(m['r'])
classes.apply(d['M'])
miss=used-set(refs); assert not miss,miss
items=[dict(id=i,sec=r[0],code=r[1],desc=r[2],key=r[3],mgml=(r[4] if len(r)>4 else None)) for i,r in enumerate(d['ITEMS'])]
S={k:dict(nef=v[0],nefN=v[1],hep=v[2],hepN=v[3],ismp=v[4],ae=v[5]) for k,v in d['S'].items()}
cat=dict(meta=dict(versao=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','VERSION')).read().strip(),fonte='Lista de exemplo transcrita de uma lista institucional em PDF escaneado (usada apenas como exemplo)',aviso='Conteúdo compilado das fontes citadas; requer revisão por farmacêutico responsável.'),
 sec=d['SEC'],items=items,mono=d['M'],safety=S,materiais=d['MATERIAIS'],refs={k:refs[k] for k in refs})
json.dump(cat,open(os.path.join(ROOT,'data','catalog.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print(len(items),len(d['M']),len(S),len(used),len(json.dumps(cat))//1024,'KB')
print([k for k in d['M'] if k not in S][:10], set(i['key'] for i in items)-set(d['M']))
