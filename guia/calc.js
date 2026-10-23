/* Fórmulas clínicas — funções puras (usadas na web e testadas em Node). Fontes em data/refs.json (chaves entre colchetes). */
(function(root){
const C={
  /* [MOST] Mosteller 1987 */
  bsa:(kg,cm)=>Math.sqrt(kg*cm/3600),
  /* [CG] Cockcroft-Gault 1976 (mL/min); ×0,85 para mulheres */
  crclCG:(age,kg,scr,female)=>((140-age)*kg)/(72*scr)*(female?0.85:1),
  /* [SCHW] Schwartz bedside 2009 (mL/min/1,73 m²); altura em cm */
  schwartz:(cm,scr)=>0.413*cm/scr,
  /* [CKDEPI] CKD-EPI 2021 sem raça (mL/min/1,73 m²) */
  ckdepi2021:(age,scr,female)=>{const k=female?0.7:0.9,a=female?-0.241:-0.302;
    return 142*Math.pow(Math.min(scr/k,1),a)*Math.pow(Math.max(scr/k,1),-1.2)*Math.pow(0.9938,age)*(female?1.012:1)},
  /* [HS] Holliday-Segar 1957: mL/dia (100/50/20) e regra 4-2-1 (mL/h) */
  hollidayDay:kg=>kg<=10?100*kg:kg<=20?1000+50*(kg-10):1500+20*(kg-20),
  hollidayHour:kg=>kg<=10?4*kg:kg<=20?40+2*(kg-10):60+(kg-20),
  /* bomba de infusão: dose mcg/kg/min, peso kg, concentração mg/mL → mL/h */
  infusionMlH:(mcgKgMin,kg,mgMl)=>mcgKgMin*kg*60/(mgMl*1000),
  /* inverso: mL/h → mcg/kg/min */
  infusionDose:(mlH,kg,mgMl)=>mlH*mgMl*1000/(kg*60),
  /* gotejamento: volume mL, tempo h, fator gotas/mL (macro 20, micro 60) → gotas/min */
  dropsMin:(mL,h,factor)=>mL*factor/(h*60),
  /* diluição C1·V1 = C2·V2 → V1 (volume da solução-estoque) */
  dilutionV1:(c1,c2,v2)=>c2*v2/c1,
  /* dose por peso com teto */
  doseMg:(kg,mgKg,maxMg)=>{const raw=kg*mgKg;return {raw,mg:(maxMg>0&&raw>maxMg)?maxMg:raw,capped:maxMg>0&&raw>maxMg}},
  mgToMl:(mg,mgMl)=>mg/mgMl,
  /* regime por peso: dose (mg/kg/dose), doses/dia, tetos por dose e por dia → mg/dose, mg/dia, avisos */
  regimen:(kg,mgKg,perDay,maxDose,maxDay)=>{
    let dose=kg*mgKg,cappedDose=false;
    if(maxDose>0&&dose>maxDose){dose=maxDose;cappedDose=true}
    const day=dose*perDay;
    return {dose,day,cappedDose,overDay:maxDay>0&&day>maxDay,perKgDay:kg>0?day/kg:0}},
};
if(typeof module!=='undefined'&&module.exports)module.exports=C;else root.CALC=C;
})(typeof window!=='undefined'?window:globalThis);
