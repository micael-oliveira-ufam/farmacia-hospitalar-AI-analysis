import 'dart:convert';

/// Estoque e Curva ABC (mesma lógica de abc-app/src/types.ts; testes em test/abc_test.dart).
/// Os nomes dos campos do JSON são os mesmos do backup do app web, então o backup é intercambiável.

enum AbcMode { value, consumption }

enum StockStatus { semEstoque, abaixoEmergencia, abaixoPontoPedido, ok }

const int defaultReviewDays = 7;

String statusLabel(StockStatus s) {
  switch (s) {
    case StockStatus.semEstoque:
      return 'Estoque não informado';
    case StockStatus.abaixoEmergencia:
      return 'Abaixo do estoque de emergência';
    case StockStatus.abaixoPontoPedido:
      return 'Abaixo do ponto de pedido';
    case StockStatus.ok:
      return 'Adequado';
  }
}

double? _num(dynamic v) {
  if (v == null) return null;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString().trim().replaceAll(',', '.'));
}

class Med {
  final String id;
  String name;
  String caf;
  String form;
  String concentration;
  double annual; // consumo anual (= consumo mensal x 12)
  double unitCost;
  double leadTime; // dias
  double? maxMonthly; // consumo mensal máximo; null/0 = estimar em 1,5 x a média
  double? inventory; // null = não informado
  String? manualClass; // 'A', 'B', 'C' ou null

  Med({
    required this.id,
    required this.name,
    this.caf = '',
    this.form = '',
    this.concentration = '',
    this.annual = 0,
    this.unitCost = 0,
    this.leadTime = 7,
    this.maxMonthly,
    this.inventory,
    this.manualClass,
  });

  double get monthly => annual / 12;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'cafCode': caf,
        'pharmaceuticalForm': form,
        'concentration': concentration,
        'annualConsumption': annual,
        'unitCost': unitCost,
        'leadTimeDays': leadTime,
        'maxMonthlyConsumption': maxMonthly,
        'currentInventory': inventory,
        'manualClassification': manualClass,
      };

  factory Med.fromJson(Map<String, dynamic> j) {
    final mc = j['manualClassification'];
    return Med(
      id: (j['id'] ?? DateTime.now().microsecondsSinceEpoch.toString()).toString(),
      name: (j['name'] ?? '').toString(),
      caf: (j['cafCode'] ?? '').toString(),
      form: (j['pharmaceuticalForm'] ?? '').toString(),
      concentration: (j['concentration'] ?? '').toString(),
      annual: _num(j['annualConsumption']) ?? 0,
      unitCost: _num(j['unitCost']) ?? 0,
      leadTime: _num(j['leadTimeDays']) ?? 7,
      maxMonthly: _num(j['maxMonthlyConsumption']),
      inventory: (_num(j['currentInventory']) ?? -1) < 0 ? null : _num(j['currentInventory']),
      manualClass: (mc == 'A' || mc == 'B' || mc == 'C') ? mc as String : null,
    );
  }
}

class AbcRow {
  final Med med;
  final double totalValue, monthly, avgDaily, maxMonthly, analysisValue;
  final int safetyStock, reorderPoint, targetStock;
  final int? suggestedOrder;
  final double? coverageDays;
  final StockStatus status;
  double cumulativePct = 0;
  String cls = 'C';
  AbcRow({
    required this.med,
    required this.totalValue,
    required this.monthly,
    required this.avgDaily,
    required this.maxMonthly,
    required this.analysisValue,
    required this.safetyStock,
    required this.reorderPoint,
    required this.targetStock,
    required this.suggestedOrder,
    required this.coverageDays,
    required this.status,
  });
}

