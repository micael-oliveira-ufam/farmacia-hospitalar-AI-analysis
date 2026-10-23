import assert from 'node:assert/strict';
import { calculateABC, type Medication } from '../src/types.ts';

const base = (o: Partial<Medication>): Medication => ({ id: 'x', name: 'x', annualConsumption: 1200, unitCost: 1, leadTimeDays: 10, ...o });
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log('ok', name); };

t('CMD, EE (1,5x), ponto de pedido, PADRÃO e PEDIDO', () => {
  // consumo anual 1200 → mensal 100 → CMD 3,333…; máx mensal 150 → 5/dia; EE = (5−3,333)×10 = 16,67 → 17
  const [r] = calculateABC([base({ currentInventory: 40 })], 'VALUE', 7);
  assert.equal(r.safetyStock, 17);
  assert.equal(r.reorderPoint, Math.ceil(100 / 30 * 10 + 17)); // 51
  assert.equal(r.targetStock, Math.ceil(100 / 30 * 17 + 17));  // 74
  assert.equal(r.suggestedOrder, 74 - 40);
  assert.equal(r.status, 'abaixo-ponto-pedido');
  assert.ok(Math.abs(r.coverageDays! - 12) < 1e-9);
});
t('estoque não informado → sem PEDIDO e sem cobertura', () => {
  const [r] = calculateABC([base({})]);
  assert.equal(r.currentInventory, -1); assert.equal(r.suggestedOrder, null);
  assert.equal(r.coverageDays, null); assert.equal(r.status, 'sem-estoque-informado');
});
t('abaixo da emergência e adequado', () => {
  assert.equal(calculateABC([base({ currentInventory: 5 })])[0].status, 'abaixo-emergencia');
  const ok = calculateABC([base({ currentInventory: 500 })])[0];
  assert.equal(ok.status, 'ok'); assert.equal(ok.suggestedOrder, 0);
});
t('consumo máximo informado substitui a estimativa', () => {
  const [r] = calculateABC([base({ maxMonthlyConsumption: 130 })]);
  assert.equal(r.safetyStock, Math.ceil((130 / 30 - 100 / 30) * 10)); // 10
});
t('curva ABC: cortes 80% / 95% e ordenação', () => {
  const meds = [70, 15, 8, 4, 3].map((v, i) => base({ id: 'm' + i, name: 'm' + i, annualConsumption: v, unitCost: 1 }));
  const r = calculateABC(meds, 'VALUE');
  assert.deepEqual(r.map(x => x.name), ['m0', 'm1', 'm2', 'm3', 'm4']);
  assert.deepEqual(r.map(x => x.classification), ['A', 'B', 'B', 'C', 'C'].map((c, i) => (i === 0 ? 'A' : c))); // 70 A | 85 B | 93 B | 97 C | 100 C
});
t('classificação manual prevalece', () => {
  const r = calculateABC([base({ manualClassification: 'C' })]);
  assert.equal(r[0].classification, 'C');
});
t('modo CONSUMPTION ordena por volume', () => {
  const r = calculateABC([base({ id: 'a', annualConsumption: 10, unitCost: 100 }), base({ id: 'b', annualConsumption: 50, unitCost: 1 })], 'CONSUMPTION');
  assert.equal(r[0].id, 'b');
});
console.log(n + ' testes passaram');
