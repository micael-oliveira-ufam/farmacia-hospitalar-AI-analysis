/* Módulo Prontuário: acompanhamento farmacêutico local, sem nome do paciente. */
(function(){
var $=PC.$,esc=PC.esc,KEY="pc:pront:v1";
var S=PC.load(KEY,{pac:[]});
var cur=null,sub="resumo",fil={q:"",st:"ativo"},editing=false;
var RIM=[["normal","Função renal normal"],["leve","Redução leve"],["moderada","Redução moderada"],["grave","Redução grave"],["dialise","Diálise"]];
var FIG=[["normal","Função hepática normal"],["alterada","Hepatopatia / função alterada"]];
var TIPOS=["Intervenção farmacêutica","Conciliação medicamentosa","Revisão da prescrição","Monitorização (nível sérico, exames)","Orientação ao paciente ou à equipe","Reação adversa suspeita","Outro"];
var DESF=[["pendente","Pendente"],["aceita","Aceita"],["nao","Não aceita"],["na","Não se aplica"]];
var VIAS=["VO","EV","IM","SC","SL","Inalatória","Tópica","Retal","Outra"];
function save(){PC.save(KEY,S)}
function get(id){return S.pac.filter(function(p){return p.id===id})[0]}
function lab(arr,v){var r=arr.filter(function(a){return a[0]===v})[0];return r?r[1]:v}
function ageTxt(p){return p.idade?p.idade+" "+p.un:"idade não informada"}
function risk(name){var n=PC.norm(name);var m=PC.items.filter(function(x){return PC.norm(x.n)===n})[0];return m||null}
function lvl(arr,n,max){return"<span class=\"mtr\" aria-hidden=\"true\">"+Array.from({length:max+1},function(_,i){return"<i class=\""+(n!=null&&i<=n?"on l"+n:"")+"\"></i>"}).join("")+"</span>"}
var HN=["Improvável","Baixo","Moderado","Alto","Muito alto"],KN=["Sem sinal","Baixo","Moderado","Alto"];
/* alertas: função do paciente x risco de cada fármaco ativo */
function alertas(p){var out=[],rimR=p.rim&&p.rim!=="normal",figR=p.fig==="alterada",gr=p.rim==="grave"||p.rim==="dialise";
  var ped=p.un!=="anos"||(PC.num(p.idade)>0&&PC.num(p.idade)<12);
  p.presc.filter(function(m){return!m.susp}).forEach(function(m){var r=risk(m.med);if(!r)return;
    if(rimR&&r.k!=null&&r.k>=(gr?2:3))out.push({c:r.k>=3?"bad":"warn",t:m.med+": risco renal "+KN[r.k].toLowerCase()+" com função renal reduzida. Revisar dose e necessidade."});
    if(figR&&r.h!=null&&r.h>=3)out.push({c:r.h>=4?"bad":"warn",t:m.med+": risco hepático "+HN[r.h].toLowerCase()+" em paciente com função hepática alterada. Revisar."})});
  var sem=p.presc.filter(function(m){return!m.susp&&!m.dose}).length;if(sem)out.push({c:"warn",t:sem+" medicamento(s) sem dose informada."});
  if(!p.peso)out.push({c:"warn",t:"Peso não informado: doses por kg não podem ser conferidas."+(ped?" Importante em pediatria.":"")});
  var alerg=PC.norm(p.alerg||"");if(alerg&&alerg!=="nega"&&alerg.indexOf("nao")!==0)p.presc.filter(function(m){return!m.susp}).forEach(function(m){alerg.split(/[,;\/]+/).forEach(function(a){a=a.trim();if(a.length>3&&PC.norm(m.med).indexOf(a)>=0)out.push({c:"bad",t:m.med+" coincide com alergia registrada ("+a+")."})})});
  return out}
function penden(p){return p.evol.filter(function(e){return e.desf==="pendente"&&e.tipo==="Intervenção farmacêutica"}).length}
/* ---------- lista ---------- */
function filtered(){var q=PC.norm(fil.q);return S.pac.filter(function(p){if(fil.st&&p.status!==fil.st)return false;return!q||PC.norm(p.reg+" "+p.setor+" "+p.leito+" "+p.ini).indexOf(q)>=0}).sort(function(a,b){return(a.setor||"").localeCompare(b.setor||"")||a.reg.localeCompare(b.reg)})}
function chip(l,on,a,n){return"<button type=\"button\" class=\"chip\" "+a+" aria-pressed=\""+on+"\">"+esc(l)+(n!=null?" <small>"+n+"</small>":"")+"</button>"}
function renderList(){
  var at=S.pac.filter(function(p){return p.status==="ativo"}).length;
  $("#f-st").innerHTML=chip("Em acompanhamento",fil.st==="ativo","data-s=\"ativo\"",at)+chip("Alta",fil.st==="alta","data-s=\"alta\"",S.pac.length-at)+chip("Todos",!fil.st,"data-s=\"\"");
  var l=filtered();
  $("#list").innerHTML=!S.pac.length?"<p class=\"hint\" style=\"padding:16px 4px\">Nenhum paciente ainda. Use o botão acima e informe só o número do prontuário.</p>":!l.length?"<p class=\"hint\" style=\"padding:16px 4px\">Nenhum paciente com esse filtro.</p>":"<div class=\"cards\">"+l.map(function(p){var al=alertas(p).filter(function(a){return a.c==="bad"}).length,pd=penden(p);return"<button type=\"button\" class=\"it"+(p.id===cur?" on":"")+"\" data-id=\""+p.id+"\"><span class=\"t\"><span>Nº "+esc(p.reg)+(p.ini?" · "+esc(p.ini):"")+"</span><span class=\"hint\">"+esc(p.setor||"sem setor")+(p.leito?" · leito "+esc(p.leito):"")+"</span></span><span class=\"s\"><span>"+esc(ageTxt(p))+"</span>"+(p.rim&&p.rim!=="normal"?"<span class=\"bdg warn\">Rim: "+esc(lab(RIM,p.rim).toLowerCase())+"</span>":"")+(p.fig==="alterada"?"<span class=\"bdg warn\">Fígado alterado</span>":"")+(al?"<span class=\"bdg bad\">"+al+" alerta"+(al>1?"s":"")+"</span>":"")+(pd?"<span class=\"bdg warn\">"+pd+" intervenç"+(pd>1?"ões":"ão")+" pendente"+(pd>1?"s":"")+"</span>":"")+(p.status==="alta"?"<span class=\"bdg\">Alta</span>":"")+"</span></button>"}).join("")+"</div>"}
/* ---------- paciente ---------- */
function fld(l,h,c){return"<label class=\"fld "+(c||"")+"\">"+l+h+"</label>"}
function inp(f,v,t,x){return"<input data-f=\""+f+"\" type=\""+(t||"text")+"\" value=\""+esc(v==null?"":v)+"\" "+(x||"")+">"}
function sel(f,arr,v){return"<select data-f=\""+f+"\">"+arr.map(function(a){a=typeof a==="string"?[a,a]:a;return"<option value=\""+esc(a[0])+"\""+(a[0]===v?" selected":"")+">"+esc(a[1])+"</option>"}).join("")+"</select>"}
function cadastro(p){return"<div class=\"grid\">"+fld("Nº do prontuário / atendimento <small>(obrigatório)</small>",inp("reg",p.reg,"text","inputmode=\"numeric\" autocomplete=\"off\""))+fld("Iniciais <small>(opcional, até 3 letras)</small>",inp("ini",p.ini,"text","maxlength=\"3\" autocomplete=\"off\""))+fld("Setor",inp("setor",p.setor,"text","placeholder=\"UTI, clínica médica…\""))+fld("Leito",inp("leito",p.leito))
 +fld("Idade",inp("idade",p.idade,"number","min=\"0\" step=\"any\" inputmode=\"decimal\""))+fld("Unidade da idade",sel("un",["anos","meses","dias"],p.un))+fld("Peso (kg)",inp("peso",p.peso,"number","min=\"0\" step=\"any\" inputmode=\"decimal\""))
 +fld("Função renal",sel("rim",RIM,p.rim))+fld("Função hepática",sel("fig",FIG,p.fig))+fld("Entrada",inp("entrada",p.entrada,"date"))
 +fld("Alergias <small>(separe por vírgula)</small>","<input data-f=\"alerg\" value=\""+esc(p.alerg||"")+"\" placeholder=\"ex.: penicilina, dipirona\">","w2")+fld("Diagnóstico principal","<input data-f=\"diag\" value=\""+esc(p.diag||"")+"\" placeholder=\"texto curto\">","w2")+"</div>"}
function alertHtml(al){return al.length?al.map(function(a){return"<div class=\"warn-l\" style=\""+(a.c==="warn"?"background:var(--amber-wash);border-color:color-mix(in srgb,var(--amber) 55%,transparent)":"")+"\">"+esc(a.t)+"</div>"}).join(""):"<p class=\"hint\">Nenhum alerta com os dados atuais. Preencha função renal, função hepática, peso e a prescrição para ativar as conferências.</p>"}
function resumo(p){var al=alertas(p);
  return"<h3 class=\"sec-t\">Alertas</h3><div id=\"alerts\">"+alertHtml(al)+"</div>"
  +"<h3 class=\"sec-t\">Cadastro</h3>"+cadastro(p)
  +"<div class=\"row\" style=\"margin-top:16px\">"+(p.status==="ativo"?"<button class=\"btn\" data-a=\"alta\">Registrar alta</button>":"<button class=\"btn\" data-a=\"reabrir\">Reabrir acompanhamento</button>")+"<button class=\"btn\" data-a=\"csvp\">CSV deste paciente</button><button class=\"btn\" data-a=\"delp\">Excluir paciente</button></div>"}
function prescricao(p){
  var rows=p.presc.map(function(m,k){var r=risk(m.med);return"<tr"+(m.susp?" style=\"opacity:.55\"":"")+"><td style=\"min-width:170px\"><b>"+esc(m.med)+"</b></td><td><input data-pi=\""+k+"\" data-f=\"dose\" value=\""+esc(m.dose||"")+"\" placeholder=\"ex.: 500 mg\"></td><td><select data-pi=\""+k+"\" data-f=\"via\">"+VIAS.map(function(v){return"<option"+(v===m.via?" selected":"")+">"+v+"</option>"}).join("")+"</select></td><td><input data-pi=\""+k+"\" data-f=\"freq\" value=\""+esc(m.freq||"")+"\" placeholder=\"ex.: 8/8 h\"></td><td><input data-pi=\""+k+"\" data-f=\"ini\" type=\"date\" value=\""+esc(m.ini||"")+"\"></td><td style=\"white-space:nowrap\">"+(r?"<span title=\"Fígado: "+(r.h==null?"sem dado":HN[r.h])+"\">F "+lvl(0,r.h,4)+"</span><br><span title=\"Rim: "+(r.k==null?"sem dado":KN[r.k])+"\">R "+lvl(0,r.k,3)+"</span>":"<small class=\"hint\">sem classificação</small>")+"</td><td><button class=\"btn\" type=\"button\" data-susp=\""+k+"\">"+(m.susp?"Retomar":"Suspender")+"</button> <button class=\"x\" type=\"button\" data-delm=\""+k+"\" aria-label=\"Remover\">✕</button></td></tr>"}).join("");
  return"<h3 class=\"sec-t\">Prescrição atual</h3><div class=\"tbl\"><table><thead><tr><th>Medicamento</th><th>Dose</th><th>Via</th><th>Frequência</th><th>Início</th><th>Risco F / R</th><th></th></tr></thead><tbody>"+(rows||"<tr><td colspan=\"7\" class=\"hint\" style=\"padding:16px\">Nenhum medicamento. Busque abaixo.</td></tr>")+"</tbody></table></div><div class=\"fld\" style=\"margin-top:10px\"><span>Adicionar medicamento <small>(lista do ICAM e da Policlínica Codajás, ou digite e tecle Enter)</small></span><div><input id=\"addm\" placeholder=\"Ex.: amoxicilina\" autocomplete=\"off\"></div></div><p class=\"hint\">Risco F/R: nível de risco para fígado (LiverTox) e rim (rótulos FDA e revisão), os mesmos do módulo Controle terapêutico. Veja a fonte de cada nível lá.</p>"}
function evolucao(p){
  var form="<div class=\"card\"><div class=\"grid\">"+fld("Tipo","<select id=\"e-tipo\">"+TIPOS.map(function(t){return"<option>"+esc(t)+"</option>"}).join("")+"</select>","w2")+fld("Data e hora","<input id=\"e-t\" type=\"datetime-local\" value=\""+PC.now()+"\">")+fld("Desfecho","<select id=\"e-d\">"+DESF.map(function(d){return"<option value=\""+d[0]+"\">"+d[1]+"</option>"}).join("")+"</select>")+fld("Registro","<textarea id=\"e-x\" placeholder=\"O que foi observado e o que foi feito. Sem nome do paciente.\"></textarea>","full")+"</div><div class=\"row\" style=\"margin-top:10px\"><button class=\"btn pri\" data-a=\"addevol\">Adicionar evolução</button></div></div>";
  var l=p.evol.slice().sort(function(a,b){return b.t<a.t?-1:1}).map(function(e){return"<li><b>"+esc(e.tipo)+"</b> <span class=\"bdg "+(e.desf==="aceita"?"ok":e.desf==="nao"?"bad":e.desf==="pendente"?"warn":"")+"\">"+esc(lab(DESF,e.desf))+"</span> <small>· "+PC.fdt(e.t)+"</small><br>"+esc(e.txt).replace(/\n/g,"<br>")+"<br>"+(e.tipo==="Intervenção farmacêutica"&&e.desf==="pendente"?"<button class=\"btn\" data-ev=\""+e.id+"\" data-d=\"aceita\">Marcar aceita</button> <button class=\"btn\" data-ev=\""+e.id+"\" data-d=\"nao\">Não aceita</button> ":"")+"<button class=\"x\" style=\"border:0;background:transparent;color:var(--ink-3);cursor:pointer\" data-evdel=\""+e.id+"\">remover</button></li>"}).join("");
  return"<h3 class=\"sec-t\">Nova evolução</h3>"+form+"<h3 class=\"sec-t\">Linha do tempo</h3>"+(l?"<ul class=\"tl\">"+l+"</ul>":"<p class=\"hint\">Nenhuma evolução registrada.</p>")}
function renderDetail(){var p=get(cur),el=$("#detail");
  if(!p){el.className="";el.innerHTML="<div class=\"detail-empty\"><h2>Escolha ou cadastre um paciente</h2><ul><li>Identificação só pelo <b>número do prontuário</b>, sem nome e sem CPF.</li><li><b>Prescrição</b> com nível de risco de fígado e rim de cada fármaco.</li><li><b>Alertas</b> quando a função renal ou hepática do paciente pede revisão da dose.</li><li><b>Evoluções e intervenções</b> com desfecho (aceita ou não) e indicadores no fim.</li></ul></div>";return}
  el.className="detail-pane";
  var tabs=[["resumo","Resumo"],["presc","Prescrição ("+p.presc.length+")"],["evol","Evoluções ("+p.evol.length+")"]];
  el.innerHTML="<div class=\"doc-h\"><div><h2>Nº "+esc(p.reg||"sem número")+(p.ini?" · "+esc(p.ini):"")+"</h2><div class=\"row\" style=\"margin-top:6px\"><span class=\"hint\">"+esc(ageTxt(p))+(p.peso?" · "+esc(p.peso)+" kg":"")+(p.setor?" · "+esc(p.setor):"")+"</span>"+(p.status==="alta"?"<span class=\"bdg\">Alta em "+PC.fdate(p.altaEm)+"</span>":"")+"</div></div></div><div class=\"chips\" role=\"tablist\">"+tabs.map(function(t){return"<button type=\"button\" class=\"chip\" role=\"tab\" data-sub=\""+t[0]+"\" aria-pressed=\""+(sub===t[0])+"\">"+esc(t[1])+"</button>"}).join("")+"</div><div id=\"sub\">"+(sub==="presc"?prescricao(p):sub==="evol"?evolucao(p):resumo(p))+"</div>";
  var am=$("#addm");if(am)PC.suggest(am,function(x){addMed(p,x.n)},function(v){addMed(p,v)})}
function addMed(p,n){p.presc.push({id:PC.uid(),med:n,dose:"",via:"VO",freq:"",ini:PC.today(),susp:false});save();render();var d=$("[data-pi=\""+(p.presc.length-1)+"\"][data-f=\"dose\"]");if(d)d.focus()}
function novo(){
  PC.dialog("Novo paciente","<p class=\"hint\">Informe só o número do prontuário ou do atendimento. Não use nome nem CPF.</p><label class=\"fld\">Nº do prontuário / atendimento<input id=\"nr\" inputmode=\"numeric\" autocomplete=\"off\"></label>",[{label:"Cancelar",value:null},{label:"Criar",cls:"pri",value:function(m){return m.querySelector("#nr").value.trim()}}]).then(function(v){
    if(!v)return;if(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(v)||/^\d{11}$/.test(v)){PC.toast("Isso parece um CPF. Use o número do prontuário.");return}
    if(/[a-zA-ZÀ-ÿ]{4,}/.test(v)){PC.toast("Use só o número, sem nome.");return}
    if(S.pac.some(function(p){return p.reg===v})){PC.toast("Esse número já está cadastrado.");return}
    var p={id:PC.uid(),reg:v,ini:"",setor:PC.load("pc:pront:setor",""),leito:"",idade:"",un:"anos",peso:"",rim:"normal",fig:"normal",alerg:"",diag:"",entrada:PC.today(),status:"ativo",altaEm:"",presc:[],evol:[]};
    S.pac.unshift(p);save();cur=p.id;sub="resumo";fil.st="ativo";render()})}
function act(a,t){var p=get(cur);if(!p)return;
  if(a==="alta"){p.status="alta";p.altaEm=PC.today();save();return render()}
  if(a==="reabrir"){p.status="ativo";p.altaEm="";save();return render()}
  if(a==="delp")return PC.confirm("Excluir o paciente Nº "+p.reg+" e todos os registros dele? Isso não pode ser desfeito.","Excluir").then(function(ok){if(ok){S.pac=S.pac.filter(function(x){return x.id!==p.id});cur=null;save();render()}});
  if(a==="csvp")return PC.exportText("paciente_"+p.reg.replace(/\W+/g,"_")+".csv",csv([p]),"text/csv","CSV");
  if(a==="addevol"){var x=$("#e-x").value.trim();if(!x){PC.toast("Escreva o registro.");return}p.evol.push({id:PC.uid(),t:$("#e-t").value||PC.now(),tipo:$("#e-tipo").value,desf:$("#e-tipo").value==="Intervenção farmacêutica"?$("#e-d").value:"na",txt:x});save();return render()}}
function csv(list){var rows=[["registro","setor","leito","tipo","data_hora","desfecho","registro_texto"]];list.forEach(function(p){p.evol.forEach(function(e){rows.push([p.reg,p.setor,p.leito,e.tipo,e.t,lab(DESF,e.desf),e.txt])})});return PC.csv(rows)}
/* ---------- indicadores ---------- */
function indicadores(){var all=S.pac,ev=[];all.forEach(function(p){p.evol.forEach(function(e){ev.push(e)})});
  var iv=ev.filter(function(e){return e.tipo==="Intervenção farmacêutica"}),ac=iv.filter(function(e){return e.desf==="aceita"}).length,na=iv.filter(function(e){return e.desf==="nao"}).length,pd=iv.filter(function(e){return e.desf==="pendente"}).length,dec=ac+na;
  var porTipo={};ev.forEach(function(e){porTipo[e.tipo]=(porTipo[e.tipo]||0)+1});
  var mx=Math.max.apply(null,[1].concat(Object.keys(porTipo).map(function(k){return porTipo[k]})));
  var al=0;all.filter(function(p){return p.status==="ativo"}).forEach(function(p){al+=alertas(p).filter(function(a){return a.c==="bad"}).length});
  return"<div class=\"kpis\" style=\"grid-template-columns:repeat(auto-fit,minmax(150px,1fr))\"><div class=\"kpi\" style=\"--c:var(--brand)\"><b>"+all.filter(function(p){return p.status==="ativo"}).length+"</b><span>Pacientes em acompanhamento</span></div><div class=\"kpi\" style=\"--c:var(--est)\"><b>"+ev.length+"</b><span>Evoluções registradas</span></div><div class=\"kpi\" style=\"--c:var(--ok)\"><b>"+(dec?Math.round(100*ac/dec)+"%":"–")+"</b><span>Intervenções aceitas (das decididas)</span></div><div class=\"kpi\" style=\"--c:var(--amber)\"><b>"+pd+"</b><span>Intervenções pendentes</span></div><div class=\"kpi\" style=\"--c:var(--r4)\"><b>"+al+"</b><span>Alertas graves ativos</span></div></div><h3 class=\"sec-t\">Registros por tipo</h3>"+(Object.keys(porTipo).length?"<div class=\"card\" style=\"display:grid;gap:8px\">"+Object.keys(porTipo).sort(function(a,b){return porTipo[b]-porTipo[a]}).map(function(k){return"<div><div class=\"row\" style=\"justify-content:space-between\"><span>"+esc(k)+"</span><b>"+porTipo[k]+"</b></div><span class=\"rng\" style=\"height:8px\"><span class=\"span\" style=\"left:0;width:"+Math.round(100*porTipo[k]/mx)+"%\"></span></span></div>"}).join("")+"</div>":"<p class=\"hint\">Ainda sem registros.</p>")+"<p class=\"hint\" style=\"margin-top:10px\">Os indicadores são calculados só com os dados deste aparelho.</p>"}
function dados(){return"<div class=\"card\" style=\"max-width:760px\"><h3 class=\"sec-t\" style=\"margin-top:0\">Onde ficam os dados</h3><p>Tudo fica neste aparelho, no armazenamento do navegador ou do aplicativo. Nada é enviado pela internet e não existe conta. Quem usar o mesmo aparelho e o mesmo navegador pode ver os registros, então use em equipamento do serviço.</p><h3 class=\"sec-t\">Cuidados com a LGPD</h3><ul><li>Identifique o paciente <b>só pelo número</b> do prontuário ou do atendimento. O aplicativo recusa números com formato de CPF.</li><li>Evite texto livre que revele o nome ou outros dados que identifiquem a pessoa.</li><li>Dados de saúde são sensíveis. Siga a política do seu hospital e apague o que não for mais necessário.</li><li>Este módulo apoia o acompanhamento farmacêutico e <b>não substitui o prontuário oficial</b>.</li></ul><h3 class=\"sec-t\">Backup</h3><div class=\"row\"><button class=\"btn\" data-a=\"bk\">Backup (JSON)</button><button class=\"btn\" data-a=\"rs\">Restaurar</button><button class=\"btn\" data-a=\"pacpdf\">PDF da lista de pacientes</button><button class=\"btn\" data-a=\"csvall\">CSV das evoluções</button><button class=\"btn\" data-a=\"wipe\">Apagar tudo</button></div></div>"}
function render(){renderList();renderDetail();if(!$("#tab-ind").hidden)$("#tab-ind").innerHTML=indicadores()}
/* ---------- reações adversas (RAM) ---------- */
S.ram=S.ram||[];var rcur=null,rnew=false;
var NQ=[["Há relatos conclusivos prévios desta reação?",[1,0,0]],["O evento surgiu depois de o medicamento ser administrado?",[2,-1,0]],["A reação melhorou ao suspender o medicamento ou ao dar antagonista?",[1,0,0]],["A reação voltou ao readministrar o medicamento?",[2,-1,0]],["Há outras causas que poderiam ter causado a reação?",[-1,2,0]],["A reação voltou com placebo?",[-1,1,0]],["O medicamento foi detectado no sangue em concentração tóxica?",[1,0,0]],["A reação piorou com dose maior ou melhorou com dose menor?",[1,0,0]],["O paciente teve reação parecida com o mesmo medicamento ou com outro semelhante?",[1,0,0]],["A reação foi confirmada por evidência objetiva (exame, biópsia, nível)?",[1,0,0]]];
var GRAV=[["obito","Óbito"],["risco","Risco de vida"],["hosp","Hospitalização ou prolongamento"],["incap","Incapacidade persistente"],["anom","Anomalia congênita"],["outra","Outra condição médica importante"]];
var DESR=[["recuperado","Recuperado"],["melhorando","Em recuperação"],["nao","Não recuperado"],["sequela","Recuperado com sequela"],["obito","Óbito"],["desc","Desconhecido"]];
function naranjo(r){var t=0,n=0;(r.nar||[]).forEach(function(v,i){if(v==null||v==="")return;n++;t+=NQ[i][1][+v]});var c=t>=9?"Definida":t>=5?"Provável":t>=1?"Possível":"Duvidosa";return{pts:t,resp:n,cat:c}}
function rGet(id){return S.ram.filter(function(x){return x.id===id})[0]}
function rList(){var l=S.ram.slice().sort(function(a,b){return b.criado<a.criado?-1:1});
  return"<div class=\"row\" style=\"margin-bottom:12px\"><button class=\"btn pri\" data-r=\"new\">+ Nova notificação</button><button class=\"btn\" data-r=\"pdfall\"".concat(S.ram.length?"":" disabled",">PDF da lista</button></div>")
   +(l.length?"<div class=\"rows\">"+l.map(function(r){var nr=naranjo(r);return"<button type=\"button\" class=\"card\" style=\"text-align:left;width:100%;margin-bottom:8px\" data-r=\"open\" data-id=\""+r.id+"\"><b>"+esc(r.med||"Medicamento não informado")+"</b> · "+esc(r.reacao||"reação não descrita")+"<br><span class=\"hint\">"+esc(r.inicio||"sem data")+(r.reg?" · Nº "+esc(r.reg):"")+" · Naranjo: "+nr.cat.toLowerCase()+" ("+nr.pts+") · <span class=\"bdg "+(r.status==="notificada"?"ok":"warn")+"\">"+(r.status==="notificada"?"Notificada":"Rascunho")+"</span></span></button>"}).join("")+"</div>":"<p class=\"hint\">Nenhuma notificação ainda. Registre aqui a suspeita de reação adversa e use a ficha em PDF para transcrever no VigiMed.</p>")}
function rForm(r){var nr=naranjo(r);
  var q=NQ.map(function(x,i){var v=r.nar&&r.nar[i];return"<div class=\"card\" style=\"padding:10px 12px;margin-bottom:6px\"><div>"+(i+1)+". "+esc(x[0])+"</div><div class=\"row\" style=\"margin-top:6px\">"+[["0","Sim"],["1","Não"],["2","Não sei"]].map(function(o){return"<button type=\"button\" class=\"chip\" data-rq=\""+i+"\" data-v=\""+o[0]+"\" aria-pressed=\""+(String(v)===o[0])+"\">"+o[1]+"</button>"}).join("")+"</div></div>"}).join("");
  var pr=S.pac.map(function(p){return[p.reg,"Nº "+p.reg]});
  return"<div class=\"row\"><button class=\"btn\" data-r=\"back\">← Voltar à lista</button></div><h3 class=\"sec-t\">Notificação de reação adversa</h3><div class=\"notice\"><b>Sem nome, CPF ou outro dado que identifique o paciente.</b> Use só o número do prontuário.</div><div class=\"grid\" style=\"margin-top:12px\">"
   +fld("Nº do prontuário <small>(opcional)</small>","<input data-rf=\"reg\" value=\""+esc(r.reg||"")+"\" list=\"rl\" inputmode=\"numeric\" autocomplete=\"off\"><datalist id=\"rl\">"+pr.map(function(a){return"<option value=\""+esc(a[0])+"\">"}).join("")+"</datalist>")
   +fld("Medicamento suspeito","<input data-rf=\"med\" value=\""+esc(r.med||"")+"\" id=\"rmed\" autocomplete=\"off\">","w2")
   +fld("Dose e via","<input data-rf=\"dose\" value=\""+esc(r.dose||"")+"\" placeholder=\"ex.: 1 g EV 8/8 h\">")
   +fld("Início do uso",inp("iniuso",r.iniuso,"date").replace("data-f","data-rf"))
   +fld("Outros medicamentos em uso","<input data-rf=\"outros\" value=\""+esc(r.outros||"")+"\">","w2")
   +fld("Reação observada","<input data-rf=\"reacao\" value=\""+esc(r.reacao||"")+"\" placeholder=\"ex.: erupção cutânea, aumento de creatinina\">","w2")
   +fld("Início da reação","<input data-rf=\"inicio\" type=\"date\" value=\""+esc(r.inicio||"")+"\">")
   +fld("Desfecho","<select data-rf=\"desf\">"+DESR.map(function(a){return"<option value=\""+a[0]+"\""+(r.desf===a[0]?" selected":"")+">"+a[1]+"</option>"}).join("")+"</select>")
   +fld("Medicamento suspenso?","<select data-rf=\"susp\"><option value=\"\">Não informado</option><option value=\"sim\""+(r.susp==="sim"?" selected":"")+">Sim</option><option value=\"nao\""+(r.susp==="nao"?" selected":"")+">Não</option><option value=\"dose\""+(r.susp==="dose"?" selected":"")+">Dose reduzida</option></select>")
   +"</div><h3 class=\"sec-t\">Gravidade</h3><div class=\"row\">"+GRAV.map(function(g){return"<button type=\"button\" class=\"chip\" data-rg=\""+g[0]+"\" aria-pressed=\""+((r.grav||[]).indexOf(g[0])>=0)+"\">"+g[1]+"</button>"}).join("")+"</div><p class=\"hint\">Sem nenhum critério marcado, a reação é considerada não grave.</p>"
   +"<h3 class=\"sec-t\">Conduta e manejo</h3><label class=\"fld full\">O que foi feito<textarea data-rf=\"conduta\" rows=\"4\" placeholder=\"ex.: suspenso o medicamento, iniciado tratamento de suporte, comunicado ao prescritor\">"+esc(r.conduta||"")+"</textarea></label>"
   +"<h3 class=\"sec-t\">Causalidade de Naranjo</h3>"+q+"<div class=\"card\" id=\"rnar\"><b>Pontuação: "+nr.pts+"</b> · "+nr.resp+" de 10 respondidas · causalidade <b>"+nr.cat.toLowerCase()+"</b> <span class=\"hint\">(9 ou mais definida, 5 a 8 provável, 1 a 4 possível, 0 ou menos duvidosa)</span></div>"
   +"<h3 class=\"sec-t\">Notificação</h3><div class=\"grid\">"+fld("Situação","<select data-rf=\"status\"><option value=\"rascunho\""+(r.status!=="notificada"?" selected":"")+">Rascunho</option><option value=\"notificada\""+(r.status==="notificada"?" selected":"")+">Notificada no VigiMed</option></select>")+fld("Nº do protocolo VigiMed","<input data-rf=\"prot\" value=\""+esc(r.prot||"")+"\">")+"</div>"
   +"<p class=\"hint\">A notificação é feita no VigiMed (Anvisa), o sistema oficial. Este módulo guarda o rascunho e gera a ficha em PDF para transcrever. <a class=\"lk\" href=\"https://www.gov.br/pt-br/servicos/notificar-eventos-adversos-de-medicamentos-e-vacinas-no-vigimed\" target=\"_blank\" rel=\"noopener noreferrer\">Abrir o VigiMed</a></p>"
   +"<div class=\"row\" style=\"margin-top:12px\"><button class=\"btn pri\" data-r=\"pdf\">Gerar ficha em PDF</button><button class=\"btn\" data-r=\"del\">Excluir</button></div>"}
function rRender(){var el=$("#tab-ram");var r=rcur&&rGet(rcur);el.innerHTML=r?rForm(r):rList();var m=$("#rmed");if(m&&r)PC.suggest(m,function(x){r.med=x.n;m.value=x.n;save()},function(v){r.med=v;save()})}
function gravTxt(r){var g=(r.grav||[]).map(function(k){return lab(GRAV,k)});return g.length?g.join(", "):"Não grave"}
function rPdf(list,nome){var rows=list.map(function(r){var nr=naranjo(r);return[(r.med||"-")+(r.dose?"\n"+r.dose:""),(r.reacao||"-")+"\nInício: "+(r.inicio||"-"),gravTxt(r)+"\n"+lab(DESR,r.desf||"desc"),"Naranjo "+nr.pts+": "+nr.cat,(r.conduta||"-"),(r.reg?"Nº "+r.reg+"\n":"")+(r.status==="notificada"?"Notificada"+(r.prot?" ("+r.prot+")":""):"Rascunho")]});
  var u=PCPDF.build({titulo:list.length===1?"Ficha de suspeita de reação adversa a medicamento":"Notificações de reação adversa",sub:"Dados para transcrição no VigiMed (Anvisa). Sem identificação do paciente além do número do prontuário.",cols:[{h:"Medicamento suspeito",w:2.2},{h:"Reação",w:2.2},{h:"Gravidade e desfecho",w:2},{h:"Causalidade",w:1.3},{h:"Conduta e manejo",w:3},{h:"Prontuário e situação",w:1.5}],rows:rows,nota:"Naranjo CA, et al. A method for estimating the probability of adverse drug reactions. Clin Pharmacol Ther. 1981;30(2):239-245. Ficha de apoio: a notificação oficial é feita no VigiMed.",rodape:"Prontuário · Reações adversas"});
  PCPDF.save(nome,u)}
document.addEventListener("click",function(e){var t;
  if((t=e.target.closest("[data-rq]"))){var r=rGet(rcur);r.nar=r.nar||[];r.nar[+t.getAttribute("data-rq")]=t.getAttribute("data-v");save();rRender();return}
  if((t=e.target.closest("[data-rg]"))){var r2=rGet(rcur),k=t.getAttribute("data-rg");r2.grav=r2.grav||[];var ix=r2.grav.indexOf(k);if(ix>=0)r2.grav.splice(ix,1);else r2.grav.push(k);save();t.setAttribute("aria-pressed",ix<0);return}
  if((t=e.target.closest("[data-r]"))){var a=t.getAttribute("data-r");
    if(a==="new"){var n={id:PC.uid(),criado:PC.now(),status:"rascunho",desf:"desc",nar:[],grav:[]};S.ram.push(n);rcur=n.id;save();rRender();return}
    if(a==="open"){rcur=t.getAttribute("data-id");rRender();return}
    if(a==="back"){rcur=null;rRender();return}
    if(a==="pdf"){rPdf([rGet(rcur)],"ficha_reacao_adversa.pdf");return}
    if(a==="pdfall"){rPdf(S.ram,"notificacoes_reacao_adversa.pdf");return}
    if(a==="del"){PC.confirm("Excluir esta notificação? Isso não pode ser desfeito.","Excluir",true).then(function(ok){if(ok){S.ram=S.ram.filter(function(x){return x.id!==rcur});rcur=null;save();rRender()}});return}}});
function rField(t){var f=t.getAttribute&&t.getAttribute("data-rf");if(!f)return;var r=rGet(rcur);if(!r)return;var v=t.value;
  if(f==="reg"&&(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(v.trim())||/^\d{11}$/.test(v.trim()))){PC.toast("Isso parece um CPF. Use o número do prontuário.");return}
  r[f]=v;save()}
document.addEventListener("input",function(e){rField(e.target)});document.addEventListener("change",function(e){rField(e.target)});
/* ---------- lista de pacientes (PDF) ---------- */
function pacPdf(){var l=S.pac.slice().sort(function(a,b){return(a.status===b.status?0:a.status==="ativo"?-1:1)||String(a.setor).localeCompare(String(b.setor),"pt")||String(a.reg).localeCompare(String(b.reg),"pt",{numeric:true})});
  var rows=[],last="";l.forEach(function(p){var g=p.status==="ativo"?"Em acompanhamento":"Alta";if(g!==last){last=g;rows.push({sec:g})}
    var ativos=p.presc.filter(function(m){return!m.susp}).map(function(m){return m.med+(m.dose?" "+m.dose:"")}).join("; ");var al=alertas(p).map(function(a){return a.t}).join(" ");
    rows.push(["Nº "+p.reg+(p.ini?" ("+p.ini+")":""),(p.setor||"-")+(p.leito?" / "+p.leito:""),ageTxt(p)+(p.peso?", "+p.peso+" kg":""),lab(RIM,p.rim)+"; "+lab(FIG,p.fig),ativos||"-",al||"-"])});
  var u=PCPDF.build({titulo:"Pacientes em acompanhamento farmacêutico",sub:"Identificação apenas pelo número do prontuário. Total: "+S.pac.length+" paciente(s). Documento com dado de saúde: guarde e descarte conforme a política do hospital (LGPD).",cols:[{h:"Prontuário",w:1.4},{h:"Setor / leito",w:1.4},{h:"Idade e peso",w:1.5},{h:"Função renal e hepática",w:2.2},{h:"Prescrição ativa",w:4},{h:"Alertas",w:4}],rows:rows,nota:"Alertas calculados pela função renal e hepática informada e pelos níveis de toxicidade do módulo Controle terapêutico. Apoio ao farmacêutico, não substitui o prontuário oficial.",rodape:"Prontuário"});
  PCPDF.save("pacientes_"+PC.today()+".pdf",u)}
/* ---------- eventos ---------- */
function tab(n){["pac","ind","ram","dados"].forEach(function(k){$("#tab-"+k).hidden=k!==n});PC.$$(".tabs-in button").forEach(function(b){b.setAttribute("aria-selected",b.getAttribute("data-tab")===n)});if(n==="ind")$("#tab-ind").innerHTML=indicadores();if(n==="ram")rRender();if(n==="dados")$("#tab-dados").innerHTML=dados()}
document.addEventListener("click",function(e){var t;
  if((t=e.target.closest("[data-tab]"))){tab(t.getAttribute("data-tab"));return}
  if(e.target.closest("#np")){novo();return}
  if((t=e.target.closest("#list [data-id]"))){cur=t.getAttribute("data-id");sub="resumo";render();if(window.innerWidth<1024)$("#detail").scrollIntoView({behavior:"smooth"});return}
  if((t=e.target.closest("#f-st [data-s]"))){fil.st=t.getAttribute("data-s");renderList();return}
  if((t=e.target.closest("[data-sub]"))){sub=t.getAttribute("data-sub");renderDetail();return}
  if((t=e.target.closest("[data-susp]"))){var p=get(cur),m=p.presc[+t.getAttribute("data-susp")];m.susp=!m.susp;save();render();return}
  if((t=e.target.closest("[data-delm]"))){get(cur).presc.splice(+t.getAttribute("data-delm"),1);save();render();return}
  if((t=e.target.closest("[data-ev]"))){var q=get(cur),ev=q.evol.filter(function(x){return x.id===t.getAttribute("data-ev")})[0];ev.desf=t.getAttribute("data-d");save();render();return}
  if((t=e.target.closest("[data-evdel]"))){var q2=get(cur);q2.evol=q2.evol.filter(function(x){return x.id!==t.getAttribute("data-evdel")});save();render();return}
  if((t=e.target.closest("[data-a]"))){var a=t.getAttribute("data-a");
    if(a==="bk"){PC.exportText("pharmacentral_prontuario_"+PC.today()+".json",JSON.stringify(S),"application/json","Backup");return}
    if(a==="pacpdf"){if(!S.pac.length){PC.toast("Nenhum paciente para listar.");return}pacPdf();return}
    if(a==="csvall"){PC.exportText("evolucoes_"+PC.today()+".csv",csv(S.pac),"text/csv","CSV");return}
    if(a==="rs"){PC.pasteBox("Restaurar backup","Cole o conteúdo do backup (JSON) ou escolha o arquivo. Isso substitui os registros deste aparelho.").then(function(txt){if(!txt)return;try{var o=JSON.parse(txt);if(!o||!Array.isArray(o.pac))throw 0;S={pac:o.pac};save();cur=null;render();PC.toast(S.pac.length+" pacientes restaurados.")}catch(x){PC.toast("Arquivo inválido.")}});return}
    if(a==="wipe"){PC.confirm("Apagar TODOS os pacientes e registros deste aparelho? Isso não pode ser desfeito. Faça um backup antes.","Apagar tudo").then(function(ok){if(ok){S={pac:[]};cur=null;save();render();tab("dados")}});return}
    act(a,t)}});
document.addEventListener("input",function(e){var t=e.target;if(t.id==="q"){fil.q=t.value;renderList();return}
  var f=t.getAttribute&&t.getAttribute("data-f");if(!f)return;var p=get(cur);if(!p)return;
  var pi=t.getAttribute("data-pi");
  if(pi!=null){p.presc[+pi][f]=t.value}
  else{if(f==="reg"){var v=t.value.trim();if(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(v)||/^\d{11}$/.test(v)){PC.toast("Isso parece um CPF. Use o número do prontuário.");return}}
    p[f]=f==="ini"?t.value.toUpperCase():t.value;if(f==="setor")PC.save("pc:pront:setor",t.value)}
  save();if(!pi&&(f==="reg"||f==="ini"||f==="setor"||f==="leito"||f==="idade"||f==="peso"))renderList()});
document.addEventListener("change",function(e){var f=e.target.getAttribute&&e.target.getAttribute("data-f");if(f==="rim"||f==="fig"||f==="un"||f==="peso"||f==="alerg"||f==="idade"){var p=get(cur),a=$("#alerts");if(p&&a)a.innerHTML=alertHtml(alertas(p));renderList()}});
render();
})();
