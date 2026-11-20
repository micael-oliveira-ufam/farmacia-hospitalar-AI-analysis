"""Evidencia de nefrotoxicidade na literatura: Pazhayattil GS, Shirali AC. Drug-induced impairment of renal function.
Int J Nephrol Renovasc Dis 2014;7:457-468 (PMC4270362, acesso aberto). Cada 'quote' e verificado, na montagem, como trecho
literal do texto da secao indicada. Nivel renal: 3 = incidencia alta/dose-dependente declarada; 2 = nefrotoxicidade bem
descrita (mecanismo definido, risco condicional); 1 = rara."""
_B=['amoxicillin','amoxicillin clavulanate','ampicillin','oxacillin','penicillin G benzathine','penicillin G potassium','piperacillin tazobactam','cefalotin','cefazolin','cefotaxime','ceftazidime','ceftriaxone','cefuroxime','cephalexin']
LIT=[
 dict(subs=['amikacin','gentamicin','tobramycin'],n=3,sec='Aminoglycosides',quote='the incidence of nephrotoxicity is reported to be as high as 10%–25%',mec='necrose tubular aguda dose-dependente'),
 dict(subs=['vancomycin'],n=3,sec='Vancomycin',quote='incidence of nephrotoxicity ranged between 5% and 43%',mec='necrose tubular aguda ou nefrite intersticial'),
 dict(subs=['amphotericin B'],n=3,sec='Amphotericin B',quote='Therapeutic use is often limited by dose-dependent nephrotoxicity.',mec='toxicidade tubular e vasoconstrição renal'),
 dict(subs=['liposomal amphotericin B'],n=2,sec='Amphotericin B',quote='Liposomal AmB has an improved renal safety profile compared to conventional AmB.',mec='menor que a anfotericina convencional'),
 dict(subs=['polymyxin B'],n=3,sec='Other antibiotics',quote='Polymyxins (colistin and polymyxin B) cause AKI by toxic tubular injury.',mec='lesão tubular tóxica'),
 dict(subs=['iobitridol iopamidol contrast','ionic iodinated contrast (meglumine)','meglumine diatrizoate contrast','non-ionic iodinated contrast'],n=3,sec='Radiocontrast agents',quote='is one of the most common causes of in-hospital AKI',mec='vasoconstrição renal, hipóxia medular e nefrose osmótica'),
 dict(subs=['ibuprofen','ibuprofen lysine','diclofenac','indomethacin','tenoxicam'],n=2,sec='Nonsteroidal anti-inflammatory drugs',quote='NSAIDs impair this renal vasodilation and alter renal hemodynamics.',mec='inibição de prostaglandinas (Tabela 1 lista as complicações renais)'),
 dict(subs=['captopril','enalapril','losartan'],n=2,sec='Angiotensin-converting enzyme inhibitors and angiotensin II receptor blockers',quote='the loss of autoregulation could precipitate or potentiate AKI',mec='perda da autorregulação da TFG (risco com hipovolemia ou AINE)'),
 dict(subs=['sulfamethoxazole trimethoprim'],n=2,sec='Sulfamethoxazole–trimethoprim and sulfa-based antibiotics',quote='the overall incidence may be as high as 11.2%',mec='nefrite intersticial aguda, hipercalemia e elevação de creatinina'),
 dict(subs=['ciprofloxacin'],n=2,sec='Ciprofloxacin',quote='has been reported to cause AIN and crystalluria',mec='nefrite intersticial e cristalúria'),
 dict(subs=['acyclovir'],n=2,sec='Acyclovir',quote='High-dose intravenous use of acyclovir can induce AKI secondary to crystal precipitation in the renal tubules.',mec='cristalúria (dose e velocidade de infusão)'),
 dict(subs=_B,n=1,sec='Other antibiotics',quote='have been found, although rarely, to cause AIN and ATN.',mec='nefrite intersticial ou necrose tubular, rara'),
 dict(subs=['omeprazole','pantoprazole'],n=1,sec='Proton-pump inhibitors',quote='can, rarely, lead to AKI from AIN',mec='nefrite intersticial aguda, rara'),
 dict(subs=['paracetamol (acetaminophen)','paracetamol acetaminophen'],n=1,sec='Acetaminophen',quote='Rarely, acetaminophen toxicity can lead to AKI.',mec='principalmente na superdose'),
 dict(subs=['simvastatin'],n=1,sec='HMG-CoA reductase inhibitors',quote='AKI from statin use is usually in the setting of rhabdomyolysis',mec='rabdomiólise'),
 dict(subs=['mannitol'],n=2,sec='Osmotic agents',quote='osmotic nephrosis are intravenous immune globulin, hydroxyethyl starch, mannitol, and radiocontrast media',mec='nefrose osmótica'),
]
