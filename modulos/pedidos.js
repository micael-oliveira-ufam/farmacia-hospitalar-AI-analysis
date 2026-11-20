/* Módulo Pedidos: CAF → CEMA (reposição) e Transferência CAF → Farmácia Clínica. Tudo local. */
(function(){
var $=PC.$,esc=PC.esc,KEY="pc:pedidos:v1";
var UNITS=["ICAM","Policlínica Codajás","Outro hospital"];
var UN=["UN","cx","fr","amp","comp","cp","sachê","bolsa","kit"];
var ST={rascunho:"Rascunho",enviado:"Enviado",parcial:"Atendido em parte",atendido:"Atendido",cancelado:"Cancelado"};
var TIPO={cema:{n:"CAF → CEMA",l:"Pedido ao CEMA",o:"CAF",d:"CEMA",c:"cema"},trf:{n:"CAF → Farmácia Clínica",l:"Transferência para a Farmácia Clínica",o:"CAF",d:"Farmácia Clínica",c:"trf"}};
var MOTIVOS=["Reposição do estoque da Farmácia Clínica","Prescrição individualizada","Kit de emergência / carrinho","Outro"];
var PROG=["Mensal programada","Complementar","Emergencial"];
var S=PC.load(KEY,{seq:{},peds:[]});
var cur=null,fil={q:"",tipo:"",st:""},editing=false;
function save(){PC.save(KEY,S)}
function get(id){return S.peds.filter(function(p){return p.id===id})[0]}
function nextNum(tipo){var y=new Date().getFullYear(),k=tipo+y;S.seq[k]=(S.seq[k]||0)+1;return(tipo==="cema"?"CEMA":"TRF")+" "+y+"/"+String(S.seq[k]).padStart(4,"0")}
function log(p,msg){p.hist.push({t:PC.now(),m:msg});p.upd=PC.now()}
function novo(tipo){
  var p={id:PC.uid(),num:nextNum(tipo),tipo:tipo,status:"rascunho",data:PC.today(),unidade:PC.load("pc:pedidos:unidade","ICAM"),solic:PC.load("pc:pedidos:solic",""),prio:"rotina",prog:PROG[0],motivo:MOTIVOS[0],setor:"",obs:"",ref:"",receb:"",ate:"",itens:[],hist:[],upd:PC.now()};
  log(p,"Rascunho criado");S.peds.unshift(p);save();cur=p.id;editing=true;render();return p}
function dup(p){var q=JSON.parse(JSON.stringify(p));q.id=PC.uid();q.num=nextNum(p.tipo);q.status="rascunho";q.data=PC.today();q.ref="";q.receb="";q.ate="";q.hist=[];q.itens.forEach(function(i){i.id=PC.uid();i.atend=0;i.lote="";i.val=""});log(q,"Criado a partir de "+p.num);S.peds.unshift(q);save();cur=q.id;editing=true;render()}
function totQ(p){return p.itens.reduce(function(a,i){return a+PC.num(i.qtd)},0)}
function totA(p){return p.itens.reduce(function(a,i){return a+PC.num(i.atend)},0)}
var open_=function(p){return p.status==="enviado"||p.status==="parcial"};

/* ---------- lista ---------- */
function filtered(){var q=PC.norm(fil.q);return S.peds.filter(function(p){
  if(fil.tipo&&p.tipo!==fil.tipo)return false;if(fil.st&&p.status!==fil.st)return false;
  if(!q)return true;return PC.norm(p.num+" "+p.solic+" "+p.unidade+" "+p.itens.map(function(i){return i.nome}).join(" ")).indexOf(q)>=0})}
function chip(lab,on,attr,n){return"<button type=\"button\" class=\"chip\" "+attr+" aria-pressed=\""+on+"\">"+esc(lab)+(n!=null?" <small>"+n+"</small>":"")+"</button>"}
function renderList(){
  var d30=new Date(Date.now()-30*864e5).toISOString().slice(0,10);
  var ab=S.peds.filter(open_).length,ur=S.peds.filter(function(p){return open_(p)&&p.prio==="urgente"}).length,at=S.peds.filter(function(p){return p.status==="atendido"&&(p.ate||p.data)>=d30}).length;
  $("#kpis").innerHTML="<div class=\"kpi\" style=\"--c:var(--amber)\"><b>"+ab+"</b><span>Em aberto</span></div><div class=\"kpi\" style=\"--c:var(--r4)\"><b>"+ur+"</b><span>Urgentes</span></div><div class=\"kpi\" style=\"--c:var(--ok)\"><b>"+at+"</b><span>Atendidos em 30 dias</span></div>";
  $("#f-tipo").innerHTML=chip("Todos",!fil.tipo,"data-t=\"\"")+chip("CAF → CEMA",fil.tipo==="cema","data-t=\"cema\"",S.peds.filter(function(p){return p.tipo==="cema"}).length)+chip("Farmácia Clínica",fil.tipo==="trf","data-t=\"trf\"",S.peds.filter(function(p){return p.tipo==="trf"}).length);
  $("#f-st").innerHTML=chip("Qualquer situação",!fil.st,"data-s=\"\"")+Object.keys(ST).map(function(k){return chip(ST[k],fil.st===k,"data-s=\""+k+"\"")}).join("");
  var l=filtered();
  $("#list").innerHTML=!S.peds.length?"<p class=\"hint\" style=\"padding:16px 4px\">Nenhum pedido ainda. Comece por um dos botões acima.</p>":!l.length?"<p class=\"hint\" style=\"padding:16px 4px\">Nenhum pedido com esse filtro.</p>":"<div class=\"cards\">"+l.map(function(p){return"<button type=\"button\" class=\"it"+(p.id===cur?" on":"")+"\" data-id=\""+p.id+"\"><span class=\"t\"><span>"+esc(p.num)+"</span><span class=\"bdg st-"+p.status+"\">"+ST[p.status]+"</span></span><span class=\"s\"><span class=\"bdg "+TIPO[p.tipo].c+"\">"+TIPO[p.tipo].n+"</span>"+(p.prio==="urgente"?"<span class=\"bdg urg\">Urgente</span>":"")+"<span>"+PC.fdate(p.data)+" · "+p.itens.length+" ite"+(p.itens.length===1?"m":"ns")+"</span></span></button>"}).join("")+"</div>"}

/* ---------- documento ---------- */
function opt(arr,v){return arr.map(function(a){return"<option"+(a===v?" selected":"")+">"+esc(a)+"</option>"}).join("")}
function fld(label,html,cls){return"<label class=\"fld "+(cls||"")+"\">"+label+html+"</label>"}
function inp(f,v,type,extra){return"<input data-f=\""+f+"\" type=\""+(type||"text")+"\" value=\""+esc(v)+"\" "+(extra||"")+(editing?"":" disabled")+">"}
function sel(f,arr,v){return"<select data-f=\""+f+"\""+(editing?"":" disabled")+">"+opt(arr,v)+"</select>"}
function cob(i){var c=PC.num(i.cmd);return c>0&&i.est!==""&&i.est!=null?PC.fmt(PC.num(i.est)/(c/30)):"–"}
function itemsTable(p){
  var cema=p.tipo==="cema",ate=!editing&&p.status!=="rascunho"&&p.status!=="cancelado";
  var head="<th>Item</th>"+(cema?"<th>Estoque atual</th><th>Consumo mensal</th><th>Cobertura (dias)</th>":"")+"<th>Qtd</th><th>Un.</th>"+(editing?"<th>Justificativa</th><th></th>":"")+(ate?"<th>Atendido</th>"+(cema?"":"<th>Lote</th><th>Validade</th>"):"");
  var rows=p.itens.map(function(i,k){var nm=editing?"<input data-i=\""+k+"\" data-f=\"nome\" value=\""+esc(i.nome)+"\">":"<b>"+esc(i.nome)+"</b>"+(i.cod?" <small class=\"hint\">cód. "+esc(i.cod)+"</small>":"")+(i.just?"<br><small class=\"hint\">"+esc(i.just)+"</small>":"");
    var ro=function(f,type){return editing?"<input data-i=\""+k+"\" data-f=\""+f+"\" type=\""+(type||"number")+"\" "+(type?"":"min=\"0\" step=\"any\" inputmode=\"decimal\"")+" value=\""+esc(i[f]==null?"":i[f])+"\">":esc(i[f]==null||i[f]===""?"–":i[f])};
    return"<tr><td style=\"min-width:200px\">"+nm+"</td>"+(cema?"<td>"+ro("est")+"</td><td>"+ro("cmd")+"</td><td data-cob=\""+k+"\">"+cob(i)+"</td>":"")+"<td>"+ro("qtd")+"</td><td>"+(editing?"<select data-i=\""+k+"\" data-f=\"un\">"+opt(UN,i.un)+"</select>":esc(i.un))+"</td>"+(editing?"<td><input data-i=\""+k+"\" data-f=\"just\" value=\""+esc(i.just||"")+"\" placeholder=\"opcional\"></td><td><button class=\"x\" type=\"button\" data-del=\""+k+"\" aria-label=\"Remover item\">✕</button></td>":"")+(ate?"<td><input data-i=\""+k+"\" data-f=\"atend\" type=\"number\" min=\"0\" step=\"any\" inputmode=\"decimal\" value=\""+esc(i.atend||"")+"\"></td>"+(cema?"":"<td><input data-i=\""+k+"\" data-f=\"lote\" value=\""+esc(i.lote||"")+"\"></td><td><input data-i=\""+k+"\" data-f=\"val\" type=\"month\" value=\""+esc(i.val||"")+"\"></td>"):"")+"</tr>"}).join("");
  return"<div class=\"tbl\"><table><thead><tr>"+head+"</tr></thead><tbody>"+(rows||"<tr><td colspan=\"9\" class=\"hint\" style=\"padding:16px\">Nenhum item. Busque um medicamento abaixo.</td></tr>")+"</tbody></table></div>"}
function renderDetail(){
  var p=get(cur),el=$("#detail");
  if(!p){el.className="";el.innerHTML="<div class=\"detail-empty\"><h2>Escolha ou crie um pedido</h2><p>Dois tipos de pedido, com o mesmo fluxo:</p><ul><li><b>CAF → CEMA</b>: reposição, com estoque atual, consumo mensal e cobertura em dias de cada item.</li><li><b>CAF → Farmácia Clínica</b>: transferência interna, com motivo, lote e validade conferidos no recebimento.</li><li>Situação: rascunho, enviado, atendido (inclusive em parte) ou cancelado, com histórico de cada mudança.</li><li>Imprima o formulário com campos de assinatura, copie o texto para mensagem ou baixe o CSV.</li></ul></div>";return}
  var T=TIPO[p.tipo],cema=p.tipo==="cema",ed=editing&&p.status==="rascunho";editing=ed;
  var acts="";
  if(p.status==="rascunho")acts+="<button class=\"btn pri\" data-a=\"send\">Marcar como enviado</button><button class=\"btn\" data-a=\"del\">Excluir</button>";
  if(p.status==="enviado"||p.status==="parcial"||p.status==="atendido")acts+=(p.status==="enviado"?"<button class=\"btn\" data-a=\"reopen\">Reabrir rascunho</button>":"")+"<button class=\"btn pri\" data-a=\"saveate\">Salvar atendimento</button>";
  if(open_(p))acts+="<button class=\"btn\" data-a=\"cancel\">Cancelar pedido</button>";
  if(p.status==="cancelado")acts+="<button class=\"btn\" data-a=\"del\">Excluir</button>";
  var head="<div class=\"doc-h\"><div><h2>"+esc(p.num)+"</h2><div class=\"row\" style=\"margin-top:6px\"><span class=\"bdg "+T.c+"\">"+T.n+"</span><span class=\"bdg st-"+p.status+"\">"+ST[p.status]+"</span>"+(p.prio==="urgente"?"<span class=\"bdg urg\">Urgente</span>":"")+"</div></div><div class=\"row\"><button class=\"btn noapp\" data-a=\"print\">Imprimir</button><button class=\"btn\" data-a=\"copy\">Copiar texto</button><button class=\"btn\" data-a=\"csv\">CSV</button><button class=\"btn\" data-a=\"dup\">Duplicar</button></div></div>";
  var f1="<div class=\"grid\">"+fld("Unidade (hospital)",sel("unidade",UNITS,p.unidade))+fld("Data",inp("data",p.data,"date"))+fld("Solicitante",inp("solic",p.solic,"text","placeholder=\"Farmacêutico ou técnico\""))+fld("Prioridade",sel("prio",["rotina","urgente"],p.prio))
   +(cema?fld("Programação",sel("prog",PROG,p.prog)):fld("Motivo",sel("motivo",MOTIVOS,p.motivo),"w2")+fld("Setor atendido",inp("setor",p.setor,"text","placeholder=\"ex.: UTI, pronto-socorro\"")))
   +fld("Observações","<textarea data-f=\"obs\""+(editing?"":" disabled")+">"+esc(p.obs)+"</textarea>","full")+"</div>";
  var add=editing?"<div class=\"fld\" style=\"margin-top:10px\"><span>Adicionar item <small>(busque na lista do ICAM ou da Policlínica Codajás, ou digite e tecle Enter)</small></span><div><input id=\"addi\" placeholder=\"Ex.: dipirona, amoxicilina…\" autocomplete=\"off\"></div></div>":"";
  var ate="";
  if(p.status!=="rascunho"&&p.status!=="cancelado")ate="<h3 class=\"sec-t\">Atendimento</h3><div class=\"grid\">"+fld("Data do atendimento","<input data-f=\"ate\" type=\"date\" value=\""+esc(p.ate||"")+"\">")+fld(cema?"Nº da guia / movimentação":"Nº da transferência","<input data-f=\"ref\" value=\""+esc(p.ref||"")+"\">")+(cema?"":fld("Recebido por (Farmácia Clínica)","<input data-f=\"receb\" value=\""+esc(p.receb||"")+"\">"))+"</div><p class=\"hint\">Informe a quantidade atendida de cada item na tabela. Se for menor que a pedida, o pedido fica como atendido em parte.</p>";
  var warn=(p.status==="rascunho"&&!p.itens.length)?"":"";
  var hist="<h3 class=\"sec-t\">Histórico</h3><ul class=\"tl\">"+p.hist.slice().reverse().map(function(h){return"<li>"+esc(h.m)+" <small>· "+PC.fdt(h.t)+"</small></li>"}).join("")+"</ul>";
  el.className="detail-pane";
  el.innerHTML=head+f1+"<h3 class=\"sec-t\">Itens <span class=\"hint\" id=\"tot\"></span></h3>"+itemsTable(p)+add+ate+(acts?"<div class=\"row\" style=\"margin-top:16px\">"+acts+"</div>":"")+hist;
  totals();
  var ai=$("#addi");if(ai)PC.suggest(ai,function(x){addItem(p,{nome:x.n,cod:x.c||""})},function(v){addItem(p,{nome:v,cod:""})})}
function totals(){var p=get(cur),t=$("#tot");if(p&&t)t.textContent="· "+p.itens.length+" ite"+(p.itens.length===1?"m":"ns")+(totQ(p)?", "+PC.fmt(totQ(p))+" unidades pedidas":"")+(totA(p)?", "+PC.fmt(totA(p))+" atendidas":"")}
function addItem(p,x){if(p.itens.some(function(i){return PC.norm(i.nome)===PC.norm(x.nome)})){PC.toast("Esse item já está no pedido.");return}
  p.itens.push({id:PC.uid(),nome:x.nome,cod:x.cod,qtd:"",un:"UN",just:"",est:"",cmd:"",atend:0,lote:"",val:""});p.upd=PC.now();save();render();var q=$("#detail [data-i=\""+(p.itens.length-1)+"\"][data-f=\"qtd\"]");if(q)q.focus()}

/* ---------- ações ---------- */
function valid(p){var e=[];if(!p.solic.trim())e.push("informe o solicitante");if(!p.itens.length)e.push("adicione ao menos um item");p.itens.forEach(function(i){if(!(PC.num(i.qtd)>0))e.push("quantidade do item \""+i.nome+"\"")});return e}
function textOf(p){var T=TIPO[p.tipo];return T.l.toUpperCase()+" "+p.num+"\n"+p.unidade+" · "+PC.fdate(p.data)+(p.prio==="urgente"?" · URGENTE":"")+"\nSolicitante: "+p.solic+"\n"+(p.tipo==="cema"?"Programação: "+p.prog:"Motivo: "+p.motivo+(p.setor?" · Setor: "+p.setor:""))+"\n\n"+p.itens.map(function(i,k){return(k+1)+". "+i.nome+" — "+i.qtd+" "+i.un+(i.just?" ("+i.just+")":"")}).join("\n")+(p.obs?"\n\nObs.: "+p.obs:"")}
function csvOf(list){var rows=[["pedido","tipo","situacao","data","unidade","origem","destino","prioridade","solicitante","item","codigo","un","qtd_pedida","qtd_atendida","lote","validade"]];list.forEach(function(p){var T=TIPO[p.tipo];if(!p.itens.length)rows.push([p.num,T.n,ST[p.status],p.data,p.unidade,T.o,T.d,p.prio,p.solic]);p.itens.forEach(function(i){rows.push([p.num,T.n,ST[p.status],p.data,p.unidade,T.o,T.d,p.prio,p.solic,i.nome,i.cod,i.un,i.qtd,i.atend||"",i.lote||"",i.val||""])})});return PC.csv(rows)}
function printDoc(p){var T=TIPO[p.tipo],cema=p.tipo==="cema";
  $("#printdoc").innerHTML="<h1>"+esc(T.l)+" · "+esc(p.num)+"</h1><p>"+esc(p.unidade)+" · "+PC.fdate(p.data)+" · Prioridade: "+esc(p.prio)+"<br>Origem: "+T.o+" · Destino: "+T.d+(cema?" · Programação: "+esc(p.prog):" · Motivo: "+esc(p.motivo)+(p.setor?" · Setor: "+esc(p.setor):""))+"<br>Solicitante: "+esc(p.solic)+"</p><table><thead><tr><th>#</th><th>Item</th><th>Cód.</th>"+(cema?"<th>Estoque</th><th>Cons. mensal</th>":"")+"<th>Qtd</th><th>Un.</th><th>Atendido</th>"+(cema?"":"<th>Lote</th><th>Val.</th>")+"</tr></thead><tbody>"+p.itens.map(function(i,k){return"<tr><td>"+(k+1)+"</td><td>"+esc(i.nome)+(i.just?"<br><small>"+esc(i.just)+"</small>":"")+"</td><td>"+esc(i.cod)+"</td>"+(cema?"<td>"+esc(i.est)+"</td><td>"+esc(i.cmd)+"</td>":"")+"<td>"+esc(i.qtd)+"</td><td>"+esc(i.un)+"</td><td>"+esc(i.atend||"")+"</td>"+(cema?"":"<td>"+esc(i.lote||"")+"</td><td>"+esc(i.val||"")+"</td>")+"</tr>"}).join("")+"</tbody></table>"+(p.obs?"<p><b>Observações:</b> "+esc(p.obs)+"</p>":"")+"<div class=\"sig\"><div>Solicitante</div><div>Responsável técnico</div><div>"+(cema?"Recebimento":"Recebido por (Farmácia Clínica)")+"</div></div><p style=\"font-size:.8rem;margin-top:14px\">Autores da plataforma: Micael Davi Lima de Oliveira (ICAM) e Ennylay (ICAM).</p>";
  window.print()}
function act(a){var p=get(cur);if(!p)return;
  if(a==="print")return printDoc(p);
  if(a==="copy")return PC.copy(textOf(p)).then(function(ok){PC.toast(ok?"Texto copiado.":"Não foi possível copiar.")});
  if(a==="csv")return PC.exportText(p.num.replace(/\W+/g,"_")+".csv",csvOf([p]),"text/csv","CSV");
  if(a==="dup")return dup(p);
  if(a==="send"){var e=valid(p);if(e.length){PC.dialog("Faltam dados","<p>Para enviar, "+e.map(esc).join("; ")+".</p>",[{label:"Entendi",cls:"pri",value:true}]);return}
    p.status="enviado";log(p,"Marcado como enviado");editing=false;PC.save("pc:pedidos:solic",p.solic);PC.save("pc:pedidos:unidade",p.unidade);save();return render()}
  if(a==="reopen"){p.status="rascunho";log(p,"Reaberto como rascunho");editing=true;save();return render()}
  if(a==="saveate"){var q=totQ(p),t=totA(p),prev=p.status;p.status=t<=0?"enviado":(t>=q?"atendido":"parcial");if(!p.ate&&t>0)p.ate=PC.today();if(p.status!==prev||t>0)log(p,p.status==="atendido"?"Atendido por completo":p.status==="parcial"?"Atendido em parte ("+PC.fmt(t)+" de "+PC.fmt(q)+")":"Atendimento zerado");save();PC.toast("Atendimento salvo.");return render()}
  if(a==="cancel")return PC.confirm("Cancelar o pedido "+p.num+"? O registro fica no histórico.","Cancelar pedido").then(function(ok){if(ok){p.status="cancelado";log(p,"Cancelado");save();render()}});
  if(a==="del")return PC.confirm("Excluir "+p.num+" de vez? Isso não pode ser desfeito.","Excluir").then(function(ok){if(ok){S.peds=S.peds.filter(function(x){return x.id!==p.id});cur=null;save();render()}})}

/* ---------- eventos ---------- */
document.addEventListener("click",function(e){
  var t;
  if(e.target.closest("#n-cema")){novo("cema");return}if(e.target.closest("#n-trf")){novo("trf");return}
  if((t=e.target.closest("#list [data-id]"))){cur=t.getAttribute("data-id");editing=get(cur).status==="rascunho";render();var d=$("#detail");if(window.innerWidth<1024)d.scrollIntoView({behavior:"smooth"});return}
  if((t=e.target.closest("#f-tipo [data-t]"))){fil.tipo=t.getAttribute("data-t");renderList();return}
  if((t=e.target.closest("#f-st [data-s]"))){fil.st=t.getAttribute("data-s");renderList();return}
  if((t=e.target.closest("[data-a]"))){act(t.getAttribute("data-a"));return}
  if((t=e.target.closest("[data-del]"))){var p=get(cur);p.itens.splice(+t.getAttribute("data-del"),1);save();render();return}
  if(e.target.closest("#bk")){PC.exportText("pharmacentral_pedidos_"+PC.today()+".json",JSON.stringify(S),"application/json","Backup");return}
  if(e.target.closest("#csv-all")){PC.exportText("pedidos_"+PC.today()+".csv",csvOf(S.peds),"text/csv","CSV");return}
  if(e.target.closest("#rs")){PC.pasteBox("Restaurar backup","Cole o conteúdo do backup (JSON) ou escolha o arquivo. Isso substitui os pedidos deste aparelho.").then(function(txt){if(!txt)return;try{var o=JSON.parse(txt);if(!o||!Array.isArray(o.peds))throw 0;S={seq:o.seq||{},peds:o.peds};save();cur=null;render();PC.toast(S.peds.length+" pedidos restaurados.")}catch(x){PC.toast("Arquivo inválido.")}});return}
});
document.addEventListener("input",function(e){
  var t=e.target;if(t.id==="q"){fil.q=t.value;renderList();return}
  var f=t.getAttribute&&t.getAttribute("data-f");if(!f)return;var p=get(cur);if(!p)return;
  var i=t.getAttribute("data-i");
  if(i!=null){var it=p.itens[+i];it[f]=t.value;if(f==="est"||f==="cmd"){var c=$("[data-cob=\""+i+"\"]");if(c)c.textContent=cob(it)}}
  else p[f]=t.value;
  p.upd=PC.now();save();totals();if(f==="prio"||f==="data")renderList()});
document.addEventListener("change",function(e){var f=e.target.getAttribute&&e.target.getAttribute("data-f");if(f==="prio"||f==="unidade"){var p=get(cur);if(p){renderDetail();renderList()}}});
function render(){renderList();renderDetail()}
render();
})();