/// Curva ABC e parâmetros de estoque.
/// Classes: A até 80% do acumulado, B até 95%, C o restante. CMD = consumo mensal / 30.
/// EE = (CMD máx - CMD) x lead time. Ponto de pedido = CMD x lead + EE.
/// PADRÃO = CMD x (lead + revisão) + EE. PEDIDO = máx(0, PADRÃO - estoque).
List<AbcRow> calculateAbc(List<Med> meds, {AbcMode mode = AbcMode.value, int reviewDays = defaultReviewDays}) {
  if (meds.isEmpty) return [];
  final rows = <AbcRow>[];
  for (final m in meds) {
    final totalValue = m.annual * m.unitCost;
    final monthly = m.annual / 12;
    final maxMonthly = (m.maxMonthly ?? 0) > 0 ? m.maxMonthly! : monthly * 1.5;
    final avgDaily = monthly / 30;
    final maxDaily = maxMonthly / 30;
    final safety = ((maxDaily - avgDaily) * m.leadTime).ceil();
    final inv = (m.inventory == null || m.inventory! < 0) ? null : m.inventory;
    final reorder = (avgDaily * m.leadTime + safety).ceil();
    final target = (avgDaily * (m.leadTime + reviewDays) + safety).ceil();
    int? order;
    if (inv != null) {
      final d = target - inv;
      order = d > 0 ? d.ceil() : 0;
    }
    final coverage = (inv == null || avgDaily <= 0) ? null : inv / avgDaily;
    StockStatus status;
    if (inv == null) {
      status = StockStatus.semEstoque;
    } else if (inv < safety) {
      status = StockStatus.abaixoEmergencia;
    } else if (inv < reorder) {
      status = StockStatus.abaixoPontoPedido;
    } else {
      status = StockStatus.ok;
    }
    rows.add(AbcRow(
      med: m,
      totalValue: totalValue,
      monthly: monthly,
      avgDaily: avgDaily,
      maxMonthly: maxMonthly,
      analysisValue: mode == AbcMode.value ? totalValue : m.annual,
      safetyStock: safety,
      reorderPoint: reorder,
      targetStock: target,
      suggestedOrder: order,
      coverageDays: coverage,
      status: status,
    ));
  }
  // ordenação decrescente e estável (empates mantêm a ordem original)
  final idx = List<int>.generate(rows.length, (i) => i);
  idx.sort((a, b) {
    final c = rows[b].analysisValue.compareTo(rows[a].analysisValue);
    return c != 0 ? c : a.compareTo(b);
  });
  final sorted = idx.map((i) => rows[i]).toList();
  final grand = sorted.fold<double>(0, (s, r) => s + r.analysisValue);
  var running = 0.0;
  for (final r in sorted) {
    running += r.analysisValue;
    r.cumulativePct = grand > 0 ? running / grand * 100 : 0;
    if (r.med.manualClass != null) {
      r.cls = r.med.manualClass!;
    } else if (r.cumulativePct <= 80) {
      r.cls = 'A';
    } else if (r.cumulativePct <= 95) {
      r.cls = 'B';
    } else {
      r.cls = 'C';
    }
  }
  return sorted;
}

/* ------------------------------------------------------------ importação / exportação */

String _norm(String s) {
  const from = 'áàâãäéèêëíìîïóòôõöúùûüçñ';
  const to = 'aaaaaeeeeiiiiooooouuuucn';
  final b = StringBuffer();
  for (final ch in s.toLowerCase().trim().split('')) {
    final i = from.indexOf(ch);
    b.write(i >= 0 ? to[i] : ch);
  }
  return b.toString().replaceAll(RegExp(r'[^a-z0-9]'), '');
}

List<String> _splitLine(String line, String sep) {
  final out = <String>[];
  final cur = StringBuffer();
  var q = false;
  for (var i = 0; i < line.length; i++) {
    final ch = line[i];
    if (ch == '"') {
      if (q && i + 1 < line.length && line[i + 1] == '"') {
        cur.write('"');
        i++;
      } else {
        q = !q;
      }
    } else if (ch == sep && !q) {
      out.add(cur.toString());
      cur.clear();
    } else {
      cur.write(ch);
    }
  }
  out.add(cur.toString());
  return out;
}

