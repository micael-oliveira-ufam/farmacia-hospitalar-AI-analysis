from dsl import F
FICHA = {}
_R = ["LEX", "BNF", "ANV"]

FICHA["vitaminas_complexo_b_inj"] = F(
    "Fornece tiamina (B1), riboflavina (B2), piridoxina (B6), nicotinamida (B3), dexpantenol e, conforme a formulação, cianocobalamina (B12): vitaminas hidrossolúveis que atuam como coenzimas do metabolismo energético (descarboxilação de piruvato e α-cetoglutarato, cadeia respiratória, transaminação e síntese de neurotransmissores).",
    "Repõe estoques depletados e restabelece vias metabólicas dependentes dessas coenzimas; na deficiência de B1, restaura o metabolismo oxidativo da glicose no neurônio e no miocárdio. Não é analgésico nem anti-inflamatório: o benefício ocorre quando há deficiência real (desnutrição, etilismo, nutrição parenteral, má-absorção).",
    fk="Hidrossolúveis: absorção rápida por via IM/EV, distribuição tecidual ampla, excesso eliminado na urina (colúria amarela é esperada). B12 e B6 têm armazenamento hepático maior.",
    fisio="A deficiência de B1 causa beribéri e encefalopatia de Wernicke; a de B6, neuropatia e convulsões; a de B3, pelagra; a de B12, anemia megaloblástica e neuropatia. Em risco nutricional, a reposição precede a oferta de glicose para evitar precipitar Wernicke.",
    pa="Dose de ataque de tiamina na suspeita de Wernicke é muito maior que a dos complexos comerciais; doses altas e prolongadas de B6 podem causar neuropatia sensitiva. Reações anafiláticas raras com tiamina EV.", r=_R, en="B-complex vitamins")

FICHA["modulo_tcm"] = F(
    "Triglicerídeos de cadeia média (C8–C10) são hidrolisados rapidamente pela lipase gástrica/pancreática (mesmo com pouca bile ou lipase) e os ácidos graxos médios seguem direto pela veia porta ao fígado, sem depender de quilomícrons nem da linfa, entrando na mitocôndria sem carnitina-palmitoiltransferase.",
    "Fonte calórica de absorção facilitada (≈ 8,3 kcal/g) em má-absorção de gorduras, colestase, quilotórax, síndrome do intestino curto, fibrose cística e prematuridade; aumenta a densidade energética da dieta sem sobrecarga de volume.",
    fk="Hidrólise e absorção rápidas, oxidação hepática quase imediata; não se acumula em tecido adiposo.",
    fisio="Na colestase e na insuficiência pancreática, a digestão de triglicerídeos de cadeia longa é prejudicada (esteatorreia e perda calórica); o TCM contorna essa etapa. Não fornece ácidos graxos essenciais (linoleico e α-linolênico), que precisam ser repostos.",
    pa="Introduzir gradualmente (diarreia, distensão, cólica); não fornece ácidos graxos essenciais; cautela em cetoacidose e hepatopatia grave (produção de cetonas).", r=["LEX", "BNFC", "ANV"], en="medium-chain triglycerides")

FICHA["deltrametrina"] = F(
    "Piretroide sintético que prolonga a abertura dos canais de sódio dependentes de voltagem nos axônios do parasita, mantendo a despolarização da membrana nervosa.",
    "No piolho (Pediculus humanus capitis) causa hiperexcitação, paralisia e morte; o parasita tem metabolismo mais lento que o hospedeiro e a absorção cutânea humana é baixa, o que explica a seletividade. Ação pediculicida e, em parte, ovicida; por isso a aplicação é repetida em 7 dias para eliminar ninfas eclodidas.",
    fk="Absorção cutânea mínima; fração absorvida é metabolizada por esterases/oxidases hepáticas e excretada na urina.",
    fisio="O ciclo do piolho dura ~7–10 dias da lêndea à ninfa; sem repetir a aplicação, as lêndeas sobreviventes reinfestam.",
    pa="Evitar olhos e mucosas; irritação do couro cabeludo e prurido são comuns; resistência a piretroides (mutação kdr) é crescente.", r=["ANV", "BNF"], en="deltamethrin")

