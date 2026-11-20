const D=require('./dose.js'),DB=require('../data/dose.json'),C=require('../data/catalog.json');
let fail=0;const ok=(n,c)=>{console.log((c?'ok ':'FALHOU ')+n);if(!c)fail++};
const med=id=>DB.itens.find(x=>x.id===id||x.n.toLowerCase().startsWith(id));
const ctxOf=m=>{const k=m.mono[0];return k?{m:C.mono[k],s:C.safety[k]}:null};
const pac=(o)=>Object.assign({idadeAnos:5,sexo:'M',peso:20,renal:'normal',hepatica:'normal'},o);
const calc=(id,p,opts)=>{const m=med(id);return D.calcular(m,pac(p),ctxOf(m),opts)};
// ácido tranexâmico 10–15 mg/kg, 8 h, teto 1000 mg/dia: peso 20 → min 200, max 300 mg
let r=calc('acido_tranexamico');
ok('tranexâmico min 200 mg',Math.abs(r.doses.min.mg-200)<1e-6);ok('max 300 mg',Math.abs(r.doses.max.mg-300)<1e-6);ok('rec 250 mg (ponto médio)',Math.abs(r.doses.rec.mg-250)<1e-6);
ok('dose diária rec 750',Math.abs(r.doses.rec.dia-750)<1e-6);
// teto absoluto: peso 100 kg → 1500 mg/dia → 333,3 mg/dose
r=calc('acido_tranexamico',{peso:100,idadeAnos:30});ok('teto absoluto limita',r.doses.max.capped&&Math.abs(r.doses.max.mg-1000/3)<0.01);
// unidades em mL (50 mg/mL): 250 mg = 5 mL
r=calc('acido_tranexamico');ok('250 mg = 5 mL',Math.abs(r.doses.rec.u.q-5)<1e-6&&r.doses.rec.u.un==='mL');
ok('ampola 5 mL → 1 ampola',r.frascos&&r.frascos.n===1);
// subdose / superdose
r=calc('acido_tranexamico',{},{prescrita:90});ok('subdose importante (<50% do mínimo)',r.avaliacao.status==='subdose_importante'&&r.avaliacao.riscos[0].startsWith('Risco da subdose'));
r=calc('acido_tranexamico',{},{prescrita:150});ok('subdose',r.avaliacao.status==='subdose');
r=calc('acido_tranexamico',{},{prescrita:250});ok('adequada',r.avaliacao.status==='adequada'&&r.avaliacao.riscos.length===1);
r=calc('acido_tranexamico',{},{prescrita:400});ok('superdose com risco',r.avaliacao.status==='superdose'&&r.avaliacao.riscos.some(x=>x.startsWith('Risco da superdose')));
r=calc('acido_tranexamico',{},{prescrita:900});ok('superdose importante',r.avaliacao.status==='superdose_importante');
// condições
const g=DB.itens.find(x=>/gentamicina/i.test(x.n)&&x.min!=null);
r=D.calcular(g,pac({renal:'grave'}),ctxOf(g),{});ok('gentamicina + IR grave: conservadora e alerta grave',r.conservadora&&r.doses.rec.mg===g.min*20&&r.avisos.some(a=>a.sev===2&&/renal/i.test(a.txt)));
r=D.calcular(g,pac({idadeAnos:10/365.25,peso:3.2}),ctxOf(g),{});ok('neonato: aviso e faixa etária',r.fe==='neo'&&r.avisos.some(a=>/Neonato/.test(a.txt)));
// TFG
ok('Cockcroft-Gault homem 60a 70kg SCr 1,0 = 78',D.tfg({idadeAnos:60,peso:70,sexo:'M',scr:1})===78);
ok('Cockcroft-Gault mulher ×0,85',D.tfg({idadeAnos:60,peso:70,sexo:'F',scr:1})===66);
ok('Schwartz bedside 100 cm SCr 0,5 = 83',D.tfg({idadeAnos:6,altura:100,scr:0.5,peso:20})===83);
ok('faixa etária',D.faixaEtaria(10/365.25)==='neo'&&D.faixaEtaria(0.5)==='ped'&&D.faixaEtaria(30)==='adu'&&D.faixaEtaria(70)==='ido');
// sem faixa
const s=DB.itens.find(x=>x.min==null);r=D.calcular(s,pac(),null,{});ok('item sem faixa avisa',r.semFaixa&&r.avisos.length>0&&!r.doses);
// toda a base calcula sem erro
let n=0;for(const m of DB.itens){for(const ip of m.ap.keys?[...m.ap.keys()]:[0]){const rr=D.calcular(m,pac(),ctxOf(m),{ap:ip,prescrita:10});n++;if(rr.doses&&!(rr.doses.min.mg<=rr.doses.max.mg+1e-9)){console.log('faixa invertida',m.n);fail++}}}ok('base inteira calcula ('+n+' combinações)',true);
ok('parecer',D.parecer(calc('acido_tranexamico',{},{prescrita:400}),pac({idadeTxt:'5 anos'}),{}).includes('SUPERDOSE'));
if(fail){console.log(fail+' falha(s)');process.exit(1)}console.log('dose: todos os testes passaram');
