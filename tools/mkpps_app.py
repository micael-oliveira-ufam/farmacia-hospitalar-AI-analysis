#!/usr/bin/env python3
"""Gera flutter_app/assets/pps.html: seção PPS no CAF (lista do ICAM) para o app Android, arquivo único e offline.
Dados: abc-app/public/data/pps.json e fotos em abc-app/public/pps/. Uso: python3 tools/mkpps_app.py"""
import json,os,re,base64
S=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
css=open(os.path.join(S,'design/pharmacentral.css'),encoding='utf8').read()
css=re.sub(r'url\((fonts/[^)]+\.woff2)\)',lambda m:'url(data:font/woff2;base64,'+b64(os.path.join(S,'design',m.group(1)))+')',css)
items=json.load(open(os.path.join(S,'abc-app/public/data/pps.json'),encoding='utf8'))
imgs={}
for i in items:
    f=i['p']
    if f and f not in imgs: imgs[f]=b64(os.path.join(S,'abc-app/public/pps',f))
js=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
html='''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PharmaCentral · PPS no CAF</title><style>'''+css+'''
body{margin:0}.w{max-width:1100px;margin:0 auto;padding:14px}h1{font:700 1.5rem/1.15 var(--f-display);margin:6px 0}
.sub{color:var(--ink-2);font-size:.9rem;margin:0 0 12px}.bar{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
.bar input,.bar select{flex:1 1 180px;min-height:42px;padding:8px 12px;border:1px solid var(--line-2);border-radius:10px;background:var(--surface);color:var(--ink);font:inherit}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;padding:0;list-style:none}
.c{display:flex;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--surface)}
.ph{width:84px;height:84px;flex:none;background:#fff;border:1px solid var(--line);border-radius:8px;display:grid;place-items:center;overflow:hidden;font-size:.7rem;color:var(--ink-2)}
.ph img{max-width:100%;max-height:100%;object-fit:contain}.k{font-size:.72rem;color:var(--ink-2)}.d{font-weight:700;font-size:.88rem;line-height:1.3;margin:2px 0}
.m{font-size:.85rem}.f{font-size:.76rem;color:var(--ink-2);line-height:1.35;margin-top:3px}
.b{min-height:44px;padding:8px 16px;border-radius:10px;border:0;background:#3157D5;color:#fff;font:700 .9rem var(--f-text);cursor:pointer}.b[disabled]{opacity:.5}
.ft{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:18px 0 8px;font-size:.78rem;color:var(--ink-2)}</style></head><body><div class="w">
<h1>PPS no CAF</h1><p class="sub">Produtos para saúde da lista do ICAM, com foto ilustrativa, consumo médio mensal (CMM) e função de cada item.</p>
<div class="bar"><input id="q" placeholder="Buscar por descrição ou código" aria-label="Buscar"><select id="cat" aria-label="Categoria"></select><button class="b" id="r1">Gerar relatório em PDF</button></div>
<p id="n" class="sub"></p><ul class="g" id="l"></ul><button class="b" id="more" style="width:100%;margin-top:10px;background:var(--sunk);color:var(--ink)">Mostrar mais</button>
<div class="ft"><span>Fotos ilustrativas por tipo de produto, não a marca do item. Origem e licença constam no relatório.</span><button class="b" id="r2">Gerar relatório</button></div>
<div class="ft"><span class="ufam"><img src="data:image/png;base64,'''+b64(os.path.join(S,'design/ufam.png'))+'''" alt="Brasão da Universidade Federal do Amazonas" width="56" height="56"><span>Universidade Federal do Amazonas</span></span><span><b>Autores</b>: Micael Davi Lima de Oliveira e Elias de Souza Barros · Orientadora: Profa. Dra. Clarice Veloso · Preceptora: Dra. Juliana Carvalho</span></div>
</div><script>'''+open(os.path.join(S,'design/pcpdf.js'),encoding='utf8').read()+'''</script><script>
var D=__ITENS__,IM=__IMGS__,P=24,shown=P;
var $=function(i){return document.getElementById(i)},nf=function(n){return n.toLocaleString("pt-BR")};
var cats={};D.forEach(function(i){cats[i.k]=(cats[i.k]||0)+1});
$("cat").innerHTML='<option value="">Todas as categorias ('+D.length+')</option>'+Object.keys(cats).sort(function(a,b){return a.localeCompare(b,"pt-BR")}).map(function(k){return'<option value="'+k+'">'+k+' ('+cats[k]+')</option>'}).join("");
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function flt(){var t=$("q").value.trim().toLowerCase(),c=$("cat").value;return D.filter(function(i){return(!c||i.k===c)&&(!t||(i.d+" "+i.c+" "+i.n).toLowerCase().indexOf(t)>-1)})}
function draw(){var l=flt(),s=0,nf0=0;l.forEach(function(i){s+=i.m;if(!i.p)nf0++});
 $("n").innerHTML="<b>"+l.length+"</b> itens · CMM somado <b>"+nf(s)+"</b>"+(nf0?" · "+nf0+" sem foto":"");
 $("l").innerHTML=l.slice(0,shown).map(function(i){return'<li class="c"><div class="ph">'+(i.p?'<img loading="lazy" alt="'+esc(i.n)+'" src="data:image/jpeg;base64,'+IM[i.p]+'">':"sem foto")+'</div><div><div class="k">Cód. '+i.c+" · "+esc(i.k)+'</div><div class="d">'+esc(i.d)+'</div><div class="m"><b>CMM '+nf(i.m)+"</b>"+(i.i?" (confirmar)":"")+'</div><div class="f">'+esc(i.f)+"</div></div></li>"}).join("");
 $("more").style.display=shown<l.length?"block":"none";$("more").textContent="Mostrar mais ("+(l.length-shown)+" restantes)"}
function jpg(b){var u=atob(b),w=0,h=0;for(var p=2;p<u.length-9;){if(u.charCodeAt(p)!==255){p++;continue}var mk=u.charCodeAt(p+1);if(mk>=192&&mk<=207&&mk!==196&&mk!==200&&mk!==204){h=u.charCodeAt(p+5)*256+u.charCodeAt(p+6);w=u.charCodeAt(p+7)*256+u.charCodeAt(p+8);break}p+=2+u.charCodeAt(p+2)*256+u.charCodeAt(p+3)}return{b64:b,w:w,h:h,pw:w,ph:h}}
function rel(){var l=flt();if(!l.length)return;var imgs={},rows=[],by={},s=0;
 l.forEach(function(i){s+=i.m;(by[i.k]=by[i.k]||[]).push(i);if(i.p&&!imgs[i.p])imgs[i.p]=jpg(IM[i.p])});
 Object.keys(by).sort(function(a,b){return a.localeCompare(b,"pt-BR")}).forEach(function(k){rows.push({sec:k+" ("+by[k].length+" itens)"});by[k].forEach(function(i){rows.push([i.p?{img:i.p}:"sem foto",i.c,i.d+(i.i?" [CMM a confirmar]":""),String(i.m),i.f])})});
 var u=PCPDF.build({titulo:"PPS no CAF - lista do ICAM",sub:l.length+" itens · CMM somado: "+nf(s)+".",cols:[{h:"Foto",w:1.1},{h:"Código",w:.9},{h:"Material (descrição)",w:4},{h:"CMM",w:.8},{h:"Função / uso",w:4.6}],rows:rows,imgs:imgs,imgMax:50,
 nota:"CMM = consumo médio mensal. Fotos ilustrativas por tipo de produto (não a marca do item); função descrita de forma geral. Fontes das fotos: Wikimedia Commons/Openverse (com licença) e páginas de lojas de materiais hospitalares.",rodape:"PPS no CAF",autores:"Autores: Micael Davi Lima de Oliveira (ICAM) e Ennylay (ICAM)"});
 PCPDF.save("PharmaCentral-PPS-CAF-ICAM.pdf",u)}
$("q").oninput=$("cat").onchange=function(){shown=P;draw()};$("more").onclick=function(){shown+=96;draw()};$("r1").onclick=$("r2").onclick=rel;draw();
</script></body></html>'''
html=html.replace('__ITENS__',js(items)).replace('__IMGS__',js(imgs))
open(os.path.join(S,'flutter_app/assets/pps.html'),'w',encoding='utf8').write(html);print('pps.html',len(html)//1024,'KB')
