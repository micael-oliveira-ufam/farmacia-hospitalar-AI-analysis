from dsl import B, NR, IDO, DESC, F
from x01 import M
P = {}
_R = ["LEX", "BNFC", "BNF", "ANV"]
_TROP = "Tropicais e infecciosas"
_CR = "Cardiometabólicos e crônicos"

P["cloroquina"] = dict(
    meta=M("Cloroquina (fosfato)", "Antimalárico (4-aminoquinolina)", ["VO"], ["Comprimido 150 mg (base)"], _TROP),
    neo=B(7.5, 10, 10, "mg/kg", (24,), None, "Malária por P. vivax (3 dias): dia 1: 10 mg/kg; dias 2 e 3: 7,5 mg/kg (base); total 25 mg/kg.", cap=600),
    lac=B(7.5, 10, 10, "mg/kg", (24,), None, "Malária por P. vivax (3 dias): dia 1: 10 mg/kg; dias 2 e 3: 7,5 mg/kg (base); total 25 mg/kg.", cap=600),
    cri=B(7.5, 10, 10, "mg/kg", (24,), None, "Malária por P. vivax (3 dias): dia 1: 10 mg/kg; dias 2 e 3: 7,5 mg/kg (máx. 600 mg no 1º dia; 450 mg nos demais).", cap=600),
    adl=B(7.5, 10, 10, "mg/kg", (24,), None, "Dia 1: 10 mg/kg; dias 2 e 3: 7,5 mg/kg (máx. 600 mg no 1º dia; 450 mg nos demais).", cap=600),
    adu=B(450, 600, 600, "mg", (24,), None, "Dia 1: 600 mg; dias 2 e 3: 450 mg (base) em dose única diária."),
    ido=IDO(1, "Avaliar QT e função renal/hepática."),
    ficha=F("Concentra-se no vacúolo digestivo ácido do Plasmodium e impede a polimerização do heme tóxico (liberado da hemoglobina) em hemozoína; o heme livre lesa as membranas do parasita.",
            "Esquizonticida sanguíneo rápido: elimina as formas assexuadas eritrocitárias de P. vivax, P. malariae, P. ovale e P. falciparum sensível, aliviando febre e parasitemia; não atua nos hipnozoítos hepáticos (necessita primaquina para cura radical).",
            fk="Absorção oral rápida, Vd muito grande (> 100 L/kg), meia-vida de 1–2 meses; eliminação renal e biliar lenta; atravessa a placenta e é segura na gestação.",
            fisio="A resistência em P. falciparum (PfCRT) limita o uso a espécies sensíveis; no Brasil, P. vivax continua sensível e é tratado com cloroquina + primaquina.",
            pa="Náuseas, prurido (frequente em pessoas negras), prolongamento do QT, retinopatia em uso crônico, hemólise em G6PD (rara); superdose é grave (cardiotoxicidade), mantê-la fora do alcance de crianças.", r=["MSIST", "LEX", "WHOC"], en="chloroquine"))

P["primaquina"] = dict(
    meta=M("Primaquina", "Antimalárico (8-aminoquinolina)", ["VO"], ["Comprimido 5 mg", "Comprimido 15 mg"], _TROP),
    neo=NR("Contraindicada em < 6 meses."),
    lac=B(0.25, 0.5, 0.5, "mg/kg", (24,), None, "≥ 6 meses: 0,5 mg/kg/dia por 7 dias (ou 0,25 mg/kg/dia por 14 dias); contraindicada em < 6 meses e na deficiência de G6PD.", cap=30),
    cri=B(0.25, 0.5, 0.5, "mg/kg", (24,), None, "0,5 mg/kg/dia por 7 dias (ou 0,25 mg/kg/dia por 14 dias); testar G6PD antes.", cap=30),
    adl=B(0.25, 0.5, 0.5, "mg/kg", (24,), None, "0,5 mg/kg/dia por 7 dias (ou 0,25 mg/kg/dia por 14 dias); máx. 30 mg/dia.", cap=30),
    adu=B(0.25, 0.5, 0.5, "mg/kg", (24,), None, "0,5 mg/kg/dia por 7 dias (ou 0,25 mg/kg/dia por 14 dias); máx. 30 mg/dia; contraindicada na gestação, amamentação < 6 meses e G6PD deficiente.", cap=30),
    ido=IDO(1, "Mesma dose; atenção à hemólise e meta-hemoglobinemia."),
    ficha=F("Pró-fármaco metabolizado (CYP2D6) em quinonas que geram espécies reativas de oxigênio e interferem no transporte de elétrons mitocondrial do parasita.",
            "Único antimalárico que elimina os hipnozoítos hepáticos de P. vivax/ovale (cura radical, prevenindo recaídas) e tem ação gametocitocida sobre P. falciparum (bloqueio de transmissão).",
            fk="Absorção oral boa, meia-vida curta (≈ 6 h), metabolismo extenso em carboxiprimaquina; eficácia depende de CYP2D6.",
            fisio="Os hipnozoítos permanecem dormentes no fígado semanas a meses e causam recaídas; a cura radical exige o esquema completo de 7 ou 14 dias.",
            pa="Hemólise aguda e meta-hemoglobinemia em deficiência de G6PD (testar antes; esquema semanal em G6PD intermediária), dor abdominal; contraindicada na gestação e < 6 meses; tomar com alimentos.", r=["MSIST", "WHOC", "LEX"], en="primaquine"))