/// Lê CSV/TSV colado (primeira linha = cabeçalho). Colunas aceitas (iguais às do app web):
/// Medicamento|Nome|Item, Codigo|CAF, ConsumoMensal|Consumo, ConsumoMaximo, Estoque|Inventario, LeadTime|prazo,
/// CustoUnitario|custo, Forma, Concentracao. O consumo informado é MENSAL.
List<Med> parseCsv(String text) {
  final lines = text.split(RegExp(r'\r?\n')).where((l) => l.trim().isNotEmpty).toList();
  if (lines.length < 2) return [];
  final first = lines.first;
  final sep = first.contains('\t') ? '\t' : (first.split(';').length >= first.split(',').length ? ';' : ',');
  final head = _splitLine(first, sep).map(_norm).toList();
  int col(List<String> names) {
    for (final n in names) {
      final i = head.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  }

  final cName = col(['medicamento', 'nome', 'name', 'item']);
  if (cName < 0) return [];
  final cCaf = col(['caf', 'codigocaf', 'codigo']);
  final cCons = col(['consumomensal', 'consumo', 'consumption']);
  final cMax = col(['consumomaximo', 'maxconsumption']);
  final cInv = col(['estoque', 'inventario', 'inventory', 'stock']);
  final cLead = col(['leadtime', 'prazo']);
  final cCost = col(['custounitario', 'custo', 'unitcost', 'preco']);
  final cForm = col(['formafarmaceutica', 'forma', 'form']);
  final cConc = col(['concentracao', 'concentration']);

  String at(List<String> r, int c) => (c >= 0 && c < r.length) ? r[c].trim() : '';
  final out = <Med>[];
  var n = 0;
  for (final l in lines.skip(1)) {
    final r = _splitLine(l, sep);
    final name = at(r, cName);
    if (name.isEmpty) continue;
    final invText = at(r, cInv);
    out.add(Med(
      id: '${DateTime.now().microsecondsSinceEpoch}-${n++}',
      name: name,
      caf: at(r, cCaf),
      form: at(r, cForm),
      concentration: at(r, cConc),
      annual: (_num(at(r, cCons)) ?? 0) * 12,
      unitCost: _num(at(r, cCost)) ?? 0,
      leadTime: _num(at(r, cLead)) ?? 7,
      maxMonthly: _num(at(r, cMax)),
      inventory: invText.isEmpty ? null : _num(invText),
    ));
  }
  return out;
}

String _q(String s) => '"${s.replaceAll('"', '""')}"';
String _n(num v, [int d = 2]) => v.toStringAsFixed(d).replaceAll('.', ',');

/// Planilha da curva ABC e do pedido (CSV com ponto e vírgula, abre no Excel).
String resultsCsv(List<AbcRow> rows) {
  final b = StringBuffer('Código;Medicamento;Classe ABC;Estoque atual;Consumo diário médio;Lead time (dias);'
      'Estoque de emergência;Ponto de pedido;PADRÃO;PEDIDO;Cobertura (dias);Situação;Custo estimado do pedido\n');
  for (final r in rows) {
    final m = r.med;
    b.writeln([
      _q(m.caf),
      _q(m.name),
      r.cls,
      m.inventory == null ? '' : _n(m.inventory!, 0),
      _n(r.avgDaily),
      _n(m.leadTime, 0),
      r.safetyStock,
      r.reorderPoint,
      r.targetStock,
      r.suggestedOrder ?? '',
      r.coverageDays == null ? '' : _n(r.coverageDays!, 1),
      _q(statusLabel(r.status)),
      (r.suggestedOrder ?? 0) > 0 ? _n((r.suggestedOrder ?? 0) * m.unitCost) : '',
    ].join(';'));
  }
  return b.toString();
}

/// Backup no mesmo formato do app web.
String backupJson(List<Med> meds) => const JsonEncoder.withIndent(' ').convert({
      'versao': 1,
      'hospitalId': 'android',
      'exportadoEm': DateTime.now().toIso8601String(),
      'medicamentos': meds.map((m) => m.toJson()).toList(),
    });

List<Med> restoreBackup(String json) {
  final o = jsonDecode(json);
  if (o is! Map || o['medicamentos'] is! List) throw const FormatException('Backup inválido.');
  return (o['medicamentos'] as List).map((e) => Med.fromJson(Map<String, dynamic>.from(e as Map))).toList();
}
