# Classificação por chave de monografia: (classe terapêutica, classe farmacológica).
# Inspirada na lógica do sistema ATC da OMS (grupos terapêuticos e farmacológicos) e na RENAME; compilada pelo assistente de IA
# e SEM conferência item a item na tabela ATC oficial. Revisar com farmacêutico. Fonte de consulta: WHO Collaborating Centre, ATC/DDD Index.
T_ANTIB='Antibacterianos'; T_FUNG='Antifúngicos'; T_VIR='Antivirais'; T_PARAS='Antiparasitários'
T_ANALG='Analgésicos e antitérmicos'; T_AINE='Anti-inflamatórios (AINEs)'; T_OPI='Opioides'
T_ANL='Anestésicos locais'; T_ANG='Anestésicos gerais e sedação'; T_BNM='Bloqueadores neuromusculares e reversores'
T_CONV='Anticonvulsivantes'; T_PSIC='Antipsicóticos e antidepressivos'; T_ANSI='Ansiolíticos e sedativos'
T_VASO='Vasopressores e inotrópicos'; T_HAS='Anti-hipertensivos'; T_DIUR='Diuréticos'; T_CVO='Outros cardiovasculares'
T_ANTIC='Anticoagulantes e antiagregantes'; T_HEMO='Hemostáticos'; T_REP='Fluidos e expansores de volume'
T_RESP='Broncodilatadores e antiasmáticos'; T_MUCO='Mucolíticos'; T_COR='Corticosteroides'
T_EME='Antieméticos e procinéticos'; T_ULC='Antiácidos e antiulcerosos'; T_LAX='Laxantes'; T_DIG='Outros digestivos'
T_ENDO='Hormônios e antidiabéticos'; T_HIST='Anti-histamínicos'; T_VIT='Vitaminas, minerais e nutrição'
T_ELE='Eletrólitos e diluentes'; T_ANTD='Antídotos e reversores'; T_CONT='Meios de contraste'
T_DERM='Dermatológicos (protetores)'; T_OFT='Oftalmológicos'

