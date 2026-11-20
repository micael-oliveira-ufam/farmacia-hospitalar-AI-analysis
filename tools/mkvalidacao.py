#!/usr/bin/env python3
"""Gera docs/validacao_toxicidade.xlsx e .csv: lista para o farmaceutico validar os niveis de toxicidade (colunas de decisao em branco)."""
import json,os,csv
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d=json.load(open(os.path.join(R,'data/toxicidade.json'),encoding='utf8'));E=d['escalas']
HN=[z['nome'] for z in E['hep']];KN=[z['nome'] for z in E['nef']]
OVR={'dextrose_glucose','sodium_chloride','amlodipine','dexamethasone','fluconazole','carbamazepine','hydralazine'}
rows=[]
def add(v,org,o,motivo):
    nm=HN if org=='Fígado' else KN
    lv='' if o is None or o.get('l') is None else '%d - %s'%(o['l'],nm[o['l']])
    for x in (o or {}).get('src',[None])[:3] or [None]:
        rows.append([v['en'],org,lv,motivo,(x or {}).get('t',''),(x or {}).get('sec',''),(x or {}).get('q',''),(x or {}).get('u',''),'','',''])
for k,v in sorted(d['itens'].items(),key=lambda a:a[1]['en'].lower()):
    h,n=v.get('h'),v.get('k')
    if h is None: add(v,'Fígado',None,'Sem fonte verificada: classificar')
    elif h.get('l') is None: add(v,'Fígado',h,'Capítulo sem escore')
    elif h.get('inf'): add(v,'Fígado',h,'Nível inferido do texto (sem escore oficial)')
    elif h.get('cap'): add(v,'Fígado',h,'Escore com modificador [H]/[HD], limitado a Alto')
    elif h['l']>=3 and any(x.get('e')=='classe' for x in h['src']): add(v,'Fígado',h,'Escore de capítulo de classe, não do fármaco')
    if n is None: add(v,'Rim',None,'Sem fonte verificada: classificar')
    elif k in OVR: add(v,'Rim',n,'Revisão manual: rótulo cita só interação/pré-condição')
    elif n.get('l') is not None and n['l']>=2: add(v,'Rim',n,'Nível 2-3: confirmar frase do rótulo/revisão')
H=['Substância','Órgão','Nível atribuído','Motivo da revisão','Fonte','Seção','Trecho original','Link','Decisão (aprovar / alterar)','Nível proposto','Observações']
os.makedirs(os.path.join(R,'docs'),exist_ok=True)
with open(os.path.join(R,'docs/validacao_toxicidade.csv'),'w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f,delimiter=';');w.writerow(H);w.writerows(rows)
from openpyxl import Workbook
from openpyxl.styles import Font,Alignment,PatternFill
wb=Workbook();ws=wb.active;ws.title='Validação'
ws.append(H);[ws.append(r) for r in rows]
for c in ws[1]: c.font=Font(bold=True,color='FFFFFF');c.fill=PatternFill('solid',fgColor='12808A')
for col,wd in zip('ABCDEFGHIJK',[26,9,16,34,30,22,70,40,20,14,30]): ws.column_dimensions[col].width=wd
for r in ws.iter_rows(min_row=2):
    for c in r: c.alignment=Alignment(wrap_text=True,vertical='top')
ws.freeze_panes='A2';ws.auto_filter.ref=ws.dimensions
wb.save(os.path.join(R,'docs/validacao_toxicidade.xlsx'))
print(len(rows),'linhas;',len({r[0] for r in rows}),'substâncias')
