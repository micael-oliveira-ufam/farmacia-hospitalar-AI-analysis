import * as React from 'react';
import { REF } from '../lib/catalog';

const L = ({ k }: { k: keyof typeof REF }) => (
  <a className="text-blue-700 underline" href={REF[k].u} target="_blank" rel="noopener noreferrer" title={REF[k].t}>[{k}]</a>
);

export function Methodology() {
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3" aria-labelledby="mt-h">
      <h3 id="mt-h" className="text-lg font-semibold">Metodologia e referências</h3>
      <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
        <li><b>Curva ABC (Pareto):</b> itens ordenados por valor (ou consumo); A até 80% do acumulado, B até 95%, C o restante. Cortes 80/95 são convenção usual; o estudo <L k="ABCP" /> aplica a mesma lógica em farmácia hospitalar.</li>
        <li><b>CMD e estoque de emergência:</b> CMD = consumo mensal ÷ 30; EE = (CMD máximo − CMD) × lead time. Conceitos de ciclo logístico e estoque de segurança em <L k="MSAF" /> e <L k="MSH" />. Sem consumo máximo informado, estima-se 1,5 × a média (premissa deste aplicativo, não de literatura).</li>
        <li><b>Ponto de pedido, PADRÃO e PEDIDO:</b> método proposto neste aplicativo (CMD × lead time + EE; CMD × (lead time + ciclo) + EE; PADRÃO − estoque). Ajuste ao protocolo da CAF.</li>
        <li><b>Selos de segurança (itens da lista de exemplo):</b> alta vigilância conforme <L k="ISMP" />; atenção renal/hepática é escala interna do guia, apoiada em <L k="NEFRO" /> e <L k="LTOX" />.</li>
        <li><b>Preços via IA:</b> a consulta usa um modelo de IA com busca na web e <b>pode errar</b>. Confira sempre na tabela oficial <L k="CMED" /> antes de usar o valor em compras.</li>
      </ul>
      <p className="text-[11px] text-slate-500">Os links “busca” abrem uma pesquisa, pois não foi possível confirmar um endereço direto. Detalhes e níveis de verificação no guia de doses (aba Referências).</p>
    </section>
  );
}