FICHA["contraste_nao_ionico"] = F(
    "Compostos iodados tri-iodados hidrossolúveis de baixa osmolaridade, sem carga elétrica em solução (iopamidol, iohexol, iobitridol). O iodo (Z elevado) atenua fortemente os raios X.",
    "Aumenta a atenuação do feixe de raios X nos vasos e tecidos perfundidos (angiografia e TC) e opacifica vias urinárias; sua baixa osmolaridade reduz dor, vasodilatação e reações quimiotóxicas em relação aos iônicos de alta osmolaridade.",
    fk="Distribuição no espaço extracelular, sem ligação a proteínas nem metabolismo; meia-vida ≈ 2 h; excreção renal por filtração glomerular (> 90% em 24 h).",
    fisio="A nefropatia induzida por contraste (vasoconstrição medular, toxicidade tubular) depende de volume, osmolaridade, hidratação e função renal prévia.",
    pa="Risco de nefropatia por contraste (hidratar; avaliar TFG), reações alérgicas/anafilactoides, hipotireoidismo transitório em neonatos e lactentes, interação com metformina (suspensão conforme TFG), extravasamento. Dose individualizada pelo radiologista.", r=["LEX", "BNFC", "ANV"], en="non-ionic iodinated contrast")

FICHA["contraste_meglumina"] = F(
    "Sais de meglumina/sódio de ácidos tri-iodados (diatrizoato, iotalamato) de alta osmolaridade, que se dissociam em solução (iônicos).",
    "Opacificam estruturas por atenuação de raios X pelo iodo; a alta osmolaridade provoca deslocamento de líquido para o intravascular, vasodilatação, dor e maior risco de reações em relação aos não iônicos, motivo de uso restrito (exames específicos e uso oral/retal).",
    fk="Distribuição extracelular, sem metabolismo; eliminação renal por filtração, meia-vida ≈ 1–2 h.",
    fisio="A hiperosmolaridade lesa o endotélio e eritrócitos, favorecendo reações e nefropatia.",
    pa="Maior risco de reações adversas e de nefrotoxicidade que os não iônicos; evitar via intratecal; alergia a iodo/contraste prévia exige premedicação conforme protocolo; hidratação.", r=["LEX", "ANV"], en="ionic iodinated contrast (meglumine)")

FICHA["cefotaxima"] = F(
    "Cefalosporina de 3ª geração: liga-se às proteínas ligadoras de penicilina (PBP) bacterianas e inibe a transpeptidação do peptidoglicano da parede celular, levando à lise (bactericida, tempo-dependente).",
    "Ampla ação contra Gram-negativos (Enterobacterales, H. influenzae, Neisseria) e estreptococos/pneumococo, estável a muitas β-lactamases; não cobre Pseudomonas, Enterococcus nem Bacteroides. Boa penetração no líquor, base para meningite neonatal e pediátrica. Alternativa à ceftriaxona no neonato (não compete com a bilirrubina).",
    fk="Meia-vida ≈ 1 h (maior no neonato); distribuição ampla, inclusive LCR inflamado; metabolizada em desacetilcefotaxima ativa; eliminação renal, com ajuste na insuficiência renal.",
    fisio="Meningite bacteriana neonatal e pediátrica exige concentrações liquóricas bactericidas, daí doses altas e fracionadas a cada 6–8 h.",
    pa="Alergia a β-lactâmicos; ajustar pelo ClCr; colite por C. difficile; infusão rápida EV central pode causar arritmia; sobrecarga de sódio (≈ 2,2 mEq/g).", r=_R, en="cefotaxime")

FICHA["ceftazidima"] = F(
    "Cefalosporina de 3ª geração com atividade anti-Pseudomonas: inibe as PBPs e a síntese do peptidoglicano (bactericida, tempo-dependente).",
    "Cobre Pseudomonas aeruginosa e Enterobacterales; pouca ação em Gram-positivos (Staphylococcus, Streptococcus) e nula em anaeróbios e Enterococcus. Indicada em infecção hospitalar, neutropenia febril, fibrose cística e meningite por Gram-negativos; boa penetração liquórica.",
    fk="Meia-vida ≈ 1,5–2 h (maior em neonatos e na insuficiência renal); excreção renal quase inalterada; infusão prolongada otimiza o tempo acima da CIM.",
    fisio="A atividade depende do tempo em que a concentração livre excede a CIM, justificando intervalos curtos ou infusão estendida.",
    pa="Alergia a β-lactâmicos; ajustar pelo ClCr (neurotoxicidade/encefalopatia em acúmulo); resistência por AmpC e ESBL.", r=_R, en="ceftazidime")

