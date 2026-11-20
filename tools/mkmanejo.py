#!/usr/bin/env python3
"""Gera data/manejo.json: manejo (intervenção, monitorização, opções mais seguras e quando suspender) por grupo de
medicamentos nefro ou hepatotóxicos, e o mapa substância -> grupos. Conteúdo geral compilado a partir de diretrizes
citadas em 'refs'; é apoio à decisão e exige revisão do farmacêutico responsável e da CCIH/serviço de referência.
Uso: python3 tools/mkmanejo.py"""
import json,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REFS=dict(
 KDIGO=dict(t='KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1–138.',u='https://kdigo.org/guidelines/acute-kidney-injury/'),
 ACG21=dict(t='Chalasani NP, Maddur H, Russo MW, Wong RJ, Reddy KR. ACG Clinical Guideline: Diagnosis and Management of Idiosyncratic Drug-Induced Liver Injury. Am J Gastroenterol. 2021;116(5):878–898. doi:10.14309/ajg.0000000000001259.',u='https://doi.org/10.14309/ajg.0000000000001259'),
 VANCO=dict(t='Rybak MJ, et al. Therapeutic monitoring of vancomycin for serious MRSA infections: revised consensus guideline (ASHP/IDSA/PIDS/SIDP). Am J Health Syst Pharm. 2020;77(11):835–864. doi:10.1093/ajhp/zxaa036.',u='https://doi.org/10.1093/ajhp/zxaa036'),
 POLI=dict(t='Tsuji BT, et al. International Consensus Guidelines for the Optimal Use of the Polymyxins. Pharmacotherapy. 2019;39(1):10–39. doi:10.1002/phar.2209.',u='https://doi.org/10.1002/phar.2209'),
 CAND=dict(t='Pappas PG, et al. Clinical Practice Guideline for the Management of Candidiasis: 2016 Update by the IDSA. Clin Infect Dis. 2016;62(4):e1–e50. doi:10.1093/cid/civ933.',u='https://doi.org/10.1093/cid/civ933'),
 CONTR=dict(t='Davenport MS, et al. Use of Intravenous Iodinated Contrast Media in Patients with Kidney Disease: Consensus Statements from the ACR and the NKF. Radiology. 2020;294(3):660–668. doi:10.1148/radiol.2019192094.',u='https://doi.org/10.1148/radiol.2019192094'),
 TB=dict(t='Nahid P, et al. Official ATS/CDC/ERS/IDSA Clinical Practice Guidelines: Treatment of Drug-Susceptible Tuberculosis. Clin Infect Dis. 2016;63(7):e147–e195. doi:10.1093/cid/ciw376.',u='https://doi.org/10.1093/cid/ciw376'),
 MTX=dict(t='Howard SC, et al. Preventing and Managing Toxicities of High-Dose Methotrexate. Oncologist. 2016;21(12):1471–1482. doi:10.1634/theoncologist.2015-0164.',u='https://doi.org/10.1634/theoncologist.2015-0164'),
 SMPC=dict(t='Targocid (teicoplanina), Resumo das Características do Produto (SmPC), Electronic Medicines Compendium (MHRA).',u='https://www.medicines.org.uk/emc/product/2927/smpc'),
 LTX=dict(t='LiverTox: Clinical and Research Information on Drug-Induced Liver Injury. NIDDK/NIH.',u='https://www.ncbi.nlm.nih.gov/books/NBK547852/'),
 FDAMET=dict(t='U.S. FDA. Drug Safety Communication: FDA revises warnings regarding use of the diabetes medicine metformin in certain patients with reduced kidney function (2016).',u='https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-fda-revises-warnings-regarding-use-diabetes-medicine-metformin-certain'),
)
GERAL=dict(
 k=dict(titulo='Conduta geral para fármacos com risco renal',
  intervencao=['Estimar a função renal antes de iniciar (depuração de creatinina ou TFG estimada) e ajustar dose e intervalo.','Corrigir hipovolemia, hipotensão, hipopotassemia e hipomagnesemia.','Evitar associar outros nefrotóxicos (AINEs, aminoglicosídeos, anfotericina B, vancomicina com piperacilina-tazobactam, contraste iodado, IECA/BRA com diuréticos).','Usar a menor dose eficaz pelo menor tempo.'],
  monitorizacao=['Creatinina, ureia e diurese: antes de iniciar, depois 2 a 3 vezes por semana (diária em paciente grave ou com doença renal).','Potássio e magnésio quando o fármaco os altera.'],
  alternativas=['Reavaliar a necessidade do medicamento e se há opção de outra classe com menor risco renal para a mesma indicação.'],
  suspender=['Lesão renal aguda (critério KDIGO): aumento de creatinina de 0,3 mg/dL ou mais em 48 h, ou 1,5 vez a basal em até 7 dias, ou diurese abaixo de 0,5 mL/kg/h por 6 h. Reavaliar o fármaco e comunicar o prescritor.'],refs=['KDIGO']),
 h=dict(titulo='Conduta geral para fármacos com risco hepático',
  intervencao=['Dosar AST, ALT, fosfatase alcalina, bilirrubina total e INR antes de iniciar em quem tem hepatopatia, uso de outros hepatotóxicos, álcool ou idade avançada.','Evitar associar outros hepatotóxicos e limitar paracetamol e álcool.','Investigar outras causas de aumento de enzimas (hepatites virais, álcool, isquemia, obstrução biliar) antes de atribuir ao medicamento.'],
  monitorizacao=['Enzimas hepáticas e bilirrubina periodicamente (frequência conforme o fármaco e o risco do paciente).','Orientar o paciente a relatar icterícia, urina escura, náusea persistente, dor no hipocôndrio direito, prurido, febre ou erupção.'],
  alternativas=['Considerar fármaco de outra classe com menor risco hepático para a mesma indicação, ou dose reduzida em hepatopatia, conforme a ficha de posologia.'],
  suspender=['Considerar suspender se ALT/AST acima de 8 vezes o limite superior da normalidade (LSN); acima de 5 vezes por 2 semanas; acima de 3 vezes com bilirrubina maior que 2 vezes o LSN ou INR maior que 1,5; ou acima de 3 vezes com sintomas.'],refs=['ACG21','LTX']))
