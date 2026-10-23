import os,json,subprocess,sys
H=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(H); SRC=os.path.join(H,'source','all2.js')
sys.path.insert(0,H)
def js(expr):
    code="const fs=require('fs');const f=new Function(fs.readFileSync(process.argv[1],'utf8')+';return %s');console.log(JSON.stringify(f()))"%expr
    return json.loads(subprocess.check_output(['node','-e',code,SRC]))
import urllib.parse as up
d=js("REFS")
doi=lambda x:'https://doi.org/'+x
pm=lambda x:'https://pubmed.ncbi.nlm.nih.gov/%s/'%x
gs=lambda q:'https://www.google.com/search?q='+up.quote(q)
# nivel: ok = URL conferida nesta sessão; doi = DOI/PMID registrado, resolução não testada; inst = página institucional (não testada); busca = link de pesquisa, não direto
U={
'AHA':(doi('10.1161/CIR.0000000000000901'),'doi'),'ACLS':(doi('10.1161/CIR.0000000000000916'),'doi'),
'NRP':(doi('10.1161/CIR.0000000000000902'),'doi'),'SSC':(doi('10.1097/CCM.0000000000005337'),'doi'),
'SSCP':(doi('10.1097/PCC.0000000000002198'),'doi'),'ISPAD':(doi('10.1111/pedi.13406'),'doi'),
'AES':(doi('10.5698/1535-7597-16.1.48'),'doi'),'VANCO':(doi('10.1093/ajhp/zxaa036'),'doi'),
'POLI':(doi('10.1002/phar.2209'),'doi'),'IDSA':(doi('10.1093/cid/civ933'),'doi'),
'CRASH':(doi('10.1016/S0140-6736(10)60835-5'),'doi'),'WOMAN':(doi('10.1016/S0140-6736(17)30638-4'),'doi'),
'AAPK':(doi('10.1542/peds.112.1.191'),'doi'),'CHEST':(doi('10.1378/chest.11-2308'),'doi'),
'AAPHAS':(doi('10.1542/peds.2017-1904'),'doi'),'TROT':(doi('10.1089/thy.2020.0717'),'doi'),
'PAH':(doi('10.1161/CIR.0000000000000329'),'doi'),'NASP':(doi('10.1097/MPG.0000000000000266'),'doi'),
'AHAKAW':(doi('10.1161/CIR.0000000000000484'),'doi'),'NEFRO':(doi('10.2215/CJN.00150118'),'ok'),
'SBCFR':(pm('20976376'),'ok'),'GINA':('https://ginasthma.org/reports/','inst'),
'NAEPP':('https://www.nhlbi.nih.gov/resources/guidelines-diagnosis-and-management-asthma-full-report-2007','inst'),
'NICE':('https://www.nice.org.uk/guidance/ng29','inst'),
'ISMP':('https://ismp-brasil.org/wp-content/uploads/2024/06/BOLETIM-ISMP-FEVEREIRO-2019.pdf','ok'),
'LTOX':('https://www.ncbi.nlm.nih.gov/books/NBK547852/','inst'),
'ANV':('https://consultas.anvisa.gov.br/#/bulario/','ok'),
'FDATRA':(gs('FDA Drug Safety Communication restricts codeine tramadol children 2017'),'busca'),
'LEX':('https://www.wolterskluwer.com/en/solutions/lexicomp','inst'),
'BNFC':('https://bnfc.nice.org.uk/','inst'),'BNF':('https://bnf.nice.org.uk/','inst'),
'WHOC':('https://www.who.int/publications/i/item/9789241547659','inst'),
'FTN':(gs('Formulário Terapêutico Nacional 2010 Rename Ministério da Saúde bvsms'),'busca'),
'HL':(gs('Harriet Lane Handbook 23rd edition Elsevier'),'busca'),
'SANF':('https://www.sanfordguide.com/','inst'),'REDB':('https://publications.aap.org/redbook','inst'),
'MSINF':(gs('Guia de Manejo e Tratamento de Influenza 2023 Ministério da Saúde'),'busca'),
'MSIST':(gs('PCDT Infecções Sexualmente Transmissíveis 2022 Ministério da Saúde gov.br'),'busca'),
'MSDIA':(gs('Manejo do paciente com diarreia cartaz Ministério da Saúde Planos A B C'),'busca'),
'ACR':('https://www.acr.org/Clinical-Resources/Contrast-Manual','inst'),
'MSGAR':(gs('Manual de Gestação de Alto Risco Ministério da Saúde 2022'),'busca'),
'SBD':('https://diretriz.diabetes.org.br/','inst'),
'WHOHEL':(gs('WHO guideline preventive chemotherapy soil-transmitted helminth 2017'),'busca'),
'MSLV':(gs('Manual de Vigilância e Controle da Leishmaniose Visceral Ministério da Saúde'),'busca'),
'EMAMET':(gs('EMA metoclopramide article 31 referral restrictions on use 2013'),'busca'),
'EMADOM':(gs('EMA domperidone article 31 referral 2014'),'busca'),
'EMAHYD':(gs('EMA hydroxyzine article 31 referral QT prolongation 2015'),'busca'),
'ASPEN':(gs('ASPEN Pediatric Nutrition Support Core Curriculum 2nd edition'),'busca'),
'MIL':(gs("Miller's Anesthesia 9th edition Elsevier"),'busca'),
'CDCINF':('https://www.cdc.gov/flu/hcp/antivirals/summary-clinicians.html','inst'),
'SBPFE':(gs('SBP Consenso anemia ferropriva atualização destaques 2021'),'busca'),
'MSFE':(gs('Manual de condutas gerais Programa Nacional de Suplementação de Ferro 2013 Ministério da Saúde'),'busca'),
'HL2':('', 'busca'),
}
# correcoes de citacao
d['MSFE']='Brasil. Ministério da Saúde. Programa Nacional de Suplementação de Ferro: manual de condutas gerais. Brasília: MS; 2013.'
d['LEX']='Taketomo CK, Hodding JH, Kraus DM. Pediatric & Neonatal Dosage Handbook. 29ª ed. Hudson (OH): Wolters Kluwer; 2022 (conteúdo atual: UpToDate Lexidrug).'
d['GINA']='Global Initiative for Asthma. Global Strategy for Asthma Management and Prevention. GINA; atualizações anuais (consultar a edição vigente).'
extra={
'P344':'Brasil. ANVISA. Portaria SVS/MS nº 344, de 12 de maio de 1998 (controle especial).|https://www.google.com/search?q=Portaria+SVS%2FMS+344+1998|busca',
'MOST':'Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.|'+doi('10.1056/NEJM198710223171717')+'|doi',
'CG':'Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41.|'+doi('10.1159/000180580')+'|doi',
'SCHW':'Schwartz GJ, Muñoz A, Schneider MF, et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol. 2009;20(3):629-637.|'+doi('10.1681/ASN.2008030287')+'|doi',
'CKDEPI':'Inker LA, Eneanya ND, Coresh J, et al. New creatinine- and cystatin C-based equations to estimate GFR without race. N Engl J Med. 2021;385(19):1737-1749.|'+doi('10.1056/NEJMoa2102953')+'|doi',
'HS':'Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19(5):823-832.|'+pm('13431307')+'|doi',
'KDIGO':'KDIGO Acute Kidney Injury Work Group. KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138.|https://kdigo.org/guidelines/acute-kidney-injury/|inst',
'ABCP':'Devnani M, Gupta AK, Nigah R. ABC and VED analysis of the pharmacy store of a tertiary care teaching, research and referral healthcare institute of India. J Young Pharm. 2010;2(2):201-205.|'+doi('10.4103/0975-1483.63170')+'|ok',
'MSH':'Management Sciences for Health. MDS-3: Managing Access to Medicines and Health Technologies. Arlington (VA): MSH; 2012.|https://msh.org/resources/mds-3-managing-access-to-medicines-and-health-technologies/|inst',
'MSAF':'Brasil. Ministério da Saúde. Assistência Farmacêutica na Atenção Básica: instruções técnicas sobre a gestão do ciclo logístico. Brasília: MS.|'+gs('Assistência Farmacêutica na Atenção Básica instruções técnicas gestão estoque Ministério da Saúde bvsms')+'|busca',
'ANSEL':'Ansel HC. Pharmaceutical Calculations. 15ª ed. Philadelphia: Wolters Kluwer.|'+gs('Ansel Pharmaceutical Calculations 15th edition')+'|busca',
'FDABZD':'U.S. Food and Drug Administration. Drug Safety Communication: FDA requiring Boxed Warning updated to improve safe use of benzodiazepine drug class. 23 set. 2020.|https://www.fda.gov/media/142368/download|ok',
}
out={}
for k,t in d.items():
    if k in('SANGUE',): continue
    u,l=U.get(k,(gs(t[:120]),'busca'))
    out[k]={'t':t,'u':u,'l':l}
for k,v in extra.items():
    t,u,l=v.split('|'); out[k]={'t':t,'u':u,'l':l}
for k in ['AES','POLI','IDSA','WOMAN','CHEST','SCHW','CKDEPI']:
    out[k]['l']='ok'
json.dump(out,open(os.path.join(ROOT,'data','refs.json'),'w'),ensure_ascii=False,indent=1)
from collections import Counter
print(len(out),Counter(v['l'] for v in out.values()))