FICHA["cefuroxima"] = F(
    "Cefalosporina de 2ª geração: liga-se às PBPs e bloqueia a transpeptidação do peptidoglicano da parede bacteriana (bactericida, tempo-dependente).",
    "Espectro intermediário: melhor ação em H. influenzae, M. catarrhalis, Enterobacterales sensíveis e cocos Gram-positivos (S. aureus meticilino-sensível, pneumococo) que as de 1ª geração; sem ação em Pseudomonas, Enterococcus e MRSA. Usada em pneumonia, otite, sinusite, infecção de pele e profilaxia cirúrgica.",
    fk="EV: meia-vida ≈ 1–1,5 h; eliminação renal inalterada; a oral (axetil) é pró-fármaco hidrolisado na mucosa intestinal, com absorção aumentada pelos alimentos.",
    fisio="Eficaz enquanto a concentração livre se mantém acima da CIM; intervalos de 6–8 h na via EV.",
    pa="Alergia a β-lactâmicos; ajustar pelo ClCr; diarreia e colite por C. difficile; fraca penetração liquórica (não usar em meningite).", r=_R, en="cefuroxime")

FICHA["nitrofurantoina"] = F(
    "Pró-fármaco reduzido por flavoproteínas bacterianas a intermediários reativos que lesam o DNA, o RNA, ribossomos e proteínas do metabolismo (ação múltipla; bacteriostática em baixas concentrações e bactericida em concentrações urinárias altas).",
    "Atinge concentração terapêutica apenas na urina; por isso trata cistite não complicada por E. coli e outras bactérias sensíveis e é usada em profilaxia de ITU recorrente, sem ação em pielonefrite, prostatite ou bacteremia. Não cobre Proteus, Pseudomonas e Serratia.",
    fk="Absorção oral rápida e ampliada com alimentos; níveis séricos baixos; meia-vida ≈ 20 min; eliminação renal (colúria marrom esperada), perde eficácia com TFG < 30 mL/min.",
    fisio="A resistência é rara porque os alvos são múltiplos; o pH ácido da urina favorece a atividade.",
    pa="Contraindicada < 1 mês (hemólise por imaturidade enzimática) e com ClCr < 30; neuropatia periférica e fibrose/pneumonite pulmonar em uso prolongado; hemólise na deficiência de G6PD; tomar com alimentos.", r=_R, en="nitrofurantoin")

FICHA["levofloxacino"] = F(
    "Fluoroquinolona respiratória: inibe a DNA-girase (topoisomerase II) e a topoisomerase IV bacterianas, impedindo o superenrolamento e a separação do DNA e causando fragmentação cromossômica (bactericida, concentração-dependente).",
    "Espectro amplo: Gram-negativos (inclusive Pseudomonas), pneumococo, atípicos (Legionella, Mycoplasma, Chlamydia) e micobactérias (reserva em TB multirresistente). Excelente biodisponibilidade oral (≈ 99%, EV = VO). Em crianças, reservada para infecções sem alternativa pelo risco de artropatia.",
    fk="Biodisponibilidade ≈ 99%; Vd ≈ 1,1 L/kg, boa penetração pulmonar e tecidual; meia-vida ≈ 6–8 h; eliminação renal inalterada, exigindo ajuste conforme ClCr; quelação por cátions (antiácidos, ferro, zinco).",
    fisio="Eficácia correlaciona-se com AUC/CIM e Cmax/CIM, o que justifica dose única diária em adultos.",
    pa="Tendinite/ruptura de tendão (↑ em idosos e com corticoide), prolongamento do QT, hipo/hiperglicemia, neuropatia, delirium, fotossensibilidade; separar de cátions por 2 h; resistência rápida em monoterapia.", r=_R, en="levofloxacin")