P["artemeter_lumefantrina"] = dict(
    meta=M("Artemeter + Lumefantrina", "Antimalárico (derivado de artemisinina combinado)", ["VO"], ["Comprimido 20 + 120 mg"], _TROP),
    lac=B(20, 20, 20, "mg", None, None, "Dose em mg de arteméter (cp 20/120 mg): 5–14 kg: 1 cp por dose, às 0, 8, 24, 36, 48 e 60 h (6 doses); tomar com alimento gordo; < 5 kg: não estabelecido."),
    cri=B(20, 40, 60, "mg", None, None, "Dose em mg de arteméter (cp 20/120 mg): 5–14 kg 1 cp; 15–24 kg 2 cp; 25–34 kg 3 cp por dose, às 0, 8, 24, 36, 48 e 60 h (6 doses)."),
    adl=B(60, 80, 80, "mg", None, None, "Dose em mg de arteméter (cp 20/120 mg): 25–34 kg 3 cp; ≥ 35 kg 4 cp por dose, às 0, 8, 24, 36, 48 e 60 h (6 doses)."),
    adu=B(80, 80, 80, "mg", None, None, "4 comprimidos (80/480 mg) por dose, às 0, 8, 24, 36, 48 e 60 h (6 doses), com alimento gordo."),
    ido=IDO(1, "Avaliar QT e interações (CYP3A4)."),
    ficha=F("Arteméter: seu endoperóxido é ativado pelo ferro do heme, gerando radicais livres que alquilam proteínas do parasita; lumefantrina: forma complexos com o heme e inibe a formação de hemozoína, prolongando a ação.",
            "Combinação de ação rápida (arteméter, reduz 95% da parasitemia em 48 h) e ação prolongada (lumefantrina), esquizonticida contra todas as espécies, incluindo P. falciparum resistente à cloroquina; reduz gametócitos.",
            fk="Lumefantrina lipofílica: absorção multiplicada por até 16× com alimento gordo, meia-vida de 3–6 dias; arteméter: meia-vida de 2 h (di-hidroartemisinina ativa); metabolismo por CYP3A4.",
            fisio="Esquema de 3 dias com 6 doses garante cobertura de ≥ 2 ciclos assexuados; a combinação reduz seleção de resistência.",
            pa="Cefaleia, tontura, QT longo (cautela com outros QT-prolongadores), interações com indutores/inibidores de CYP3A4; 1º trimestre da gestação: uso restrito; vomitar até 30 min: repetir dose.", r=["MSIST", "WHOC", "LEX"], en="artemether and lumefantrine"))

P["rifampicina"] = dict(
    meta=M("Rifampicina", "Antituberculoso (rifamicina)", ["VO"], ["Cápsula 300 mg", "Suspensão 20 mg/mL"], _TROP),
    neo=B(10, 10, 15, "mg/kg", (24,), 15, "Neonato (TB/profilaxia, sob especialista): 10–15 mg/kg/dia em jejum."),
    lac=B(10, 15, 20, "mg/kg", (24,), 20, "TB: 10–20 mg/kg/dia (máx. 600 mg), em jejum.", cap=600),
    cri=B(10, 15, 20, "mg/kg", (24,), 20, "TB: 10–20 mg/kg/dia (máx. 600 mg), em jejum.", cap=600),
    adl=B(10, 10, 20, "mg/kg", (24,), 20, "TB: 10 mg/kg/dia (máx. 600 mg), em jejum.", cap=600),
    adu=B(450, 600, 600, "mg", (24,), 600, "450 mg (< 50 kg) ou 600 mg (≥ 50 kg) 1×/dia, em jejum."),
    ido=IDO(1, "Hepatotoxicidade e interações (indutor de CYP/P-gp); urina alaranjada é esperada."),
    ficha=F("Inibe a RNA-polimerase DNA-dependente bacteriana (subunidade β), impedindo o início da transcrição do RNA mensageiro (bactericida).",
            "Poderoso esterilizante: ativo contra M. tuberculosis em replicação lenta, M. leprae, estafilococos e meningococo (profilaxia). Base de todos os esquemas de TB; nunca usada isoladamente (resistência rápida).",
            fk="Absorção oral boa (reduzida por alimentos), meia-vida ≈ 2–5 h (autoindução); metabolismo hepático com excreção biliar; indutor potente de CYP3A4/2C9/2C19 e P-gp.",
            fisio="Em TB, a exposição prolongada (6 meses) é necessária para eliminar bacilos persistentes.",
            pa="Hepatotoxicidade, secreções alaranjadas (urina, lágrimas), interação com muitos fármacos (ARV, anticoncepcionais, varfarina, tacrolimo), trombocitopenia e síndrome pseudogripal na terapia intermitente.", r=["MSIST", "WHOC", "LEX", "BNF"], en="rifampicin"))

