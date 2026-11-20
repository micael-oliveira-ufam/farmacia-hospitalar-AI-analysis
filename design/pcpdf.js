/* PharmaCentral – gerador de PDF offline (Helvetica, tabelas). Sem dependências.
   PCPDF.build({titulo,sub,cols:[{h,w}],rows:[[..]|{sec:"texto"}],nota,rodape,autores}) -> Uint8Array
   PCPDF.save(nome,bytes) baixa no navegador; no app Android envia ao canal nativo. */
(function(g){
var W=842,H=595,M=36,FS=8.5,LH=11;
var HW="278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584".split(",").map(Number);
var BASE={"À":"A","Á":"A","Â":"A","Ã":"A","Ç":"C","È":"E","É":"E","Ê":"E","Í":"I","Ó":"O","Ô":"O","Õ":"O","Ú":"U","à":"a","á":"a","â":"a","ã":"a","ç":"c","è":"e","é":"e","ê":"e","í":"i","ó":"o","ô":"o","õ":"o","ú":"u","ü":"u"};
var CP={"–":150,"—":151,"“":147,"”":148,"‘":145,"’":146,"•":149,"…":133,"€":128,"×":120,"−":45,"µ":181,"º":186,"ª":170,"°":176,"±":177,"·":183};
function code(ch){var c=ch.charCodeAt(0);if(c<32)return 32;if(c<127)return c;if(CP[ch])return CP[ch];if(c>=160&&c<=255)return c;return 63}
function cw(ch){var c=ch.charCodeAt(0);if(c>=32&&c<127)return HW[c-32];var b=BASE[ch];if(b)return HW[b.charCodeAt(0)-32];return 556}
function tw(s,fs){var w=0;for(var i=0;i<s.length;i++)w+=cw(s[i]);return w*fs/1000}
function nz(s){return String(s==null?"":s).replace(/≥/g,">=").replace(/≤/g,"<=").replace(/→/g,"->").replace(/≈/g,"~")}
function esc(s){s=nz(s);var o="";for(var i=0;i<s.length;i++){var c=code(s[i]);o+=c===40||c===41||c===92?"\\"+String.fromCharCode(c):c>126||c<32?"\\"+("00"+c.toString(8)).slice(-3):String.fromCharCode(c)}return o}
function wrap(s,w,fs){s=nz(s);var out=[];s.split("\n").forEach(function(par){var words=par.split(/\s+/),line="";words.forEach(function(wd){if(!wd)return;while(tw(wd,fs)>w){var k=wd.length;while(k>1&&tw(wd.slice(0,k),fs)>w)k--;if(line){out.push(line);line=""}out.push(wd.slice(0,k));wd=wd.slice(k)}var t=line?line+" "+wd:wd;if(tw(t,fs)<=w)line=t;else{out.push(line);line=wd}});out.push(line)});return out.length?out:[""]}
function build(o){
  var cols=o.cols,tot=cols.reduce(function(a,c){return a+c.w},0),avail=W-2*M,pad=3;
  var cws=cols.map(function(c){return c.w/tot*avail});
  var pages=[],cur=null,y=0,used={};
  var stamp=new Date().toLocaleString("pt-BR");
  function np(){cur=[];pages.push(cur);y=H-M;
    cur.push("BT /F2 15 Tf "+M+" "+y+" Td ("+esc(o.titulo)+") Tj ET");y-=16;
    if(o.sub){wrap(o.sub,avail,FS).forEach(function(l){cur.push("BT /F1 "+FS+" Tf 0.35 g "+M+" "+y+" Td ("+esc(l)+") Tj ET 0 g");y-=LH})}
    y-=4;head()}
  function head(){var x=M,h=LH+2*pad;cur.push("0.07 0.16 0.26 rg "+M+" "+(y-h)+" "+avail+" "+h+" re f");
    cols.forEach(function(c,i){cur.push("BT /F2 "+FS+" Tf 1 g "+(x+pad)+" "+(y-pad-FS+1)+" Td ("+esc(c.h)+") Tj ET");x+=cws[i]});cur.push("0 g");y-=h}
  np();var zebra=0;
  o.rows.forEach(function(r){
    if(!Array.isArray(r)){var need=LH+8;if(y-need<M+24)np();cur.push("0.86 0.93 0.95 rg "+M+" "+(y-LH-2*pad+2)+" "+avail+" "+(LH+2*pad-2)+" re f");cur.push("BT /F2 "+(FS+0.5)+" Tf 0.07 0.16 0.26 rg "+(M+pad)+" "+(y-pad-FS+1)+" Td ("+esc(r.sec)+") Tj ET 0 g");y-=LH+2*pad-2;zebra=0;return}
    var ims=[];var cells=r.map(function(t,i){if(t&&typeof t==="object"&&t.img){ims[i]=t.img;return[]}return wrap(t,cws[i]-2*pad,FS)});var n=Math.max.apply(null,cells.map(function(c){return c.length}));var h=n*LH+2*pad-2;var IH=0;ims.forEach(function(k){var m=(o.imgs||{})[k];if(m)IH=Math.max(IH,Math.min(m.h,o.imgMax||56))});if(IH)h=Math.max(h,IH+2*pad);
    if(y-h<M+24)np();
    if(zebra++%2)cur.push("0.96 0.97 0.98 rg "+M+" "+(y-h)+" "+avail+" "+h+" re f 0 g");
    var x=M;cells.forEach(function(c,i){c.forEach(function(l,j){cur.push("BT /F"+(i===0?2:1)+" "+FS+" Tf "+(x+pad)+" "+(y-pad-FS+1-j*LH)+" Td ("+esc(l)+") Tj ET")});x+=cws[i]});
    ims.forEach(function(k,i){var m=(o.imgs||{})[k];if(!m)return;var ih=Math.min(m.h,o.imgMax||56),iw=ih*m.w/m.h,mw=cws[i]-2*pad;if(iw>mw){iw=mw;ih=iw*m.h/m.w}var xo=M;for(var q=0;q<i;q++)xo+=cws[q];used[k]=1;cur.push("q "+iw.toFixed(1)+" 0 0 "+ih.toFixed(1)+" "+(xo+pad).toFixed(1)+" "+(y-pad-ih).toFixed(1)+" cm /Im"+k+" Do Q")});
    cur.push("0.85 g "+M+" "+(y-h)+" "+avail+" 0.4 re f 0 g");y-=h});
  if(o.nota){var nl=wrap(o.nota,avail,FS-0.5);if(y-nl.length*LH<M+24)np();y-=6;nl.forEach(function(l){cur.push("BT /F1 "+(FS-0.5)+" Tf 0.3 g "+M+" "+y+" Td ("+esc(l)+") Tj ET 0 g");y-=LH-1})}
  var objs=[];function add(s){objs.push(s);return objs.length}
  add("<< /Type /Catalog /Pages 2 0 R >>");add("");var f1=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"),f2=add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  var xo2="";Object.keys(o.imgs||{}).forEach(function(k){if(!used[k])return;var m=o.imgs[k],bin=atob(m.b64);var id=add("<< /Type /XObject /Subtype /Image /Width "+m.pw+" /Height "+m.ph+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+bin.length+" >>\nstream\n"+bin+"\nendstream");xo2+="/Im"+k+" "+id+" 0 R "});
  var kids=[];pages.forEach(function(p,i){p.push("BT /F1 7 Tf 0.4 g "+M+" 20 Td ("+esc("PharmaCentral · "+(o.rodape||"")+" · gerado em "+stamp+" · apoio à decisão, sem dado identificável de paciente")+") Tj ET");p.push("BT /F1 7 Tf "+(W-M-40)+" 20 Td (Pág. "+(i+1)+"/"+pages.length+") Tj ET");
    if(o.autores)p.push("BT /F1 7 Tf 0.4 g "+M+" 11 Td ("+esc(o.autores)+") Tj ET");
    var s=p.join("\n");var c=add("<< /Length "+s.length+" >>\nstream\n"+s+"\nendstream");var pg=add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Resources << /Font << /F1 "+f1+" 0 R /F2 "+f2+" 0 R >> /XObject << "+xo2+">> >> /Contents "+c+" 0 R >>");kids.push(pg+" 0 R")});
  objs[1]="<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+kids.length+" >>";
  var out="%PDF-1.4\n",offs=[];objs.forEach(function(b,i){offs.push(out.length);out+=(i+1)+" 0 obj\n"+b+"\nendobj\n"});
  var xr=out.length;out+="xref\n0 "+(objs.length+1)+"\n0000000000 65535 f \n";offs.forEach(function(x){out+=("0000000000"+x).slice(-10)+" 00000 n \n"});
  out+="trailer\n<< /Size "+(objs.length+1)+" /Root 1 0 R /Info << /Title ("+esc(o.titulo)+") /Producer (PharmaCentral) >> >>\nstartxref\n"+xr+"\n%%EOF";
  var u=new Uint8Array(out.length);for(var i=0;i<out.length;i++)u[i]=out.charCodeAt(i)&255;return u}
function b64(u){var s="";for(var i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)}
function save(nome,u){
  if(g.PCBridge&&g.PCBridge.postMessage){g.PCBridge.postMessage(JSON.stringify({t:"pdf",name:nome,b64:b64(u)}));return"app"}
  var bl=new Blob([u],{type:"application/pdf"}),a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=nome;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},2000);return"web"}
g.PCPDF={build:build,save:save,wrap:wrap};if(typeof module!=="undefined")module.exports=g.PCPDF;
})(typeof window!=="undefined"?window:globalThis);