FICHA["imipenem_cilastatin"] = F(
    "Carbapenêmico de amplo espectro: liga-se às PBPs (sobretudo PBP2) e inibe a síntese da parede celular (bactericida). A cilastatina inibe a desidropeptidase-I do túbulo renal, evitando a degradação do imipenem e sua nefrotoxicidade.",
    "Cobre Gram-positivos (inclusive Enterococcus faecalis), Gram-negativos (Pseudomonas, Enterobacterales produtoras de ESBL/AmpC) e anaeróbios, com estabilidade à maioria das β-lactamases; não cobre MRSA, Enterococcus faecium nem muitas carbapenemase-produtoras. Reservado a infecções graves e hospitalares.",
    fk="Meia-vida ≈ 1 h; eliminação renal (sem cilastatina, é degradado no rim); ajuste obrigatório na insuficiência renal.",
    fisio="Atividade tempo-dependente: intervalos de 6–8 h mantêm a concentração acima da CIM.",
    pa="Reduz o limiar convulsivo (maior risco em lesão de SNC e insuficiência renal; evitar em meningite); alergia a β-lactâmicos (reação cruzada baixa); interação com valproato (queda do nível, evitar associação).", r=_R, en="imipenem and cilastatin")

FICHA["voriconazol"] = F(
    "Triazol que inibe a lanosterol 14-α-desmetilase (CYP51) fúngica, bloqueando a conversão do lanosterol em ergosterol e provocando acúmulo de esteróis tóxicos na membrana (fungistático para Candida, fungicida para Aspergillus).",
    "Tratamento de escolha da aspergilose invasiva; ativo contra Candida (inclusive C. krusei e parte das fluconazol-resistentes), Fusarium e Scedosporium. Sem ação em Mucorales. Boa penetração no SNC.",
    fk="Biodisponibilidade oral ≈ 90%; metabolismo hepático dependente de CYP2C19 (polimorfismo gera grande variabilidade), CYP2C9 e 3A4, com cinética não linear; inibe fortemente CYP3A4/2C19/2C9 (muitas interações); monitorar nível sérico (vale 1–5,5 mg/L).",
    fisio="Crianças metabolizam mais rápido (necessitam doses por kg maiores) e há variabilidade genética, daí a monitorização de nível.",
    pa="Hepatotoxicidade, distúrbios visuais, alucinações, fototoxicidade/câncer de pele em uso prolongado, prolongamento do QT; veículo EV (ciclodextrina) acumula na insuficiência renal; interações (tacrolimo, ciclosporina, estatinas, anticoagulantes).", r=_R, en="voriconazole")

FICHA["ganciclovir"] = F(
    "Análogo nucleosídico da guanina: fosforilado pela quinase viral UL97 (e depois por quinases celulares) a ganciclovir-trifosfato, que inibe competitivamente a DNA-polimerase do CMV e é incorporado ao DNA viral, interrompendo seu alongamento.",
    "Atividade seletiva contra citomegalovírus (e herpesvírus), pois a primeira fosforilação ocorre sobretudo em células infectadas. Usado na doença por CMV (retinite, colite, pneumonite, CMV congênito sintomático) e na profilaxia em transplantados.",
    fk="Baixa biodisponibilidade oral (valganciclovir é o pró-fármaco oral); meia-vida ≈ 2–4 h; eliminação renal inalterada, ajuste obrigatório pelo ClCr; infusão em 1 h.",
    fisio="O DNA do CMV é replicado de forma contínua nas células infectadas; a supressão exige exposição sustentada e a resistência surge por mutações UL97/UL54.",
    pa="Mielossupressão (neutropenia, plaquetopenia, anemia): hemograma 2–3×/semana; teratogênico e carcinogênico em animais (manipulação com cuidado); nefrotoxicidade aditiva; pH alcalino (extravasamento irrita).", r=_R, en="ganciclovir")

FICHA["aztreonam"] = F(
    "Monobactâmico: liga-se de forma seletiva à PBP3 de bacilos Gram-negativos aeróbios, inibindo a septação e a síntese de peptidoglicano (bactericida), sem anel β-lactâmico fusionado.",
    "Ação apenas em Gram-negativos aeróbios (Enterobacterales e Pseudomonas), sem cobrir Gram-positivos nem anaeróbios; estável a muitas β-lactamases (não a ESBL e carbapenemases). Alternativa em alergia grave a penicilinas, pois quase não há reação cruzada (exceto com ceftazidima, que compartilha cadeia lateral).",
    fk="Meia-vida ≈ 1,7 h; distribuição ampla; excreção renal inalterada, com ajuste na insuficiência renal; IM e EV.",
    fisio="Atividade tempo-dependente; costuma ser associado a agente anti-Gram-positivo/anaeróbio quando o foco é polimicrobiano.",
    pa="Ajustar pelo ClCr; colite por C. difficile; elevação transitória de transaminases; flebite local.", r=_R, en="aztreonam")

