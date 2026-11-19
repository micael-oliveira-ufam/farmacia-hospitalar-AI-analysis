#!/usr/bin/env python3
"""Baixa (com cache) ate 8 rotulos FDA por substancia da API publica openFDA (api.fda.gov/drug/label).
Uso: fda_fetch.py <universe.json> <cache_dir>. Limite ~40 req/min sem chave."""
import json,os,re,sys,time,urllib.parse,urllib.request,urllib.error
from concurrent.futures import ThreadPoolExecutor
QOV={ # nome no catalogo -> consulta openFDA (generic_name)
 'amoxicillin clavulanate':'amoxicillin AND clavulanate','artemether and lumefantrine':'artemether AND lumefantrine','aspirin acetylsalicylic acid':'aspirin',
 'caffeine citrate':'caffeine AND citrate','dextrose glucose':'dextrose','esketamine ketamine':'ketamine','haloperidol decanoate':'haloperidol AND decanoate',
 'hyoscine butylbromide':'scopolamine butylbromide','ibuprofen lysine':'ibuprofen AND lysine','imipenem and cilastatin':'imipenem AND cilastatin',
 'insulin human regular':'insulin AND human','insulin isophane NPH':'insulin AND isophane','leucovorin folinic acid':'leucovorin',
 'liposomal amphotericin B':'amphotericin AND liposome','amphotericin B':'amphotericin AND b','metamizole dipyrone':'dipyrone',
 'neomycin bacitracin':'neomycin AND bacitracin','paracetamol (acetaminophen)':'acetaminophen','paracetamol acetaminophen':'acetaminophen',
 'penicillin G benzathine':'penicillin AND benzathine','penicillin G potassium':'penicillin AND potassium','phytonadione vitamin K':'phytonadione',
 'piperacillin tazobactam':'piperacillin AND tazobactam','polymyxin B':'polymyxin','salbutamol albuterol':'albuterol','sodium nitroprusside':'nitroprusside',
 'succinylcholine suxamethonium':'succinylcholine','sulfamethoxazole trimethoprim':'sulfamethoxazole AND trimethoprim','valproate valproic acid':'valproate',
 'iobitridol iopamidol contrast':'iopamidol','ionic iodinated contrast (meglumine)':'diatrizoate','meglumine diatrizoate contrast':'diatrizoate',
 'non-ionic iodinated contrast':'iohexol','vitamin B complex':'thiamine','B-complex vitamins':'thiamine','aluminium hydroxide':'aluminum hydroxide',
 'ursodeoxycholic acid':'ursodiol','rifampicin':'rifampin','chloroquine':'chloroquine','heparin':'heparin','oral rehydration salts':'sodium chloride AND potassium AND glucose',
 'medium chain triglycerides':'medium chain triglycerides','medium-chain triglycerides':'medium chain triglycerides','albumin human':'albumin AND human','sterile water':'water',
 'zinc oxide':'zinc AND oxide','mineral oil':'mineral AND oil','folic acid':'folic AND acid','barium sulfate':'barium AND sulfate'}
FIELDS=['set_id','effective_time','boxed_warning','warnings_and_cautions','warnings','adverse_reactions','precautions','contraindications']
def query(en):
    q=QOV.get(en) or re.sub(r'\s*\(.*?\)','',en).strip()
    if ' AND ' not in q and ' ' in q: q=q.replace(' ',' AND ')
    return q
def um(en,cache):
    fn=os.path.join(cache,re.sub(r'[^a-z0-9]+','_',en.lower())+'.json')
    if os.path.exists(fn): return
    q=query(en);url='https://api.fda.gov/drug/label.json?search='+urllib.parse.quote('openfda.generic_name:('+q+')')+'&limit=8'
    for tent in range(3):
        try:
            r=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'farmacia-hospitalar-tox/1.0'}),timeout=60))
            res=[{k:v for k,v in x.items() if k in FIELDS}|{'gn':x.get('openfda',{}).get('generic_name',[]),'bn':x.get('openfda',{}).get('brand_name',[])} for x in r.get('results',[])]
            out={'q':q,'n':r.get('meta',{}).get('results',{}).get('total',len(res)),'res':res};break
        except urllib.error.HTTPError as e:
            if e.code==404: out={'q':q,'n':0,'res':[],'err':404};break
            print('erro',en,e.code,flush=True);time.sleep(6);out=None
        except Exception as e: print('erro',en,e,flush=True);time.sleep(6);out=None
    if out is None: return
    json.dump(out,open(fn,'w'),ensure_ascii=False);print(en,'->',out['n'],flush=True);time.sleep(1.2)
def main(uni,cache):
    os.makedirs(cache,exist_ok=True);U=sorted(json.load(open(uni)))
    with ThreadPoolExecutor(4) as ex: list(ex.map(lambda e:um(e,cache),U))
if __name__=='__main__': main(*sys.argv[1:3])
