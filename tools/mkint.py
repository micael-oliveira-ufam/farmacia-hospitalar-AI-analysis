#!/usr/bin/env python3
"""Gera data/interacoes.json (regras de triagem, ingredientes casados com as monografias do catalogo).
CONTEUDO COMPILADO POR IA a partir de conhecimento farmacologico geral e bulas: exige revisao farmaceutica."""
import json, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G={
 "opioide":["morfina","fentanil","metadona","tramadol","remifentanil"],
 "benzo":["midazolam","diazepam","lorazepam","clonazepam","clobazam"],
 "sedativo":["fenobarbital","clorpromazina","prometazina","hidroxizina","dexmedetomidina"],
 "aine":["ibuprofeno","tenoxicam","acido acetilsalicilico"],
 "anticoag":["enoxaparina","heparina"],
 "ieca_bra":["captopril","losartana"],
 "k_poup":["espironolactona","cloreto de potassio"],
 "aminoglic":["gentamicina","amicacina","tobramicina"],
 "bnm":["atracurio","rocuronio","pancuronio","suxametonio"],
 "pot_bnm":["gentamicina","amicacina","tobramicina","polimixina b","clindamicina","sulfato de magnesio"],
 "qt":["haloperidol","clorpromazina","ondansetrona","metadona","azitromicina","claritromicina","ciprofloxacino","fluconazol","domperidona","fluoxetina","risperidona","hidroxizina"],
 "sero":["fluoxetina","tramadol","linezolida","metadona","ondansetrona","fentanil"],
 "cyp3a4_inib":["claritromicina","fluconazol"],
 "cyp3a4_subs":["midazolam","fentanil"],
 "indutores":["fenitoina","fenobarbital","carbamazepina"],
 "corticoide":["dexametasona","prednisona","prednisolona","metilprednisolona","hidrocortisona"],
 "cations":["carbonato de calcio","hidroxido de aluminio","sulfato ferroso"],
 "antipsic":["haloperidol","clorpromazina","risperidona"],
 "procinetico":["metoclopramida","bromoprida","domperidona"],
 "betabloq":["propranolol","carvedilol"],
 "adren":["epinefrina","norepinefrina","dopamina"],
 "nefrotox_aa":["vancomicina","anfotericina b","polimixina b","contraste"],
}
F={
 "FDABZD":{"t":"FDA. Drug Safety Communication: benzodiazepines (boxed warning, uso com opioides)","u":"https://www.fda.gov/media/142368/download","l":"ok"},
 "FDATAB":{"t":"FDA. Drug Development and Drug Interactions: Table of Substrates, Inhibitors and Inducers","u":"https://www.fda.gov/drugs/drug-interactions-labeling/drug-development-and-drug-interactions-table-substrates-inhibitors-and-inducers","l":"inst"},
 "CREDMEDS":{"t":"CredibleMeds. Lista de medicamentos com risco de QT/Torsades","u":"https://crediblemeds.org/","l":"inst"},
 "DRUGS":{"t":"Drugs.com. Drug Interactions Checker","u":"https://www.drugs.com/drug_interactions.html","l":"inst"},
 "LEX":{"t":"Lexicomp (Wolters Kluwer). Drug Interactions","u":"https://www.wolterskluwer.com/en/solutions/lexicomp","l":"inst"},
 "NEFRO":{"t":"Perazella MA. Pharmacology behind common drug nephrotoxicities. CJASN 2018","u":"https://doi.org/10.2215/CJN.00150118","l":"ok"},
 "KDIGO":{"t":"KDIGO. Clinical Practice Guideline for Acute Kidney Injury","u":"https://kdigo.org/guidelines/acute-kidney-injury/","l":"inst"},
 "ISMP":{"t":"ISMP Brasil. Medicamentos potencialmente perigosos de uso hospitalar","u":"https://ismp-brasil.org/wp-content/uploads/2024/06/BOLETIM-ISMP-FEVEREIRO-2024-MPP-HOSPITALAR.pdf","l":"ok"},
 "BULA":{"t":"Bulas dos medicamentos envolvidos (DailyMed/FDA e Bulário ANVISA)","u":"https://dailymed.nlm.nih.gov/dailymed/","l":"inst"},
}
def r(i,a,b,sev,t,mec,cond,ref,so=None):
    d={"id":i,"a":a,"b":b,"sev":sev,"titulo":t,"mec":mec,"cond":cond,"ref":ref}
    if so: d["so"]=so
    return d