P["isoniazida"] = dict(
    meta=M("Isoniazida", "Antituberculoso", ["VO"], ["Comprimido 100 mg", "Comprimido 300 mg"], _TROP),
    lac=B(7, 10, 15, "mg/kg", (24,), 15, "TB: 10 mg/kg/dia (7–15; máx. 300 mg); associar piridoxina em lactentes, desnutridos e HIV.", cap=300),
    cri=B(7, 10, 15, "mg/kg", (24,), 15, "TB: 10 mg/kg/dia (7–15; máx. 300 mg); piridoxina em desnutridos/HIV.", cap=300),
    adl=B(5, 5, 10, "mg/kg", (24,), 10, "TB: 5 mg/kg/dia (máx. 300 mg); piridoxina em risco de neuropatia.", cap=300),
    adu=B(150, 300, 300, "mg", (24,), 300, "300 mg 1×/dia (5 mg/kg); associar piridoxina 25–50 mg/dia nos de risco."),
    ido=IDO(1, "Hepatotoxicidade aumenta com a idade; acompanhar transaminases; piridoxina."),
    ficha=F("Pró-fármaco ativado pela catalase-peroxidase KatG de M. tuberculosis, formando radicais que se ligam ao NAD⁺ e inibem a InhA, bloqueando a síntese de ácidos micólicos da parede celular.",
            "Bactericida potente contra bacilos em multiplicação ativa; componente da fase de ataque e manutenção e agente da quimioprofilaxia da infecção latente.",
            fk="Absorção oral rápida (↓ com alimentos); meia-vida ≈ 1–4 h (acetiladores rápidos vs lentos por NAT2); metabolismo hepático e excreção renal.",
            fisio="Acetiladores lentos têm níveis mais altos e mais neuropatia/hepatotoxicidade; a resistência por mutação katG/inhA é a mais frequente.",
            pa="Hepatite medicamentosa (risco ↑ > 35 anos, etilismo), neuropatia periférica (piridoxina), neurite óptica rara, interação com fenitoína e carbamazepina.", r=["MSIST", "WHOC", "LEX"], en="isoniazid"))

P["pirazinamida"] = dict(
    meta=M("Pirazinamida", "Antituberculoso", ["VO"], ["Comprimido 500 mg", "Suspensão 30 mg/mL"], _TROP),
    lac=B(30, 35, 40, "mg/kg", (24,), 40, "TB (2 primeiros meses): 30–40 mg/kg/dia (máx. 1.500 mg).", cap=1500),
    cri=B(30, 35, 40, "mg/kg", (24,), 40, "TB (2 primeiros meses): 30–40 mg/kg/dia (máx. 1.500 mg).", cap=1500),
    adl=B(30, 35, 40, "mg/kg", (24,), 40, "TB (2 primeiros meses): 30–40 mg/kg/dia (máx. 2.000 mg).", cap=2000),
    adu=B(1000, 1500, 2000, "mg", (24,), 2000, "Por peso: 20–35 kg 1.000 mg; 36–50 kg 1.500 mg; > 50 kg 2.000 mg 1×/dia."),
    ido=IDO(1, "Hepatotoxicidade; hiperuricemia/gota."),
    ficha=F("Pró-fármaco convertido pela pirazinamidase micobacteriana em ácido pirazinoico, que acidifica o citoplasma e inibe a síntese de ácidos graxos (FAS-I) e o transporte de membrana em pH ácido.",
            "Esterilizante em meio ácido (focos inflamatórios e macrófagos): elimina bacilos persistentes e permite encurtar o tratamento da TB de 9 para 6 meses; sem ação em M. bovis.",
            fk="Absorção oral excelente; meia-vida ≈ 9–10 h; metabolismo hepático a ácido pirazinoico e excreção renal.",
            fisio="Apenas atua em pH ácido (≈ 5,5), o que explica sua utilidade nas lesões caseosas e a falta de ação na fase de manutenção.",
            pa="Hepatotoxicidade (a mais frequente entre os antituberculosos), hiperuricemia e artralgia, fotossensibilidade; ajuste na insuficiência renal.", r=["MSIST", "WHOC", "LEX"], en="pyrazinamide"))

P["etambutol"] = dict(
    meta=M("Etambutol", "Antituberculoso", ["VO"], ["Comprimido 400 mg"], _TROP),
    lac=B(15, 20, 25, "mg/kg", (24,), 25, "TB: 15–25 mg/kg/dia (máx. 1.200 mg); avaliar acuidade visual (difícil em < 5 anos).", cap=1200),
    cri=B(15, 20, 25, "mg/kg", (24,), 25, "TB: 15–25 mg/kg/dia (máx. 1.200 mg); avaliar acuidade visual.", cap=1200),
    adl=B(15, 20, 25, "mg/kg", (24,), 25, "TB: 15–25 mg/kg/dia (máx. 1.200 mg); avaliar acuidade visual.", cap=1200),
    adu=B(400, 800, 1200, "mg", (24,), 1200, "Por peso: 20–35 kg 400 mg; 36–50 kg 800 mg; > 50 kg 1.200 mg 1×/dia."),
    ido=IDO(1, "Ajustar pelo ClCr; atenção à neurite óptica."),
    ficha=F("Inibe a arabinosil-transferase (EmbA/B/C) de M. tuberculosis, impedindo a síntese do arabinogalactano da parede celular e aumentando sua permeabilidade (bacteriostático).",
            "Companheiro dos esquemas de TB: previne resistência aos outros fármacos e protege-os; sem atividade esterilizante relevante.",
            fk="Biodisponibilidade oral ≈ 80%; meia-vida ≈ 3–4 h; eliminação renal (50–80% inalterada), com ajuste na insuficiência renal.",
            fisio="A toxicidade óptica é dose e tempo-dependente (quelação de cobre), sendo mais comum com > 25 mg/kg e na insuficiência renal.",
            pa="Neurite óptica (acuidade, discriminação de cores), hiperuricemia, neuropatia periférica; contraindicada se não for possível monitorar a visão.", r=["MSIST", "WHOC", "LEX"], en="ethambutol"))