FICHA["diclofenaco"] = F(
    "AINE derivado do ácido fenilacético que inibe as ciclo-oxigenases COX-1 e COX-2 (preferência relativa por COX-2), reduzindo a síntese de prostaglandinas e tromboxano A2.",
    "Efeito analgésico, anti-inflamatório e antipirético potente: a queda de PGE2 reduz a sensibilização de nociceptores, a vasodilatação e a febre. O bloqueio de PG renais e gástricas explica os principais efeitos adversos (retenção de sódio, ↓ TFG, gastropatia) e o do tromboxano, a ação antiplaquetária reversível.",
    fk="Absorção oral rápida, com metabolismo de 1ª passagem (biodisponibilidade ≈ 50–60%); liga-se > 99% à albumina; meia-vida plasmática ≈ 2 h, mas boa penetração sinovial; metabolismo hepático (CYP2C9) e excreção renal/biliar.",
    fisio="Prostaglandinas medeiam a dor e a inflamação, mas também protegem a mucosa gástrica e mantêm o fluxo renal em hipovolemia; por isso o AINE é perigoso em desidratação.",
    pa="Não usar < 6 meses; úlcera/sangramento GI, lesão renal aguda (desidratação, IECA/diurético: 'tripla maldita'), risco cardiovascular, hepatotoxicidade, asma sensível a AINE; menor dose pelo menor tempo.", r=_R, en="diclofenac")

FICHA["adenosina"] = F(
    "Nucleosídeo endógeno que ativa receptores A1 no nó AV e no nó sinusal, abrindo canais de potássio (IKAdo) e hiperpolarizando as células, o que reduz o cálcio intracelular e bloqueia transitoriamente a condução AV.",
    "Interrompe taquicardias supraventriculares por reentrada que dependem do nó AV (TSV paroxística, WPW ortodrômico) e, ao desacelerar a resposta ventricular, ajuda no diagnóstico de flutter/fibrilação atrial. Efeito imediato e muito curto, sem ação em taquicardia ventricular.",
    fk="Meia-vida < 10 s (captada por eritrócitos e endotélio e metabolizada por adenosina-desaminase); precisa de bolo rápido seguido de flush em acesso venoso próximo ao coração.",
    fisio="Reentrada nodal é interrompida quando o nó AV, parte obrigatória do circuito, fica transitoriamente inexcitável.",
    pa="Sensação de morte iminente, rubor, dispneia, broncoespasmo (evitar em asma grave), assistolia/bradicardia breves; dose menor em transplantados cardíacos e com dipiridamol/carbamazepina; antagonizada por cafeína/teofilina; ter ressuscitação à mão.", r=["PALS", "AHA", "LEX"], en="adenosine")

FICHA["amiodarona"] = F(
    "Antiarrítmico classe III (bloqueio de canais de potássio IKr), com ações adicionais classes I (bloqueio de Na⁺), II (antiadrenérgico não competitivo) e IV (Ca²⁺), prolongando o potencial de ação e o período refratário em todo o miocárdio.",
    "Suprime arritmias ventriculares e supraventriculares (FV/TV refratária, fibrilação atrial para controle de ritmo, TV com pulso); ao ↑ o período refratário, interrompe circuitos de reentrada, e o bloqueio do nó AV ajuda no controle de frequência.",
    fk="Lipofílica (Vd muito grande), meia-vida de eliminação de semanas a meses (acúmulo em gordura, fígado e pulmão); metabolismo hepático (CYP3A4/2C8) a desetilamiodarona ativa; efeito EV inicia em minutos e o efeito oral completo demora semanas.",
    fisio="Torsades é raro apesar do QT longo; o iodo da molécula (≈ 37% em peso) explica a disfunção tireoidiana.",
    pa="Hipotensão e bradicardia (infusão EV: diluir e infundir lentamente; usar por via central), prolongamento do QT, disfunção tireoidiana (hipo/hiper), toxicidade pulmonar e hepática, depósitos corneanos; interações (varfarina, digoxina, estatinas, outros antiarrítmicos).", r=["PALS", "AHA", "LEX"], en="amiodarone")
