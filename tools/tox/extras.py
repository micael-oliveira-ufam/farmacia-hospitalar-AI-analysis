"""Substâncias sem rótulo FDA nem capítulo útil no LiverTox/revisão: classificadas a partir da bula europeia/britânica (SmPC).
Cada entrada traz a seção e a frase literal. Mesclado por tools/mktox.py ao final."""
SMPC_URL='https://www.medicines.org.uk/emc/product/2927/smpc'
REF_EXTRA=dict(SMPC=dict(t='Targocid (teicoplanina) 400 mg, Resumo das Características do Produto (SmPC), Electronic Medicines Compendium (MHRA/Reino Unido). A teicoplanina não tem rótulo FDA.',u=SMPC_URL))
EXTRAS={
 'teicoplanin':dict(
  k=dict(l=2,eq=True,src=[
   dict(r='SMPC',t='Targocid 400 mg (SmPC)',u=SMPC_URL,sec='4.4 Advertências e precauções especiais',q='Nephrotoxicity and renal failure have been reported in patients treated with teicoplanin',mec='alerta dedicado; monitorar função renal e audição; cuidado com aminoglicosídeos, colistina, anfotericina B, ciclosporina e cisplatina'),
   dict(r='SMPC',t='Targocid 400 mg (SmPC)',u=SMPC_URL,sec='4.2 Posologia',q='Dose adjustment is not required until the fourth day of treatment',mec='a partir do 4º dia: ClCr 30–80 mL/min, metade da dose de manutenção; ClCr < 30 mL/min e hemodiálise, um terço')]),
  h=dict(l=None,nt='A teicoplanina não tem rótulo FDA e não há escore LiverTox verificado. A bula europeia (SmPC, seção 4.8) lista aumento transitório de transaminases como reação incomum; por isso o nível não foi atribuído.',src=[
   dict(r='SMPC',t='Targocid 400 mg (SmPC)',u=SMPC_URL,sec='4.8 Reações adversas (Investigações, incomum)',q='Transaminases increased (transient abnormality of transaminases)')])),
}
