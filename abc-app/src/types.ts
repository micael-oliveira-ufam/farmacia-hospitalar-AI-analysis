export type ABCCalculationMode = 'VALUE' | 'CONSUMPTION';

export interface Medication {
  id: string;
  name: string;
  cafCode?: string; // código do item (ex.: CAF); liga à lista de exemplo e ao PosologiaPED
  pharmaceuticalForm?: string;
  concentration?: string;
  annualConsumption: number;
  unitCost: number;
  leadTimeDays: number;
  maxMonthlyConsumption?: number; // Optional manual override
  activeUsers?: number;
  currentInventory?: number | null; // null/undefined/-1 = não informado
  manualClassification?: 'A' | 'B' | 'C' | null; // Manual override for ABC class
}

export type StockStatus = 'sem-estoque-informado' | 'abaixo-emergencia' | 'abaixo-ponto-pedido' | 'ok';

export interface ABCResult extends Medication {
  totalValue: number;
  monthlyConsumption: number;
  avgDailyConsumption: number;
  maxMonthlyConsumption: number;
  safetyStock: number;
  currentInventory: number; // -1 = não informado
  cumulativeValue: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
  analysisValue: number;
  /** Ponto de pedido = CMD × lead time + EE */
  reorderPoint: number;
  /** PADRÃO (nível de reposição) = CMD × (lead time + ciclo de revisão) + EE */
  targetStock: number;
  /** PEDIDO sugerido = máx(0, PADRÃO − estoque atual); null se o estoque não foi informado */
  suggestedOrder: number | null;
  /** Cobertura em dias = estoque ÷ CMD; null se não informado ou CMD = 0 */
  coverageDays: number | null;
  status: StockStatus;
}

export const DEFAULT_REVIEW_DAYS = 7;

/**
 * Curva ABC e parâmetros de estoque.
 * - Classes (Pareto): A até 80% do acumulado, B até 95%, C o restante [ABCP].
 * - CMD = consumo mensal ÷ 30. EE = (CMD máx − CMD) × lead time.
 * - Ponto de pedido, PADRÃO e PEDIDO: proposta de método (ver METODOLOGIA.md); ajustar ao protocolo da CAF.
 */
export const calculateABC = (
  medications: Medication[],
  mode: ABCCalculationMode = 'VALUE',
  reviewDays: number = DEFAULT_REVIEW_DAYS,
): ABCResult[] => {
  if (medications.length === 0) return [];

  const results = medications.map(m => {
    const totalValue = m.annualConsumption * m.unitCost;
    const monthlyConsumption = m.annualConsumption / 12;

    // Consumo máximo informado ou estimado em 1,5× a média
    const maxMonthlyConsumption = m.maxMonthlyConsumption || (monthlyConsumption * 1.5);

    const avgDaily = monthlyConsumption / 30;
    const maxDaily = maxMonthlyConsumption / 30;
    const safetyStock = Math.ceil((maxDaily - avgDaily) * m.leadTimeDays);

    const inv = m.currentInventory == null || m.currentInventory < 0 ? -1 : m.currentInventory;
    const reorderPoint = Math.ceil(avgDaily * m.leadTimeDays + safetyStock);
    const targetStock = Math.ceil(avgDaily * (m.leadTimeDays + reviewDays) + safetyStock);
    const suggestedOrder = inv === -1 ? null : Math.max(0, targetStock - inv);
    const coverageDays = inv === -1 || avgDaily <= 0 ? null : inv / avgDaily;
    const status: StockStatus = inv === -1 ? 'sem-estoque-informado'
      : inv < safetyStock ? 'abaixo-emergencia'
      : inv < reorderPoint ? 'abaixo-ponto-pedido' : 'ok';

    const analysisValue = mode === 'VALUE' ? totalValue : m.annualConsumption;

    return {
      ...m,
      totalValue,
      monthlyConsumption,
      avgDailyConsumption: avgDaily,
      maxMonthlyConsumption,
      safetyStock,
      currentInventory: inv,
      cumulativeValue: 0,
      cumulativePercentage: 0,
      classification: 'C' as const,
      analysisValue,
      reorderPoint,
      targetStock,
      suggestedOrder,
      coverageDays,
      status,
    };
  });

  results.sort((a, b) => b.analysisValue - a.analysisValue);

  const grandTotal = results.reduce((sum, item) => sum + item.analysisValue, 0);
  let runningTotal = 0;

  return results.map(item => {
    runningTotal += item.analysisValue;
    const cumulativePercentage = grandTotal > 0 ? (runningTotal / grandTotal) * 100 : 0;

    let classification: 'A' | 'B' | 'C' = 'C';
    if (item.manualClassification) {
      classification = item.manualClassification;
    } else if (cumulativePercentage <= 80) classification = 'A';
    else if (cumulativePercentage <= 95) classification = 'B';

    return { ...item, cumulativeValue: runningTotal, cumulativePercentage, classification };
  });
};
