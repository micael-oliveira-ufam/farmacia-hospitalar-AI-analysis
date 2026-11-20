#!/usr/bin/env python3
"""Le o pacote publico do LiverTox (NIH/NIDDK; ftp.ncbi.nlm.nih.gov/pub/litarch/29/31/livertox_NBK547852.tar.gz)
ja extraido (somente *.nxml) e grava um indice por capitulo: id, titulo, escore de verossimilhanca (A-E), a frase exata
do escore e a primeira frase da secao 'Hepatotoxicity'. Uso: extract_livertox.py <dir_com_nxml> <saida.json>"""
import glob,html,json,os,re,sys
def txt(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
def main(d,out):
    res={}
    for f in sorted(glob.glob(os.path.join(d,'*.nxml'))):
        cid=os.path.basename(f)[:-5];s=open(f,encoding='utf8').read()
        titles=re.findall(r'<title>(.*?)</title>',s,re.S)
        title=txt(titles[1]) if len(titles)>1 else cid
        m=re.search(r'<sec id="[^"]*Hepatotoxicity">(.*?)</sec>',s,re.S)
        sec=txt(m.group(1)) if m else ''
        full=txt(s)
        ls=[]
        body=sec or full
        for sm in re.finditer(r'[Ll]ikelihood score([^:.]{0,80}):\s*([A-E])(\*?)(\[[A-Za-z]+\])?\s*(\((?:[^()]|\([^)]*\))*\))?',body):
            pre=body[max(0,sm.start()-90):sm.start()];pre=re.split(r'[.;] ',pre)[-1].strip()
            ls.append({'q':(pre+' '+sm.group(1)).strip(' ,'),'s':sm.group(2)+sm.group(3),'m':(sm.group(4) or '').strip('[]'),'l':txt(pre+' '+sm.group(0))[:430]})
        first=re.sub(r'^Hepatotoxicity\s*','',sec);first=re.split(r'(?<=[.!?])\s',first)[0][:260] if first else ''
        mem=re.search(r'(?:Drugs in the Subclass[^:]*|Selected Drugs in the Class|REPRESENTATIVE TRADE NAMES)\s*:?\s*(.{0,500})',full)
        res[cid]={'t':title,'s':ls[0]['s'] if ls else None,'l':ls[0]['l'] if ls else None,'ls':ls,'h':first,'mem':mem.group(1)[:300] if mem else ''}
    json.dump(res,open(out,'w'),ensure_ascii=False,separators=(',',':'))
    print(len(res),'capitulos;',sum(1 for v in res.values() if v['s']),'com escore')
if __name__=='__main__': main(*sys.argv[1:3])
