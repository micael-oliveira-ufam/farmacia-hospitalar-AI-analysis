#!/usr/bin/env python3
"""Sincroniza a versão (arquivo VERSION) nos projetos e gera o pacote farmacia-hospitalar-integrada-vX.Y.Z.zip
(a pasta dentro do zip também leva a versão). Uso: python3 tools/release.py [--no-zip]"""
import json,os,re,subprocess,sys,zipfile
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v=open(os.path.join(R,'VERSION')).read().strip()
assert re.fullmatch(r'\d+\.\d+\.\d+',v),'VERSION deve ser MAIOR.MENOR.CORREÇÃO'
a,b,c=map(int,v.split('.'));build=a*10000+b*100+c
def sub(path,pat,rep):
    p=os.path.join(R,path);s=open(p,encoding='utf-8').read();n=re.sub(pat,rep,s,count=1,flags=re.M)
    open(p,'w',encoding='utf-8').write(n);return n!=s
sub('flutter_app/pubspec.yaml',r'^version:.*$',f'version: {v}+{build}')
for pj in ('abc-app/package.json','server/package.json'):
    sub(pj,r'^(\s*)"version":\s*"[^"]*"',r'\1"version": "%s"'%v)
subprocess.run([sys.executable,'mkdose.py'],cwd=os.path.join(R,'tools'),check=True,stdout=subprocess.DEVNULL)
subprocess.run([sys.executable,'mkint.py'],cwd=os.path.join(R,'tools'),check=True,stdout=subprocess.DEVNULL)
subprocess.run([sys.executable,'mkcat.py'],cwd=os.path.join(R,'tools'),check=True,stdout=subprocess.DEVNULL)
for d in ('abc-app/public/data','flutter_app/assets'):
    for f in ('catalog.json','codajas.json','interacoes.json','dose.json'): open(os.path.join(R,d,f),'wb').write(open(os.path.join(R,'data',f),'rb').read())
print('versão',v,'sincronizada (pubspec +%d, package.json x2, catalog.meta.versao)'%build)
if '--no-zip' in sys.argv:sys.exit()
name=f'farmacia-hospitalar-integrada-v{v}';out=os.path.join(R,name+'.zip')
SKIP=('node_modules','__pycache__','dist','dist_guia','pkg','.git','_site')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for dp,dn,fn in os.walk(R):
        dn[:]=[d for d in dn if d not in SKIP]
        for f in fn:
            if f.endswith(('.zip','.png','.pyc')) or f in('patch_abc.py','t2.js') or f.startswith(('e2e_','shot_')):continue
            full=os.path.join(dp,f);z.write(full,os.path.join(name,os.path.relpath(full,R)))
print('pacote:',out)