G={}
def g(i,t,org,inter,mon,alt,susp,refs):G[i]=dict(titulo=t,org=org,intervencao=inter,monitorizacao=mon,alternativas=alt,suspender=susp,refs=refs)
g('aminoglicosideos','Aminoglicosídeos','k',
 ['Preferir dose única diária calculada pelo peso quando o esquema permitir, e limitar a duração (idealmente até 7 dias).','Corrigir hipovolemia, hipopotassemia e hipomagnesemia antes e durante o uso.','Evitar associar vancomicina, anfotericina B, polimixinas, contraste iodado, AINEs e diuréticos de alça.','Ajustar o intervalo pela depuração de creatinina e pelos níveis séricos.'],
 ['Creatinina e ureia antes de iniciar e a cada 2 a 3 dias (diária em UTI, instabilidade ou doença renal prévia).','Diurese.','Níveis séricos (vale e pico, ou AUC) conforme o protocolo do serviço.','Avaliar audição e equilíbrio se uso prolongado ou se houver zumbido ou tontura.'],
 ['Se o antibiograma permitir, trocar por antimicrobiano de outra classe sem toxicidade renal equivalente (por exemplo cefalosporina, carbapenêmico ou quinolona), em discussão com a CCIH.','Em infecção urinária não complicada, avaliar fosfomicina ou outra opção conforme a sensibilidade.'],
 ['Aumento da creatinina de 0,3 mg/dL ou mais em 48 h, ou 1,5 vez a basal: reavaliar a necessidade e trocar de classe se possível.','Zumbido, perda auditiva ou vertigem novos: suspender e comunicar o prescritor.'],['KDIGO'])
g('glicopeptideos','Glicopeptídeos (vancomicina e teicoplanina)','k',
 ['Vancomicina: guiar a dose por AUC/CIM de 400 a 600 (consenso ASHP/IDSA 2020) em vez de apenas pelo vale; evitar vales persistentemente altos.','Teicoplanina: dose de ataque e, a partir do 4º dia, ajustar a manutenção pela função renal (ClCr de 30 a 80 mL/min: metade da dose; abaixo de 30 mL/min e hemodiálise: um terço, segundo a bula).','Evitar associar vancomicina com piperacilina-tazobactam quando houver alternativa (maior incidência de lesão renal aguda); aminoglicosídeos, anfotericina B, colistina, ciclosporina, cisplatina, contraste e AINEs também aumentam o risco.','Infundir a vancomicina em 60 minutos ou mais (até 10 mg/min) para evitar reação à infusão.'],
 ['Creatinina antes de iniciar e 2 a 3 vezes por semana (diária se paciente grave).','Níveis séricos conforme o protocolo (vancomicina por AUC ou vale; teicoplanina pelo vale, com alvo maior em infecção grave).','Hemograma e audição em tratamento prolongado.'],
 ['Para MRSA com risco renal alto, discutir com a CCIH: teicoplanina (menor nefrotoxicidade que a vancomicina em parte dos estudos, mas ainda exige monitorização), linezolida (atenção a mielossupressão e interações serotoninérgicas) ou daptomicina (exceto pneumonia; acompanhar CPK).','Se estiver em uso de piperacilina-tazobactam com vancomicina, avaliar outro betalactâmico ativo (por exemplo cefepima ou meropenem) quando clinicamente adequado.'],
 ['Aumento da creatinina de 0,3 mg/dL ou mais em 48 h, ou 1,5 vez a basal: revisar a dose pelo nível, retirar fármacos associados e considerar troca.'],['VANCO','SMPC','KDIGO'])
g('polimixinas','Polimixinas','k',
 ['Usar dose de ataque seguida de manutenção calculada pelo peso, como no consenso internacional; a polimixina B tem eliminação renal mínima e o consenso não indica ajuste pela função renal, mas a lesão renal é frequente.','Evitar associar outros nefrotóxicos e neurotóxicos (aminoglicosídeos, vancomicina, bloqueadores neuromusculares).','Manter volemia adequada.'],
 ['Creatinina e diurese diárias nos primeiros dias, depois conforme a evolução.','Sinais neurológicos: parestesias, tontura, fraqueza muscular e apneia.'],
 ['Se houver alternativa ativa pelo antibiograma (por exemplo novos betalactâmicos com inibidor de betalactamase, quando disponíveis no serviço), discutir com a CCIH.'],
 ['Lesão renal aguda progressiva ou sintomas neurológicos: reavaliar o esquema com a CCIH.'],['POLI','KDIGO'])
