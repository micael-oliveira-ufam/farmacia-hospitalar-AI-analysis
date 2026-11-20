/* Utilidades dos módulos Pedidos e Prontuário. Sem dependências, sem rede; dados só no aparelho. */
(function(){
var PC=window.PC={},mem={};
PC.$=function(s,r){return(r||document).querySelector(s)};PC.$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
PC.esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
PC.load=function(k,d){try{var v=localStorage.getItem(k);if(v!=null)return JSON.parse(v)}catch(e){}return k in mem?mem[k]:d};
PC.save=function(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
PC.uid=function(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
var pad=PC.pad=function(n){return String(n).padStart(2,"0")};
PC.today=function(){var d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
PC.now=function(){var d=new Date();return PC.today()+"T"+pad(d.getHours())+":"+pad(d.getMinutes())};
PC.fdate=function(i){if(!i)return"";var p=i.slice(0,10).split("-");return p[2]+"/"+p[1]+"/"+p[0]};
PC.fdt=function(i){return i?PC.fdate(i)+(i.length>10?" "+i.slice(11,16):""):""};
PC.norm=function(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()};
PC.num=function(v){var n=parseFloat(String(v==null?"":v).replace(",","."));return isFinite(n)?n:0};
PC.fmt=function(n){return(Math.round(n*100)/100).toLocaleString("pt-BR")};
PC.toast=function(m){var t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2600)};
PC.copy=function(text){
  function fb(){var a=document.createElement("textarea");a.value=text;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}a.remove();return ok}
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text).then(function(){return true},function(){return fb()});
  return Promise.resolve(fb())};
/* no site baixa o arquivo; no app Android (sem download) copia o texto */
PC.exportText=function(name,text,type,label){
  if(document.body.classList.contains("app")){PC.copy(text).then(function(ok){PC.toast(ok?(label||"Conteúdo")+" copiado. Cole em uma nota ou mensagem.":"Não foi possível copiar.")});return}
  var b=new Blob(["﻿"+text],{type:type||"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1500)};
PC.csv=function(rows){return rows.map(function(r){return r.map(function(c){c=String(c==null?"":c);return /[;"\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(";")}).join("\r\n")};
/* caixas de diálogo próprias: alert/confirm/prompt não funcionam no WebView do app */
PC.dialog=function(title,html,actions){return new Promise(function(res){
  var m=document.createElement("div");m.className="mdl";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  m.innerHTML="<div><h3>"+PC.esc(title)+"</h3><div class=\"mb\">"+html+"</div><div class=\"row end\" style=\"margin-top:14px\">"+actions.map(function(a,i){return"<button type=\"button\" class=\"btn "+(a.cls||"")+"\" data-i=\""+i+"\">"+PC.esc(a.label)+"</button>"}).join("")+"</div></div>";
  document.body.appendChild(m);
  function done(v){m.remove();res(v)}
  m.addEventListener("click",function(e){var b=e.target.closest("button[data-i]");if(b){var a=actions[+b.getAttribute("data-i")];done(a.value===undefined?a.label:(typeof a.value==="function"?a.value(m):a.value))}else if(e.target===m)done(null)});
  var f=m.querySelector("textarea,input");if(f)f.focus()})};
PC.confirm=function(msg,ok,danger){return PC.dialog("Confirmar","<p>"+PC.esc(msg)+"</p>",[{label:"Cancelar",value:false},{label:ok||"Confirmar",cls:danger?"":"pri",value:true}]).then(function(v){return v===true})};
PC.pasteBox=function(title,hint){return PC.dialog(title,"<p class=\"hint\">"+PC.esc(hint)+"</p><textarea id=\"pb\"></textarea><div class=\"row\" style=\"margin-top:8px\"><label class=\"btn\" style=\"cursor:pointer\">Escolher arquivo<input type=\"file\" accept=\".json,text/plain\" id=\"pbf\" hidden></label></div>",[{label:"Cancelar",value:null},{label:"Restaurar",cls:"pri",value:function(m){return m.querySelector("#pb").value}}]).then(function(v){return v})};
document.addEventListener("change",function(e){if(e.target.id==="pbf"&&e.target.files[0]){e.target.files[0].text().then(function(t){var a=document.getElementById("pb");if(a)a.value=t})}});
/* lista de medicamentos (ICAM + Policlínica Codajás) para busca */
PC.items=window.ITENS||[];
PC.find=function(q,n){q=PC.norm(q).trim();if(!q)return[];var out=[],t=q.split(/\s+/);for(var i=0;i<PC.items.length&&out.length<(n||8);i++){var s=PC.norm(PC.items[i].n);if(t.every(function(x){return s.indexOf(x)>=0}))out.push(PC.items[i])}return out};
PC.suggest=function(input,onPick,onFree){
  var wrap=input.parentNode;wrap.classList.add("sugg");var box=document.createElement("div");box.className="sugg-l";box.hidden=true;wrap.appendChild(box);var cur=[];
  function render(){var r=PC.find(input.value,8);cur=r;if(!input.value.trim()||!r.length){box.hidden=true;return}box.innerHTML=r.map(function(x,i){return"<button type=\"button\" data-i=\""+i+"\">"+PC.esc(x.n)+(x.c?" <small>· cód. "+PC.esc(x.c)+"</small>":"")+"</button>"}).join("");box.hidden=false}
  input.addEventListener("input",render);input.addEventListener("focus",render);
  input.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();var v=input.value.trim();if(!v)return;if(cur.length&&!box.hidden)onPick(cur[0]);else if(onFree)onFree(v);box.hidden=true;input.value=""}else if(e.key==="Escape")box.hidden=true});
  box.addEventListener("mousedown",function(e){var b=e.target.closest("button[data-i]");if(b){e.preventDefault();onPick(cur[+b.getAttribute("data-i")]);input.value="";box.hidden=true}});
  input.addEventListener("blur",function(){setTimeout(function(){box.hidden=true},150)})};
/* tema: claro por padrão; escuro só se a pessoa escolher */
try{var t=localStorage.getItem("fl-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}
document.addEventListener("DOMContentLoaded",function(){var b=PC.$("#theme");if(b)b.addEventListener("click",function(){var r=document.documentElement,n=(r.getAttribute("data-theme")||"light")==="dark"?"light":"dark";r.setAttribute("data-theme",n);try{localStorage.setItem("fl-theme",n)}catch(e){}})});
})();
