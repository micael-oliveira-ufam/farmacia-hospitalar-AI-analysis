#!/usr/bin/env python3
"""Gera data/dose.json (faixas de dose do ICAM, unificadas no PosologiaPED) a partir de data/icam_medicamentos.json,
ligando cada item as monografias do catalogo pelo nome do principio ativo.
Faixas compiladas por IA (base do repositorio ICAM): exigem revisao farmaceutica."""
import json,os,re,unicodedata
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def norm(s): return ''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn').lower()
def ing(s): return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9+ ]',' ',norm(re.split(r'[\d(]',s)[0]))).strip()
def load(p): return json.load(open(os.path.join(ROOT,'data',p),encoding='utf8'))
cat=load('catalog.json');ic=load('icam_medicamentos.json')
monos={k:ing(m['n']) for k,m in cat['mono'].items()}
FIX={'Remifentanila':'remifentanil','Hidroxizine xarope':'hidroxizina','Gliconato de Cálcio 10%':'gluconato de calcio','Beclometasona inalatória':'beclometasona'}
out=[]
for x in ic:
    n=ing(re.sub(r'\(.*?\)','',FIX.get(x['nome'],x['nome'])))
    ks=[k for k,v in monos.items() if v==n or (n and (v.startswith(n+' ') or n.startswith(v+' ')) and len(v)>=5)]
    out.append({'id':x['id'],'n':x['nome'],'c':x['classe'],'cat':x['categoria'],'v':x['vias'],
      'ap':[{'f':p['forma'],'k':p['concentracao'],'u':p['unidade']} for p in x['apresentacoes']],
      'min':x['dose_min_mg_kg_dose'],'max':x['dose_max_mg_kg_dose'],'dia':x['dose_max_dia_mg_kg'],'abs':x['dose_max_absoluta_mg_dia'],
      'imin':x['intervalo_horas_min'],'imax':x['intervalo_horas_max'],'obs':x['observacoes'],
      'ctl':bool(x['uso_controlado']),'p344':x['portaria_344_lista'],'du':bool(x['requer_dose_unitaria']),
      'fd':bool(x['farmaceutico_define_frascos']),'col':bool(x['uso_coletivo']),'disp':bool(x['disponivel']),'mono':ks})
json.dump({'fonte':'Base de medicamentos do repositorio ICAM (compilada por IA; revisao farmaceutica obrigatoria)','itens':out},open(os.path.join(ROOT,'data','dose.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print(len(out),'itens;',sum(1 for o in out if o['mono']),'ligados ao catalogo;',sum(1 for o in out if o['min'] is not None),'com faixa')