g('anfotericina','Anfotericina B','k',
 ['Preferir a formulação lipídica (lipossomal) quando disponível e indicada, pela menor nefrotoxicidade.','Hidratar com solução salina antes da infusão conforme o protocolo, se tolerado.','Repor potássio e magnésio, que se perdem com frequência.','Evitar associar outros nefrotóxicos.'],
 ['Creatinina e eletrólitos (potássio e magnésio) diários ou pelo menos 3 vezes por semana.','Reações à infusão (febre, calafrios) e hemograma.'],
 ['Na candidemia, uma equinocandina é a primeira linha em adultos não neutropênicos (IDSA 2016), e o fluconazol serve de alternativa conforme a espécie.','Na aspergilose, avaliar voriconazol ou isavuconazol, conforme o serviço.'],
 ['Aumento progressivo da creatinina ou hipopotassemia refratária: discutir troca para formulação lipídica ou outra classe.'],['CAND','KDIGO'])
g('aines','Anti-inflamatórios não esteroides (AINEs)','k',
 ['Evitar em hipovolemia, insuficiência cardíaca, cirrose, doença renal crônica (contraindicados em ClCr abaixo de 30 mL/min) e em idosos.','Não associar com IECA/BRA e diurético ao mesmo tempo ("tripla associação"), nem com outros nefrotóxicos.','Usar a menor dose pelo menor tempo e manter hidratação.','No fechamento do canal arterial em recém-nascidos, acompanhar diurese e creatinina e seguir a orientação da neonatologia.'],
 ['Pressão arterial, edema e diurese.','Creatinina e potássio em 3 a 7 dias após iniciar em paciente de risco.'],
 ['Para dor ou febre, paracetamol respeitando o teto de dose (e a restrição em hepatopatia) ou dipirona; em dor moderada, avaliar opioide fraco.','Para gota aguda em doença renal, avaliar colchicina com dose ajustada ou corticoide.'],
 ['Oligúria, aumento da creatinina de 0,3 mg/dL ou mais, hiperpotassemia ou edema novo: suspender e comunicar o prescritor.'],['KDIGO'])
g('contrastes','Contrastes iodados','k',
 ['Risco baixo quando a TFG é 30 mL/min ou mais e não há lesão renal aguda. Se a TFG for abaixo de 30 ou houver lesão renal aguda, considerar hidratação intravenosa com solução isotônica (consenso ACR/NKF 2020).','Usar o menor volume do contraste de baixa osmolaridade ou iso-osmolar que permita o exame; evitar doses repetidas em 48 a 72 h.','Não adiar um exame necessário apenas por receio do contraste.','Suspender temporariamente a metformina se TFG abaixo de 30 ou lesão renal aguda, e reiniciar após 48 h com função renal estável.'],
 ['Creatinina 48 a 72 h após o exame em paciente de risco.'],
 ['Quando responder à pergunta clínica, considerar exame sem contraste (ultrassonografia, tomografia sem contraste ou ressonância sem gadolínio).'],
 ['Aumento da creatinina após o exame: hidratar, suspender outros nefrotóxicos e comunicar o prescritor.'],['CONTR','KDIGO'])
g('antivirais','Aciclovir e ganciclovir','k',
 ['Hidratar bem e infundir em 1 hora ou mais, sem bolus, para evitar cristalúria.','Ajustar a dose pela depuração de creatinina (obrigatório para o ganciclovir).','Evitar associar outros nefrotóxicos.','Ganciclovir: acompanhar hemograma (neutropenia e plaquetopenia).'],
 ['Creatinina e diurese 2 a 3 vezes por semana.','Hemograma com o ganciclovir.'],
 ['Quando a via oral for possível, aciclovir ou valaciclovir (com ajuste renal) ou valganciclovir. Foscarnet e cidofovir são ainda mais nefrotóxicos e não são alternativa mais segura.'],
 ['Cristalúria, oligúria ou aumento da creatinina: aumentar a hidratação, reduzir a dose e comunicar o prescritor.'],['KDIGO'])
g('renina','IECA e BRA (captopril, enalapril, losartana)','k',
 ['Dosar creatinina e potássio 1 a 2 semanas após iniciar ou aumentar a dose; um aumento de creatinina de até cerca de 30% é esperado e não exige suspender.','Suspender temporariamente em desidratação (vômitos, diarreia, febre) e antes de procedimentos com risco de hipotensão.','Evitar associar AINEs e diuréticos poupadores de potássio.','Captopril e enalapril: hepatotoxicidade colestática é rara; suspender se houver icterícia.'],
 ['Creatinina, potássio e pressão arterial.'],
 ['Se não tolerar, avaliar bloqueador de canal de cálcio di-hidropiridínico ou outra classe conforme a indicação (hipertensão, insuficiência cardíaca, nefropatia).'],
 ['Aumento da creatinina acima de 30%, hiperpotassemia grave ou angioedema: suspender e comunicar o prescritor.'],['KDIGO','LTX'])
