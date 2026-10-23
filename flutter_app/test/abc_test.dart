import 'package:flutter_test/flutter_test.dart';
import 'package:farmacia_integrada/abc.dart';

Med base({String id = 'x', double annual = 1200, double cost = 1, double lead = 10, double? inv, double? max, String? manual}) =>
    Med(id: id, name: id, annual: annual, unitCost: cost, leadTime: lead, inventory: inv, maxMonthly: max, manualClass: manual);

void main() {
  test('CMD, EE (1,5x), ponto de pedido, PADRÃO e PEDIDO', () {
    final r = calculateAbc([base(inv: 40)], reviewDays: 7).first;
    expect(r.safetyStock, 17);
    expect(r.reorderPoint, 51);
    expect(r.targetStock, 74);
    expect(r.suggestedOrder, 34);
    expect(r.status, StockStatus.abaixoPontoPedido);
    expect(r.coverageDays!, closeTo(12, 1e-9));
  });
  test('estoque não informado: sem PEDIDO e sem cobertura', () {
    final r = calculateAbc([base()]).first;
    expect(r.suggestedOrder, isNull);
    expect(r.coverageDays, isNull);
    expect(r.status, StockStatus.semEstoque);
  });
  test('abaixo da emergência e adequado', () {
    expect(calculateAbc([base(inv: 5)]).first.status, StockStatus.abaixoEmergencia);
    final ok = calculateAbc([base(inv: 500)]).first;
    expect(ok.status, StockStatus.ok);
    expect(ok.suggestedOrder, 0);
  });
  test('consumo máximo informado substitui a estimativa', () {
    expect(calculateAbc([base(max: 130)]).first.safetyStock, 10);
  });
  test('curva ABC: cortes 80/95 e ordenação', () {
    final meds = [70, 15, 8, 4, 3].asMap().entries.map((e) => base(id: 'm${e.key}', annual: e.value.toDouble())).toList();
    final r = calculateAbc(meds);
    expect(r.map((x) => x.med.id).toList(), ['m0', 'm1', 'm2', 'm3', 'm4']);
    expect(r.map((x) => x.cls).toList(), ['A', 'B', 'B', 'C', 'C']);
  });
  test('classificação manual prevalece; modo consumo ordena por volume', () {
    expect(calculateAbc([base(manual: 'C')]).first.cls, 'C');
    final r = calculateAbc([base(id: 'a', annual: 10, cost: 100), base(id: 'b', annual: 50, cost: 1)], mode: AbcMode.consumption);
    expect(r.first.med.id, 'b');
  });
  test('CSV: importa consumo mensal, aceita ; e vírgula decimal', () {
    final meds = parseCsv('Medicamento;Codigo;ConsumoMensal;Estoque;LeadTime\nDipirona 500 mg;12;100;40;10\n"Soro, 0,9%";13;50,5;;7\n');
    expect(meds.length, 2);
    expect(meds[0].annual, 1200);
    expect(meds[0].inventory, 40);
    expect(meds[1].name, 'Soro, 0,9%');
    expect(meds[1].annual, closeTo(606, 1e-9));
    expect(meds[1].inventory, isNull);
  });
  test('backup: ida e volta (formato do app web)', () {
    final m = base(id: 'k', inv: 3, manual: 'B');
    final back = restoreBackup(backupJson([m]));
    expect(back.length, 1);
    expect(back.first.inventory, 3);
    expect(back.first.manualClass, 'B');
    expect(back.first.annual, 1200);
  });
}
