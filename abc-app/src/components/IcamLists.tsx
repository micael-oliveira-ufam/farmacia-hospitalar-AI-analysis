import * as React from 'react';
import { useState } from 'react';
import { PpsCaf } from './PpsCaf';
import { IcamMeds, type StockInfo } from './IcamMeds';
import type { Catalog } from '../lib/catalog';

const KEY = 'estoque-listas-visiveis';
const read = () => { try { return { meds: true, pps: true, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { meds: true, pps: true }; } };

/** Listas do ICAM no Estoque (medicamentos e PPS) com opção de ocultar cada uma; a escolha fica neste navegador. */
export function IcamLists({ unit, catalog, stock }: { unit: string; catalog: Catalog | null; stock: Record<string, StockInfo> }) {
  const [show, setShow] = useState<{ meds: boolean; pps: boolean }>(read);
  const set = (k: 'meds' | 'pps', v: boolean) => setShow(s => { const n = { ...s, [k]: v }; try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* sem armazenamento */ } return n; });
  const chip = (k: 'meds' | 'pps', label: string) => (
    <button type="button" onClick={() => set(k, !show[k])} aria-pressed={show[k]}
      className={'px-4 py-2 rounded-full text-sm font-semibold border ' + (show[k] ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50')}>
      {show[k] ? '✓ ' : ''}{label}
    </button>
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl border border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-slate-700 mr-2">Listas do ICAM:</span>
        {chip('meds', 'Medicamentos')}
        {chip('pps', 'PPS no CAF')}
        <span className="text-xs text-slate-500 ml-1">Toque para mostrar ou ocultar.</span>
      </div>
      {show.meds && <IcamMeds unit={unit} catalog={catalog} stock={stock} onHide={() => set('meds', false)} />}
      {show.pps && <PpsCaf unit={unit} onHide={() => set('pps', false)} />}
    </div>
  );
}