g('diureticos','Diuréticos (furosemida, hidroclorotiazida, manitol)','k',
 ['Evitar depleção de volume: a perda excessiva causa lesão pré-renal.','Furosemida: evitar associar aminoglicosídeos (ototoxicidade) e acompanhar eletrólitos.','Hidroclorotiazida: perde eficácia com depuração de creatinina abaixo de 30 mL/min; considerar diurético de alça.','Manitol: usar apenas com indicação (hipertensão intracraniana, por exemplo) e acompanhar a osmolaridade.'],
 ['Peso, diurese, pressão arterial, sódio, potássio e creatinina.','Manitol: osmolaridade sérica e intervalo osmolar.'],
 ['Para hipertensão intracraniana, avaliar solução salina hipertônica no lugar do manitol quando o protocolo permitir.'],
 ['Manitol: suspender se houver oligúria, osmolaridade acima de 320 mOsm/kg ou intervalo osmolar acima de 10 mOsm/kg.'],['KDIGO'])
g('penicilinas','Penicilinas (amoxicilina, amoxicilina-clavulanato, oxacilina)','h',
 ['Amoxicilina-clavulanato é uma das causas mais comuns de lesão hepática por antibiótico, em geral colestática, com início até semanas após o tratamento; é mais frequente em idosos e em ciclos longos.','Limitar a duração ao necessário e evitar em quem já teve icterícia por esse medicamento (contraindicação em bula).','Oxacilina: acompanhar potássio e enzimas hepáticas em tratamento prolongado.'],
 ['AST, ALT, fosfatase alcalina e bilirrubina se ciclo longo, hepatopatia ou idade avançada.','Sintomas: icterícia, prurido, urina escura.'],
 ['Quando o agente for sensível, usar amoxicilina sem clavulanato; alternativas conforme a infecção e o antibiograma (por exemplo cefalosporina).'],
 ['Padrão colestático ou aumento de enzimas segundo os limites gerais: suspender e comunicar o prescritor.'],['ACG21','LTX'])
g('cefalosporinas','Cefalosporinas e piperacilina-tazobactam','b',
 ['Ajustar a dose pela função renal (ceftazidima em excesso pode causar neurotoxicidade na doença renal).','Ceftriaxona: não administrar com cálcio intravenoso em recém-nascidos; em crianças, atenção a pseudolitíase biliar.','Piperacilina-tazobactam com vancomicina aumenta a lesão renal aguda: avaliar alternativa se possível.','Lesão hepática é rara e em geral colestática.'],
 ['Creatinina em uso prolongado ou associado a nefrotóxicos.','Enzimas hepáticas e bilirrubina em tratamento prolongado.'],
 ['Escolher pelo antibiograma; se a associação com vancomicina for necessária, considerar cefepima ou meropenem em lugar de piperacilina-tazobactam.'],
 ['Aumento da creatinina, icterícia ou aumento importante de enzimas: reavaliar o esquema.'],['KDIGO','ACG21'])
g('quinolonas','Fluoroquinolonas (ciprofloxacino, levofloxacino)','b',
 ['Ajustar a dose pela função renal.','Cuidado com tendinopatia, prolongamento do QT, alterações da glicemia e efeitos neuropsiquiátricos; evitar em idosos com corticoide.','Hepatotoxicidade grave é rara; suspender se houver sinais.'],
 ['Creatinina, enzimas hepáticas se uso prolongado ou hepatopatia, glicemia em diabéticos e ECG se houver outros fármacos que prolongam o QT.'],
 ['Se o antibiograma permitir, betalactâmico ou outra classe (por exemplo sulfametoxazol-trimetoprima em infecção urinária sensível).'],
 ['Dor tendínea, icterícia ou aumento importante de enzimas: suspender e comunicar o prescritor.'],['KDIGO','ACG21'])
g('macrolideos','Macrolídeos (azitromicina, claritromicina)','h',
 ['Lesão hepática colestática rara, em geral de início tardio.','Claritromicina inibe o CYP3A4 e interage com estatinas, anticoagulantes e outros; atenção ao prolongamento do QT.'],
 ['Enzimas hepáticas e bilirrubina se uso prolongado ou hepatopatia; ECG se risco de QT longo.'],
 ['Doxiciclina para atípicos quando indicada; azitromicina tem menos interações que a claritromicina.'],
 ['Icterícia, prurido ou aumento importante de enzimas: suspender.'],['ACG21','LTX'])
g('outros_antibioticos','Linezolida, tigeciclina, nitrofurantoína e clindamicina','h',
 ['Linezolida: mielossupressão e acidose lática em uso prolongado; evitar associar fármacos serotoninérgicos.','Tigeciclina: pode elevar bilirrubina e transaminases e causar pancreatite; acompanhar fibrinogênio.','Nitrofurantoína: hepatite crônica e fibrose pulmonar em uso prolongado; evitar com depuração de creatinina abaixo de 30 mL/min.','Clindamicina: risco de colite por C. difficile; lesão renal aguda descrita.'],
 ['Hemograma e lactato (linezolida), enzimas hepáticas e lipase (tigeciclina), creatinina (clindamicina) e enzimas em uso prolongado.'],
 ['Cistite não complicada: fosfomicina ou cefalexina conforme a sensibilidade.','Demais casos: escolher pelo antibiograma com a CCIH.'],
 ['Sintomas de hepatite, diarreia grave ou aumento da creatinina: suspender e comunicar o prescritor.'],['ACG21','KDIGO'])
