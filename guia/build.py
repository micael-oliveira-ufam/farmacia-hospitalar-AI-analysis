import json,sys,os,shutil,re
H=os.path.dirname(os.path.abspath(__file__));S=os.path.dirname(H)
def rd(p):return open(os.path.join(H,p),encoding='utf8').read()
cat=json.load(open(os.path.join(S,'data/catalog.json'),encoding='utf8'))
def build(pwa):
    t=rd('index.tpl.html')
    t=t.replace('/*CSS*/',rd('style.css')).replace('/*CALC*/',rd('calc.js')).replace('/*APP*/',rd('app.js'))
    t=t.replace('/*CATALOG*/',json.dumps(cat,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    t=t.replace('<!--PWA-->','<link rel="manifest" href="manifest.json"><link rel="icon" href="icon.svg">' if pwa else '')
    return t
out=sys.argv[1]
os.makedirs(out,exist_ok=True)
open(os.path.join(out,'index.html'),'w',encoding='utf8').write(build(True))
t=build(False)
t=t.replace('<a class="homelnk" href="../">← Início</a> · ','')
t=t.replace('<button class="btn" id="print" type="button">Imprimir</button>','')
m=re.search(r'<title>.*?</head>',t,re.S);head=m.group(0)[:-7]
body=re.search(r'<body>(.*)</body>',t,re.S).group(1)
open(os.path.join(out,'guia-artifact.html'),'w',encoding='utf8').write(head+'\n'+body)
json.dump({"name":"PosologiaPED · Posologia pediátrica hospitalar","short_name":"PosologiaPED","start_url":"./","display":"standalone","background_color":"#F8FAFB","theme_color":"#0B6B70","lang":"pt-BR","icons":[{"src":"icon.svg","sizes":"any","type":"image/svg+xml","purpose":"any"}]},open(os.path.join(out,'manifest.json'),'w'),ensure_ascii=False)
open(os.path.join(out,'icon.svg'),'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="#0B6B70"/><rect x="40" y="18" width="16" height="60" rx="4" fill="#fff"/><rect x="18" y="40" width="60" height="16" rx="4" fill="#fff"/></svg>')
open(os.path.join(out,'sw.js'),'w').write('''const V="icam-guia-%s";
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(["./","index.html","manifest.json","icon.svg"])));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();if(new URL(e.request.url).origin===location.origin)caches.open(V).then(ch=>ch.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match("index.html"))))});
'''%cat['meta']['versao'])
print('ok',os.path.getsize(os.path.join(out,'guia-artifact.html'))//1024,'KB')