P["metformina"] = dict(
    meta=M("Metformina", "Antidiabético (biguanida)", ["VO"], ["Comprimido 500 mg", "Comprimido 850 mg"], _CR),
    lac=NR("Não indicada."), cri=NR("Não indicada em < 10 anos."),
    adl=B(500, 500, 1000, "mg", (12, 24), 2000, "≥ 10 anos: 500 mg 1–2×/dia com as refeições; aumentar semanalmente (máx. 2.000 mg/dia)."),
    adu=B(500, 850, 1000, "mg", (8, 12, 24), 2550, "500–850 mg 1–3×/dia com as refeições (máx. 2.550 mg/dia); ajustar pela TFG."),
    ido=IDO(0.75, "Ajustar pela TFG (evitar < 30; reduzir se < 45); suspender em contraste iodado e doença aguda."),
    ficha=F("Ativa a AMP-quinase hepática e inibe o complexo I mitocondrial, reduzindo a gliconeogênese hepática e aumentando a captação periférica de glicose (sensibilizador de insulina), sem causar hipoglicemia isolada.",
            "Reduz a glicemia de jejum e a HbA1c (1–1,5 pontos), com benefício cardiovascular no DM2 e efeito neutro/redutor sobre o peso; 1ª linha no DM2 e em jovens obesos.",
            fk="Biodisponibilidade ≈ 50–60%; meia-vida ≈ 6 h; sem metabolismo, eliminação renal inalterada (por secreção tubular), ajuste pela TFG.",
            fisio="A resistência à insulina hepática eleva a glicose basal; reduzir a gliconeogênese corrige esse componente.",
            pa="Intolerância GI (iniciar baixo, com refeição), acidose láctica rara (TFG < 30, insuficiência hepática/cardíaca, álcool, contraste), deficiência de vitamina B12.", r=["SBD", "LEX", "BNF"], en="metformin"))

P["enalapril"] = dict(
    meta=M("Enalapril", "Anti-hipertensivo (IECA)", ["VO"], ["Comprimido 5 mg", "Comprimido 10 mg", "Comprimido 20 mg"], _CR),
    neo=NR("Usar com muita cautela (oligúria, hipotensão); apenas sob especialista."),
    lac=B(0.08, 0.1, 0.5, "mg/kg/dia", (12, 24), 0.6, "Iniciar 0,08 mg/kg/dia ÷ 1–2 doses, aumentar até 0,5 mg/kg/dia (máx. 40 mg/dia); monitorar creatinina e K⁺.", capd=40),
    cri=B(0.08, 0.1, 0.5, "mg/kg/dia", (12, 24), 0.6, "Iniciar 0,08 mg/kg/dia ÷ 1–2 doses, aumentar até 0,5 mg/kg/dia (máx. 40 mg/dia).", capd=40),
    adl=B(0.08, 0.1, 0.5, "mg/kg/dia", (12, 24), 0.6, "Iniciar 0,08 mg/kg/dia ÷ 1–2 doses (máx. 40 mg/dia).", capd=40),
    adu=B(2.5, 10, 20, "mg", (12, 24), 40, "HAS: 5–20 mg 1–2×/dia (máx. 40 mg/dia); IC: iniciar 2,5 mg 12/12 h; ajustar pelo ClCr."),
    ido=IDO(0.5, "Iniciar 2,5 mg; ajustar pelo ClCr; hiperpotassemia e hipotensão."),
    ficha=F("O enalapril é pró-fármaco hidrolisado no fígado em enalaprilato, que inibe a enzima conversora de angiotensina (ECA), reduzindo angiotensina II e a degradação de bradicinina.",
            "Vasodilatação arterial e venosa, queda da aldosterona (menor retenção de sódio/água) e proteção cardíaca e renal (↓ remodelamento ventricular, ↓ proteinúria), reduzindo morbimortalidade na insuficiência cardíaca e na nefropatia diabética.",
            fk="Biodisponibilidade oral ≈ 60%; pico do enalaprilato em 3–4 h; meia-vida efetiva ≈ 11 h; eliminação renal.",
            fisio="A ativação do SRAA em hipertensão, IC e doença renal crônica eleva pós-carga e esclerose glomerular.",
            pa="Tosse seca (bradicinina), hiperpotassemia, ↑ creatinina (estenose de artéria renal bilateral), angioedema, hipotensão da 1ª dose; teratogênico (2º/3º trimestres).", r=_R, en="enalapril"))