g('smx_tmp','Sulfametoxazol-trimetoprima','b',
 ['Aumenta a creatinina por inibir a secreção tubular (nem sempre é lesão real) e causa hiperpotassemia, sobretudo com IECA/BRA e doença renal.','Hidratar para evitar cristalúria; ajustar a dose na doença renal e evitar com depuração abaixo de 15 mL/min.','Reações graves de pele (SSJ/NET, DRESS) e hepatite colestática podem ocorrer nas primeiras semanas.'],
 ['Creatinina e potássio em 3 a 7 dias; enzimas hepáticas se uso prolongado; hemograma.'],
 ['Em infecção urinária sensível, fosfomicina, cefalexina ou nitrofurantoína (se depuração de creatinina de 30 mL/min ou mais).','Na profilaxia da pneumocistose em quem não tolera, discutir atovaquona.'],
 ['Erupção, febre, icterícia, hiperpotassemia ou aumento da creatinina: suspender e comunicar o prescritor.'],['KDIGO','ACG21'])
g('antifungicos','Antifúngicos (fluconazol, voriconazol, micafungina)','b',
 ['Azólicos: enzimas hepáticas antes e semanalmente no início; muitas interações pelo CYP450.','Voriconazol: acompanhar o nível sérico; a forma intravenosa contém ciclodextrina que se acumula quando a depuração de creatinina é menor que 50 mL/min, por isso preferir a via oral se possível.','Fluconazol: reduzir a dose pela metade com depuração de creatinina abaixo de 50 mL/min.','Micafungina: boa tolerância renal, mas acompanhar creatinina e enzimas.'],
 ['AST, ALT, bilirrubina, creatinina; nível sérico do voriconazol; ECG (QT) com azólicos.'],
 ['Conforme a micose: equinocandina ou anfotericina lipossomal; o perfil hepático e renal de cada uma deve ser pesado com o quadro do paciente.'],
 ['Aumento de enzimas segundo os limites gerais, icterícia ou piora renal: reavaliar com a CCIH.'],['ACG21','KDIGO','CAND'])
g('antituberculosos','Antituberculosos (isoniazida, rifampicina, pirazinamida)','h',
 ['Dosar enzimas hepáticas antes de iniciar em risco (hepatopatia, álcool, idade avançada, uso de outros hepatotóxicos) e acompanhar durante o tratamento.','Orientar o paciente a relatar náusea, vômito, icterícia e dor abdominal.','Se houver hepatite, o tratamento é conduzido pela referência em tuberculose, com reintrodução sequencial das drogas após a normalização.'],
 ['AST, ALT e bilirrubina no início e periodicamente (mensal nos primeiros meses em pacientes de risco).'],
 ['Na hepatite durante o tratamento, esquemas especiais sem as drogas hepatotóxicas (por exemplo com etambutol e fluoroquinolona) definidos pela referência, seguindo o manual do Ministério da Saúde.'],
 ['ALT/AST acima de 3 vezes o LSN com sintomas, ou acima de 5 vezes sem sintomas: suspender as drogas hepatotóxicas e encaminhar à referência.'],['TB','ACG21'])
g('anticonvulsivantes','Anticonvulsivantes (valproato, carbamazepina, fenitoína, fenobarbital, lamotrigina)','h',
 ['Valproato: risco de hepatotoxicidade fatal, maior em menores de 2 anos, politerapia e doença mitocondrial (POLG); pode causar pancreatite e hiperamonemia.','Carbamazepina: reações graves de pele associadas ao HLA-B*15:02 em ascendência asiática; acompanhar sódio e hemograma.','Fenitoína: acompanhar o nível (corrigir pela albumina) e infundir devagar na via intravenosa.','Lamotrigina: titular lentamente para reduzir o risco de erupção grave; o valproato dobra o nível.'],
 ['AST, ALT e bilirrubina no início e periodicamente; níveis séricos conforme o fármaco; amônia se alteração do estado mental com valproato; hemograma e sódio com carbamazepina.'],
 ['Em hepatopatia, discutir com a neurologia o uso de levetiracetam (sem metabolismo hepático relevante; ajustar na doença renal), conforme o tipo de crise.'],
 ['Icterícia, vômitos persistentes, letargia, erupção ou aumento importante de enzimas: suspender com orientação do prescritor.'],['ACG21','LTX'])
g('amiodarona','Amiodarona','h',
 ['Menor dose eficaz; evitar associar outros hepatotóxicos.','Hepatotoxicidade pode ser crônica (semelhante à hepatite alcoólica) e, mais raramente, aguda na via intravenosa.','Interage com varfarina, digoxina e estatinas (limitar a sinvastatina a 10 mg/dia).'],
 ['AST/ALT, TSH e radiografia de tórax no início; enzimas e TSH a cada 6 meses; ECG; avaliação oftalmológica se sintomas.'],
 ['Conforme a arritmia, discutir com a cardiologia: na fibrilação atrial, controle de frequência com betabloqueador ou antagonista de cálcio não di-hidropiridínico.'],
 ['ALT/AST acima do dobro a o triplo do basal com sintomas, ou acima de 3 vezes o LSN: reavaliar com a cardiologia.'],['ACG21','LTX'])
