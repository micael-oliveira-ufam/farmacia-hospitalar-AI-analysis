/** Lista de exemplo (data/catalog.json, a mesma do PosologiaPED). Carregada sob demanda. */
export interface CatItem { id: number; sec: string; code: string; desc: string; key: string; mgml: number | null }
export interface CatSafety { nef: number; hep: number; ismp: string }
export interface Catalog {
  items: CatItem[]; sec: Record<string, string>;
  safety: Record<string, CatSafety>;
  mono: Record<string, { n: string; c: string; en: string }>;
}
let cache: Promise<Catalog | null> | null = null;
export const loadCatalog = () => (cache ??= fetch(`${import.meta.env.BASE_URL}data/catalog.json`).then(r => (r.ok ? r.json() : null)).catch(() => null));

export interface CodajasItem { name: string; activeUsers: number; unitCost: number }
let cacheC: Promise<{ nome: string; itens: CodajasItem[] } | null> | null = null;
export const loadCodajas = () => (cacheC ??= fetch(`${import.meta.env.BASE_URL}data/codajas.json`).then(r => (r.ok ? r.json() : null)).catch(() => null));

export const HOME_URL = (import.meta.env.VITE_HOME_URL as string | undefined) ?? '/';
export const GUIDE_URL = (import.meta.env.VITE_GUIDE_URL as string | undefined) ?? '/guia/';
export const guideLink = (code: string) => `${GUIDE_URL}#caf=${encodeURIComponent(code)}`;

export const REF = {
  ISMP: { t: 'ISMP Brasil. Medicamentos potencialmente perigosos de uso hospitalar – lista atualizada 2019. Boletim ISMP Brasil. 2019;8(1).', u: 'https://ismp-brasil.org/wp-content/uploads/2024/06/BOLETIM-ISMP-FEVEREIRO-2019.pdf' },
  ABCP: { t: 'Devnani M, Gupta AK, Nigah R. ABC and VED analysis of the pharmacy store of a tertiary care teaching, research and referral healthcare institute of India. J Young Pharm. 2010;2(2):201-205.', u: 'https://doi.org/10.4103/0975-1483.63170' },
  MSH: { t: 'Management Sciences for Health. MDS-3: Managing Access to Medicines and Health Technologies. Arlington (VA): MSH; 2012.', u: 'https://msh.org/resources/mds-3-managing-access-to-medicines-and-health-technologies/' },
  MSAF: { t: 'Brasil. Ministério da Saúde. Assistência Farmacêutica na Atenção Básica: instruções técnicas sobre a gestão do ciclo logístico.', u: 'https://www.google.com/search?q=Assist%C3%AAncia+Farmac%C3%AAutica+na+Aten%C3%A7%C3%A3o+B%C3%A1sica+instru%C3%A7%C3%B5es+t%C3%A9cnicas+gest%C3%A3o+estoque+Minist%C3%A9rio+da+Sa%C3%BAde' },
  CMED: { t: 'Anvisa. CMED – Preços de medicamentos (tabela oficial).', u: 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed/precos' },
  NEFRO: { t: 'Perazella MA. Pharmacology behind Common Drug Nephrotoxicities. Clin J Am Soc Nephrol. 2018;13(12):1897-1908.', u: 'https://doi.org/10.2215/CJN.00150118' },
  LTOX: { t: 'NIDDK. LiverTox: Clinical and Research Information on Drug-Induced Liver Injury.', u: 'https://www.ncbi.nlm.nih.gov/books/NBK547852/' },
};