P["metoprolol"] = dict(
    meta=M("Metoprolol (tartarato)", "Betabloqueador β1-seletivo", ["VO"], ["Comprimido 50 mg", "Comprimido 100 mg"], _CR),
    neo=NR("Não estabelecido."), lac=NR("Dados limitados."),
    cri=B(0.5, 1, 2, "mg/kg/dia", (12,), 6, "HAS: iniciar 1–2 mg/kg/dia ÷ 2 (máx. 6 mg/kg/dia; 200 mg/dia).", capd=200),
    adl=B(0.5, 1, 2, "mg/kg/dia", (12,), 6, "HAS: iniciar 1–2 mg/kg/dia ÷ 2 (máx. 6 mg/kg/dia; 200 mg/dia).", capd=200),
    adu=B(25, 50, 100, "mg", (12, 24), 400, "HAS/angina: 50–100 mg 1–2×/dia (máx. 400 mg/dia); IC (succinato): 12,5–25 mg/dia, titular até 200 mg; pós-IAM: ver protocolo."),
    ido=IDO(0.5, "Iniciar com doses menores; bradicardia e hipotensão."),
    ficha=F("Bloqueia de forma seletiva e competitiva os receptores β1-adrenérgicos cardíacos (ação em β2 em doses altas), reduzindo AMPc, Ca²⁺ intracelular e a resposta à noradrenalina.",
            "Reduz frequência cardíaca, contratilidade, condução AV e consumo de O₂ do miocárdio, baixando a pressão arterial, controlando arritmias supraventriculares e dor anginosa, e diminuindo mortalidade pós-infarto e na IC (succinato).",
            fk="Biodisponibilidade ≈ 50% (primeira passagem); meia-vida ≈ 3–7 h; metabolismo hepático por CYP2D6; excreção renal dos metabólitos.",
            fisio="A ativação simpática crônica no coração doente promove remodelamento e arritmias; o β-bloqueio é cardioprotetor.",
            pa="Bradicardia, bloqueio AV, hipotensão, broncoespasmo (menor que não seletivos), fadiga, mascaramento de hipoglicemia; não suspender abruptamente; interação com verapamil/diltiazem e fortes inibidores do CYP2D6.", r=["LEX", "BNF", "AHA"], en="metoprolol"))

P["sinvastatina"] = dict(
    meta=M("Sinvastatina", "Hipolipemiante (estatina)", ["VO"], ["Comprimido 10 mg", "Comprimido 20 mg", "Comprimido 40 mg"], _CR),
    neo=NR("Não indicada."), lac=NR("Não indicada."), cri=NR("Não indicada em < 10 anos."),
    adl=B(10, 10, 20, "mg", (24,), 40, "≥ 10 anos (hipercolesterolemia familiar): 10 mg à noite, titular até 40 mg/dia."),
    adu=B(10, 20, 40, "mg", (24,), 80, "10–40 mg/dia à noite (80 mg só em casos selecionados, risco de miopatia)."),
    ido=IDO(1, "Limitar a 20 mg com anlodipino/amiodarona; ajustar pelo ClCr; miopatia."),
    ficha=F("Inibe de forma competitiva a HMG-CoA redutase, enzima limitante da síntese hepática do colesterol, reduzindo o colesterol intracelular e aumentando os receptores de LDL.",
            "Reduz LDL-c em 30–50%, triglicerídeos e inflamação vascular, diminuindo eventos cardiovasculares na prevenção primária e secundária; efeito máximo à noite (maior síntese de colesterol noturna).",
            fk="Pró-fármaco lactona; primeira passagem hepática intensa (biodisponibilidade < 5%); metabolismo por CYP3A4; meia-vida curta; excreção biliar.",
            fisio="A redução do colesterol celular aumenta a captação de LDL e estabiliza placas ateroscleróticas.",
            pa="Miopatia/rabdomiólise (risco ↑ com genfibrozila, amiodarona, anlodipino, macrolídeos, suco de toranja), hepatotoxicidade, hiperglicemia leve; contraindicada na gestação.", r=["SBCFR", "LEX", "BNF"], en="simvastatin"))

P["varfarina"] = dict(
    meta=M("Varfarina", "Anticoagulante oral (antagonista da vitamina K)", ["VO"], ["Comprimido 2,5 mg", "Comprimido 5 mg"], _CR),
    neo=NR("Uso especializado (dose guiada por INR)."),
    lac=B(0.05, 0.1, 0.2, "mg/kg", (24,), None, "Dose inicial 0,1 mg/kg/dia (máx. 5 mg), ajustada ao INR alvo (2–3).", cap=10),
    cri=B(0.05, 0.1, 0.2, "mg/kg", (24,), None, "Dose inicial 0,1 mg/kg/dia (máx. 5 mg), ajustada ao INR alvo (2–3).", cap=10),
    adl=B(0.05, 0.1, 0.2, "mg/kg", (24,), None, "Dose inicial 0,1 mg/kg/dia (máx. 5 mg), ajustada ao INR alvo (2–3).", cap=10),
    adu=B(1, 5, 10, "mg", (24,), 10, "Iniciar 2,5–5 mg/dia e ajustar ao INR alvo (2–3; 2,5–3,5 em prótese mecânica mitral); manutenção habitual 2–10 mg/dia."),
    ido=IDO(0.5, "Iniciar 2,5 mg/dia; maior sensibilidade e risco de sangramento."),
    ficha=F("Inibe a vitamina K epóxido-redutase (VKORC1), reduzindo a vitamina K reduzida necessária para a γ-carboxilação dos fatores II, VII, IX e X e das proteínas C e S.",
            "Efeito anticoagulante após 2–3 dias (depleção dos fatores com meia-vida mais longa, em especial o II) e pico em 5–7 dias; o INR monitora a eficácia. Na fase inicial, há risco pró-trombótico transitório (queda da proteína C).",
            fk="Biodisponibilidade ≈ 100%; > 99% ligada à albumina; meia-vida ≈ 36–42 h; metabolismo hepático (CYP2C9, polimorfismos CYP2C9/VKORC1 alteram a dose).",
            fisio="Dieta rica em vitamina K, antibióticos, álcool, hepatopatia, tireoide e muitos fármacos alteram o INR; o antídoto é a vitamina K e, nos graves, concentrado de complexo protrombínico.",
            pa="Sangramento (maior risco com INR > 4, idosos, AINE/antiagregante), necrose cutânea, teratogenicidade (embriopatia), interação com inúmeros medicamentos; INR a cada 1–4 semanas.", r=["CHEST", "LEX", "BNF"], en="warfarin"))