g('psicotropicos','Antipsicóticos e antidepressivos (clorpromazina, haloperidol, risperidona, olanzapina, quetiapina, amitriptilina, sertralina)','h',
 ['Clorpromazina pode causar hepatite colestática; evitar em colestase prévia.','Em hepatopatia, iniciar com dose menor e titular devagar (amitriptilina, sertralina, quetiapina, olanzapina).','Acompanhar o perfil metabólico e o QT.'],
 ['Enzimas hepáticas se hepatopatia ou sintomas; glicemia, lipídios e peso com antipsicóticos atípicos; ECG se risco de QT longo.'],
 ['Em hepatopatia, discutir a troca para fármaco com menor risco hepático e o ajuste de dose com a psiquiatria.'],
 ['Icterícia, prurido ou aumento importante de enzimas: suspender com orientação do prescritor.'],['ACG21','LTX'])
g('imunossupressores','Imunossupressores e biológicos (azatioprina, leflunomida, adalimumabe, etanercepte)','h',
 ['Antes de anti-TNF, rastrear tuberculose e hepatite B (HBsAg e anti-HBc): há risco de reativação.','Azatioprina: avaliar TPMT/NUDT15 quando disponível e acompanhar hemograma.','Leflunomida: enzimas mensais nos primeiros 6 meses; em hepatotoxicidade, discutir lavagem com colestiramina.'],
 ['AST, ALT e hemograma no início e a cada 1 a 3 meses; sinais de infecção.'],
 ['Discutir com a reumatologia ou a gastroenterologia: hidroxicloroquina ou sulfassalazina (menor risco hepático) ou outro biológico conforme a doença.'],
 ['ALT/AST acima de 3 vezes o LSN persistente, icterícia ou infecção grave: suspender e comunicar o prescritor.'],['ACG21','LTX'])
g('metotrexato','Metotrexato','b',
 ['Em dose alta: hidratação intensa, alcalinização da urina (pH acima de 7), leucovorina de resgate e dosagem seriada do nível (24, 48 e 72 h).','Evitar associar AINEs, inibidores de bomba de prótons, penicilinas e sulfametoxazol-trimetoprima, que reduzem a eliminação.','Em dose baixa semanal: dose única por semana (erro de dose diária é grave), ácido fólico e ajuste na doença renal.','Considerar glucarpidase se houver nível tóxico com lesão renal.'],
 ['Creatinina, enzimas hepáticas, hemograma e nível sérico (dose alta); enzimas e hemograma a cada 4 a 12 semanas na dose baixa.'],
 ['Na artrite ou psoríase, discutir com a reumatologia ou dermatologia outra opção (por exemplo leflunomida com atenção hepática, hidroxicloroquina ou biológico).'],
 ['Aumento da creatinina, mucosite, citopenia ou aumento importante de enzimas: suspender e acionar o protocolo de resgate.'],['MTX','ACG21'])
g('alopurinol','Alopurinol','b',
 ['Começar com 100 mg/dia (50 mg/dia na doença renal) e titular devagar.','Rastrear o HLA-B*58:01 em ascendência do sudeste asiático, chinesa Han, tailandesa e afro-americana, quando disponível.','Reações graves (DRESS, SSJ/NET) e hepatite podem ocorrer nas primeiras semanas.'],
 ['Creatinina, enzimas hepáticas, hemograma e ácido úrico; erupção cutânea.'],
 ['Febuxostate (atenção ao risco cardiovascular) ou, para crises agudas, colchicina com ajuste renal.'],
 ['Erupção, febre, eosinofilia, icterícia ou piora renal: suspender imediatamente.'],['ACG21','LTX'])
g('metformina','Metformina','b',
 ['Contraindicada com TFG abaixo de 30 mL/min; não iniciar com TFG de 30 a 45; reduzir a dose se a TFG cair abaixo de 45 (FDA).','Suspender temporariamente com contraste iodado em risco, cirurgia, sepse ou hipoperfusão (risco de acidose láctica).','Evitar em hepatopatia grave e uso excessivo de álcool.'],
 ['Creatinina e TFG pelo menos uma vez ao ano (a cada 3 a 6 meses se a TFG for menor que 60); vitamina B12 em uso prolongado.'],
 ['Com TFG reduzida, avaliar inibidor de SGLT2, inibidor de DPP-4 (linagliptina não precisa de ajuste renal) ou insulina.'],
 ['TFG abaixo de 30, acidose láctica ou desidratação grave: suspender.'],['FDAMET','KDIGO'])
g('antidiabeticos','Dapagliflozina e insulinas','k',
 ['Dapagliflozina: queda inicial da TFG é esperada; suspender em jejum prolongado, doença aguda e cirurgia (risco de cetoacidose euglicêmica) e evitar depleção de volume.','Insulinas: a necessidade cai na doença renal (risco de hipoglicemia); reduzir a dose e acompanhar a glicemia.'],
 ['Creatinina, TFG, volemia, cetonas se mal-estar; glicemia capilar.'],
 ['Conforme a função renal, discutir ajuste do esquema com a endocrinologia.'],
 ['Cetoacidose, desidratação ou hipoglicemias recorrentes: reavaliar o esquema.'],['KDIGO'])
g('estatinas','Sinvastatina','b',
 ['Dosar ALT antes de iniciar.','Rabdomiólise pode causar lesão renal aguda; evitar com claritromicina, azólicos, ciclosporina e outros inibidores do CYP3A4 e limitar a dose com amiodarona (10 mg/dia) e anlodipino (20 mg/dia).'],
 ['CK se mialgia ou fraqueza; ALT se sintomas; creatinina se rabdomiólise.'],
 ['Atorvastatina, rosuvastatina (ajustar na doença renal grave) ou pravastatina, que têm menos interações pelo CYP3A4.'],
 ['CK acima de 10 vezes o LSN, mialgia intensa ou urina escura: suspender.'],['ACG21','KDIGO'])
