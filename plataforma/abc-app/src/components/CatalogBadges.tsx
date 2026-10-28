import * as React from 'react';
import { guideLink, type Catalog } from '../lib/catalog';

/** Selos de segurança (ISMP, rim, fígado) e link ao guia, quando o item consta na lista de exemplo (pelo código do item). */
export function CatalogBadges({ cafCode, catalog }: { cafCode?: string; catalog: Catalog | null }) {
  if (!cafCode) return null;
  const item = catalog?.items.find(i => i.code === cafCode);
  const s = item ? catalog!.safety[item.key] : undefined;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 ml-1 align-middle">
      {s?.ismp ? <span title={`ISMP Brasil 2019: ${s.ismp}`} className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase">Alta vigilância</span> : null}
      {s?.nef ? <span title="Escala interna do guia (ver Metodologia)" className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 text-[10px] font-black uppercase">{s.nef === 2 ? 'Nefrotóxico' : 'Nefro: atenção'}</span> : null}
      {s?.hep ? <span title="Escala interna do guia (ver Metodologia)" className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black uppercase">{s.hep === 2 ? 'Hepatotóxico' : 'Hepato: atenção'}</span> : null}
      <a href={guideLink(cafCode)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 underline uppercase" onClick={e => e.stopPropagation()}>PosologiaPED</a>
    </span>
  );
}
