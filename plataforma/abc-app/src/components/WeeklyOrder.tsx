import * as React from 'react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import type { ABCResult } from '../types';
import { guideLink, type Catalog } from '../lib/catalog';

const STATUS: Record<ABCResult['status'], { t: string; c: string }> = {
  'sem-estoque-informado': { t: 'Estoque não informado', c: 'bg-slate-100 text-slate-600' },
  'abaixo-emergencia': { t: 'Abaixo do estoque de emergência', c: 'bg-red-100 text-red-700' },
  'abaixo-ponto-pedido': { t: 'Abaixo do ponto de pedido', c: 'bg-amber-100 text-amber-800' },
  ok: { t: 'Adequado', c: 'bg-emerald-100 text-emerald-700' },
};
const n0 = (v: number | null) => (v == null ? '–' : Math.round(v).toLocaleString('pt-BR'));

export function WeeklyOrder({ results, reviewDays, setReviewDays, catalog }: {
  results: ABCResult[]; reviewDays: number; setReviewDays: (n: number) => void; catalog: Catalog | null;
}) {
  const [only, setOnly] = useState(true);
  const rows = useMemo(() => results.filter(r => !only || (r.suggestedOrder ?? 0) > 0 || r.status === 'abaixo-emergencia'), [results, only]);
  const totalOrder = rows.reduce((s, r) => s + (r.suggestedOrder ?? 0) * r.unitCost, 0);
  const caf = (r: ABCResult) => r.cafCode || '';

  const exportXlsx = () => {
    const ws = XLSX.utils.json_to_sheet(results.map(r => ({
      'Código': caf(r), 'Medicamento': r.name, 'Classe ABC': r.classification,
      'Estoque atual': r.currentInventory === -1 ? '' : r.currentInventory,
      'Consumo diário médio': +r.avgDailyConsumption.toFixed(2), 'Lead time (dias)': r.leadTimeDays,
      'Estoque de emergência': r.safetyStock, 'Ponto de pedido': r.reorderPoint,
      'PADRÃO': r.targetStock, 'PEDIDO': r.suggestedOrder ?? '',
      'Cobertura (dias)': r.coverageDays == null ? '' : +r.coverageDays.toFixed(1),
      'Situação': STATUS[r.status].t, 'Custo estimado do pedido': r.suggestedOrder ? +(r.suggestedOrder * r.unitCost).toFixed(2) : '',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedido semanal');
    XLSX.writeFile(wb, `pedido_semanal_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" aria-labelledby="po-h">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h3 id="po-h" className="text-lg font-semibold">Pedido semanal: PADRÃO e PEDIDO</h3>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            PADRÃO = CMD × (lead time + ciclo de revisão) + estoque de emergência. PEDIDO = PADRÃO − estoque atual (se positivo).
            Método proposto a partir de referências de gestão de estoque; ajuste ao protocolo da sua CAF. Sem estoque informado, o PEDIDO não é calculado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <label className="flex items-center gap-2">Ciclo de revisão (dias)
            <input type="number" min={1} value={reviewDays} onChange={e => setReviewDays(Math.max(1, Number(e.target.value) || 7))} className="w-16 px-2 py-1 border border-slate-200 rounded-lg" />
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> Só itens com pedido</label>
          <button onClick={exportXlsx} className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black">Exportar planilha do pedido</button>
        </div>
      </div>
      {rows.length === 0 ? <p className="text-sm text-slate-500 py-6 text-center">Nenhum item com pedido sugerido. Informe o estoque atual dos itens para calcular.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-3">Medicamento</th><th className="px-2 text-center">Classe</th><th className="px-2 text-right">Estoque</th><th className="px-2 text-right">Cobertura (d)</th>
              <th className="px-2 text-right">Pt. pedido</th><th className="px-2 text-right">PADRÃO</th><th className="px-2 text-right">PEDIDO</th><th className="px-2">Situação</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="py-2 pr-3 font-semibold">{r.name}{caf(r) && <> <a className="text-blue-600 text-[11px] font-bold underline" href={guideLink(caf(r))} target="_blank" rel="noopener noreferrer">PosologiaPED</a></>}</td>
                  <td className="px-2 text-center font-black">{r.classification}</td>
                  <td className="px-2 text-right tabular-nums">{r.currentInventory === -1 ? '–' : n0(r.currentInventory)}</td>
                  <td className="px-2 text-right tabular-nums">{r.coverageDays == null ? '–' : r.coverageDays.toFixed(1)}</td>
                  <td className="px-2 text-right tabular-nums">{n0(r.reorderPoint)}</td>
                  <td className="px-2 text-right tabular-nums">{n0(r.targetStock)}</td>
                  <td className="px-2 text-right tabular-nums font-black">{n0(r.suggestedOrder)}</td>
                  <td className="px-2"><span className={`px-2 py-0.5 rounded text-[11px] font-bold ${STATUS[r.status].c}`}>{STATUS[r.status].t}</span></td>
                </tr>))}
            </tbody>
          </table>
          {totalOrder > 0 && <p className="text-xs text-slate-500 mt-3">Custo estimado dos pedidos listados (com os custos unitários informados): <b>{totalOrder.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b></p>}
        </div>)}
      {catalog == null && <p className="text-[11px] text-slate-400 mt-2">Lista de exemplo não carregada: selos de segurança indisponíveis.</p>}
    </section>
  );
}