g('ibp','Inibidores de bomba de prótons (omeprazol, pantoprazol)','k',
 ['Nefrite intersticial aguda é rara, mas é causa reconhecida de lesão renal; reavaliar a indicação e retirar se não houver necessidade.','Hepatotoxicidade é rara.'],
 ['Creatinina em uso prolongado ou com doença renal; magnésio em uso crônico.'],
 ['Se a indicação for leve, medidas não farmacológicas ou antagonista H2 (famotidina, com ajuste na doença renal).'],
 ['Aumento inexplicado da creatinina em uso de IBP: suspender e comunicar o prescritor.'],['KDIGO'])
g('cloroquina','Hidroxicloroquina e cloroquina','k',
 ['Ajustar a dose pela função renal e, para a hidroxicloroquina, limitar a 5 mg/kg/dia de peso real (risco de retinopatia).','Atenção ao prolongamento do QT.'],
 ['Creatinina, ECG se fatores de risco e avaliação oftalmológica anual após 5 anos (antes se doença renal).'],
 ['Conforme a indicação (lúpus, artrite), discutir alternativas com a reumatologia.'],
 ['Alteração visual ou QT longo: suspender e comunicar o prescritor.'],['KDIGO'])
g('mesalazina','Mesalazina','k',
 ['Nefrite intersticial é rara, mas pode ser grave; evitar associar AINEs.'],
 ['Creatinina antes, aos 3 a 6 meses e depois anualmente.'],
 ['Se houver lesão renal, discutir com a gastroenterologia outras opções para a doença inflamatória intestinal.'],
 ['Aumento da creatinina sem outra causa: suspender e comunicar o prescritor.'],['KDIGO'])
g('varfarina','Varfarina','k',
 ['Nefropatia relacionada à anticoagulação pode ocorrer com INR muito alto; manter INR no alvo.','Interage com muitos fármacos (azólicos, macrolídeos, amiodarona, sulfametoxazol-trimetoprima).'],
 ['INR frequente no início e após qualquer mudança de medicamento; creatinina.'],
 ['Em fibrilação atrial ou tromboembolismo, discutir anticoagulante oral direto com ajuste pela função renal (apixabana tem menor eliminação renal que dabigatrana); varfarina segue sendo a escolha em válvula mecânica.'],
 ['INR acima de 4,5 ou sangramento: seguir o protocolo de reversão.'],['KDIGO'])
g('anestesicos','Sevoflurano, cetamina e esketamina','b',
 ['Sevoflurano: evitar fluxo de gás fresco baixo (composto A) e reexposição repetida a halogenados em quem teve hepatite por esses agentes.','Cetamina e esketamina: uso crônico pode causar cistite ulcerativa e lesão hepática colestática.'],
 ['Enzimas hepáticas se sintomas ou reexposição; sintomas urinários com cetamina.'],
 ['Anestesia venosa total (propofol) em quem teve reação a halogenados, conforme a anestesiologia.'],
 ['Icterícia ou hematúria persistente: reavaliar.'],['ACG21','KDIGO'])
g('dipirona','Dipirona (metamizol)','h',
 ['Agranulocitose é a reação grave mais conhecida; hepatite medicamentosa é rara.','Evitar uso prolongado.'],
 ['Hemograma se uso prolongado; enzimas hepáticas se sintomas.'],
 ['Paracetamol (respeitando o teto de dose) para dor e febre.'],
 ['Febre, dor de garganta ou icterícia durante o uso: suspender e colher hemograma e enzimas.'],['ACG21'])
g('albendazol','Albendazol','h',
 ['Dosar enzimas hepáticas antes de cada ciclo e durante tratamentos longos (neurocisticercose, hidatidose).','Tomar com refeição gordurosa para melhor absorção.'],
 ['AST/ALT antes de cada ciclo e a cada 2 semanas em tratamento prolongado; hemograma.'],
 ['Para helmintoses intestinais simples, outras opções conforme o parasita (por exemplo mebendazol ou ivermectina).'],
 ['ALT/AST acima de 3 vezes o LSN em tratamento prolongado: suspender e comunicar o prescritor.'],['ACG21','LTX'])
g('hidralazina','Hidralazina e clopidogrel','h',
 ['Hidralazina: pode causar síndrome lúpus-símile e hepatite; usar a menor dose.','Clopidogrel: lesão hepática é rara; acompanhar enzimas se sintomas.'],
 ['Enzimas hepáticas se sintomas; anticorpos antinucleares se sintomas de lúpus com hidralazina.'],
 ['Para hipertensão, outras classes (por exemplo bloqueador de canal de cálcio) conforme a indicação.'],
 ['Icterícia, dor articular ou febre persistentes: reavaliar.'],['ACG21','LTX'])
g('leucovorina','Leucovorina (folinato de cálcio)','k',
 ['A leucovorina não é nefrotóxica; o alerta da bula refere-se à lesão renal do metotrexato, que ela não previne.','No resgate do metotrexato em dose alta, manter hidratação, alcalinização da urina e dosagem seriada do nível; ajustar a leucovorina pelo nível e pela função renal.'],
 ['Creatinina, diurese e nível sérico de metotrexato.'],
 ['Se houver nível tóxico de metotrexato com lesão renal, discutir glucarpidase com a oncologia.'],
 ['Aumento da creatinina no resgate: acionar o protocolo do serviço e a oncologia.'],['MTX'])
