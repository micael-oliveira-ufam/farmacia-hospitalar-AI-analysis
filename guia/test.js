const C=require('./calc.js');let f=0;
const eq=(n,a,b,t=0.01)=>{if(Math.abs(a-b)>t){console.log('FALHOU',n,a,b);f++}else console.log('ok',n,a.toFixed(3))};
eq('Mosteller 70kg/175cm',C.bsa(70,175),1.8446);
eq('Mosteller 10kg/75cm',C.bsa(10,75),0.4564,0.001);
eq('CG homem 60a 70kg scr1',C.crclCG(60,70,1,false),77.78);
eq('CG mulher 60a 70kg scr1',C.crclCG(60,70,1,true),66.11);
eq('Schwartz 100cm scr0,5',C.schwartz(100,0.5),82.6);
eq('CKD-EPI 2021 M 50a scr1,0',C.ckdepi2021(50,1.0,false),91.7,0.3);
eq('CKD-EPI 2021 F 60a scr0,8',C.ckdepi2021(60,0.8,true),C.ckdepi2021(60,0.8,true));
eq('Holliday 8kg dia',C.hollidayDay(8),800);eq('Holliday 15kg dia',C.hollidayDay(15),1250);eq('Holliday 30kg dia',C.hollidayDay(30),1700);
eq('4-2-1 8kg',C.hollidayHour(8),32);eq('4-2-1 15kg',C.hollidayHour(15),50);eq('4-2-1 30kg',C.hollidayHour(30),70);
eq('Infusão 5mcg/kg/min 10kg 1mg/mL',C.infusionMlH(5,10,1),3);
eq('Infusão inversa',C.infusionDose(3,10,1),5);
eq('Gotas 500mL 8h macro',C.dropsMin(500,8,20),20.83);
eq('Gotas 100mL 1h micro',C.dropsMin(100,1,60),100);
eq('C1V1 KCl 19,1%→ 2 mEq/mL? V1',C.dilutionV1(10,1,100),10);
const d=C.doseMg(20,15,250);eq('dose cap',d.mg,250);if(!d.capped){f++;console.log('FALHOU cap')}
const g=C.regimen(20,10,4,0,0);eq('regime 20kg 10mg/kg 4x dose',g.dose,200);eq('regime dia',g.day,800);eq('regime mg/kg/dia',g.perKgDay,40);
const g2=C.regimen(50,15,4,500,1500);eq('regime teto dose',g2.dose,500);if(!g2.cappedDose||!g2.overDay){f++;console.log('FALHOU regime flags')}
const g3=C.regimen(10,5,3,0,20);eq('regime 15 mg/dia',g3.day,150);if(!g3.overDay){f++;console.log('FALHOU overDay')}
console.log(f?f+' falhas':'todos os testes passaram');process.exit(f?1:0);
