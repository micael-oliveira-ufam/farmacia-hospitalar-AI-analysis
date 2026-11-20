#!/usr/bin/env python3
"""Gera os módulos Pedidos e Prontuário (arquivo único cada, offline).
Saídas: <out>/pedidos/index.html, <out>/prontuario/index.html (site) e
flutter_app/assets/pedidos.html, prontuario.html (app Android, sem links entre módulos).
Uso: python3 tools/mkmodulos.py <pasta_de_saida>"""
import json,os,re,sys,base64
S=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));M=os.path.join(S,'modulos')
rd=lambda p:open(os.path.join(M,p),encoding='utf8').read()
def design_css():
    css=open(os.path.join(S,'design/pharmacentral.css'),encoding='utf8').read()
    emb=lambda m:'url(data:font/woff2;base64,'+base64.b64encode(open(os.path.join(S,'design',m.group(1)),'rb').read()).decode()+')'
    return re.sub(r'url\((fonts/[^)]+\.woff2)\)',emb,css)
def itens():
    cat=json.load(open(os.path.join(S,'data/catalog.json'),encoding='utf8'))
    tox=json.load(open(os.path.join(S,'data/toxicidade.json'),encoding='utf8'))
    cod=json.load(open(os.path.join(S,'data/codajas.json'),encoding='utf8'))
    out=[];seen=set()
    for i in cat['items']:
        t=tox['itens'].get(tox['idx'].get(i['key'],''),{}) if i.get('key') else {}
        h=(t.get('h') or {}).get('l');k=(t.get('k') or {}).get('l')
        d={'n':i['desc'],'c':str(i['code'])}
        if h is not None:d['h']=h
        if k is not None:d['k']=k
        out.append(d);seen.add(i['desc'].strip().lower())
    for i in cod['itens']:
        n=i['name'].strip()
        if n.lower() not in seen:out.append({'n':n});seen.add(n.lower())
    return out
MARK=open(os.path.join(S,'design/mark.svg'),encoding='utf8').read()
MARK=re.sub(r'<svg[^>]*>','<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">',MARK,count=1).replace('id="mm"','id="pmm"').replace('url(#mm)','url(#pmm)')
THEME='<button class="fl-ic" id="theme" type="button" aria-label="Alternar tema claro e escuro" title="Alternar tema"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg></button>'
MODS=[('guia','Controle terapêutico','gui'),('estoque','Estoque','est'),('pedidos','Pedidos','ped'),('prontuario','Prontuário','pro')]
def bar(cur,web):
    brand='<a class="fl-brand" href="'+('../' if web else '#')+'" aria-label="PharmaCentral">'+MARK+'<span>Pharma<b>Central</b></span></a>'
    nav=''
    if web:nav='<nav class="fl-mods" aria-label="Módulos">'+''.join('<a class="%s"%s href="../%s/"><i></i>%s</a>'%(c,' aria-current="page"' if k==cur else '',k,n) for k,n,c in MODS)+'</nav>'
    return '<header class="fl-bar"><div class="fl-bar-in">'+brand+nav+'<span class="fl-sp"></span><div class="fl-tools">'+THEME+'</div></div></header>'
def build(name,web,items,css):
    t=rd(name+'.tpl.html')
    t=t.replace('<!--UFAM-->','<span class="ufam"><img src="data:image/png;base64,'+base64.b64encode(open(os.path.join(S,'design/ufam.png'),'rb').read()).decode()+'" alt="Brasão da Universidade Federal do Amazonas" width="43" height="56"><span>Universidade Federal do Amazonas</span></span>')
    t=t.replace('<!--BAR-->',bar(name,web)).replace('<!--BODYCLS-->','' if web else ' class="app"')
    t=t.replace('<!--PWA-->','<link rel="icon" href="../icon.svg">' if web else '')
    t=t.replace('/*ITENS*/',json.dumps(items,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    # callables: evita que "$&" etc. em JS sejam interpretados pelo re
    for ph,val in (('/*CSS*/',css),('/*COMMON*/',open(os.path.join(S,'design/pcpdf.js'),encoding='utf8').read()+'\n'+rd('common.js')),('/*JS*/',rd(name+'.js'))):t=t.replace(ph,val)
    return t
def main(out):
    items=itens();css=design_css()+'\n'+rd('base.css')
    A=os.path.join(S,'flutter_app/assets')
    for name in ('pedidos','prontuario'):
        d=os.path.join(out,name);os.makedirs(d,exist_ok=True)
        open(os.path.join(d,'index.html'),'w',encoding='utf8').write(build(name,True,items,css))
        if os.path.isdir(A):open(os.path.join(A,name+'.html'),'w',encoding='utf8').write(build(name,False,items,css))
    print('módulos ok:',len(items),'itens')
if __name__=='__main__':main(sys.argv[1] if len(sys.argv)>1 else os.path.join(S,'plataforma'))