MAP={
'leucovorin_folinic_acid':['leucovorina'],
'amikacin':['aminoglicosideos'],'gentamicin':['aminoglicosideos'],'tobramycin':['aminoglicosideos'],
'vancomycin':['glicopeptideos'],'teicoplanin':['glicopeptideos'],'polymyxin_b':['polimixinas'],
'amphotericin_b':['anfotericina'],'liposomal_amphotericin_b':['anfotericina'],
'diclofenac':['aines'],'ibuprofen':['aines'],'ibuprofen_lysine':['aines'],'indomethacin':['aines'],'tenoxicam':['aines'],
'iobitridol_iopamidol_contrast':['contrastes'],'ionic_iodinated_contrast_meglumine':['contrastes'],'meglumine_diatrizoate_contrast':['contrastes'],'non_ionic_iodinated_contrast':['contrastes'],
'acyclovir':['antivirais'],'ganciclovir':['antivirais'],
'captopril':['renina'],'enalapril':['renina'],'losartan':['renina'],
'furosemide':['diureticos'],'hydrochlorothiazide':['diureticos'],'mannitol':['diureticos'],
'amoxicillin':['penicilinas'],'amoxicillin_clavulanate':['penicilinas'],'oxacillin':['penicilinas'],
'cefalotin':['cefalosporinas'],'cefazolin':['cefalosporinas'],'cefotaxime':['cefalosporinas'],'ceftazidime':['cefalosporinas'],'ceftriaxone':['cefalosporinas'],'cefuroxime':['cefalosporinas'],'cephalexin':['cefalosporinas'],'piperacillin_tazobactam':['cefalosporinas'],
'ciprofloxacin':['quinolonas'],'levofloxacin':['quinolonas'],
'azithromycin':['macrolideos'],'clarithromycin':['macrolideos'],
'linezolid':['outros_antibioticos'],'tigecycline':['outros_antibioticos'],'nitrofurantoin':['outros_antibioticos'],'clindamycin':['outros_antibioticos'],
'sulfamethoxazole_trimethoprim':['smx_tmp'],
'fluconazole':['antifungicos'],'voriconazole':['antifungicos'],'micafungin':['antifungicos'],
'isoniazid':['antituberculosos'],'rifampicin':['antituberculosos'],'pyrazinamide':['antituberculosos'],
'valproate_valproic_acid':['anticonvulsivantes'],'carbamazepine':['anticonvulsivantes'],'phenytoin':['anticonvulsivantes'],'phenobarbital':['anticonvulsivantes'],'lamotrigine':['anticonvulsivantes'],
'amiodarone':['amiodarona'],
'chlorpromazine':['psicotropicos'],'haloperidol':['psicotropicos'],'haloperidol_decanoate':['psicotropicos'],'risperidone':['psicotropicos'],'olanzapine':['psicotropicos'],'quetiapine':['psicotropicos'],'amitriptyline':['psicotropicos'],'sertraline':['psicotropicos'],
'azathioprine':['imunossupressores'],'leflunomide':['imunossupressores'],'adalimumab':['imunossupressores'],'etanercept':['imunossupressores'],
'methotrexate':['metotrexato'],'allopurinol':['alopurinol'],'metformin':['metformina'],
'dapagliflozin':['antidiabeticos'],'insulin_degludec':['antidiabeticos'],'insulin_glargine':['antidiabeticos'],
'simvastatin':['estatinas'],'omeprazole':['ibp'],'pantoprazole':['ibp'],
'chloroquine':['cloroquina'],'hydroxychloroquine':['cloroquina'],'mesalamine':['mesalazina'],'warfarin':['varfarina'],
'sevoflurane':['anestesicos'],'esketamine_ketamine':['anestesicos'],
'metamizole_dipyrone':['dipirona'],'albendazole':['albendazol'],'hydralazine':['hidralazina'],'clopidogrel':['hidralazina'],
}
if __name__=='__main__':
    tox=json.load(open(os.path.join(ROOT,'data/toxicidade.json'),encoding='utf8'))
    flag=[s for s,v in tox['itens'].items() if ((v.get('k') or {}).get('l') or 0)>=2 or ((v.get('h') or {}).get('l') or 0)>=3]
    miss=[s for s in flag if s not in MAP];bad=[s for s in MAP if s not in tox['itens']]
    assert not bad,bad
    used={r for gr in G.values() for r in gr['refs']}|{r for x in GERAL.values() for r in x['refs']}
    assert used<=set(REFS),used-set(REFS)
    out=dict(fonte='Manejo geral por grupo de medicamentos, compilado por IA a partir das diretrizes citadas. Apoio à decisão: confirmar com a bula, o protocolo do serviço, a CCIH e o farmacêutico responsável.',
             refs={k:REFS[k] for k in sorted(used)},geral=GERAL,grupos=G,map=MAP)
    json.dump(out,open(os.path.join(ROOT,'data/manejo.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
    print(len(flag),'substâncias sinalizadas;',len(G),'grupos;',len(MAP),'mapeadas; sem grupo (usam a conduta geral):',miss)
