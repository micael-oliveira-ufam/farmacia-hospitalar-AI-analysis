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
farma_path=os.path.join(ROOT,'data','farma.json')
if os.path.exists(farma_path):
    farma=json.load(open(farma_path,encoding='utf8'))
    for k,m in d['M'].items():
        if k in farma: m.update(farma[k])
used=set()
for k,m in d['M'].items():
    m['en']=EN[k]; used|=set(m['r'])
classes.apply(d['M'])
miss=used-set(refs); assert not miss,miss
import re as _re
# forma farmacêutica básica (Análise Detalhada): pelo texto da descrição; se não houver, pela seção
_FORMA_RULES=[
 ('Injetáveis',_re.compile(r'ampola|frasco[- ]ampola|\bfap\b|injet|bolsa|seringa|liofiliz|\biv\b|\bev\b',_re.I)),
 ('Comprimidos e cápsulas',_re.compile(r'comprimido|cápsula|capsula|drágea|tablete',_re.I)),
 ('Gotas e emulsão',_re.compile(r'\bgotas?\b|emulsão|emulsao',_re.I)),
 ('Xaropes e elixir',_re.compile(r'xarope|elixir',_re.I)),
 ('Suspensões e soluções',_re.compile(r'suspens|sol\. oral|solução oral|solucao oral|pó p/ susp',_re.I)),
 ('Pomadas, cremes, géis e loções',_re.compile(r'pomada|creme|\bgel\b|loção|loçao',_re.I)),
 ('Inalatórios',_re.compile(r'inalat|aerossol|spray|flaconete',_re.I)),
 ('Oftálmicos',_re.compile(r'oftálm|oftalm|colírio|colirio',_re.I)),
]
_FORMA_SEC={'Injetáveis':'Injetáveis','Controlados injetáveis':'Injetáveis','Antimicrobianos de reserva':'Injetáveis','Eletrólitos':'Injetáveis','Termolábeis':'Injetáveis','Controlados anestésicos':'Injetáveis','Comprimidos e cápsulas':'Comprimidos e cápsulas','Controlados comprimidos':'Comprimidos e cápsulas','Suspensões e soluções':'Suspensões e soluções','Gotas e emulsão':'Gotas e emulsão','Controlados orais (gotas)':'Gotas e emulsão','Xaropes e elixir':'Xaropes e elixir','Pomadas, cremes, géis e loções':'Pomadas, cremes, géis e loções','Inalatórios':'Inalatórios','Oftálmicos':'Oftálmicos','Contrastes':'Suspensões e soluções'}
def _forma(desc,sec):
    for f,rx in _FORMA_RULES:
        if rx.search(desc):return f
    return _FORMA_SEC.get(sec,'Sem forma informada')
items=[dict(id=i,sec=r[0],code=r[1],desc=r[2],key=r[3],mgml=(r[4] if len(r)>4 else None),forma=_forma(r[2],d['SEC'].get(r[0],''))) for i,r in enumerate(d['ITEMS'])]
S={k:dict(nef=v[0],nefN=v[1],hep=v[2],hepN=v[3],ismp=v[4],ae=v[5]) for k,v in d['S'].items()}
cat=dict(meta=dict(versao=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','VERSION')).read().strip(),fonte='Lista de exemplo transcrita de uma lista institucional em PDF escaneado (usada apenas como exemplo)',aviso='Conteúdo compilado das fontes citadas; requer revisão por farmacêutico responsável.'),
 sec=d['SEC'],items=items,mono=d['M'],safety=S,materiais=d['MATERIAIS'],refs={k:refs[k] for k in refs})
json.dump(cat,open(os.path.join(ROOT,'data','catalog.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print(len(items),len(d['M']),len(S),len(used),len(json.dumps(cat))//1024,'KB')
print([k for k in d['M'] if k not in S][:10], set(i['key'] for i in items)-set(d['M']))