P["clopidogrel"] = dict(
    meta=M("Clopidogrel", "Antiagregante plaquetário (inibidor P2Y12)", ["VO"], ["Comprimido 75 mg"], _CR),
    pre=B(0.2, 0.2, 0.2, "mg/kg", (24,), None, "Prevenção de trombose (off-label): 0,2 mg/kg/dia."),
    neo=B(0.2, 0.2, 0.2, "mg/kg", (24,), None, "Prevenção de trombose (off-label): 0,2 mg/kg/dia, sob especialista."),
    lac=B(0.2, 0.2, 1, "mg/kg", (24,), 1, "Prevenção de trombose (off-label): 0,2 mg/kg/dia; até 1 mg/kg/dia sob especialista.", cap=75),
    cri=B(0.2, 0.2, 1, "mg/kg", (24,), 1, "Off-label: 0,2 mg/kg/dia (máx. 75 mg).", cap=75),
    adl=B(0.2, 0.2, 1, "mg/kg", (24,), 1, "Off-label: 0,2 mg/kg/dia (máx. 75 mg).", cap=75),
    adu=B(75, 75, 600, "mg", (24,), None, "Manutenção 75 mg 1×/dia; ataque na SCA/ATC: 300–600 mg em dose única."),
    ido=IDO(1, "Sem ajuste; risco de sangramento."),
    ficha=F("Pró-fármaco ativado (CYP2C19, principalmente) em metabólito tiol que se liga de forma irreversível ao receptor P2Y12 de ADP da plaqueta, bloqueando sua ativação e a expressão do receptor GP IIb/IIIa.",
            "Inibe a agregação plaquetária induzida por ADP durante toda a vida da plaqueta (7–10 dias), reduzindo trombose arterial em SCA, após stent e AVC isquêmico; efeito pleno após 5–7 dias sem ataque.",
            fk="Absorção oral (≈ 50%), ativação hepática em dois passos; meia-vida do pró-fármaco ≈ 6 h; efeito persiste dias; polimorfismo CYP2C19 reduz o efeito em metabolizadores pobres.",
            fisio="O ADP amplifica a agregação plaquetária após a ativação inicial; bloquear P2Y12 interrompe esse ciclo.",
            pa="Sangramento, interação com omeprazol/esomeprazol (preferir pantoprazol), neutropenia/PTT rara; suspender 5–7 dias antes de cirurgia eletiva.", r=["LEX", "BNF", "AHA"], en="clopidogrel"))

P["gabapentina"] = dict(
    meta=M("Gabapentina", "Anticonvulsivante / Analgésico neuropático", ["VO"], ["Cápsula 300 mg", "Cápsula 400 mg"], "Neuropsiquiatria"),
    neo=NR("Não estabelecido."), lac=NR("Não estabelecido em < 3 anos."),
    cri=B(10, 25, 40, "mg/kg/dia", (8,), 50, "3–12 anos: iniciar 10–15 mg/kg/dia ÷ 3; manutenção 25–35 mg/kg/dia (até 40–50); ajustar pelo ClCr.", capd=3600),
    adl=B(300, 600, 1200, "mg", (8,), 3600, "300 mg no dia 1, 300 mg 2×/dia no dia 2, 300 mg 3×/dia no dia 3; manutenção 900–3.600 mg/dia ÷ 3."),
    adu=B(300, 600, 1200, "mg", (8,), 3600, "300 mg no dia 1, 300 mg 2×/dia no dia 2, 300 mg 3×/dia no dia 3; manutenção 900–3.600 mg/dia ÷ 3; ajustar pelo ClCr."),
    ido=IDO(0.5, "Ajustar pelo ClCr; sedação, tontura e quedas."),
    ficha=F("Liga-se à subunidade α2δ-1 dos canais de cálcio voltagem-dependentes pré-sinápticos, reduzindo a liberação de glutamato, noradrenalina e substância P; não atua em receptores GABA, apesar do nome.",
            "Reduz a hiperexcitabilidade neuronal: efeito anticonvulsivante (crises focais), analgésico em dor neuropática (neuralgia pós-herpética, neuropatia diabética) e ansiolítico/sedativo.",
            fk="Absorção por transportador saturável (biodisponibilidade cai com a dose: 60% a 300 mg, 33% a 3.600 mg); sem metabolismo; meia-vida ≈ 5–7 h; excreção renal inalterada.",
            fisio="Na dor neuropática, a sensibilização central aumenta a expressão de α2δ-1 nos neurônios sensoriais.",
            pa="Sonolência, tontura, ataxia, edema periférico, ganho de peso, depressão respiratória com opioides; abuso potencial; reduzir a dose na insuficiência renal; retirada gradual.", r=["LEX", "BNF", "BNFC"], en="gabapentin"))

