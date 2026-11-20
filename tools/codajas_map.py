"""Lote de substancias da lista da Policlinica Codajas com ficha montada a partir do rotulo FDA.
kw: palavras (normalizadas, sem acento) que devem aparecer TODAS no nome do item; ex: formoterol+budesonida.
excl: palavras que excluem o item (ex.: tiotropio isolado nao pode conter olodaterol)."""
LOTE1=[
 dict(en='budesonide and formoterol',pt='Formoterol + budesonida',kw=['formoterol','budesonida']),
 dict(en='leflunomide',pt='Leflunomida',kw=['leflunomida']),
 dict(en='adalimumab',pt='Adalimumabe',kw=['adalimumabe']),
 dict(en='methotrexate',pt='Metotrexato',kw=['metotrexato']),
 dict(en='insulin lispro',pt='Insulina lispro',kw=['insulina','lispro']),
 dict(en='insulin glargine',pt='Insulina glargina',kw=['insulina','glargina']),
 dict(en='insulin degludec',pt='Insulina degludeca',kw=['insulina','degludeca']),
 dict(en='insulin aspart',pt='Insulina asparte',kw=['insulina','aspart']),
 dict(en='azathioprine',pt='Azatioprina',kw=['azatioprina']),
 dict(en='hydroxychloroquine',pt='Hidroxicloroquina',kw=['hidroxicloroquina']),
 dict(en='tiotropium and olodaterol',pt='Tiotrópio + olodaterol',kw=['tiotropio','olodaterol']),
 dict(en='tiotropium',pt='Tiotrópio',kw=['tiotropio'],excl=['olodaterol']),
 dict(en='risperidone',pt='Risperidona',kw=['risperidona']),
 dict(en='mycophenolate mofetil',pt='Micofenolato de mofetila',kw=['micofenolato','mofetila']),
 dict(en='quetiapine',pt='Quetiapina',kw=['quetiapina']),
 dict(en='epoetin alfa',pt='Alfaepoetina',kw=['alfaepoetina']),
 dict(en='somatropin',pt='Somatropina',kw=['somatropina']),
 dict(en='umeclidinium and vilanterol',pt='Umeclidínio + vilanterol',kw=['umeclidinio','vilanterol']),
 dict(en='olanzapine',pt='Olanzapina',kw=['olanzapina']),
 dict(en='mesalamine',pt='Mesalazina',kw=['mesalazina']),
 dict(en='etanercept',pt='Etanercepte',kw=['etanercepte']),
 dict(en='golimumab',pt='Golimumabe',kw=['golimumabe']),
 dict(en='tofacitinib',pt='Tofacitinibe',kw=['tofacitinibe']),
 dict(en='dapagliflozin',pt='Dapagliflozina',kw=['dapagliflozina']),
]