R=[
 r("opi-benzo","@opioide","@benzo",2,"Opioide + benzodiazepínico","Depressão respiratória e do SNC aditiva (alerta em tarja/bula do FDA).","Evitar se possível; se necessário, menor dose e menor tempo, monitorar sedação, FR e SpO2.",["FDABZD","BULA"]),
 r("opi-sed","@opioide","@sedativo",1,"Opioide + sedativo/neuroléptico","Sedação e depressão respiratória aditivas.","Monitorar nível de consciência e FR; ajustar doses.",["LEX","BULA"]),
 r("benzo-fenob","@benzo","fenobarbital",1,"Benzodiazepínico + fenobarbital","Depressão do SNC aditiva; o fenobarbital também induz o metabolismo de alguns benzodiazepínicos.","Monitorar sedação e FR.",["LEX","BULA"]),
 r("aine-anticoag","@aine","@anticoag",2,"AINE/AAS + anticoagulante","Risco aumentado de sangramento (efeito antiplaquetário e lesão gástrica).","Evitar associação quando possível; proteção gástrica e monitorar sinais de sangramento.",["LEX","BULA"]),
 r("aine-ieca","@aine","@ieca_bra",1,"AINE + IECA/BRA","Redução do efeito anti-hipertensivo e risco de lesão renal aguda, sobretudo com desidratação.","Monitorar creatinina, diurese e pressão; evitar em desidratação.",["NEFRO","KDIGO"]),
 r("aine-diur","@aine","furosemida",1,"AINE + furosemida","Reduz o efeito diurético e aumenta o risco de lesão renal.","Monitorar diurese, creatinina e volemia.",["NEFRO","LEX"]),
 r("hiperk-1","@ieca_bra","@k_poup",2,"IECA/BRA + espironolactona/KCl","Hipercalemia (redução da excreção de potássio).","Monitorar potássio e creatinina; revisar necessidade de reposição de potássio.",["LEX","BULA"]),
 r("hiperk-2","espironolactona","cloreto de potassio",2,"Espironolactona + cloreto de potássio","Hipercalemia.","Evitar reposição de rotina; dosar potássio antes e durante.",["LEX","BULA"]),
 r("hiperk-3","sulfametoxazol","@k_poup",2,"Sulfametoxazol-trimetoprim + espironolactona/KCl","O trimetoprim reduz a excreção renal de potássio: hipercalemia.","Monitorar potássio, sobretudo em pacientes com função renal reduzida.",["LEX","BULA"]),
 r("hiperk-4","sulfametoxazol","@ieca_bra",2,"Sulfametoxazol-trimetoprim + IECA/BRA","Hipercalemia e piora de função renal.","Monitorar potássio e creatinina.",["LEX","BULA"]),
 r("tram-fluox","tramadol","fluoxetina",2,"Tramadol + fluoxetina","Síndrome serotoninérgica e convulsões; a fluoxetina inibe o CYP2D6 e reduz a ativação do tramadol.","Evitar quando possível; monitorar sinais de toxicidade serotoninérgica.",["FDATAB","BULA"]),
 r("lzd-sero","linezolida","@sero",2,"Linezolida + serotoninérgico","A linezolida é inibidora fraca e reversível da MAO: risco de síndrome serotoninérgica.","Evitar ou monitorar de perto (agitação, tremor, hipertermia, clônus).",["BULA","LEX"]),
 r("lzd-adren","linezolida","@adren",1,"Linezolida + vasopressor adrenérgico","Possível resposta pressora exagerada pela inibição da MAO.","Titular o vasopressor com cautela e monitorar PA.",["BULA","LEX"]),
 r("qt","@qt",None,2,"Associação de fármacos que prolongam o QT","Efeito aditivo no intervalo QT; risco de Torsades de pointes, maior com hipocalemia/hipomagnesemia.","Checar ECG (QTc), K+ e Mg2+; considerar alternativa sem efeito no QT.",["CREDMEDS","BULA"],None),
 r("cyp-mid","@cyp3a4_inib","@cyp3a4_subs",2,"Inibidor de CYP3A4 + midazolam/fentanil","Aumento da concentração e do tempo de ação do substrato: sedação prolongada e depressão respiratória.","Reduzir dose, monitorar sedação e respiração.",["FDATAB","BULA"]),
 r("ind-cort","@indutores","@corticoide",1,"Indutor enzimático + corticoide","Indução do metabolismo reduz o efeito do corticoide.","Considerar aumento de dose do corticoide conforme resposta.",["FDATAB","LEX"]),
 r("fen-flu","fenitoina","fluconazol",2,"Fenitoína + fluconazol","Aumento da concentração de fenitoína (inibição do CYP2C9/2C19) e risco de toxicidade.","Dosar fenitoína e monitorar sinais de toxicidade (nistagmo, ataxia).",["FDATAB","BULA"]),
 r("fen-metro","fenitoina","metronidazol",1,"Fenitoína + metronidazol","Pode aumentar a concentração de fenitoína.","Monitorar nível sérico e toxicidade.",["LEX","BULA"]),
 r("fen-smx","fenitoina","sulfametoxazol",1,"Fenitoína + sulfametoxazol-trimetoprim","Pode aumentar a concentração de fenitoína.","Monitorar nível sérico e toxicidade.",["LEX","BULA"]),
 r("cbz-clari","carbamazepina","@cyp3a4_inib",2,"Carbamazepina + claritromicina/fluconazol","Inibição do CYP3A4 eleva a carbamazepina: tontura, diplopia, ataxia.","Evitar ou reduzir dose e dosar carbamazepina.",["FDATAB","BULA"]),
 r("vpa-ltg","valproato","lamotrigina",2,"Valproato + lamotrigina","O valproato dobra a meia-vida da lamotrigina e aumenta o risco de erupção cutânea grave (Stevens-Johnson).","Usar esquema de dose reduzida e titulação lenta conforme a bula; orientar sobre rash.",["BULA","LEX"]),
 r("vpa-cbp","valproato","meropenem",2,"Valproato + meropenem","Os carbapenêmicos reduzem de forma acentuada o nível do valproato, com risco de perda de controle das crises.","Evitar associação; usar outro antimicrobiano ou outro antiepiléptico.",["BULA","LEX"]),
 r("vpa-tpm","valproato","topiramato",1,"Valproato + topiramato","Risco de hiperamonemia e encefalopatia.","Monitorar estado mental e amônia se houver letargia ou vômitos.",["BULA","LEX"]),
 r("vpa-fenob","valproato","fenobarbital",1,"Valproato + fenobarbital","O valproato eleva a concentração do fenobarbital: sedação excessiva.","Monitorar sedação e nível sérico.",["BULA","LEX"]),
 r("vpa-aas","valproato","acido acetilsalicilico",1,"Valproato + AAS","O AAS desloca o valproato da albumina e eleva a fração livre; efeito antiplaquetário soma-se.","Monitorar toxicidade e sangramento.",["BULA","LEX"]),
 r("aa-nef","@aminoglic","@nefrotox_aa",2,"Aminoglicosídeo + outro nefrotóxico","Nefrotoxicidade e ototoxicidade aditivas.","Monitorar creatinina, diurese e níveis séricos; manter hidratação; menor duração possível.",["NEFRO","KDIGO"]),
 r("aa-furo","@aminoglic","furosemida",1,"Aminoglicosídeo + furosemida","Ototoxicidade e nefrotoxicidade potencializadas.","Monitorar audição, função renal e eletrólitos.",["LEX","BULA"]),
 r("vanc-pip","vancomicina","piperacilina",2,"Vancomicina + piperacilina-tazobactam","Maior incidência de lesão renal aguda do que com outros betalactâmicos.","Considerar alternativa (p.ex. cefepima/meropenem conforme indicação) ou monitorar creatinina diariamente.",["NEFRO","KDIGO"]),
 r("bnm-pot","@bnm","@pot_bnm",2,"Bloqueador neuromuscular + potenciador","Aminoglicosídeos, polimixina, clindamicina e magnésio potencializam o bloqueio neuromuscular e podem prolongar a paralisia.","Monitorar a função neuromuscular (TOF); ter reversor disponível.",["LEX","BULA"]),
 r("cef-ca","ceftriaxona","@calcio",2,"Ceftriaxona + cálcio IV","Precipitação de ceftriaxona-cálcio com casos fatais em neonatos. Contraindicada em neonato (≤ 28 dias) com cálcio IV. Em outras idades, não administrar simultaneamente na mesma via.","Neonato: não usar com cálcio IV. Demais: vias separadas e lavagem entre as infusões.",["BULA","LEX"],"neo"),
 r("cef-ca2","ceftriaxona","@calcio",1,"Ceftriaxona + cálcio IV","Risco de precipitação quando infundidas pela mesma via.","Não misturar nem infundir simultaneamente na mesma via; lavar o acesso entre as infusões.",["BULA","LEX"]),
 r("cipro-cat","ciprofloxacino","@cations",1,"Ciprofloxacino oral + cálcio/alumínio/ferro","Quelação reduz muito a absorção do antibiótico (relevante na via oral).","Separar: ciprofloxacino 2 h antes ou 6 h depois do cátion.",["BULA","LEX"]),
 r("cipro-cort","ciprofloxacino","@corticoide",1,"Quinolona + corticoide","Risco aumentado de tendinopatia e ruptura de tendão.","Orientar para suspender e avaliar em caso de dor em tendão.",["BULA","LEX"]),
 r("lev-cat","levotiroxina","@cations",1,"Levotiroxina + cálcio/alumínio/ferro","Reduz a absorção da levotiroxina.","Separar por pelo menos 4 horas; reavaliar TSH.",["BULA","LEX"]),
 r("fe-ibp","sulfato ferroso","@ibp",1,"Sulfato ferroso + inibidor de bomba de prótons","A redução da acidez gástrica diminui a absorção do ferro oral.","Reavaliar necessidade do IBP ou resposta ao ferro.",["LEX","BULA"]),
 r("ins-bb","insulina","@betabloq",1,"Insulina + betabloqueador","Pode mascarar sinais adrenérgicos da hipoglicemia e prolongá-la.","Monitorar glicemia com mais frequência.",["BULA","LEX"]),
 r("ins-cort","insulina","@corticoide",1,"Insulina + corticoide","Os corticoides causam hiperglicemia e elevam a necessidade de insulina.","Monitorar glicemia e ajustar a insulina.",["BULA","LEX"]),
 r("prop-salb","propranolol","salbutamol",2,"Propranolol + salbutamol","Betabloqueador não seletivo antagoniza o broncodilatador e pode causar broncoespasmo.","Evitar propranolol em asma/broncoespasmo; considerar betabloqueador cardiosseletivo se indicado.",["BULA","LEX"]),
 r("prop-epi","propranolol","epinefrina",2,"Propranolol + epinefrina","Hipertensão grave com bradicardia reflexa; a epinefrina pode perder o efeito beta.","Monitorar PA e FC; cautela na anafilaxia em uso de betabloqueador.",["BULA","LEX"]),
 r("antipsic-proc","@antipsic","@procinetico",1,"Antipsicótico + procinético","Risco aditivo de sintomas extrapiramidais e síndrome neuroléptica maligna.","Evitar a associação, sobretudo em crianças; monitorar sinais extrapiramidais.",["BULA","LEX"]),
 r("cort-aine","@corticoide","@aine",1,"Corticoide + AINE/AAS","Risco aumentado de úlcera e sangramento gastrointestinal.","Considerar proteção gástrica e menor tempo de uso.",["LEX","BULA"]),
 r("seg-ond","ondansetrona","tramadol",1,"Ondansetrona + tramadol","Pode reduzir o efeito analgésico do tramadol e aumentar o risco serotoninérgico.","Monitorar analgesia e sinais de toxicidade.",["LEX","BULA"]),
 r("fluox-sang","fluoxetina","@anticoag",1,"Fluoxetina + anticoagulante","Aumento do risco de sangramento (ISRS prejudica a agregação plaquetária).","Monitorar sinais de sangramento.",["LEX","BULA"]),
 r("mag-ca","sulfato de magnesio","gluconato de calcio",1,"Sulfato de magnésio + gluconato de cálcio","O cálcio antagoniza o magnésio (usado como antídoto da toxicidade por Mg).","Esperado se houver intoxicação por Mg; fora disso, confirmar a intenção.",["LEX","BULA"]),
]
G["calcio"]=["gluconato de calcio","cloreto de calcio"]
G["ibp"]=["omeprazol","pantoprazol"]
# o grupo QT e uma regra de grupo (min 2)
for x in R:
    if x["id"]=="qt": x["b"]=None; x["min"]=2
out={"versao":1,"aviso":"Conteudo compilado por IA; exige revisao farmaceutica. Nao substitui Lexicomp/Micromedex.","grupos":G,"fontes":F,"regras":R,
 "credito":"Logica de triagem inspirada no NoHarm.ai (https://github.com/noharm-ai, licenca MIT). Nenhum codigo ou dado do NoHarm foi copiado."}
json.dump(out,open(os.path.join(ROOT,'data','interacoes.json'),'w',encoding='utf8'),ensure_ascii=False,indent=1)
print(len(R),'regras')