P["sertralina"] = dict(
    meta=M("Sertralina", "Antidepressivo (ISRS)", ["VO"], ["Comprimido 50 mg"], "Neuropsiquiatria"),
    neo=NR("Não se aplica."), lac=NR("Não estabelecido."),
    cri=B(25, 50, 200, "mg", (24,), 200, "TOC ≥ 6 anos: iniciar 25 mg/dia (6–12 anos), titular a cada semana até 200 mg/dia; monitorar ideação suicida."),
    adl=B(25, 50, 200, "mg", (24,), 200, "TOC/depressão: iniciar 25–50 mg/dia, titular até 200 mg/dia; monitorar ideação suicida."),
    adu=B(25, 50, 200, "mg", (24,), 200, "50 mg/dia (TOC/depressão) até 200 mg/dia; TEPT/pânico: iniciar 25 mg."),
    ido=IDO(0.5, "Iniciar 25 mg; hiponatremia, quedas e sangramento."),
    ficha=F("Inibe seletivamente a recaptação de serotonina (SERT) na fenda sináptica, elevando a serotonina disponível; após semanas, a dessensibilização de autorreceptores 5-HT1A leva à adaptação do circuito.",
            "Efeito antidepressivo, ansiolítico e anti-TOC com início em 2–6 semanas; menos efeitos anticolinérgicos e cardiotóxicos que os tricíclicos.",
            fk="Absorção oral boa; meia-vida ≈ 26 h; metabolismo hepático (CYP2B6, 2C19) a desmetilsertralina menos ativa; inibidor moderado de CYP2D6 em doses altas.",
            fisio="A resposta clínica tardia reflete adaptações neuroplásticas e de receptores, não a elevação imediata da serotonina.",
            pa="Náuseas, diarreia, insônia, disfunção sexual, hiponatremia, sangramento (com AINE/anticoagulantes), síndrome serotoninérgica (com tramadol, linezolida), ideação suicida no início (< 25 anos); retirada gradual.", r=["LEX", "BNF", "BNFC"], en="sertraline"))

P["amitriptilina"] = dict(
    meta=M("Amitriptilina", "Antidepressivo tricíclico", ["VO"], ["Comprimido 25 mg"], "Neuropsiquiatria"),
    neo=NR("Não estabelecido."), lac=NR("Não estabelecido."),
    cri=B(10, 10, 25, "mg", (24,), 50, "≥ 6 anos (enurese/dor neuropática): 10–25 mg à noite; ECG; risco de ideação suicida.", capd=50),
    adl=B(10, 25, 50, "mg", (24,), 100, "Depressão (> 12 anos): 25–50 mg/dia; dor neuropática: 10–25 mg à noite."),
    adu=B(10, 25, 75, "mg", (24,), 150, "Dor neuropática: 10–25 mg à noite → até 75 mg; depressão: 25–75 mg/dia, máx. 150 mg/dia (ambulatorial)."),
    ido=IDO(0.4, "Evitar (Beers): anticolinérgico; se necessário 10 mg à noite."),
    ficha=F("Inibe a recaptação de noradrenalina e serotonina e bloqueia receptores muscarínicos, H1, α1-adrenérgicos e canais de sódio (ação em múltiplos alvos).",
            "Analgesia neuropática (modulação descendente da dor) em doses baixas, antidepressivo em doses maiores; os efeitos anti-H1/anticolinérgicos causam sedação e xerostomia, e o bloqueio de Na⁺ explica a cardiotoxicidade na superdose.",
            fk="Biodisponibilidade ≈ 45%; meia-vida ≈ 10–28 h; metabolismo hepático por CYP2C19/2D6 a nortriptilina ativa.",
            fisio="O efeito analgésico independe da ação antidepressiva e surge em dias com dose menor.",
            pa="Sedação, boca seca, retenção urinária, constipação, hipotensão ortostática, arritmia/QT longo (superdose potencialmente fatal), ganho de peso; cautela em idosos, glaucoma, cardiopatia.", r=["LEX", "BNF", "BNFC"], en="amitriptyline"))

