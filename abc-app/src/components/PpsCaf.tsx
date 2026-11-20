import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

type Pps = { c: string; d: string; m: number; k: string; f: string; n: string; p: string | null; s: string | null; u: string | null; i: boolean };
const BASE = import.meta.env.BASE_URL;
const PAGE = 24;
let cache: Promise<Pps[] | null> | null = null;
const load = () => (cache ??= fetch(`${BASE}data/pps.json`).then(r => (r.ok ? r.json() : null)).catch(() => null));

/** PPS (produtos para saúde) do CAF, lista do ICAM: foto ilustrativa, descrição, CMM e função de cada item. */
export function PpsCaf({ unit, onHide }: { unit: string; onHide?: () => void }) {
  const [items, setItems] = useState<Pps[] | null>(null);
  const [fail, setFail] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [busy, setBusy] = useState(false);
  useEffect(() => { load().then(d => (d ? setItems(d) : setFail(true))); }, []);
  useEffect(() => setShown(PAGE), [q, cat]);

  const cats = useMemo(() => {
    const m = new Map<string, number>();
    (items || []).forEach(i => m.set(i.k, (m.get(i.k) || 0) + 1));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [items]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (items || []).filter(i => (!cat || i.k === cat) && (!t || (i.d + ' ' + i.c + ' ' + i.n).toLowerCase().includes(t)));
  }, [items, q, cat]);
  const soma = list.reduce((s, i) => s + i.m, 0);
  const semFoto = list.filter(i => !i.p).length;

  const report = async () => {
    const P = (window as any).PCPDF;
    if (!P || !list.length) return;
    setBusy(true);
    try {
      const imgs: Record<string, any> = {};
      const files = [...new Set(list.map(i => i.p).filter(Boolean) as string[])];
      await Promise.all(files.map(async f => {
        try {
          const buf = new Uint8Array(await (await fetch(`${BASE}pps/${f}`)).arrayBuffer());
          // dimensões do JPEG (marcador SOF)
          let w = 0, h = 0;
          for (let p = 2; p < buf.length - 9;) {
            if (buf[p] !== 0xff) { p++; continue; }
            const mk = buf[p + 1];
            if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) { h = (buf[p + 5] << 8) | buf[p + 6]; w = (buf[p + 7] << 8) | buf[p + 8]; break; }
            p += 2 + ((buf[p + 2] << 8) | buf[p + 3]);
          }
          if (!w || !h) return;
          let s = ''; for (let k = 0; k < buf.length; k += 8192) s += String.fromCharCode.apply(null, buf.subarray(k, k + 8192) as any);
          imgs[f] = { b64: btoa(s), w, h, pw: w, ph: h };
        } catch { /* item sai sem foto */ }
      }));
      const rows: any[] = [];
      const porCat = new Map<string, Pps[]>();
      list.forEach(i => porCat.set(i.k, [...(porCat.get(i.k) || []), i]));
      [...porCat.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR')).forEach(([k, l]) => {
        rows.push({ sec: `${k} (${l.length} itens)` });
        l.forEach(i => rows.push([imgs[i.p || ''] ? { img: i.p } : 'sem foto', i.c, i.d + (i.i ? ' [CMM a confirmar]' : ''), String(i.m), i.f]));
      });
      const u = P.build({
        titulo: 'PPS no CAF – lista do ICAM',
        sub: `${unit ? 'Unidade: ' + unit + '. ' : ''}${list.length} itens${cat ? ' · categoria: ' + cat : ''}${q ? ' · busca: "' + q + '"' : ''} · CMM somado: ${soma.toLocaleString('pt-BR')}.`,
        cols: [{ h: 'Foto', w: 1.1 }, { h: 'Código', w: 0.9 }, { h: 'Material (descrição)', w: 4 }, { h: 'CMM', w: 0.8 }, { h: 'Função / uso', w: 4.6 }],
        rows, imgs, imgMax: 50,
        nota: 'CMM = consumo médio mensal. Fotos ilustrativas por tipo de produto (não a marca do item); função descrita de forma geral, sem substituir a especificação técnica. Fontes das fotos: Wikimedia Commons/Openverse (com licença) e páginas de lojas de materiais hospitalares.',
        rodape: 'PPS no CAF',
        autores: 'Autores: Micael Davi Lima de Oliveira (ICAM) e Ennylay (ICAM)',
      });
      P.save('PharmaCentral-PPS-CAF-ICAM.pdf', u);
    } finally { setBusy(false); }
  };

  return (
    <section id="pps-caf" className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900" style={{ fontFamily: 'var(--f-display)' }}>PPS no CAF</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">Produtos para saúde da lista do ICAM no Centro de Abastecimento Farmacêutico, com foto ilustrativa, consumo médio mensal (CMM) e função de cada item.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={report} disabled={busy || !list.length} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
            {busy ? 'Gerando PDF…' : 'Gerar relatório em PDF'}
          </button>
          {onHide && <button onClick={onHide} className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-sm">Ocultar</button>}
        </div>
      </div>

      {fail && <p className="text-sm text-red-600">Não foi possível carregar a lista de PPS.</p>}
      {!items && !fail && <p className="text-sm text-slate-500">Carregando lista…</p>}

      {items && (<>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por descrição ou código" aria-label="Buscar PPS"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
          <select value={cat} onChange={e => setCat(e.target.value)} aria-label="Categoria" className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white">
            <option value="">Todas as categorias ({items.length})</option>
            {cats.map(([k, n]) => <option key={k} value={k}>{k} ({n})</option>)}
          </select>
        </div>
        <p className="text-sm text-slate-600"><b>{list.length}</b> itens · CMM somado <b>{soma.toLocaleString('pt-BR')}</b>{semFoto > 0 && <> · {semFoto} sem foto</>}</p>

        <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.slice(0, shown).map(i => (
            <li key={i.c} className="border border-slate-200 rounded-xl p-3 flex gap-3">
              <div className="w-24 h-24 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {i.p ? <img src={`${BASE}pps/${i.p}`} alt={i.n} loading="lazy" className="max-w-full max-h-full object-contain" title={i.s || ''} />
                  : <span className="text-[11px] text-slate-400 text-center px-1">sem foto</span>}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-slate-500">Cód. {i.c} · {i.k}</p>
                <p className="text-sm font-semibold text-slate-900 leading-snug">{i.d}</p>
                <p className="text-sm text-slate-700"><b>CMM {i.m.toLocaleString('pt-BR')}</b>{i.i && <span className="text-amber-700"> (confirmar)</span>}</p>
                <p className="text-xs text-slate-600 leading-snug">{i.f}</p>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="text-sm text-slate-500">Nenhum item encontrado. Limpe a busca ou escolha outra categoria.</p>}
        {shown < list.length && (
          <button onClick={() => setShown(s => s + PAGE * 4)} className="w-full py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Mostrar mais ({list.length - shown} restantes)
          </button>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 max-w-2xl">Fotos ilustrativas por tipo de produto, não a marca do item. Origem e licença no passar do mouse sobre a foto e no relatório.</p>
          <button onClick={report} disabled={busy || !list.length} className="px-5 py-2.5 border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-xl font-semibold text-sm disabled:opacity-50">
            {busy ? 'Gerando PDF…' : 'Gerar relatório (' + list.length + ' itens)'}
          </button>
        </div>
      </>)}
    </section>
  );
}
