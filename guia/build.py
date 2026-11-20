import json,sys,os,shutil,re,base64
H=os.path.dirname(os.path.abspath(__file__));S=os.path.dirname(H)
def rd(p):return open(os.path.join(H,p),encoding='utf8').read()
cat=json.load(open(os.path.join(S,'data/catalog.json'),encoding='utf8'))
PAGES=len(sys.argv)>2 and sys.argv[2]=='pages'
def design_css():
    # sistema visual compartilhado (design/pharmacentral.css) com as fontes embutidas em base64: o arquivo único funciona offline
    css=open(os.path.join(S,'design/pharmacentral.css'),encoding='utf8').read()
    def emb(m):
        b=base64.b64encode(open(os.path.join(S,'design',m.group(1)),'rb').read()).decode()
        return 'url(data:font/woff2;base64,'+b+')'
    return re.sub(r'url\((fonts/[^)]+\.woff2)\)',emb,css)
def build(pwa):
    t=rd('index.tpl.html')
    t=t.replace('/*CSS*/',design_css()+'\n'+rd('style.css')).replace('/*CALC*/',rd('calc.js')).replace('/*APP*/',rd('app.js')).replace('/*TRIAGEM*/',rd('triagem.js')).replace('/*DOSEJS*/',rd('dose.js'))
    t=t.replace('/*CATALOG*/',json.dumps(cat,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    cod=json.load(open(os.path.join(S,'data/codajas.json'),encoding='utf8'))
    listas={'codajas':{'nome':cod['nome'],'itens':[i['name'] for i in cod['itens']]}}
    t=t.replace('/*LISTAS*/',json.dumps(listas,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    inter=json.load(open(os.path.join(S,'data/interacoes.json'),encoding='utf8'))
    t=t.replace('/*INTER*/',json.dumps(inter,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    dose=json.load(open(os.path.join(S,'data/dose.json'),encoding='utf8'))
    t=t.replace('/*DOSE*/',json.dumps(dose,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    poso=json.load(open(os.path.join(S,'data/posologia.json'),encoding='utf8'))
    t=t.replace('/*POSO*/',json.dumps(poso,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    tox=json.load(open(os.path.join(S,'data/toxicidade.json'),encoding='utf8'))
    fic=json.load(open(os.path.join(S,'data/codajas_fichas.json'),encoding='utf8'))
    t=t.replace('/*FICHAS*/',json.dumps(fic,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    mj=json.load(open(os.path.join(S,'data/manejo.json'),encoding='utf8'))
    t=t.replace('/*MANEJO*/',json.dumps(mj,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    t=t.replace('/*PCPDF*/',open(os.path.join(S,'design/pcpdf.js'),encoding='utf8').read().replace('</','<\\/'))
    fa=json.load(open(os.path.join(S,'data/farmacologia.json'),encoding='utf8'))
    pps=[{k:i.get(k) for k in ('c','d','m','k','f','i','p')} for i in json.load(open(os.path.join(S,'abc-app/public/data/pps.json'),encoding='utf8'))]
    t=t.replace('/*PPS*/',json.dumps(pps,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    t=t.replace('/*FARMACO*/',json.dumps(fa,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    t=t.replace('/*TOX*/',json.dumps(tox,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    t=t.replace('/*UFAMNEGIMG*/','data:image/png;base64,'+base64.b64encode(open(os.path.join(S,'design/ufam_neg.png'),'rb').read()).decode())
    t=t.replace('/*UFAMIMG*/','data:image/png;base64,'+base64.b64encode(open(os.path.join(S,'design/ufam.png'),'rb').read()).decode())
    t=t.replace('<!--HOMEHREF-->','../' if pwa else '#')
    t=t.replace('<!--ESTLINK-->','<a class="est" href="../estoque/"><i></i>Estoque</a><a class="ped" href="../pedidos/"><i></i>Pedidos</a><a class="pro" href="../prontuario/"><i></i>Prontuário</a>' if pwa else '')
    t=t.replace('<!--PWA-->','<link rel="manifest" href="manifest.json"><link rel="icon" href="icon.svg">' if pwa else '')
    return t
out=sys.argv[1]
os.makedirs(out,exist_ok=True)
open(os.path.join(out,'index.html'),'w',encoding='utf8').write(build(True))
t=build(False)
t=t.replace('<button class="btn" id="print" type="button">Imprimir</button>','')
A=os.path.join(S,'flutter_app/assets')
if os.path.isdir(A):open(os.path.join(A,'guia.html'),'w',encoding='utf8').write(t)  # mesma interface do site, dentro do app Android
m=re.search(r'<title>.*?</title>.*?</head>',t,re.S) if False else re.search(r'<title>.*?</head>',t,re.S);head=m.group(0)[:-7]
body=re.search(r'<body>(.*)</body>',t,re.S).group(1)
open(os.path.join(out,'guia-artifact.html'),'w',encoding='utf8').write(head+'\n'+body)
json.dump({"name":"PharmaCentral · Controle terapêutico","short_name":"PharmaCentral","start_url":"./","display":"standalone","background_color":"#F4F8F8","theme_color":"#12808A","lang":"pt-BR","icons":[{"src":"icon.svg","sizes":"any","type":"image/svg+xml","purpose":"any"}]},open(os.path.join(out,'manifest.json'),'w'),ensure_ascii=False)
shutil.copy(os.path.join(H,'icon.svg'),os.path.join(out,'icon.svg'))
open(os.path.join(out,'sw.js'),'w').write('''const V="icam-guia-%s";
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(["./","index.html","manifest.json","icon.svg"])));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).pathname.startsWith("/api/"))return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();if(new URL(e.request.url).origin===location.origin)caches.open(V).then(ch=>ch.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match("index.html"))))});
'''%cat['meta']['versao'])
print('ok',os.path.getsize(os.path.join(out,'guia-artifact.html'))//1024,'KB')
