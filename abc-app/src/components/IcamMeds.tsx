import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CatalogBadges } from './CatalogBadges';
import type { Catalog } from '../lib/catalog';

const PAGE = 30;
export type StockInfo = { inv: number | null; cmm: number };

/** Medicamentos do ICAM: a lista original transcrita (a mesma do Controle terapêutico), com forma/tipo, classe, via e alertas de segurança. */
export function IcamMeds({ unit, catalog, stock, onHide }: { unit: string; catalog: Catalog | null; stock: Record<string, StockInfo>; onHide?: () => void }) {
  const [q, setQ] = useState('');
  const [sec, setSec] = useState('');
  const [shown, setShown] = useState(PAGE);
  useEffect(() => setShown(PAGE), [q, sec]);

  const items = catalog?.items ?? [];
  const secs = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach(i => m.set(i.sec, (m.get(i.sec) || 0) + 1));
    return Object.keys(catalog?.sec ?? {}).filter(k => m.has(k)).map(k => [k, catalog!.sec[k], m.get(k)!] as const);
  }, [items, catalog]);
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const list = useMemo(() => {
    const t = norm(q.trim());
    return items.filter(i => (!sec || i.sec === sec) && (!t || norm(i.desc + ' ' + i.code).includes(t)))
      .sort((a, b) => a.desc.localeCompare(b.desc, 'pt-BR'));
  }, [items, q, sec]);

  const report = () => {
    const P = (window as any).PCPDF;
    if (!P || !list.length || !catalog) return;
    const rows: any[] = [];
    secs.filter(([k]) => list.some(i => i.sec === k)).forEach(([k, nome]) => {
      const l = list.filter(i => i.sec === k);
      rows.push({ sec: `${nome} (${l.length} itens)` });
      l.forEach(i => {
        const m = catalog.mono[i.key], s = catalog.safety[i.key], e = stock[i.code];
        const alerta = [s?.ismp ? 'Alta vigilância (ISMP): ' + s.ismp : '', s?.hep ? (s.hep === 2 ? 'Hepatotóxico' : 'Hepato: atenção') : '', s?.nef ? (s.nef === 2 ? 'Nefrotóxico' : 'Nefro: atenção') : ''].filter(Boolean).join('; ');
        rows.push([i.code, i.desc, m?.c || '', e ? (e.inv == null || e.inv < 0 ? 'não informado' : String(e.inv)) : '—', e ? e.cmm.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '—', alerta || '—']);
      });
    });
    const u = P.build({
      titulo: 'Medicamentos do ICAM – lista original',
      sub: `${unit ? 'Unidade: ' + unit + '. ' : ''}${list.length} itens${sec ? ' · tipo: ' + catalog.sec[sec] : ''}${q ? ' · busca: "' + q + '"' : ''}.`,
      cols: [{ h: 'Código', w: 0.8 }, { h: 'Medicamento (descrição)', w: 4 }, { h: 'Classe', w: 2.4 }, { h: 'Estoque', w: 1 }, { h: 'Consumo mensal', w: 1.2 }, { h: 'Alertas de segurança', w: 3 }],
      rows,
      nota: 'Lista transcrita de uma lista institucional; conferir com o cadastro oficial. Estoque e consumo mensal vêm do que foi informado neste navegador. Alertas: ISMP Brasil e níveis de hepato e nefrotoxicidade do guia, com fonte em cada ficha.',
      rodape: 'Medicamentos do ICAM',
    });
    P.save('PharmaCentral-medicamentos-ICAM.pdf', u);
  };

  return (
    <section id="icam-meds" className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900" style={{ fontFamily: 'var(--f-display)' }}>Medicamentos do ICAM</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">Lista original transcrita, por forma e tipo, com classe, via e alertas de segurança. Mostra o estoque e o consumo mensal quando já foram informados.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={report} disabled={!list.length} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50">Gerar relatório em PDF</button>
          {onHide && <button onClick={onHide} className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-sm">Ocultar</button>}
        </div>
      </div>

      {!catalog && <p className="text-sm text-slate-500">Carregando lista…</p>}
      {catalog && (<>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por descrição ou código" aria-label="Buscar medicamento"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
          <select value={sec} onChange={e => setSec(e.target.value)} aria-label="Tipo" className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white">
            <option value="">Todos os tipos ({items.length})</option>
            {secs.map(([k, nome, n]) => <option key={k} value={k}>{nome} ({n})</option>)}
          </select>
        </div>
        <p className="text-sm text-slate-600"><b>{list.length}</b> medicamentos</p>
        <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.slice(0, shown).map(i => {
            const m = catalog.mono[i.key], e = stock[i.code];
            return (
              <li key={i.code + i.desc} className="border border-slate-200 rounded-xl p-3 space-y-1">
                <p className="text-xs text-slate-500">Cód. {i.code} · {catalog.sec[i.sec]}</p>
                <p className="text-sm font-semibold text-slate-900 leading-snug">{i.desc}</p>
                {m?.c && <p className="text-xs text-slate-600">{m.c}</p>}
                {e && <p className="text-xs text-slate-700">Estoque <b>{e.inv == null || e.inv < 0 ? 'não informado' : e.inv}</b> · consumo mensal <b>{e.cmm.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</b></p>}
                <CatalogBadges cafCode={i.code} catalog={catalog} />
              </li>
            );
          })}
        </ul>
        {list.length === 0 && <p className="text-sm text-slate-500">Nenhum medicamento encontrado. Limpe a busca ou escolha outro tipo.</p>}
        {shown < list.length && (
          <button onClick={() => setShown(s => s + PAGE * 4)} className="w-full py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Mostrar mais ({list.length - shown} restantes)
          </button>
        )}
      </>)}
    </section>
  );
}