P["cetirizina"] = dict(
    meta=M("Cetirizina", "Anti-histamínico (2ª geração)", ["VO"], ["Comprimido 10 mg", "Solução oral 1 mg/mL"], "Alergia e respiratório"),
    neo=NR("Não recomendada."),
    lac=B(2.5, 2.5, 2.5, "mg", (12, 24), 5, "6–11 meses: 2,5 mg 1×/dia; 12–23 meses: 2,5 mg até 2×/dia; < 6 meses: não recomendada."),
    cri=B(2.5, 5, 10, "mg", (12, 24), 10, "2–5 anos: 2,5 mg 1–2×/dia (máx. 5 mg/dia); 6–11 anos: 5–10 mg 1×/dia."),
    adl=B(5, 10, 10, "mg", (24,), 10, "10 mg 1×/dia."),
    adu=B(5, 10, 10, "mg", (24,), 10, "10 mg 1×/dia."),
    ido=IDO(0.5, "ClCr < 50: 5 mg/dia; sonolência."),
    ficha=F("Antagonista seletivo (agonista inverso) dos receptores H1 periféricos de histamina, com baixa penetração no SNC.",
            "Bloqueia a vasodilatação, o prurido, a rinorreia e o broncoespasmo leve mediados pela histamina em rinite alérgica e urticária, com início em ≈ 1 h e duração de 24 h; sedação menor que as de 1ª geração.",
            fk="Biodisponibilidade > 70%; meia-vida ≈ 8 h (adulto) (menor em crianças); eliminação renal em grande parte inalterada, pouca metabolização hepática.",
            fisio="A histamina liberada por mastócitos causa sintomas alérgicos agudos por H1; os anti-H1 impedem a ligação, mas não a liberação.",
            pa="Sonolência (dose-dependente), boca seca, cefaleia; reduzir a dose na insuficiência renal ou hepática.", r=["LEX", "BNF", "BNFC"], en="cetirizine"))

P["paracetamol_comp"] = dict(
    meta=M("Paracetamol comprimido", "Analgésico / Antipirético", ["VO"], ["Comprimido 500 mg", "Comprimido 750 mg"], "Analgésicos"),
    neo=NR("Usar gotas/solução oral (dose por peso)."), lac=NR("Usar gotas/solução oral (dose por peso)."), cri=NR("Usar gotas/solução oral (dose por peso)."),
    adl=B(500, 500, 1000, "mg", (4, 6, 8), 4000, "≥ 12 anos (> 40 kg): 500–1.000 mg a cada 4–6 h; máx. 4 g/dia (3 g se hepatopatia)."),
    adu=B(500, 750, 1000, "mg", (4, 6, 8), 4000, "500–1.000 mg a cada 4–6 h; máx. 4 g/dia (3 g na hepatopatia, etilismo ou desnutrição)."),
    ido=IDO(1, "Considerar máx. 3 g/dia."),
    ficha=F("Inibe a ciclo-oxigenase no sistema nervoso central (possivelmente COX-3/peroxidase), reduzindo a síntese de prostaglandinas centrais; também modula vias serotoninérgicas descendentes e canabinoides.",
            "Analgesia leve a moderada e antipirese (ação no centro termorregulador do hipotálamo), sem efeito anti-inflamatório relevante nem ação antiplaquetária/gastrolesiva significativa.",
            fk="Absorção oral rápida, biodisponibilidade 70–90%; meia-vida ≈ 2 h; metabolismo hepático (glicuronidação/sulfatação); ≈ 5% por CYP2E1 gera NAPQI, tóxico e inativado pela glutationa.",
            fisio="Na superdose, a glutationa se esgota e o NAPQI causa necrose hepática; o antídoto é a acetilcisteína, mais eficaz em até 8 h.",
            pa="Hepatotoxicidade na superdose (> 150 mg/kg ou 7,5–10 g), cuidado em hepatopatia, jejum e etilismo; evitar duplicidade com associações.", r=_R, en="paracetamol (acetaminophen)"))

P["mebendazol"] = dict(
    meta=M("Mebendazol", "Antiparasitário (benzimidazólico)", ["VO"], ["Comprimido 100 mg", "Suspensão 20 mg/mL"], _TROP),
    neo=NR("Não recomendado."), lac=NR("Não recomendado em < 1 ano; 1–2 anos sob orientação."),
    cri=B(100, 100, 500, "mg", (12,), None, "≥ 2 anos: 100 mg 12/12 h por 3 dias, ou 500 mg em dose única; enterobíase: 100 mg dose única, repetir em 2 semanas."),
    adl=B(100, 100, 500, "mg", (12,), None, "100 mg 12/12 h por 3 dias, ou 500 mg em dose única; enterobíase: 100 mg dose única, repetir em 2 semanas."),
    adu=B(100, 100, 500, "mg", (12,), None, "100 mg 12/12 h por 3 dias, ou 500 mg em dose única; enterobíase: 100 mg dose única, repetir em 2 semanas."),
    ido=IDO(1, "Sem ajuste."),
    ficha=F("Liga-se à β-tubulina do parasita e inibe a polimerização dos microtúbulos, prejudicando a captação de glicose e a absorção de nutrientes.",
            "Reduz os estoques de glicogênio dos vermes, que morrem por depleção energética, sendo ativo contra Ascaris, Trichuris, Enterobius e ancilostomídeos; baixa absorção sistêmica, ação principalmente intraluminal.",
            fk="Absorção oral < 10% (↑ com refeição gordurosa); metabolismo hepático de primeira passagem; excreção principalmente fecal.",
            fisio="Os helmintos intestinais dependem de captação de glicose pela cutícula; a depleção de glicogênio leva à imobilização e eliminação.",
            pa="Dor abdominal, diarreia; contraindicado no 1º trimestre da gestação; interação com cimetidina (↑ nível).", r=["MSIST", "WHOC", "LEX"], en="mebendazole"))
