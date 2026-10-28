(function(){
"use strict";
const CAT=window.CATALOG, M=CAT.mono, S=CAT.safety, R=CAT.refs, SEC=CAT.sec, ITEMS=CAT.items, CALC=window.CALC;
const CTRL=new Set(["cinj","canest","cgts","ccp"]);
const LV={ok:["conferido","ok","Endereço aberto e conferido durante a elaboração"],doi:["DOI","","DOI registrado; resolução não testada automaticamente"],inst:["site oficial","","Página institucional do órgão/editora; conteúdo pode mudar"],busca:["busca","","Link de pesquisa — leva aos resultados, não ao documento direto"]};
const AGE={neo:"Neonatos (0–28 dias)",ped:"Lactentes e crianças (29 dias – 17 anos)",adu:"Adultos (referência)",ido:"Idosos ≥ 65 anos (referência)"};
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const fmt=(v,d)=>Number.isFinite(v)?v.toLocaleString("pt-BR",{maximumFractionDigits:d==null?(Math.abs(v)<1?3:2):d}):"—";
const store={get(k,def){try{const v=localStorage.getItem(k);return v==null?def:JSON.parse(v)}catch(e){return def}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- estado ---------- */
const st={tab:"meds",age:store.get("icam-age","ped"),
  fav:new Set(store.get("icam-fav",[])),cart:new Set(store.get("icam-cart",[])),cmp:[],favOnly:false,
  tc:"",fc:"",more:false,dr:0};
if(!AGE[st.age])st.age="ped";
const byId=new Map(ITEMS.map(i=>[i.id,i]));
const keyMap={}; // índice: chave da monografia -> itens
ITEMS.forEach(i=>(keyMap[i.key]=keyMap[i.key]||[]).push(i));
/* refs usadas (numeração estável por ordem de aparição) */
const refNum={}; let nref=0;
function useRef(k){if(!refNum[k])refNum[k]=++nref;return refNum[k]}
for(const it of ITEMS){const s=S[it.key];const m=M[it.key];const add=[];if(s.ismp)add.push("ISMP");if(s.nef)add.push("NEFRO");if(s.hep)add.push("LTOX");if(CTRL.has(it.sec))add.push("P344");
  m.rr=m.r.concat(add.filter(a=>!m.r.includes(a)));m.rr.forEach(useRef)}
["ANV","MOST","CG","SCHW","CKDEPI","HS","KDIGO","ABCP","MSH","MSAF","ANSEL","FDABZD"].forEach(useRef);

/* ---------- referências / links ---------- */
function refChip(k){const r=R[k];if(!r)return "";const l=LV[r.l];
  return '<a href="'+esc(r.u)+'" target="_blank" rel="noopener noreferrer" title="'+esc(r.t+" — "+l[2])+'">'+esc(k)+" ["+refNum[k]+"]</a>"}
function linksFor(enRaw,ptRaw,liver){const en=encodeURIComponent(enRaw),pt=encodeURIComponent(ptRaw);
  const L=[["DailyMed (bula FDA)","https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query="+en],
   ["PubMed","https://pubmed.ncbi.nlm.nih.gov/?term="+en+"+dosing"],
   ["BNFc","https://bnfc.nice.org.uk/search/?q="+en],
   ["Bulário Anvisa","https://consultas.anvisa.gov.br/#/bulario/q/?nomeProduto="+pt],
   ["Busca: dose pediátrica","https://www.google.com/search?q="+en+"+pediatric+dosing+neonatal"]];
  if(liver)L.push(["LiverTox","https://www.ncbi.nlm.nih.gov/books/?term="+en+"+livertox"]);
  return L.map(x=>'<a class="lk" href="'+x[1]+'" target="_blank" rel="noopener noreferrer">'+x[0]+"</a>").join(" ")}

function drugLinks(it){const m=M[it.key];return linksFor(m.en,norm(m.n.split(/[\d(]/)[0].trim().split(" ")[0]),!!S[it.key].hep)}

/* ---------- qualquer medicamento ---------- */
function renderAny(){
  const pt=$("#any-pt").value.trim(),en=$("#any-en").value.trim(),q=norm(pt||en);
  const hit=q.length>=3?ITEMS.filter(i=>norm([i.desc,M[i.key].n,M[i.key].en].join(" ")).includes(q)).slice(0,6):[];
  $("#any-hit").innerHTML=hit.length?'<p class="note"><b>Está na lista carregada:</b> '+hit.map(i=>'<a href="#" data-open="'+i.id+'">'+esc(i.desc)+" (código "+esc(i.code)+")</a>").join(" · ")+" — clique para abrir a monografia com doses por faixa etária.</p>":(q.length>=3?'<p class="note">Não consta na lista carregada: use as fontes abaixo.</p>':"");
  $("#any-links").innerHTML=q.length>=3?linksFor(en||pt,pt||en,true)+' <a class="lk" href="https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed/precos" target="_blank" rel="noopener noreferrer">Preços CMED</a>'
    +' <span class="note" style="flex:1 1 100%">São links de <b>pesquisa</b> pelo nome digitado (não páginas verificadas). Confirme a ortografia e prefira o nome internacional (inglês) para DailyMed, PubMed e BNFc.</span>':"";
}
function runAny(){const f=$("#anycalc form"),g=n=>parseFloat(String(f.elements[n].value).replace(",","."));
  const p=g("p"),d=g("d"),n=g("n")||1,mx=g("mx")||0,md=g("md")||0,c=g("c")||0,o=$(".out",f);
  if(!(p>0&&d>0)){o.innerHTML='<span class="note">Preencha peso e dose.</span>';return}
  const r=CALC.regimen(p,d,n,mx,md);
  o.innerHTML="Por tomada: <b>"+fmt(r.dose)+" mg</b>"+(c>0?" = <b>"+fmt(r.dose/c)+" mL</b> a "+fmt(c)+" mg/mL":"")+" · Por dia: <b>"+fmt(r.day)+" mg</b> ("+fmt(r.perKgDay)+" mg/kg/dia)"
   +(r.cappedDose?' <span class="over">Dose por tomada limitada ao máximo informado (calc. '+fmt(p*d)+" mg).</span>":"")
   +(r.overDay?' <span class="over">Atenção: excede a dose máxima diária informada ('+fmt(md)+" mg).</span>":"")}


/* ---------- minha lista (elenco do hospital) ---------- */
const SALT=/\b(sodic[oa]|potassic[oa]|cloridrato|sulfato|acetato|fosfato|succinato|hemissuccinato|humana|base|di|mono)\b/g;
const core=t=>norm(t).replace(SALT," ").replace(/[^a-z0-9+ ]/g," ").replace(/\s+/g," ").trim();
const KEYS=Object.keys(M).map(k=>{const nm=M[k].n.split(/[\d(]/)[0].trim();return {k,full:norm(nm),core:core(nm),en:norm(M[k].en||"")}}).filter(x=>x.core.length>=4);
function matchMine(desc){const d=" "+norm(desc).replace(/[^a-z0-9+ ]/g," ").replace(/\s+/g," ")+" ";
  const hits=KEYS.filter(x=>d.includes(" "+x.core+" ")||d.includes(" "+x.full+" ")||(x.en.length>=5&&d.includes(" "+x.en+" ")));
  hits.sort((a,b)=>b.core.length-a.core.length);
  const top=hits.length?hits[0].core.length:0;
  return hits.filter(h=>h.core.length>=top-3).slice(0,3).map(h=>h.k)}
function parseMine(txt){
  return txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map((l,i)=>{
    const sep=l.includes(";")?";":(l.includes("\t")?"\t":null);
    let code="",desc=l;if(sep){const p=l.split(sep);if(p.length>=2){code=p[0].trim();desc=p.slice(1).join(" ").trim()}}
    return {code,desc}}).filter((r,i)=>!(i===0&&/^(c[oó]digo|code|item|medicamento|descri)/i.test(r.code||r.desc)));}
let mine=store.get("ped-minha-lista",[]),mineName=store.get("ped-minha-lista-nome","Minha lista"),mineF="all";
const LISTS={icam:()=>({nome:"ICAM",itens:ITEMS.map(i=>({code:/^s\//.test(i.code)?"":i.code,desc:i.desc}))}),
  cod:()=>({nome:(window.LISTAS&&window.LISTAS.codajas.nome)||"Policlínica Codajás",itens:((window.LISTAS&&window.LISTAS.codajas.itens)||[]).map(n=>({code:"",desc:n}))})};
function importList(w){const l=LISTS[w]();mine=l.itens;mineName=l.nome;mineF="all";store.set("ped-minha-lista",mine);store.set("ped-minha-lista-nome",mineName);
  $("#mine-txt").value=mine.map(r=>(r.code?r.code+";":"")+r.desc).join("\n");st.tab="mine";st.more=false;renderTabs();toast("Lista "+l.nome+": "+mine.length+" itens");window.scrollTo({top:0})}
function renderMine(){
  const out=$("#mine-out"),info=$("#mine-info");
  if(!mine.length){info.textContent="";out.innerHTML='<p class="empty">Nenhuma lista carregada. Toque em um dos botões acima ou cole a lista do seu hospital.</p>';return}
  const rows=mine.map((r,i)=>({r,i,m:matchMine(r.desc)}));const ok=rows.filter(x=>x.m.length).length;
  info.innerHTML="<b>"+esc(mineName)+"</b>: "+mine.length+" itens, <b>"+ok+"</b> com monografia no guia. A sugestão é automática, feita pelo nome: confira sal, associação e apresentação.";
  const show=rows.filter(x=>mineF==="all"||(mineF==="ok"?x.m.length:!x.m.length));
  out.innerHTML='<div class="chips"><button type="button" class="chip" data-mf="all" aria-pressed="'+(mineF==="all")+'">Todos <small>'+rows.length+'</small></button><button type="button" class="chip" data-mf="ok" aria-pressed="'+(mineF==="ok")+'">Com monografia <small>'+ok+'</small></button><button type="button" class="chip" data-mf="no" aria-pressed="'+(mineF==="no")+'">Sem monografia <small>'+(rows.length-ok)+"</small></button></div>"
   +'<div class="rows">'+show.map(({r,i,m})=>'<div class="mrow"><span class="mname">'+esc(r.desc)+(r.code?" <small>cód. "+esc(r.code)+"</small>":"")+'</span><span class="macts">'+(m.length?m.map(k=>'<a class="lk" href="#" data-mk="'+esc(k)+'" title="'+esc(M[k].n)+'">Abrir '+esc(M[k].n.split(/[\d(]/)[0].trim().slice(0,22))+"</a>").join(" "):'<a class="lk" href="#" data-any="'+i+'">Ver fontes</a>')+"</span></div>").join("")+"</div>"}
function mineCsv(){const q=s=>'"'+String(s).replace(/"/g,'""')+'"';
  return "codigo;item;monografia_sugerida\n"+mine.map(r=>[q(r.code),q(r.desc),q(matchMine(r.desc).map(k=>M[k].n.split(/[\d(]/)[0].trim()).join(" | "))].join(";")).join("\n")}
function initMine(){
  $("#mine-txt").value=mine.map(r=>(r.code?r.code+";":"")+r.desc).join("\n");
  $("#mine-go").addEventListener("click",()=>{mine=parseMine($("#mine-txt").value);mineName="Minha lista";mineF="all";store.set("ped-minha-lista",mine);store.set("ped-minha-lista-nome",mineName);renderMine();toast(mine.length+" itens carregados")});
  $("#imp-icam").addEventListener("click",()=>importList("icam"));$("#imp-cod").addEventListener("click",()=>importList("cod"));
  $("#mine-clear").addEventListener("click",()=>{mine=[];$("#mine-txt").value="";store.set("ped-minha-lista",[]);renderMine()});
  $("#mine-csv").addEventListener("click",()=>{if(!mine.length){toast("Carregue uma lista primeiro");return}copy(mineCsv())});
  $("#p-mine").addEventListener("click",e=>{
    const f=e.target.closest("[data-mf]");if(f){mineF=f.dataset.mf;renderMine();return}
    const a=e.target.closest("a");if(!a)return;e.preventDefault();
    if(a.dataset.mk){const it=ITEMS.find(i=>i.key===a.dataset.mk);if(it)openItem(it)}
    else if(a.dataset.any!=null){const r=mine[+a.dataset.any];$("#any-pt").value=r.desc;$("#any-en").value="";st.tab="any";renderTabs();renderAny();window.scrollTo({top:0})}});
}

/* ---------- toast ---------- */
let tt;function toast(t){let e=$(".toast");if(!e){e=document.createElement("div");e.className="toast";e.setAttribute("role","status");document.body.appendChild(e)}e.textContent=t;e.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{e.hidden=true},2200)}
function copy(txt){const ok=()=>toast("Copiado para a área de transferência");
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(ok,fb)}else fb();
  function fb(){const a=document.createElement("textarea");a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand("copy");ok()}catch(e){toast("Não foi possível copiar")}a.remove()}}

/* ---------- tema ---------- */

/* ---------- classes ---------- */
const TCS=[...new Set(ITEMS.map(i=>M[i.key].tc))].sort((a,b)=>a.localeCompare(b,"pt"));
const FCS=[...new Set(ITEMS.map(i=>M[i.key].fc))].sort((a,b)=>a.localeCompare(b,"pt"));
const hue=t=>(TCS.indexOf(t)*47+160)%360;
const nOf=f=>ITEMS.filter(f).length;
const AGES={neo:"Neonato",ped:"Lactente / criança",adu:"Adulto",ido:"Idoso"};
const HAY={};ITEMS.forEach(i=>{const m=M[i.key];HAY[i.id]={name:norm([i.desc,m.n,m.en].join(" ")),cls:norm([m.c,m.tc,m.fc].join(" ")),oth:norm([i.code,S[i.key].ae].join(" "))}});
const NL=["","Nefro: atenção","Nefrotóxico"],HL=["","Hepato: atenção","Hepatotóxico"];

/* ---------- detalhe do medicamento (gaveta) ---------- */
function doseHtml(it){const m=M[it.key];
  if(st.age==="ido")return '<div class="bigdose"><div><span class="k">Idosos (referência)</span><p>'+esc(m.ido||"—")+"</p></div></div>";
  const d=m[st.age],ped=st.age==="neo"||st.age==="ped";
  return '<div class="bigdose'+(ped?" ped":"")+'"><div><span class="k">Dose usual</span><p>'+esc(d[0])+'</p></div><div><span class="k">Dose máxima</span><p>'+esc(d[1])+"</p></div></div>"}
const AGEHINT={neo:"0 a 28 dias de vida",ped:"29 dias a 17 anos",adu:"apenas referência",ido:"65 anos ou mais, apenas referência"};
function drawerHtml(it){
  const m=M[it.key],s=S[it.key],id=it.id;
  const ae=s.ae.split("|").map(x=>x.replace(/^(Comuns|Graves)[^:]*:\s*/,""));
  const fav=st.fav.has(id),inC=st.cart.has(id),inK=st.cmp.includes(id);
  const vias=m.v.split(/,\s*(?![^()]*\))/).map(v=>'<span class="via">'+esc(v)+"</span>").join("");
  const tox=(s.nef?'<p><b>Rim ('+NL[s.nef]+"):</b> "+esc(s.nefN)+"</p>":"")+(s.hep?'<p><b>Fígado ('+HL[s.hep]+"):</b> "+esc(s.hepN)+"</p>":"")+(CTRL.has(it.sec)?"<p><b>Controlado:</b> exige receituário e registro (Portaria SVS/MS 344/98) "+refChip("P344")+"</p>":"");
  const rows=["neo","ped","adu"].map(a=>'<tr class="'+(a!=="adu"?"pedrow":"")+'"><td>'+AGES[a]+"</td><td>"+esc(m[a][0])+"</td><td>"+esc(m[a][1])+"</td></tr>").join("")+"<tr><td>Idoso</td><td colspan=\"2\">"+esc(m.ido||"—")+"</td></tr>";
  const c=it.mgml||"";
  return '<div data-id="'+id+'" class="dr">'
   +'<h2 class="dr-name">'+esc(it.desc)+'</h2><p class="dr-sub"><span class="bdg tcb" style="--h:'+hue(m.tc)+'">'+esc(m.tc)+'</span> <span class="bdg fcb">'+esc(m.fc)+'</span></p><p class="dr-via">'+vias+"</p>"
   +'<div class="seg" id="dr-age" role="group" aria-label="Faixa etária">'+Object.keys(AGES).map(a=>'<button type="button" class="'+(a==="neo"||a==="ped"?"ped":"")+'" data-dage="'+a+'" aria-pressed="'+(st.age===a)+'">'+AGES[a]+"</button>").join("")+"</div>"
   +'<p class="note" id="dr-hint">'+AGEHINT[st.age]+'</p><div id="dr-dose">'+doseHtml(it)+"</div>"
   +(s.ismp?'<div class="alertp"><b>Alta vigilância (ISMP Brasil):</b> '+esc(s.ismp)+". Dupla checagem na prescrição, no preparo e na administração.</div>":"")
   +(m.pa?'<div class="alertp"><b>Alerta pediátrico:</b> '+esc(m.pa)+"</div>":"")
   +'<details><summary>Efeitos adversos</summary><p><b>Comuns:</b> '+esc(ae[0])+"</p><p><b>Graves:</b> "+esc(ae[1]||"—")+"</p></details>"
   +(tox?"<details><summary>Rim, fígado e controle</summary>"+tox+"</details>":"")
   +'<details><summary>Todas as faixas etárias</summary><div class="tbl"><table><thead><tr><th>Faixa</th><th>Dose usual</th><th>Dose máxima</th></tr></thead><tbody>'+rows+"</tbody></table></div></details>"
   +'<details><summary>Calcular dose por peso</summary><form class="calc-form" onsubmit="return false"><label class="fld">Peso (kg)<input inputmode="decimal" name="p" placeholder="ex.: 12"></label><label class="fld">Dose (mg/kg)<input inputmode="decimal" name="d" placeholder="ex.: 15"></label><label class="fld">Dose máx. (mg)<input inputmode="decimal" name="x" placeholder="opcional"></label><label class="fld">Concentração (mg/mL)<input inputmode="decimal" name="c" value="'+(c?fmt(c):"")+'" placeholder="opcional"></label><output class="out" aria-live="polite">Informe peso e dose em mg/kg.</output><span class="formula">dose (mg) = peso × mg/kg, limitada à dose máxima; volume (mL) = mg ÷ concentração</span></form></details>'
   +'<details><summary>Fontes e links</summary><ol class="refs">'+m.rr.map(k=>'<li>'+esc(R[k].t)+' <a class="lk" href="'+esc(R[k].u)+'" target="_blank" rel="noopener noreferrer">abrir</a> <span class="lv '+(R[k].l==="ok"?"ok":"")+'">'+LV[R[k].l][0]+"</span></li>").join("")+'</ol><div class="links"><span class="note">Pesquisar em:</span> '+drugLinks(it)+"</div></details>"
   +'<div class="acts2">'+(DOSEBY[it.key]?'<button class="btn pri" data-dz="'+DOSEBY[it.key].id+'">Dose do paciente</button>':"")+'<button class="btn" data-a="fav" aria-pressed="'+fav+'">'+(fav?"★ Favorito":"☆ Favoritar")+'</button><button class="btn" data-a="cart" aria-pressed="'+inC+'">'+(inC?"Na cesta":"+ Cesta")+'</button><button class="btn" data-a="cmp" aria-pressed="'+inK+'">Comparar</button></div></div>'}
const num=(f,k)=>parseFloat(String(f.elements[k].value).replace(",","."));
function calcDose(f){const p=num(f,"p"),d=num(f,"d"),x=num(f,"x"),c=num(f,"c"),o=$(".out",f);
  if(!(p>0&&d>0)){o.textContent="Informe peso e dose em mg/kg.";return}
  const r=CALC.doseMg(p,d,x);
  o.innerHTML="Dose: <b>"+fmt(r.mg)+" mg</b>"+(c>0?" = <b>"+fmt(CALC.mgToMl(r.mg,c))+" mL</b> a "+fmt(c)+" mg/mL":"")+"."+(r.capped?' <span class="over">Limitada à dose máxima ('+fmt(x)+" mg; calculado "+fmt(r.raw)+" mg).</span>":"")}

/* ---------- aba Medicamentos: classes → lista → detalhe ---------- */
let view=[];
const MATCH=(m,s,c,it)=>!c||(c==="mav"&&!!s.ismp)||(c==="n2"&&s.nef===2)||(c==="n1"&&s.nef>=1)||(c==="h2"&&s.hep===2)||(c==="h1"&&s.hep>=1)||(c==="pa"&&!!m.pa)||(c==="ctl"&&CTRL.has(it.sec));
const inResults=()=>!!($("#q").value.trim()||st.tc||st.fc||st.favOnly);
function row(it,withCls){const m=M[it.key],s=S[it.key];
  return '<button class="ri" type="button" data-open="'+it.id+'"><span class="ri-main"><span class="ri-name">'+esc(it.desc)+"</span>"+(withCls?'<span class="ri-sub">'+esc(m.fc)+"</span>":"")+"</span>"+(s.ismp?'<span class="bdg mav">Alta vigilância</span>':"")+'<span class="ri-go" aria-hidden="true">›</span></button>'}
function renderBrowse(){
  $("#browse").innerHTML='<h2 class="pick">Escolha uma classe</h2><div class="tiles">'
   +(st.fav.size?'<button type="button" class="tile favt" data-fav="1"><b>★ Meus favoritos</b><small>'+st.fav.size+(st.fav.size===1?" item":" itens")+"</small></button>":"")
   +TCS.map(t=>'<button type="button" class="tile" data-tc="'+esc(t)+'" style="--h:'+hue(t)+'"><b>'+esc(t)+"</b><small>"+nOf(i=>M[i.key].tc===t)+" itens</small></button>").join("")+"</div>"
   +'<h2 class="pick">Listas do hospital</h2><div class="listbtns"><button type="button" class="btn" data-imp="icam">Importar lista do ICAM</button><button type="button" class="btn" data-imp="cod">Importar lista da Policlínica Codajás</button></div>'}
function renderMeds(){
  const qv=$("#q").value.trim(),q=norm(qv);$("#clearq").hidden=!qv;
  const sc=new Map();
  view=ITEMS.filter(it=>{const m=M[it.key];
    if(st.tc&&m.tc!==st.tc)return false;if(st.fc&&m.fc!==st.fc)return false;if(st.favOnly&&!st.fav.has(it.id))return false;
    if(!q)return true;const h=HAY[it.id];
    const s0=h.name.startsWith(q)?0:h.name.includes(" "+q)?0:h.name.includes(q)?1:h.cls.includes(q)?2:h.oth.includes(q)?3:-1;
    if(s0<0)return false;sc.set(it.id,s0);return true});
  if(q)view.sort((a,b)=>sc.get(a.id)-sc.get(b.id));
  const res=inResults();$("#browse").hidden=res;$("#crumb").hidden=!res;
  const out=$("#out");
  if(!res){renderBrowse();out.innerHTML="";return}
  const title=st.favOnly?"Meus favoritos":st.fc?st.fc:st.tc?st.tc:"Resultados da busca";
  let c='<div class="crumb-row"><button class="btn" type="button" data-crumb="reset">← Classes</button><span class="count">'+view.length+(view.length===1?" item":" itens")+"</span></div><h2 class=\"cl-title\">"+esc(title)+"</h2>";
  if(st.tc&&!st.fc){const fs=[...new Set(ITEMS.filter(i=>M[i.key].tc===st.tc).map(i=>M[i.key].fc))];if(fs.length>1)c+='<div class="chips sub">'+fs.map(f=>'<button type="button" class="chip" data-fc="'+esc(f)+'">'+esc(f)+"</button>").join("")+"</div>"}
  if(st.tc&&st.fc)c+='<div class="chips sub"><button type="button" class="chip" data-fc="">Mostrar toda a classe '+esc(st.tc)+"</button></div>";
  if(q.length>=3&&!st.tc){const hits=[...TCS.filter(t=>norm(t).includes(q)).map(t=>["tc",t]),...FCS.filter(f=>norm(f).includes(q)).map(f=>["fc",f])].slice(0,5);
    if(hits.length)c+='<div class="chips sub"><span class="agelbl">Classes:</span>'+hits.map(h=>'<button type="button" class="chip" data-'+h[0]+'="'+esc(h[1])+'" data-clearq="1">'+esc(h[1])+"</button>").join("")+"</div>"}
  $("#crumb").innerHTML=c;
  if(!view.length){out.innerHTML='<p class="empty">Nada encontrado. Tente outro nome.</p>'+(qv?'<p class="empty"><button class="btn pri" id="goany" type="button">Buscar “'+esc(qv)+'” em qualquer medicamento</button></p>':"");return}
  let h="";
  if(q&&!st.tc){const g=[[],[],[]];view.forEach(it=>g[sc.get(it.id)<=1?0:sc.get(it.id)===2?1:2].push(it));
    const names=["","Na mesma classe","Citado em efeitos adversos"];
    g.forEach((arr,k)=>{if(arr.length)h+=(k?'<h3 class="sub-h">'+names[k]+"</h3>":"")+'<div class="rows">'+arr.map(it=>row(it,true)).join("")+"</div>"})}
  else if(st.tc&&!st.fc){const g=new Map();view.forEach(it=>{const k=M[it.key].fc;(g.get(k)||g.set(k,[]).get(k)).push(it)});
    g.forEach((arr,k)=>{h+=(g.size>1?'<h3 class="sub-h">'+esc(k)+"</h3>":"")+'<div class="rows">'+arr.map(it=>row(it)).join("")+"</div>"})}
  else h='<div class="rows">'+view.map(it=>row(it,!st.fc&&!st.tc)).join("")+"</div>";
  out.innerHTML=h}

/* ---------- gaveta de detalhe ---------- */
function openDrawer(id){const it=byId.get(id);if(!it)return;st.dr=id+1;
  $("#dr-body").innerHTML=drawerHtml(it);$("#drawer").hidden=false;document.body.classList.add("noscroll");$(".dr-panel").scrollTop=0;$("#dr-close").focus();
  try{if(!(history.state&&history.state.dr))history.pushState({dr:1},"")}catch(e){}}
function closeDrawer(fromPop){if(!st.dr)return;st.dr=0;$("#drawer").hidden=true;document.body.classList.remove("noscroll");
  try{if(!fromPop&&history.state&&history.state.dr)history.back()}catch(e){}}
function syncDrawer(){if(!st.dr)return;const id=st.dr-1,b=$("#dr-body");
  const f=$('[data-a="fav"]',b),c=$('[data-a="cart"]',b),k=$('[data-a="cmp"]',b);
  if(f){f.setAttribute("aria-pressed",st.fav.has(id));f.textContent=st.fav.has(id)?"★ Favorito":"☆ Favoritar"}if(c){c.setAttribute("aria-pressed",st.cart.has(id));c.textContent=st.cart.has(id)?"Na cesta":"+ Cesta"}if(k)k.setAttribute("aria-pressed",st.cmp.includes(id))}
function openItem(it){st.tab="meds";st.more=false;renderTabs();renderMeds();openDrawer(it.id)}

/* ---------- calculadoras ---------- */
const sexF=[["m","Masculino"],["f","Feminino"]];
const CALCS=[
 {id:"dose",t:"Dose por peso (mg/kg) → volume · pediatria",f:[["p","Peso (kg)"],["d","Dose (mg/kg)"],["x","Dose máx. (mg)"],["c","Concentração (mg/mL)"]],
  fx:"mg = kg × mg/kg (teto = dose máxima); mL = mg ÷ (mg/mL)",refs:["ANSEL"],run:v=>{if(!(v.p>0&&v.d>0))return null;const r=CALC.doseMg(v.p,v.d,v.x);return "Dose: <b>"+fmt(r.mg)+" mg</b>"+(v.c>0?" = <b>"+fmt(r.mg/v.c)+" mL</b>":"")+(r.capped?' <span class="over">limitada ao máximo (calc. '+fmt(r.raw)+" mg)</span>":"")}},
 {id:"hs",t:"Manutenção hídrica pediátrica (Holliday-Segar)",f:[["p","Peso (kg)"]],fx:"Dia: 100 mL/kg (≤10 kg) + 50 mL/kg (10–20) + 20 mL/kg (>20) · Hora (4-2-1): 4/2/1 mL/kg/h",refs:["HS","NICE"],
  run:v=>{if(!(v.p>0))return null;return "Por dia: <b>"+fmt(CALC.hollidayDay(v.p),0)+" mL</b> · Por hora (4-2-1): <b>"+fmt(CALC.hollidayHour(v.p),1)+" mL/h</b><br><span class='note'>Volume de manutenção basal; ajustar a perdas, febre, função renal e tipo de solução (ver NICE NG29).</span>"}},
 {id:"bsa",t:"Superfície corporal (Mosteller)",f:[["p","Peso (kg)"],["h","Altura (cm)"],["d","Dose por m² (opcional)"]],fx:"SC (m²) = √(altura[cm] × peso[kg] ÷ 3600)",refs:["MOST"],
  run:v=>{if(!(v.p>0&&v.h>0))return null;const b=CALC.bsa(v.p,v.h);return "SC: <b>"+fmt(b,3)+" m²</b>"+(v.d>0?" · dose = <b>"+fmt(b*v.d)+"</b> (unidade da dose/m²)":"")}},
 {id:"schw",t:"TFG pediátrica (Schwartz à beira do leito) · pediatria",f:[["h","Altura (cm)"],["s","Creatinina sérica (mg/dL)"]],fx:"TFGe (mL/min/1,73 m²) = 0,413 × altura[cm] ÷ SCr",refs:["SCHW"],
  run:v=>{if(!(v.h>0&&v.s>0))return null;return "TFGe: <b>"+fmt(CALC.schwartz(v.h,v.s),1)+" mL/min/1,73 m²</b><br><span class='note'>Equação para crianças com doença renal crônica; menos confiável em neonatos e em lesão renal aguda.</span>"}},
 {id:"inf",t:"Bomba de infusão (mcg/kg/min → mL/h)",f:[["d","Dose (mcg/kg/min)"],["p","Peso (kg)"],["c","Concentração (mg/mL)"],["m","…ou droga total (mg)"],["vf","…e volume final (mL)"]],
  fx:"mL/h = dose × peso × 60 ÷ (concentração[mg/mL] × 1000) · concentração = mg ÷ mL",refs:["ANSEL"],
  run:v=>{if(!(v.d>0&&v.p>0))return null;const c=v.c>0?v.c:(v.m>0&&v.vf>0?v.m/v.vf:0);if(!(c>0))return "Informe a concentração ou a droga total e o volume final.";
   return "Concentração: <b>"+fmt(c,4)+" mg/mL</b> · Vazão: <b>"+fmt(CALC.infusionMlH(v.d,v.p,c))+" mL/h</b><br><span class='note'>Droga de alta vigilância? Confira a concentração padrão da instituição e faça dupla checagem independente.</span>"}},
 {id:"drip",t:"Gotejamento de soro",f:[["v","Volume (mL)"],["h","Tempo (horas)"],["k","Fator","drip"]],fx:"gotas/min = volume × fator ÷ (horas × 60) · macrogotas 20 gts/mL, microgotas 60 gts/mL",refs:["ANSEL"],
  run:v=>{if(!(v.v>0&&v.h>0))return null;const f=+v.k||20;const g=CALC.dropsMin(v.v,v.h,f);return "<b>"+fmt(g,1)+" gotas/min</b> · "+fmt(v.v/v.h)+" mL/h"}},
 {id:"c1v1",t:"Diluição (C₁·V₁ = C₂·V₂)",f:[["c1","Concentração do estoque (C₁)"],["c2","Concentração desejada (C₂)"],["v2","Volume final desejado (V₂, mL)"]],fx:"V₁ = C₂ × V₂ ÷ C₁  (mesma unidade em C₁ e C₂)",refs:["ANSEL"],
  run:v=>{if(!(v.c1>0&&v.c2>0&&v.v2>0))return null;if(v.c2>v.c1)return '<span class="over">C₂ não pode ser maior que C₁.</span>';const v1=CALC.dilutionV1(v.c1,v.c2,v.v2);return "Retirar <b>"+fmt(v1)+" mL</b> do estoque e completar até <b>"+fmt(v.v2)+" mL</b> (diluente: "+fmt(v.v2-v1)+" mL)"}},
 {id:"cg",t:"Depuração de creatinina (Cockcroft-Gault) · adulto",f:[["a","Idade (anos)"],["p","Peso (kg)"],["s","Creatinina sérica (mg/dL)"],["g","Sexo","sex"]],
  fx:"ClCr (mL/min) = (140 − idade) × peso ÷ (72 × SCr) × 0,85 se mulher",refs:["CG"],
  run:v=>{if(!(v.a>0&&v.p>0&&v.s>0))return null;return "ClCr: <b>"+fmt(CALC.crclCG(v.a,v.p,v.s,v.g==="f"),1)+" mL/min</b><br><span class='note'>Validada em adultos; use o peso conforme o protocolo do serviço (real, ideal ou ajustado). Não usar em crianças.</span>"}},
 {id:"epi",t:"TFG adulto (CKD-EPI 2021, creatinina) · só adultos",f:[["a","Idade (anos)"],["s","Creatinina sérica (mg/dL)"],["g","Sexo","sex"]],
  fx:"142 × mín(SCr/κ,1)^α × máx(SCr/κ,1)^−1,200 × 0,9938^idade × 1,012 (se mulher); κ = 0,7 (F)/0,9 (M); α = −0,241 (F)/−0,302 (M)",refs:["CKDEPI"],
  run:v=>{if(!(v.a>0&&v.s>0))return null;return "TFGe: <b>"+fmt(CALC.ckdepi2021(v.a,v.s,v.g==="f"),1)+" mL/min/1,73 m²</b>"}}];
function renderCalcs(){
  $("#cgrid").innerHTML=CALCS.map(c=>'<div class="card" data-c="'+c.id+'"><h3>'+c.t+'</h3><form class="calc-form" onsubmit="return false" style="margin:0">'
   +c.f.map(f=>f[2]==="sex"?'<label class="fld">'+f[1]+'<select name="'+f[0]+'">'+sexF.map(s=>'<option value="'+s[0]+'">'+s[1]+"</option>").join("")+"</select></label>"
    :f[2]==="drip"?'<label class="fld">'+f[1]+'<select name="'+f[0]+'"><option value="20">Macro (20 gts/mL)</option><option value="60">Micro (60 gts/mL)</option></select></label>'
    :'<label class="fld">'+f[1]+'<input inputmode="decimal" name="'+f[0]+'"></label>').join("")
   +'<output class="out" aria-live="polite"><span class="note">Preencha os campos.</span></output></form><div class="formula">'+c.fx+'</div><div class="refchips"><span>Fonte:</span>'+c.refs.map(refChip).join("")+"</div></div>").join("")}
function runCalc(card){const c=CALCS.find(x=>x.id===card.dataset.c),f=$("form",card),v={};
  c.f.forEach(x=>{const e=f.elements[x[0]];v[x[0]]=(x[2]?e.value:parseFloat(String(e.value).replace(",",".")))});
  const r=c.run(v);$(".out",f).innerHTML=r||'<span class="note">Preencha os campos.</span>'}

/* ---------- triagem de prescrição (cesta) ---------- */
const PT=Object.assign({age:"adu",crcl:"",hep:false},store.get("ped-pt",{}));
const TAGE={neo:"Neonato",ped:"Criança",adu:"Adulto",ido:"Idoso"};
const SEVC={2:"grave",1:"aten",0:"info"};
function drugOf(i){const m=M[i.key],s=S[i.key];return {id:i.id,name:i.desc,c:m.c,pa:m.pa||"",ismp:s.ismp,nef:s.nef,nefN:s.nefN,hep:s.hep,hepN:s.hepN,ctl:CTRL.has(i.sec)}}
function triagem(){const items=[...st.cart].map(i=>byId.get(i)).filter(Boolean);
  const crcl=PT.crcl===""||isNaN(parseFloat(PT.crcl))?null:parseFloat(PT.crcl);
  const p={age:PT.age,crcl:crcl,hepatic:PT.hep};
  return {items,p,alerts:Triagem.analyze(items.map(drugOf),p,window.INTER)}}
function srcLinks(a){const F=window.INTER.fontes;return a.ref.map(k=>{const r=F[k]||R[k];if(!r)return "";return '<a class="lk" href="'+esc(r.u)+'" target="_blank" rel="noopener noreferrer" title="'+esc(r.t)+'">'+esc(k==="BULA"?"Bula":k==="LEX"?"Lexicomp":k==="FDATAB"?"FDA (CYP)":k==="CREDMEDS"?"CredibleMeds":k==="DRUGS"?"Drugs.com":k)+"</a>"}).join(" ")}
function alertsHtml(){const t=triagem();if(!t.items.length)return "";
  const al=t.alerts,nG=al.filter(a=>a.sev===2).length,nA=al.filter(a=>a.sev===1).length;
  return '<div class="tri-sum '+(nG?"g":nA?"a":"o")+'"><b>'+(nG?nG+(nG>1?" alertas graves":" alerta grave"):nA?"Nenhum alerta grave":"Nenhum alerta pelas regras")+"</b>"+(nA?" · "+nA+" de atenção":"")+" · "+t.items.length+(t.items.length===1?" item":" itens")+"</div>"
   +al.map(a=>'<article class="tri-al '+SEVC[a.sev]+'"><header><span class="sv">'+Triagem.SEV[a.sev]+"</span><h3>"+esc(a.titulo)+'</h3></header><p class="tri-d">'+a.drugs.map(d=>esc(d.name.split(/[\d(,]/)[0].trim())).join(" + ")+"</p><p>"+esc(a.mec)+"</p><p><b>Conduta sugerida:</b> "+esc(a.cond)+'</p><p class="refchips">'+srcLinks(a)+"</p></article>").join("")
   +(t.items.length>=2&&!al.some(a=>a.tipo==="interacao")?'<p class="note">Nenhuma interação encontrada <b>nas '+window.INTER.regras.length+' regras cadastradas</b>. Isso não exclui interações não cobertas: confira também em <a href="https://www.drugs.com/drug_interactions.html" target="_blank" rel="noopener noreferrer">Drugs.com</a> ou Lexicomp.</p>':"")}
function renderAlerts(){const e=$("#tri-al");if(e)e.innerHTML=alertsHtml()}
function renderCart(){
  const items=[...st.cart].map(i=>byId.get(i)).filter(Boolean);
  const box=$("#cartbox");
  const pt='<div class="tri-pt"><div class="seg" id="tri-age" role="group" aria-label="Faixa etária do paciente">'+Object.keys(TAGE).map(a=>'<button type="button" data-tage="'+a+'" aria-pressed="'+(PT.age===a)+'">'+TAGE[a]+"</button>").join("")+'</div>'
   +'<label class="fld">ClCr (mL/min) <input id="tri-crcl" inputmode="decimal" placeholder="opcional" value="'+esc(PT.crcl)+'"></label>'
   +'<label class="chk"><input type="checkbox" id="tri-hep"'+(PT.hep?" checked":"")+'> Insuficiência hepática</label></div>'
   +'<div class="searchbox tri-add"><input id="tri-q" type="search" placeholder="Adicionar medicamento à triagem" autocomplete="off"></div><div id="tri-res" class="rows" hidden></div>';
  let h=pt+'<div id="tri-al"></div>';
  if(!items.length)h+='<p class="empty">Adicione os medicamentos da prescrição para checar interações, duplicidades e alertas por idade e função renal/hepática.</p>';
  else h+='<h3 class="sub-h">Itens da prescrição</h3><div class="rows">'+items.map(i=>'<div class="mrow" data-id="'+i.id+'"><span class="mname">'+esc(i.desc)+'</span><button class="btn" data-a="cart" data-id="'+i.id+'" aria-pressed="true">Remover</button></div>').join("")+"</div>"
   +'<div class="row" style="margin-top:10px"><button class="btn pri" id="tri-rep">Copiar parecer</button><button class="btn" id="cartcsv">Copiar lista (CSV)</button><button class="btn" id="cartclear">Limpar</button></div>';
  h+='<p class="warn">Triagem de <b>apoio</b>, não prescrição nem parecer. Cobre apenas os medicamentos deste guia e as '+window.INTER.regras.length+' regras cadastradas (compiladas por IA, revisão farmacêutica obrigatória). Não avalia dose total nem alergias. Inspirada nas categorias de alerta do <a href="https://github.com/noharm-ai" target="_blank" rel="noopener noreferrer">NoHarm.ai</a> (licença MIT); nenhum código ou dado do NoHarm foi copiado.</p>';
  box.innerHTML=h;renderAlerts()}
function triInit(){const box=$("#cartbox");
  box.addEventListener("click",e=>{
    const g=e.target.closest("[data-tage]");if(g){PT.age=g.dataset.tage;store.set("ped-pt",PT);$$("#tri-age button").forEach(x=>x.setAttribute("aria-pressed",x===g));renderAlerts();return}
    const a=e.target.closest("[data-addtri]");if(a){st.cart.add(+a.dataset.addtri);persist();renderTabs();return}
    if(e.target.id==="tri-rep"){const t=triagem();copy(Triagem.report(t.alerts,t.p,t.items.map(i=>i.desc)))}});
  box.addEventListener("input",e=>{
    if(e.target.id==="tri-crcl"){PT.crcl=e.target.value.trim();store.set("ped-pt",PT);renderAlerts();return}
    if(e.target.id==="tri-q"){const q=norm(e.target.value.trim()),r=$("#tri-res");if(q.length<2){r.hidden=true;r.innerHTML="";return}
      const hit=ITEMS.filter(i=>!st.cart.has(i.id)&&HAY[i.id].name.includes(q)).slice(0,6);r.hidden=!hit.length;
      r.innerHTML=hit.map(i=>'<button class="ri" type="button" data-addtri="'+i.id+'"><span class="ri-main"><span class="ri-name">'+esc(i.desc)+'</span></span><span class="ri-go" aria-hidden="true">+</span></button>').join("")}});
  box.addEventListener("change",e=>{if(e.target.id==="tri-hep"){PT.hep=e.target.checked;store.set("ped-pt",PT);renderAlerts()}})}

/* ---------- dose do paciente ---------- */
const DZ={sel:null,ap:0,iv:null,last:null,pac:Object.assign({idade:"",un:"anos",sexo:"",peso:"",alt:"",scr:"",renal:"normal",hep:"normal",gest:false,prem:false,desid:false,desn:false,outra:false},store.get("ped-pac",{})),presc:""};
const DOSEBY={};window.DOSE.itens.forEach(d=>d.mono.forEach(k=>{if(!DOSEBY[k])DOSEBY[k]=d}));
const dnum=v=>{const n=parseFloat(String(v).replace(",","."));return isFinite(n)?n:NaN};
function dzPac(){const p=DZ.pac,idade=dnum(p.idade),peso=dnum(p.peso);
  const ia=isFinite(idade)?Dose.idadeEmAnos(idade,p.un):NaN;
  return {idadeAnos:ia,idadeTxt:(p.idade||"-")+" "+p.un,sexo:p.sexo,peso:peso,altura:dnum(p.alt),scr:dnum(p.scr),renal:p.renal,hepatica:p.hep,gestante:p.gest&&p.sexo==="F",prematuro:p.prem,desidratacao:p.desid,desnutricao:p.desn,outra:p.outra}}
function dzCtx(d){const k=d.mono[0];return k?{m:M[k],s:S[k]}:null}
function dzSyncForm(){const p=DZ.pac,pc=dzPac();
  $("#dz-idade").value=p.idade;$("#dz-un").value=p.un;$("#dz-peso").value=p.peso;$("#dz-alt").value=p.alt;$("#dz-scr").value=p.scr;
  $("#dz-renal").value=p.renal;$("#dz-hep").value=p.hep;
  $$("#dz-sexo button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.sx===p.sexo));
  ["gest","prem","desid","desn","outra"].forEach(k=>{$("#dz-"+k).checked=!!p[k]});
  $("#dz-w-gest").hidden=!(p.sexo==="F"&&pc.idadeAnos>=10);$("#dz-w-prem").hidden=!(pc.idadeAnos<=1);
  const t=Dose.tfg(pc);$("#dz-tfg").textContent=t!=null?"TFG estimada: "+t+" mL/min"+(pc.idadeAnos<18?"/1,73 m² (Schwartz)":" (Cockcroft-Gault)"):""}
function dzSave(){store.set("ped-pac",DZ.pac)}
function dzResult(){
  const pc=dzPac(),d=DZ.sel&&window.DOSE.itens.find(x=>x.id===DZ.sel);
  if(!d){$("#dz-out").innerHTML="";return}
  const miss=[];if(!(pc.idadeAnos>=0))miss.push("a idade");if(!(pc.peso>0))miss.push("o peso");
  if(miss.length){$("#dz-out").innerHTML='<p class="empty">Informe '+miss.join(" e ")+" do paciente para calcular a dose.</p>";DZ.last=null;return}
  const pr=dnum(DZ.presc);let r;
  try{r=Dose.calcular(d,pc,dzCtx(d),{ap:DZ.ap,intervalo:DZ.iv,prescrita:isFinite(pr)?pr:null})}catch(e){$("#dz-out").innerHTML='<p class="empty">'+esc(e.message)+"</p>";return}
  DZ.last={r,pc,d};
  let h="";
  const badges=[d.ctl?'<span class="bdg tcb" style="--h:0">Controlado'+(d.p344?" · lista "+esc(String(d.p344).split(" ")[0]):"")+"</span>":"",d.du?'<span class="bdg fcb">Requer dose unitária</span>':"",d.fd?'<span class="bdg fcb">Farmacêutico define frascos</span>':"",d.col?'<span class="bdg fcb">Uso coletivo</span>':""].filter(Boolean).join(" ");
  if(badges)h+='<p class="dr-sub">'+badges+"</p>";
  if(r.doses){
    const card=(k,t,cls)=>{const x=r.doses[k];return '<div class="dz-card '+cls+'"><span class="k">'+t+'</span><b>'+Dose.fmtQ(x.mg)+' mg</b><span class="u">'+(x.u?"= "+Dose.fmtQ(x.u.q)+" "+esc(x.u.un):"")+'</span><small>'+Dose.fmtQ(x.dia)+" mg/dia · "+fmt(x.kgDia)+" mg/kg/dia"+(x.capped?" · limitada pelo teto":"")+"</small></div>"};
    h+='<h3 class="sub-h">Dose por administração (a cada '+r.intervalo+' h, '+fmt(r.dosesDia)+'×/dia)</h3><div class="dz-cards">'+card("min","Mínima","")+card("rec",r.conservadora?"Recomendada (conservadora)":"Recomendada","rec")+card("max","Máxima","")+"</div>";
    h+='<p class="note">A recomendada é o ponto médio da faixa de referência de '+fmt(d.min)+(d.max!==d.min?"–"+fmt(d.max):"")+' mg/kg/dose'+(r.conservadora?"; nas condições informadas ela foi reduzida para o limite inferior da faixa":"")+". Peso usado: "+fmt(pc.peso)+" kg."+"</p>";
    if(r.frascos)h+='<p class="note"><b>Frascos/ampolas ('+esc(r.frascos.forma)+'):</b> '+r.frascos.n+" por dose recomendada (sobra de "+fmt(r.frascos.sobra)+" "+r.frascos.un+").</p>";
  }
  if(r.avisos.length)h+='<h3 class="sub-h">Avisos para este paciente</h3>'+r.avisos.map(a=>'<div class="dz-al '+(a.sev===2?"g":"a")+'">'+esc(a.txt)+"</div>").join("");
  if(r.obs)h+='<p class="note"><b>Observações:</b> '+esc(r.obs)+"</p>";
  const it=d.mono[0]&&ITEMS.find(i=>i.key===d.mono[0]);
  h+='<div class="acts2">'+(it?'<button class="btn" data-open="'+it.id+'">Ver monografia completa</button>':"")+'<button class="btn" id="dz-copy">Copiar parecer</button></div>';
  h+='<h3 class="sub-h">Conferir dose prescrita</h3><label class="fld">Dose prescrita (mg por administração) <input id="dz-presc" inputmode="decimal" placeholder="ex.: 250" value="'+esc(DZ.presc)+'"></label><div id="dz-eval"></div>';
  $("#dz-out").innerHTML=h;dzEval()}
function dzEval(){const e=$("#dz-eval");if(!e||!DZ.last)return;
  const pc=DZ.last.pc,d=DZ.last.d,pr=dnum(DZ.presc);
  if(!isFinite(pr)||pr<=0){e.innerHTML="";DZ.last.r.avaliacao=null;return}
  const r=Dose.calcular(d,pc,dzCtx(d),{ap:DZ.ap,intervalo:DZ.iv,prescrita:pr});DZ.last.r=r;const a=r.avaliacao;
  if(!a){e.innerHTML='<div class="dz-al a">Sem faixa de referência cadastrada: avalie clinicamente.</div>';return}
  const lab={adequada:"Dose dentro da faixa",subdose:"SUBDOSE",subdose_importante:"SUBDOSE IMPORTANTE",superdose:"SUPERDOSE",superdose_importante:"SUPERDOSE IMPORTANTE"}[a.status];
  const cls=a.status==="adequada"&&!a.motivos.length?"ok":a.status.startsWith("super")?"g":"a";
  e.innerHTML='<div class="dz-ev '+cls+'"><b>'+lab+"</b> · "+fmt(a.mg)+" mg a cada "+r.intervalo+" h = "+fmt(a.kgDose)+" mg/kg/dose, "+fmt(a.kgDia)+" mg/kg/dia, "+fmt(a.mgDia)+" mg/dia"
   +(a.motivos.length?"<ul>"+a.motivos.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ul>":"")
   +(a.status!=="adequada"?"<ul>"+a.riscos.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ul>":'<p class="note">Dentro do mínimo e do máximo da faixa de referência.'+(a.motivos.length?"":" Confirme sempre com o prescritor.")+"</p>")+"</div>"}
function dzSelect(id){DZ.sel=id;DZ.ap=0;DZ.presc="";const d=window.DOSE.itens.find(x=>x.id===id);DZ.iv=d?Dose.intervaloPadrao(d):null;
  const box=$("#dz-sel");
  if(!d){box.innerHTML="";dzResult();return}
  const ivs=Dose.intervalosPermitidos(d);
  box.innerHTML='<div class="dz-med"><b>'+esc(d.n)+'</b><span class="note">'+esc(d.c)+" · "+esc(d.v.join(", "))+'</span><div class="dz-row"><label class="fld">Apresentação <select id="dz-ap">'+d.ap.map((p,i)=>'<option value="'+i+'">'+esc(p.f)+"</option>").join("")+'</select></label><label class="fld">Intervalo <select id="dz-iv">'+ivs.map(h=>'<option value="'+h+'"'+(h===DZ.iv?" selected":"")+">a cada "+h+" h</option>").join("")+"</select></label></div></div>";
  dzResult()}
function dzReadForm(){const p=DZ.pac;p.idade=$("#dz-idade").value;p.un=$("#dz-un").value;p.peso=$("#dz-peso").value;p.alt=$("#dz-alt").value;p.scr=$("#dz-scr").value;p.renal=$("#dz-renal").value;p.hep=$("#dz-hep").value;
  ["gest","prem","desid","desn","outra"].forEach(k=>{p[k]=$("#dz-"+k).checked});}
function initDose(){
  $("#dz-renal").innerHTML=Object.entries(Dose.RENAL).map(([k,v])=>'<option value="'+k+'">'+v+"</option>").join("");
  $("#dz-hep").innerHTML=Object.entries(Dose.HEPA).map(([k,v])=>'<option value="'+k+'">'+v+"</option>").join("");
  dzSyncForm();
  const p=$("#p-dose");
  p.addEventListener("input",e=>{const id=e.target.id;
    if(id==="dz-q"){const q=norm(e.target.value.trim()),r=$("#dz-res");if(q.length<2){r.hidden=true;r.innerHTML="";return}
      const hit=window.DOSE.itens.filter(d=>norm(d.n+" "+d.c).includes(q)).slice(0,8);r.hidden=!hit.length;
      r.innerHTML=hit.map(d=>'<button class="ri" type="button" data-dzpick="'+esc(d.id)+'"><span class="ri-main"><span class="ri-name">'+esc(d.n)+'</span><span class="ri-sub">'+esc(d.c)+(d.min==null?" · sem faixa em mg/kg":"")+'</span></span><span class="ri-go" aria-hidden="true">›</span></button>').join("");return}
    if(id==="dz-presc"){DZ.presc=e.target.value;dzEval();return}
    if(/^dz-(idade|un|peso|alt|scr|renal|hep|gest|prem|desid|desn|outra)$/.test(id)){
      dzReadForm();
      if(/^dz-(idade|un|peso|alt|scr)$/.test(id)){const t=Dose.tfg(dzPac()),rr=Dose.renalDeTfg(t);if(rr&&DZ.pac.renal!=="dialise"){DZ.pac.renal=rr;$("#dz-renal").value=rr}}
      dzSave();dzSyncForm();dzResult()}});
  p.addEventListener("change",e=>{const id=e.target.id;
    if(id==="dz-ap"){DZ.ap=+e.target.value;dzResult()}
    else if(id==="dz-iv"){DZ.iv=+e.target.value;dzResult()}
    else if(/^dz-(un|renal|hep|gest|prem|desid|desn|outra)$/.test(id)){dzReadForm();dzSave();dzSyncForm();dzResult()}});
  p.addEventListener("click",e=>{
    const sx=e.target.closest("[data-sx]");if(sx){DZ.pac.sexo=sx.dataset.sx;dzSave();dzSyncForm();dzResult();return}
    const pk=e.target.closest("[data-dzpick]");if(pk){$("#dz-q").value="";$("#dz-res").hidden=true;dzSelect(pk.dataset.dzpick);return}
    if(e.target.id==="dz-copy"&&DZ.last)copy(Dose.parecer(DZ.last.r,DZ.last.pc,{}))});
}
function openDose(id){st.tab="dose";st.more=false;renderTabs();dzSelect(id);window.scrollTo({top:0})}

/* ---------- comparar ---------- */
function renderCmp(){
  const box=$("#cmpbox");
  if(!st.cmp.length){box.innerHTML='<p class="empty">Escolha de 2 a 3 medicamentos com o botão “Comparar” na aba Medicamentos.</p>';return}
  box.innerHTML='<div class="cmp">'+st.cmp.map(id=>{const it=byId.get(id),m=M[it.key],s=S[it.key];
   return '<div class="card"><h3>'+esc(it.desc)+'</h3><span class="note">'+esc(m.n)+" · "+esc(m.c)+'</span><dl><dt>Via</dt><dd>'+esc(m.v)+"</dd><dt>"+AGE[st.age]+" — dose usual</dt><dd>"+esc(st.age==="ido"?m.ido:m[st.age][0])+"</dd><dt>Dose máxima</dt><dd>"+esc(st.age==="ido"?"—":m[st.age][1])+"</dd>"
   +"<dt>Alta vigilância</dt><dd>"+(s.ismp?esc(s.ismp):"não")+"</dd><dt>Rim</dt><dd>"+(s.nef?esc(NL[s.nef]+": "+s.nefN):"sem alerta")+"</dd><dt>Fígado</dt><dd>"+(s.hep?esc(HL[s.hep]+": "+s.hepN):"sem alerta")+"</dd>"
   +(m.pa?"<dt>Alerta pediátrico</dt><dd>"+esc(m.pa)+"</dd>":"")+"<dt>Efeitos graves</dt><dd>"+esc((s.ae.split('|')[1]||'').replace(/^Graves[^:]*:\s*/,""))+'</dd></dl><div class="refchips">'+m.rr.map(refChip).join("")+'</div><div class="row"><button class="btn" data-a="cmp" data-id="'+id+'" aria-pressed="true">Remover</button></div></div>'}).join("")+"</div>"}

/* ---------- referências ---------- */
function renderRefs(){
  const ks=Object.keys(refNum).sort((a,b)=>refNum[a]-refNum[b]);
  const cnt={};ks.forEach(k=>cnt[R[k].l]=(cnt[R[k].l]||0)+1);
  $("#refsbox").innerHTML='<p class="note">Cada referência tem o nível de verificação do link: <b>conferido</b> (endereço aberto durante a elaboração), <b>DOI</b> (identificador registrado, não testado automaticamente), <b>site oficial</b> (página do órgão/editora) e <b>busca</b> (link de pesquisa, pois não foi possível confirmar um endereço direto). Total: '+ks.length+' referências — '+Object.entries(cnt).map(([l,n])=>n+" "+LV[l][0]).join(", ")+'.</p><ol class="refs">'
   +ks.map(k=>'<li id="ref-'+k+'"><b class="lv">['+refNum[k]+"] "+k+"</b> "+esc(R[k].t)+' <a class="lk" href="'+esc(R[k].u)+'" target="_blank" rel="noopener noreferrer">abrir</a> <span class="lv '+(R[k].l==="ok"?"ok":"")+'" title="'+esc(LV[R[k].l][2])+'">'+LV[R[k].l][0]+"</span></li>").join("")+"</ol>"}

/* ---------- navegação ---------- */
const TABS=[["meds","Medicamentos"],["dose","Dose do paciente"],["calc","Calculadoras"],["mine","Minha lista"],["any","Qualquer medicamento"],["cart","Triagem"],["cmp","Comparar"],["refs","Referências"],["about","Sobre"]];
const PRIM=["meds","dose","calc"],SHORT={dose:"Dose"};
function renderTabs(){
  const lab=t=>t[0]==="cart"&&st.cart.size?t[1]+'<span class="n">'+st.cart.size+"</span>":t[0]==="cmp"&&st.cmp.length?t[1]+'<span class="n">'+st.cmp.length+"</span>":t[1];
  const inMore=!PRIM.includes(st.tab),nm=st.cart.size+st.cmp.length;
  $("#tabs").innerHTML=TABS.filter(t=>PRIM.includes(t[0])).map(t=>'<button type="button" role="tab" data-t="'+t[0]+'" aria-selected="'+(st.tab===t[0])+'" title="'+t[1]+'">'+(SHORT[t[0]]||t[1])+"</button>").join("")
   +'<span class="morewrap"><button type="button" data-more="1" aria-haspopup="true" aria-expanded="'+st.more+'" aria-selected="'+inMore+'">'+(inMore?TABS.find(t=>t[0]===st.tab)[1]:"Mais")+(nm&&!inMore?'<span class="n">'+nm+"</span>":"")+' ▾</button>'
   +'<span class="menu" '+(st.more?"":"hidden")+' role="menu">'+TABS.filter(t=>!PRIM.includes(t[0])).map(t=>'<button type="button" role="menuitem" data-t="'+t[0]+'" aria-current="'+(st.tab===t[0])+'">'+lab(t)+"</button>").join("")+"</span></span>";
  $$(".panel").forEach(p=>p.hidden=p.id!=="p-"+st.tab);
  if(st.tab==="any")renderAny();
  if(st.tab==="mine")renderMine();
  if(st.tab==="cart")renderCart();if(st.tab==="cmp")renderCmp()}
function csvOf(items){const q=s=>'"'+String(s==null?"":s).replace(/"/g,'""')+'"';
  return ["codigo","descricao","monografia","classe","vias","dose_usual_"+st.age,"dose_max_"+st.age,"alta_vigilancia","nefro","hepato"].join(";")+"\n"+items.map(i=>{const m=M[i.key],s=S[i.key],d=st.age==="ido"?[m.ido,""]:m[st.age];return [i.code,i.desc,m.n,m.c,m.v,d[0],d[1],s.ismp,NL[s.nef],HL[s.hep]].map(q).join(";")}).join("\n")}
function persist(){store.set("icam-fav",[...st.fav]);store.set("icam-cart",[...st.cart])}
function onAction(e){const b=e.target.closest("button[data-a]");if(!b)return;const a=b.dataset.a;const id=+(b.dataset.id||b.closest("[data-id]").dataset.id);
  if(a==="fav"){st.fav.has(id)?st.fav.delete(id):st.fav.add(id)}
  else if(a==="cart"){st.cart.has(id)?st.cart.delete(id):st.cart.add(id)}
  else if(a==="cmp"){const i=st.cmp.indexOf(id);if(i>=0)st.cmp.splice(i,1);else{if(st.cmp.length>=3){toast("Máximo de 3 medicamentos na comparação");return}st.cmp.push(id)}}
  persist();renderTabs();syncDrawer();
  if(st.tab==="meds"){const r=b.closest(".ri");if(r&&a==="fav")b.setAttribute("aria-pressed",st.fav.has(id));else renderMeds()}
}
function init(){
  $("#mat").innerHTML=CAT.materiais.map(m=>"<li>"+esc(m)+"</li>").join("");
  renderCalcs();renderRefs();initMine();triInit();initDose();
  $("#tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.more){st.more=!st.more;renderTabs();return}
    st.tab=b.dataset.t;st.more=false;renderTabs();window.scrollTo({top:0})});
  document.addEventListener("click",e=>{if(st.more&&!e.target.closest(".morewrap")){st.more=false;renderTabs()}});
  $("#q").addEventListener("input",()=>{if($("#q").value.trim()){st.favOnly=false}renderMeds()});
  $("#clearq").addEventListener("click",()=>{$("#q").value="";renderMeds();$("#q").focus()});
  const nav=e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
    if(d.imp){importList(d.imp);return}
    if(d.fav){st.favOnly=true;st.tc=st.fc="";$("#q").value="";renderMeds();window.scrollTo({top:0});return}
    if(d.tc!==undefined){st.tc=d.tc;st.fc="";st.favOnly=false}
    else if(d.fc!==undefined){st.fc=d.fc}
    else if(d.crumb){st.tc=st.fc="";st.favOnly=false;$("#q").value="";renderMeds();window.scrollTo({top:0});return}
    else return;
    if(d.clearq)$("#q").value="";
    renderMeds();window.scrollTo({top:0})};
  $("#browse").addEventListener("click",nav);$("#crumb").addEventListener("click",nav);
  $("#drawer").addEventListener("click",e=>{const b=e.target.closest("[data-dage]");if(!b)return;
    st.age=b.dataset.dage;store.set("icam-age",st.age);
    $$("#dr-age button").forEach(x=>x.setAttribute("aria-pressed",x===b));
    const it=byId.get(st.dr-1);$("#dr-dose").innerHTML=doseHtml(it);$("#dr-hint").textContent=AGEHINT[st.age]});
  $("#drawer").addEventListener("input",e=>{const f=e.target.closest("form.calc-form");if(f)calcDose(f)});
  $("#cgrid").addEventListener("input",e=>{const c=e.target.closest(".card");if(c)runCalc(c)});
  $("#cartbox").addEventListener("click",e=>{if(e.target.id==="cartcsv")copy(csvOf([...st.cart].map(i=>byId.get(i))));if(e.target.id==="cartclear"){st.cart.clear();persist();renderTabs()}});
  $("#any-pt").addEventListener("input",renderAny);$("#any-en").addEventListener("input",renderAny);
  $("#anycalc").addEventListener("input",runAny);
  $("#any-refs").innerHTML=refChip("ANSEL")+" "+refChip("ANV");
  document.addEventListener("click",e=>{
    const o=e.target.closest("[data-open]");if(o){e.preventDefault();const it=byId.get(+o.dataset.open);if(it)openItem(it);return}
    const dz=e.target.closest("[data-dz]");if(dz){closeDrawer();openDose(dz.dataset.dz);return}
    if(e.target.closest("[data-close]")){closeDrawer();return}
    if(e.target.closest("#out,#cartbox,#cmpbox,#drawer"))onAction(e)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(st.dr)closeDrawer();else if(st.more){st.more=false;renderTabs()}}});
  window.addEventListener("popstate",()=>closeDrawer(true));
  $("#out").addEventListener("click",e=>{if(e.target.id==="goany"){$("#any-pt").value=$("#q").value.trim();st.tab="any";renderTabs();renderAny();window.scrollTo({top:0})}});
  const pb=$("#print");if(pb)pb.addEventListener("click",()=>window.print());
  renderTabs();renderMeds();
  const hm=location.hash.match(/caf=([^&]+)/);if(hm){const it=ITEMS.find(i=>i.code===decodeURIComponent(hm[1]));if(it)openItem(it)}
  if("serviceWorker" in navigator&&location.protocol.startsWith("http")){navigator.serviceWorker.register("sw.js").catch(()=>{})}
}
init();
})();
