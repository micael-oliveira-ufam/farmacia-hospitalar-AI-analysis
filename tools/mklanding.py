#!/usr/bin/env python3
"""Gera a página inicial do PharmaCentral a partir de pages/index.tpl.html e dos dados reais do projeto.
Saídas: pages/index.html (caminhos relativos, GitHub Pages) e server/landing/index.html (caminhos absolutos, Docker).
Uso: python3 tools/mklanding.py"""
import json, os, re
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J=lambda p:json.load(open(os.path.join(R,p),encoding='utf8'))
cat,pos,tox,fich,cod=J('data/catalog.json'),J('data/posologia.json'),J('data/toxicidade.json'),J('data/codajas_fichas.json'),J('data/codajas.json')
ver=open(os.path.join(R,'VERSION')).read().strip()
tpl=open(os.path.join(R,'pages/index.tpl.html'),encoding='utf8').read()

# destaque: paracetamol (dados reais de posologia.json e toxicidade.json)
tx=tox['itens']['paracetamol_acetaminophen']
HN=[e['nome'] for e in tox['escalas']['hep']]; KN=[e['nome'] for e in tox['escalas']['nef']]
def org(o,names):
    if not o: return None
    s=o['src'][0]
    return {'l':o['l'],'nome':names[o['l']],'s':o.get('s'),'m':o.get('m'),'cap':bool(o.get('cap')),'fonte':s['t'],'u':s['u'],'q':s.get('q','')}
spec={'nome':'Paracetamol','classe':'Analgésicos e antitérmicos','via':'Via oral',
 'bandas':[{'id':b,'nome':pos['bandas'][b],'v':v} for b,v in pos['itens']['paracetamol']['b'].items()],
 'h':org(tx.get('h'),HN),'k':org(tx.get('k'),KN)}
# linhas de exemplo para o módulo (níveis reais)
def lv(key):
    t=tox['itens'][tox['idx'][key]]; return [t['h']['l'] if t.get('h') and t['h'].get('l') is not None else None, t['k']['l'] if t.get('k') and t['k'].get('l') is not None else None]
amostra=[('Amoxicilina','Penicilinas','amoxicilina_susp'),('Paracetamol','Analgésicos e antitérmicos','paracetamol'),('Dipirona','Analgésicos e antitérmicos','dipirona_gts'),('Gentamicina','Aminoglicosídeos','gentamicina')]
amostra=[(n,c,lv(k)) for n,c,k in amostra if k in tox['idx']]
def meter(n,mx):
    return '<span class="mtr" aria-hidden="true">'+''.join('<i class="%s"></i>'%(('on l%d'%n) if i<=n else '') for i in range(mx+1))+'</span>'
rows=''.join('<li><span class="ex-n">%s<small>%s</small></span><span class="ex-m"><span>Fígado %s</span><span>Rim %s</span></span></li>'%(n,c,
   meter(l[0],4) if l[0] is not None else '<em>sem nível</em>', meter(l[1],3) if l[1] is not None else '<em>sem nível</em>') for n,c,l in amostra)
def escala(es,mx):
    return ''.join('<li>%s<div><b>%s</b><span>%s</span></div></li>'%(meter(e['n'],mx),e['nome'],e['crit']) for e in es)
NOMES={'LTX':'LiverTox, base do NIH sobre lesão hepática por medicamentos','FDA':'Rótulos de medicamentos da FDA (DailyMed)','PAZ':'Pazhayattil e Shirali (2014): nefrotoxicidade de medicamentos',
 'ANV':'Bulário Eletrônico da Anvisa','BNFC':'BNF for Children (Reino Unido)','WHOC':'WHO Model Formulary for Children','LEX':'Pediatric & Neonatal Dosage Handbook (Lexicomp)','REDB':'Red Book, da Academia Americana de Pediatria'}
def chips(keys,src):
    return ''.join('<li><a href="%s" target="_blank" rel="noopener noreferrer">%s</a></li>'%(src[k]['u'],NOMES.get(k,src[k]['t'][:80])) for k in keys)
fontes=chips(['LTX','FDA','PAZ'],tox['refs'])+chips([k for k in ('ANV','BNFC','WHOC','LEX','REDB') if k in cat['refs']],cat['refs'])
n_fich=len(fich['itens']); n_fich_it=sum(len(f['itens']) for f in fich['itens'].values())
F={'__VERSION__':ver,'__N_ITENS__':str(len(cat['items'])),'__N_TOX__':str(len(tox['itens'])),'__N_REFS__':str(len(cat['refs'])),
 '__N_COD__':str(len(cod['itens'])),'__N_FICHAS__':str(n_fich),'__N_FICHAS_IT__':str(n_fich_it),'__N_BANDAS__':str(len(pos['bandas'])),
 '__ESCALA_H__':escala(tox['escalas']['hep'],4),'__ESCALA_K__':escala(tox['escalas']['nef'],3),'__EXEMPLOS__':rows,'__FONTES__':fontes,
 '__SPEC__':json.dumps(spec,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')}
html=tpl
for k,v in F.items(): html=html.replace(k,v)
SW_REL='if("serviceWorker" in navigator&&location.protocol.indexOf("http")===0){\n  navigator.serviceWorker.register("sw.js").catch(function(){});\n  navigator.serviceWorker.register("guia/sw.js",{scope:"guia/"}).catch(function(){});\n  navigator.serviceWorker.register("estoque/sw.js",{scope:"estoque/"}).catch(function(){});}'
SW_ABS='if("serviceWorker" in navigator&&location.protocol.indexOf("http")===0){navigator.serviceWorker.register("/sw.js").catch(function(){});}'
open(os.path.join(R,'pages/index.html'),'w',encoding='utf8').write(html.replace('/*SW*/',SW_REL))
srv=html.replace('href="shared/','href="/shared/').replace('href="guia/','href="/guia/').replace('href="estoque/','href="/estoque/').replace('src="icons/','src="/icons/').replace('src="shared/','src="/shared/').replace('href="manifest.json"','href="/manifest.json"').replace('href="icon.svg"','href="/icon.svg"')
srv=srv.replace('/*SW*/',SW_ABS)
open(os.path.join(R,'server/landing/index.html'),'w',encoding='utf8').write(srv)
print('landing ok:',len(html)//1024,'KB;',n_fich,'fichas;',len(tox['itens']),'substâncias')