K={
# injetáveis
'acetilcisteina_inj':(T_ANTD,'Doador de glutationa (antídoto do paracetamol)'),'acido_ascorbico_inj':(T_VIT,'Vitaminas hidrossolúveis'),
'tranexamico_inj':(T_HEMO,'Antifibrinolíticos'),'aciclovir_inj':(T_VIR,'Análogos de nucleosídeo'),'albumina':(T_REP,'Expansores plasmáticos (albumina)'),
'amicacina':(T_ANTIB,'Aminoglicosídeos'),'ampicilina':(T_ANTIB,'Penicilinas'),'atropina':(T_ANTD,'Anticolinérgicos antimuscarínicos'),
'penicilina_cristalina':(T_ANTIB,'Penicilinas'),'penicilina_benzatina':(T_ANTIB,'Penicilinas'),'bromoprida_inj':(T_EME,'Antagonistas dopaminérgicos (procinéticos)'),
'bupivacaina':(T_ANL,'Amidas'),'bupivacaina_pesada':(T_ANL,'Amidas'),'cefalotina':(T_ANTIB,'Cefalosporinas'),'cefazolina':(T_ANTIB,'Cefalosporinas'),
'ceftriaxona':(T_ANTIB,'Cefalosporinas'),'ciprofloxacino_inj':(T_ANTIB,'Fluoroquinolonas'),'claritromicina_inj':(T_ANTIB,'Macrolídeos'),
'clindamicina_inj':(T_ANTIB,'Lincosamidas'),'dexametasona_inj':(T_COR,'Corticosteroides sistêmicos'),'dipirona_inj':(T_ANALG,'Pirazolonas (dipirona)'),
'dobutamina':(T_VASO,'Catecolaminas (inotrópico β1)'),'dopamina':(T_VASO,'Catecolaminas'),'enoxaparina':(T_ANTIC,'Heparinas de baixo peso molecular'),
'epinefrina':(T_VASO,'Catecolaminas'),'escopolamina_inj':(T_DIG,'Antiespasmódicos anticolinérgicos'),'fitomenadiona':(T_VIT,'Vitamina K'),
'fluconazol_inj':(T_FUNG,'Azólicos'),'folinato':(T_ANTD,'Resgate de antifolatos (folinato)'),'furosemida_inj':(T_DIUR,'Diuréticos de alça'),
'gentamicina':(T_ANTIB,'Aminoglicosídeos'),'heparina':(T_ANTIC,'Heparinas não fracionadas'),'hidralazina_inj':(T_HAS,'Vasodilatadores arteriais'),
'hidrocortisona':(T_COR,'Corticosteroides sistêmicos'),'lidocaina_inj':(T_ANL,'Amidas'),'meropenem':(T_ANTIB,'Carbapenêmicos'),
'metilprednisolona':(T_COR,'Corticosteroides sistêmicos'),'metronidazol_inj':(T_ANTIB,'Nitroimidazólicos'),'metoclopramida_inj':(T_EME,'Antagonistas dopaminérgicos (procinéticos)'),
'noradrenalina':(T_VASO,'Catecolaminas'),'omeprazol_inj':(T_ULC,'Inibidores da bomba de prótons'),'ondansetrona_inj':(T_EME,'Antagonistas 5-HT3'),
'oxacilina':(T_ANTIB,'Penicilinas'),'pantoprazol_inj':(T_ULC,'Inibidores da bomba de prótons'),'prometazina_inj':(T_HIST,'Anti-histamínicos H1 de 1ª geração'),
'piperacilina':(T_ANTIB,'Penicilinas'),'salbutamol_inj':(T_RESP,'β2-agonistas'),'smx_tmp_inj':(T_ANTIB,'Sulfonamidas + inibidor de folato'),
'suxametonio':(T_BNM,'Bloqueadores despolarizantes'),'tenoxicam_inj':(T_AINE,'Oxicams'),'vancomicina':(T_ANTIB,'Glicopeptídeos'),
'complexo_b_inj':(T_VIT,'Vitaminas hidrossolúveis'),
# comprimidos
'aas':(T_ANTIC,'Antiagregantes plaquetários (salicilatos)'),'acido_folico':(T_VIT,'Vitaminas hidrossolúveis'),'albendazol':(T_PARAS,'Benzimidazólicos'),
'alopurinol':(T_CVO,'Inibidores da xantina oxidase'),'anlodipino':(T_HAS,'Bloqueadores de canal de cálcio'),'azitromicina':(T_ANTIB,'Macrolídeos'),
'amoxicilina':(T_ANTIB,'Penicilinas'),'baclofeno':(T_CVO,'Relaxantes musculares (agonista GABA-B)'),'captopril':(T_HAS,'Inibidores da ECA'),
'carbonato_calcio':(T_VIT,'Sais minerais (cálcio)'),'carvedilol':(T_HAS,'β-bloqueadores'),'cefalexina':(T_ANTIB,'Cefalosporinas'),
'ciprofloxacino_vo':(T_ANTIB,'Fluoroquinolonas'),'dipirona_comp':(T_ANALG,'Pirazolonas (dipirona)'),'espironolactona':(T_DIUR,'Poupadores de potássio (antagonista da aldosterona)'),
'ibuprofeno_comp':(T_AINE,'Derivados do ácido propiônico'),'fluconazol_vo':(T_FUNG,'Azólicos'),'hctz':(T_DIUR,'Tiazídicos'),'hidralazina_vo':(T_HAS,'Vasodilatadores arteriais'),
'ivermectina':(T_PARAS,'Avermectinas'),'levotiroxina':(T_ENDO,'Hormônios tireoidianos'),'losartana':(T_HAS,'Antagonistas do receptor AT1'),
'metronidazol_vo':(T_ANTIB,'Nitroimidazólicos'),'omeprazol_vo':(T_ULC,'Inibidores da bomba de prótons'),'oseltamivir':(T_VIR,'Inibidores de neuraminidase'),
'prednisona':(T_COR,'Corticosteroides sistêmicos'),'propranolol':(T_HAS,'β-bloqueadores'),'sildenafila':(T_CVO,'Inibidores da PDE-5'),
# suspensões / soluções
'albendazol_susp':(T_PARAS,'Benzimidazólicos'),'amox_clav':(T_ANTIB,'Penicilinas'),'claritromicina_susp':(T_ANTIB,'Macrolídeos'),
'domperidona':(T_EME,'Antagonistas dopaminérgicos (procinéticos)'),'glicerina_enema':(T_LAX,'Laxantes osmóticos/retais'),'hidroxido_aluminio':(T_ULC,'Antiácidos'),
'benzoilmetronidazol':(T_ANTIB,'Nitroimidazólicos'),'nistatina':(T_FUNG,'Poliênicos'),'oleo_mineral':(T_LAX,'Laxantes lubrificantes'),
'prednisolona':(T_COR,'Corticosteroides sistêmicos'),'smx_tmp_susp':(T_ANTIB,'Sulfonamidas + inibidor de folato'),'sro':(T_ELE,'Soluções de reidratação oral'),
'tcm':(T_VIT,'Módulos nutricionais'),
# gotas / xaropes
'acido_ascorbico_gts':(T_VIT,'Vitaminas hidrossolúveis'),'bromoprida_gts':(T_EME,'Antagonistas dopaminérgicos (procinéticos)'),'dipirona_gts':(T_ANALG,'Pirazolonas (dipirona)'),
'ibuprofeno_gts':(T_AINE,'Derivados do ácido propiônico'),'metoclopramida_gts':(T_EME,'Antagonistas dopaminérgicos (procinéticos)'),'paracetamol_gts':(T_ANALG,'Anilidas (paracetamol)'),
'simeticona':(T_DIG,'Antiflatulentos'),'sulfato_ferroso':(T_VIT,'Sais de ferro'),'complexo_b_gts':(T_VIT,'Vitaminas hidrossolúveis'),
'ambroxol_adulto':(T_MUCO,'Mucolíticos'),'ambroxol_ped':(T_MUCO,'Mucolíticos'),'dexclorfeniramina':(T_HIST,'Anti-histamínicos H1 de 1ª geração'),
'hidroxizina':(T_HIST,'Anti-histamínicos H1 de 1ª geração'),'lactulose':(T_LAX,'Laxantes osmóticos/retais'),'salbutamol_xpe':(T_RESP,'β2-agonistas'),
'dexametasona_elixir':(T_COR,'Corticosteroides sistêmicos'),'loratadina':(T_HIST,'Anti-histamínicos H1 de 2ª geração'),'kcl_xarope':(T_ELE,'Eletrólitos'),
# tópicos
'dexametasona_creme':(T_COR,'Corticosteroides tópicos'),'lidocaina_geleia':(T_ANL,'Amidas'),'miconazol_derm':(T_FUNG,'Azólicos'),'miconazol_gin':(T_FUNG,'Azólicos'),
'mupirocina':(T_ANTIB,'Antibacterianos tópicos'),'neomicina_bacitracina':(T_ANTIB,'Antibacterianos tópicos'),'nistatina_zinco':(T_DERM,'Antifúngico + protetor cutâneo'),
'oxido_zinco':(T_DERM,'Protetores cutâneos'),'zinco_vit_ad':(T_DERM,'Protetores cutâneos'),'creme_barreira':(T_DERM,'Protetores cutâneos'),
'deltametrina':(T_PARAS,'Piretroides'),'permetrina':(T_PARAS,'Piretroides'),
# inalatórios / oftálmicos
'beclometasona_neb':(T_COR,'Corticosteroides inalatórios'),'ipratropio':(T_RESP,'Anticolinérgicos inalatórios'),'nacl_inal':(T_ELE,'Veículos e diluentes'),
'salbutamol_neb':(T_RESP,'β2-agonistas'),'salbutamol_spray':(T_RESP,'β2-agonistas'),'lagrima':(T_OFT,'Lubrificantes oculares'),
'tobramicina_colirio':(T_ANTIB,'Aminoglicosídeos'),'tropicamida':(T_OFT,'Midriáticos e cicloplégicos'),'ciprofloxacino_colirio':(T_ANTIB,'Fluoroquinolonas'),
# eletrólitos / contrastes
'agua_destilada':(T_ELE,'Veículos e diluentes'),'kcl_10':(T_ELE,'Eletrólitos'),'nacl_10':(T_ELE,'Eletrólitos'),'gluconato_calcio':(T_ELE,'Eletrólitos'),
'glicose_50':(T_ELE,'Soluções hipertônicas'),'magnesio':(T_ELE,'Eletrólitos'),'manitol':(T_DIUR,'Diuréticos osmóticos'),
'contraste_nao_ionico':(T_CONT,'Contrastes iodados'),'contraste_meglumina':(T_CONT,'Contrastes iodados'),'bario':(T_CONT,'Contrastes baritados'),
# termolábeis / reserva
'anfotericina_b':(T_FUNG,'Poliênicos'),'atracurio':(T_BNM,'Bloqueadores não despolarizantes'),'insulina_regular':(T_ENDO,'Insulinas'),'insulina_nph':(T_ENDO,'Insulinas'),
'pancuronio':(T_BNM,'Bloqueadores não despolarizantes'),'rocuronio':(T_BNM,'Bloqueadores não despolarizantes'),'glicerina_supositorio':(T_LAX,'Laxantes osmóticos/retais'),
'anfotericina_lipossomal':(T_FUNG,'Poliênicos'),'caspofungina':(T_FUNG,'Equinocandinas'),'linezolida':(T_ANTIB,'Oxazolidinonas'),'micafungina':(T_FUNG,'Equinocandinas'),
'polimixina_b':(T_ANTIB,'Polimixinas'),'teicoplanina':(T_ANTIB,'Glicopeptídeos'),'tigeciclina':(T_ANTIB,'Glicilciclinas'),
# controlados
'clorpromazina_inj':(T_PSIC,'Antipsicóticos fenotiazínicos'),'dexmedetomidina':(T_ANG,'Agonistas α2'),'diazepam_inj':(T_ANSI,'Benzodiazepínicos'),
'escetamina':(T_ANG,'Anestésicos dissociativos'),'etomidato':(T_ANG,'Hipnóticos (imidazólicos)'),'fenitoina_inj':(T_CONV,'Hidantoínas'),
'fenobarbital_inj':(T_CONV,'Barbitúricos'),'fentanil':(T_OPI,'Opioides fortes'),'flumazenil':(T_ANTD,'Antagonistas benzodiazepínicos'),
'haloperidol_inj':(T_PSIC,'Antipsicóticos butirofenonas'),'haloperidol_dec':(T_PSIC,'Antipsicóticos butirofenonas'),'midazolam_inj':(T_ANSI,'Benzodiazepínicos'),
'morfina_02':(T_OPI,'Opioides fortes'),'morfina_10':(T_OPI,'Opioides fortes'),'naloxona':(T_ANTD,'Antagonistas opioides'),'remifentanil':(T_OPI,'Opioides fortes'),
'sugamadex':(T_BNM,'Reversor seletivo (γ-ciclodextrina)'),'tramadol_inj':(T_OPI,'Opioides fracos'),'propofol':(T_ANG,'Hipnóticos (alquilfenóis)'),
'sevoflurano':(T_ANG,'Anestésicos inalatórios'),'tiopental':(T_ANG,'Barbitúricos'),'carbamazepina':(T_CONV,'Carboxamidas'),'clonazepam':(T_CONV,'Benzodiazepínicos'),
'fenobarbital_vo':(T_CONV,'Barbitúricos'),'haloperidol_vo':(T_PSIC,'Antipsicóticos butirofenonas'),'valproato':(T_CONV,'Derivados do ácido valproico'),
'levetiracetam':(T_CONV,'Racetamas'),'ursodesoxicolico':(T_DIG,'Ácidos biliares'),'clobazam':(T_ANSI,'Benzodiazepínicos'),'diazepam_vo':(T_ANSI,'Benzodiazepínicos'),
'fluoxetina':(T_PSIC,'Antidepressivos ISRS'),'lamotrigina':(T_CONV,'Feniltriazinas'),'lorazepam':(T_ANSI,'Benzodiazepínicos'),'metadona':(T_OPI,'Opioides fortes'),
'risperidona':(T_PSIC,'Antipsicóticos atípicos'),'topiramato':(T_CONV,'Sulfamatos'),
}
def apply(mono):
    miss=[k for k in mono if k not in K]; extra=[k for k in K if k not in mono]
    assert not miss and not extra,(miss,extra)
    for k,m in mono.items(): m['tc'],m['fc']=K[k]
