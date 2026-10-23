import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'abc.dart';
import 'models.dart';
import 'pages.dart' show DetailPage;
import 'util.dart';

const _cmedUrl = 'https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed/precos';

/* ------------------------------------------------------------------ armazenamento local */

class StockStore extends ChangeNotifier {
  final SharedPreferences prefs;
  List<Med> meds = [];
  AbcMode mode = AbcMode.value;
  int reviewDays = defaultReviewDays;
  int _seq = 0;

  StockStore(this.prefs) {
    try {
      final raw = prefs.getString('abc_meds_v1');
      if (raw != null && raw.isNotEmpty) {
        meds = (jsonDecode(raw) as List).map((e) => Med.fromJson(Map<String, dynamic>.from(e as Map))).toList();
      }
    } catch (_) {
      meds = [];
    }
    mode = prefs.getString('abc_mode') == 'consumption' ? AbcMode.consumption : AbcMode.value;
    reviewDays = prefs.getInt('abc_review') ?? defaultReviewDays;
  }

  String newId() => '${DateTime.now().microsecondsSinceEpoch}-${_seq++}';

  void _save() {
    prefs.setString('abc_meds_v1', jsonEncode(meds.map((m) => m.toJson()).toList()));
    notifyListeners();
  }

  void add(Med m) {
    meds.add(m);
    _save();
  }

  void addMany(List<Med> list) {
    meds.addAll(list);
    _save();
  }

  void changed() => _save(); // após editar campos de um Med existente

  void remove(Med m) {
    meds.removeWhere((x) => x.id == m.id);
    _save();
  }

  void replaceAll(List<Med> list) {
    meds = list;
    _save();
  }

  void setMode(AbcMode m) {
    mode = m;
    prefs.setString('abc_mode', m == AbcMode.value ? 'value' : 'consumption');
    notifyListeners();
  }

  void setReview(int d) {
    reviewDays = d < 1 ? 1 : d;
    prefs.setInt('abc_review', reviewDays);
    notifyListeners();
  }

  List<AbcRow> get rows => calculateAbc(meds, mode: mode, reviewDays: reviewDays);
}

/* ------------------------------------------------------------------ módulo */

class StockHome extends StatefulWidget {
  final Catalog catalog;
  final SharedPreferences prefs;
  const StockHome({super.key, required this.catalog, required this.prefs});
  @override
  State<StockHome> createState() => _StockHomeState();
}

class _StockHomeState extends State<StockHome> {
  late final StockStore store = StockStore(widget.prefs);
  int tab = 0;

  @override
  void dispose() {
    store.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final titles = ['Itens', 'Curva ABC', 'Pedido semanal', 'Dados e método'];
    return Scaffold(
      appBar: AppBar(title: Text('FarmaGestão · ${titles[tab]}'), toolbarHeight: 48),
      floatingActionButton: tab == 0
          ? FloatingActionButton(
              tooltip: 'Novo item',
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => MedEditPage(store: store, catalog: widget.catalog, prefs: widget.prefs, med: null))),
              child: const Icon(Icons.add),
            )
          : null,
      body: SafeArea(
        child: AnimatedBuilder(
          animation: store,
          builder: (context, _) {
            switch (tab) {
              case 0:
                return _ItemsTab(store: store, catalog: widget.catalog, prefs: widget.prefs);
              case 1:
                return _AbcTab(store: store);
              case 2:
                return _OrderTab(store: store);
              default:
                return _DataTab(store: store, catalog: widget.catalog);
            }
          },
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.inventory_2_outlined), label: 'Itens'),
          NavigationDestination(icon: Icon(Icons.bar_chart_outlined), label: 'Curva ABC'),
          NavigationDestination(icon: Icon(Icons.local_shipping_outlined), label: 'Pedido'),
          NavigationDestination(icon: Icon(Icons.storage_outlined), label: 'Dados'),
        ],
      ),
    );
  }
}

Color _clsColor(String c) => c == 'A' ? Colors.red.shade700 : (c == 'B' ? Colors.amber.shade800 : Colors.green.shade700);

Color _statusColor(StockStatus s) {
  switch (s) {
    case StockStatus.semEstoque:
      return Colors.blueGrey;
    case StockStatus.abaixoEmergencia:
      return Colors.red.shade700;
    case StockStatus.abaixoPontoPedido:
      return Colors.amber.shade800;
    case StockStatus.ok:
      return Colors.green.shade700;
  }
}

String _i(num? v) => v == null ? '-' : fmt(v.toDouble(), 0);

void _snack(BuildContext c, String t) => ScaffoldMessenger.of(c).showSnackBar(SnackBar(content: Text(t)));

/* ------------------------------------------------------------------ itens */

class _ItemsTab extends StatefulWidget {
  final StockStore store;
  final Catalog catalog;
  final SharedPreferences prefs;
  const _ItemsTab({required this.store, required this.catalog, required this.prefs});
  @override
  State<_ItemsTab> createState() => _ItemsTabState();
}

class _ItemsTabState extends State<_ItemsTab> {
  String q = '';

  @override
  Widget build(BuildContext context) {
    final byRow = {for (final r in widget.store.rows) r.med.id: r};
    final list = widget.store.meds.where((m) => q.isEmpty || norm('${m.name} ${m.caf}').contains(norm(q))).toList();
    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 6),
        child: TextField(
          decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Buscar item ou código', border: OutlineInputBorder(), isDense: true),
          onChanged: (v) => setState(() => q = v.trim()),
        ),
      ),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        child: Align(alignment: Alignment.centerLeft, child: Text('${list.length} de ${widget.store.meds.length} itens', style: const TextStyle(fontSize: 12))),
      ),
      Expanded(
        child: widget.store.meds.isEmpty
            ? const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text('Nenhum item ainda. Use o botão + ou vá em "Dados" para importar a lista do ICAM ou da Policlínica Codajás ou colar a planilha do seu hospital.',
                      textAlign: TextAlign.center)))
            : ListView.separated(
                itemCount: list.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, i) {
                  final m = list[i];
                  final r = byRow[m.id];
                  return ListTile(
                    dense: true,
                    title: Text(m.name, maxLines: 2, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                        '${m.caf.isNotEmpty ? 'Cód. ${m.caf} · ' : ''}consumo/mês ${fmt(m.monthly, 1)} · estoque ${m.inventory == null ? 'não informado' : fmt(m.inventory!, 0)} · lead ${fmt(m.leadTime, 0)} d'),
                    trailing: r == null ? null : Text(r.cls, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: _clsColor(r.cls))),
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(
                        builder: (_) => MedEditPage(store: widget.store, catalog: widget.catalog, prefs: widget.prefs, med: m))),
                  );
                },
              ),
      ),
    ]);
  }
}

/* ------------------------------------------------------------------ edição de item */

class MedEditPage extends StatefulWidget {
  final StockStore store;
  final Catalog catalog;
  final SharedPreferences prefs;
  final Med? med;
  const MedEditPage({super.key, required this.store, required this.catalog, required this.prefs, required this.med});
  @override
  State<MedEditPage> createState() => _MedEditPageState();
}

class _MedEditPageState extends State<MedEditPage> {
  late final Med m = widget.med ?? Med(id: widget.store.newId(), name: '');
  late final c = <String, TextEditingController>{
    'name': TextEditingController(text: m.name),
    'caf': TextEditingController(text: m.caf),
    'form': TextEditingController(text: m.form),
    'conc': TextEditingController(text: m.concentration),
    'cons': TextEditingController(text: m.annual == 0 ? '' : fmtPlain(m.monthly)),
    'cost': TextEditingController(text: m.unitCost == 0 ? '' : fmtPlain(m.unitCost)),
    'lead': TextEditingController(text: fmtPlain(m.leadTime)),
    'max': TextEditingController(text: (m.maxMonthly ?? 0) > 0 ? fmtPlain(m.maxMonthly!) : ''),
    'inv': TextEditingController(text: m.inventory == null ? '' : fmtPlain(m.inventory!)),
  };
  late String manual = m.manualClass ?? 'auto';

  @override
  void dispose() {
    for (final x in c.values) {
      x.dispose();
    }
    super.dispose();
  }

  Item? get _catItem {
    final code = c['caf']!.text.trim();
    if (code.isEmpty) return null;
    for (final it in widget.catalog.items) {
      if (it.code == code) return it;
    }
    return null;
  }

  void _save() {
    final name = c['name']!.text.trim();
    if (name.isEmpty) {
      _snack(context, 'Informe o nome do item.');
      return;
    }
    m.name = name;
    m.caf = c['caf']!.text.trim();
    m.form = c['form']!.text.trim();
    m.concentration = c['conc']!.text.trim();
    m.annual = (parseNum(c['cons']!.text) ?? 0) * 12;
    m.unitCost = parseNum(c['cost']!.text) ?? 0;
    m.leadTime = parseNum(c['lead']!.text) ?? 7;
    final mx = parseNum(c['max']!.text);
    m.maxMonthly = (mx != null && mx > 0) ? mx : null;
    m.inventory = c['inv']!.text.trim().isEmpty ? null : parseNum(c['inv']!.text);
    m.manualClass = manual == 'auto' ? null : manual;
    if (widget.med == null) {
      widget.store.add(m);
    } else {
      widget.store.changed();
    }
    Navigator.of(context).pop();
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir item?'),
        content: Text(m.name),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Excluir')),
        ],
      ),
    );
    if (ok == true && mounted) {
      widget.store.remove(m);
      Navigator.of(context).pop();
    }
  }

  void _openGuide(Item it) {
    final prefs = widget.prefs;
    final favs = (prefs.getStringList('fav') ?? <String>[]).map(int.parse).toSet();
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => DetailPage(
        catalog: widget.catalog,
        item: it,
        age: prefs.getString('age') ?? 'adu',
        fav: favs.contains(it.id),
        onFav: () {
          favs.contains(it.id) ? favs.remove(it.id) : favs.add(it.id);
          prefs.setStringList('fav', favs.map((e) => e.toString()).toList());
        },
      ),
    ));
  }

  Widget _f(String k, String label, {bool num = true, String? help}) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: TextField(
          controller: c[k],
          keyboardType: num ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
          decoration: InputDecoration(labelText: label, helperText: help, border: const OutlineInputBorder(), isDense: true),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final it = _catItem;
    return Scaffold(
      appBar: AppBar(title: Text(widget.med == null ? 'Novo item' : 'Editar item'), toolbarHeight: 48, actions: [
        if (widget.med != null) IconButton(onPressed: _delete, icon: const Icon(Icons.delete_outline), tooltip: 'Excluir'),
      ]),
      body: ListView(padding: const EdgeInsets.all(14), children: [
        _f('name', 'Medicamento / item', num: false),
        _f('caf', 'Código do item (liga à lista de exemplo e ao PosologiaPED)', num: false),
        if (it != null)
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: OutlinedButton.icon(
                onPressed: () => _openGuide(it),
                icon: const Icon(Icons.medication_outlined),
                label: Text('Abrir no guia: ${it.desc}', overflow: TextOverflow.ellipsis),
              ),
            ),
          ),
        _f('form', 'Forma farmacêutica / seção', num: false),
        _f('conc', 'Concentração', num: false),
        _f('cons', 'Consumo mensal (unidades)'),
        _f('cost', 'Custo unitário (R\$)', help: 'Confira na tabela oficial da CMED/Anvisa. Nada é buscado automaticamente.'),
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton.icon(onPressed: () => openUrl(context, _cmedUrl), icon: const Icon(Icons.open_in_new, size: 16), label: const Text('Tabela CMED (precisa de internet)')),
        ),
        _f('lead', 'Prazo de reposição / lead time (dias)'),
        _f('max', 'Consumo mensal máximo (opcional)', help: 'Em branco = estimado em 1,5 x a média.'),
        _f('inv', 'Estoque atual (em branco = não informado)'),
        DropdownButtonFormField<String>(
          value: manual,
          decoration: const InputDecoration(labelText: 'Classe ABC', border: OutlineInputBorder(), isDense: true),
          items: const [
            DropdownMenuItem(value: 'auto', child: Text('Automática')),
            DropdownMenuItem(value: 'A', child: Text('A (manual)')),
            DropdownMenuItem(value: 'B', child: Text('B (manual)')),
            DropdownMenuItem(value: 'C', child: Text('C (manual)')),
          ],
          onChanged: (v) => setState(() => manual = v ?? 'auto'),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(onPressed: _save, icon: const Icon(Icons.check), label: const Text('Salvar')),
      ]),
    );
  }
}

/// Número sem separador de milhar nem zeros finais, para preencher campos.
String fmtPlain(double v) {
  var s = v.toStringAsFixed(3);
  if (s.contains('.')) {
    s = s.replaceFirst(RegExp(r'0+$'), '').replaceFirst(RegExp(r'\.$'), '');
  }
  return s.replaceAll('.', ',');
}

/* ------------------------------------------------------------------ curva ABC */

class _AbcTab extends StatelessWidget {
  final StockStore store;
  const _AbcTab({required this.store});

  @override
  Widget build(BuildContext context) {
    final rows = store.rows;
    if (rows.isEmpty) return const Center(child: Text('Cadastre itens (com consumo e custo) para ver a curva ABC.'));
    final total = rows.fold<double>(0, (s, r) => s + r.analysisValue);
    double share(String k) => total > 0 ? rows.where((r) => r.cls == k).fold<double>(0, (s, r) => s + r.analysisValue) / total * 100 : 0;
    int count(String k) => rows.where((r) => r.cls == k).length;
    final pa = share('A'), pb = share('B'), pc = share('C');
    int flex(double p) => p.round() < 1 ? 1 : p.round();
    return ListView(padding: const EdgeInsets.all(12), children: [
      SegmentedButton<AbcMode>(
        showSelectedIcon: false,
        segments: const [
          ButtonSegment(value: AbcMode.value, label: Text('Por valor (R\$)')),
          ButtonSegment(value: AbcMode.consumption, label: Text('Por consumo')),
        ],
        selected: {store.mode},
        onSelectionChanged: (s) => store.setMode(s.first),
      ),
      const SizedBox(height: 12),
      ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: SizedBox(
          height: 18,
          child: Row(children: [
            Expanded(flex: flex(pa), child: Container(color: _clsColor('A'))),
            Expanded(flex: flex(pb), child: Container(color: _clsColor('B'))),
            Expanded(flex: flex(pc), child: Container(color: _clsColor('C'))),
          ]),
        ),
      ),
      const SizedBox(height: 8),
      Row(children: [
        for (final k in ['A', 'B', 'C'])
          Expanded(
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Classe $k', style: TextStyle(fontWeight: FontWeight.w800, color: _clsColor(k))),
                  Text('${count(k)} itens', style: const TextStyle(fontSize: 13)),
                  Text('${fmt(share(k), 1)}% do total', style: const TextStyle(fontSize: 12)),
                ]),
              ),
            ),
          ),
      ]),
      const Text('Cortes: A até 80% do acumulado, B até 95%, C o restante (ver aba Dados e método).', style: TextStyle(fontSize: 12)),
      const SizedBox(height: 8),
      for (final r in rows)
        Card(
          child: ListTile(
            dense: true,
            leading: CircleAvatar(radius: 14, backgroundColor: _clsColor(r.cls), child: Text(r.cls, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800))),
            title: Text(r.med.name, maxLines: 2, overflow: TextOverflow.ellipsis),
            subtitle: Text('Valor anual R\$ ${fmt(r.totalValue)} · acumulado ${fmt(r.cumulativePct, 1)}%${r.med.manualClass != null ? ' · classe manual' : ''}'),
          ),
        ),
    ]);
  }
}

/* ------------------------------------------------------------------ pedido semanal */

class _OrderTab extends StatefulWidget {
  final StockStore store;
  const _OrderTab({required this.store});
  @override
  State<_OrderTab> createState() => _OrderTabState();
}

class _OrderTabState extends State<_OrderTab> {
  bool only = true;

  @override
  Widget build(BuildContext context) {
    final s = widget.store;
    final all = s.rows;
    final rows = all.where((r) => !only || (r.suggestedOrder ?? 0) > 0 || r.status == StockStatus.abaixoEmergencia).toList();
    final totalCost = rows.fold<double>(0, (t, r) => t + (r.suggestedOrder ?? 0) * r.med.unitCost);
    return ListView(padding: const EdgeInsets.all(12), children: [
      const Text('PADRÃO = CMD x (lead time + ciclo de revisão) + estoque de emergência. PEDIDO = PADRÃO - estoque atual (se positivo). '
          'Método proposto (ver aba Dados e método); ajuste ao protocolo do seu hospital. Sem estoque informado, o PEDIDO não é calculado.',
          style: TextStyle(fontSize: 12)),
      const SizedBox(height: 8),
      Row(children: [
        const Text('Ciclo de revisão (dias): '),
        IconButton(onPressed: () => s.setReview(s.reviewDays - 1), icon: const Icon(Icons.remove_circle_outline)),
        Text('${s.reviewDays}', style: const TextStyle(fontWeight: FontWeight.w700)),
        IconButton(onPressed: () => s.setReview(s.reviewDays + 1), icon: const Icon(Icons.add_circle_outline)),
      ]),
      SwitchListTile(
        dense: true,
        contentPadding: EdgeInsets.zero,
        title: const Text('Só itens com pedido'),
        value: only,
        onChanged: (v) => setState(() => only = v),
      ),
      Row(children: [
        Expanded(child: Text('${rows.length} itens · custo estimado R\$ ${fmt(totalCost)}', style: const TextStyle(fontWeight: FontWeight.w700))),
        FilledButton.tonalIcon(
          onPressed: all.isEmpty
              ? null
              : () async {
                  await Clipboard.setData(ClipboardData(text: resultsCsv(all)));
                  if (context.mounted) _snack(context, 'Planilha copiada (CSV com ;). Cole no Excel, WhatsApp ou e-mail.');
                },
          icon: const Icon(Icons.copy_all),
          label: const Text('Copiar CSV'),
        ),
      ]),
      const SizedBox(height: 6),
      if (rows.isEmpty) const Padding(padding: EdgeInsets.all(24), child: Text('Nenhum item com pedido sugerido. Informe o estoque atual dos itens para calcular.', textAlign: TextAlign.center)),
      for (final r in rows)
        Card(
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Text(r.med.name, style: const TextStyle(fontWeight: FontWeight.w700))),
                Text(r.cls, style: TextStyle(fontWeight: FontWeight.w800, color: _clsColor(r.cls))),
              ]),
              const SizedBox(height: 4),
              Text(statusLabel(r.status), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _statusColor(r.status))),
              const SizedBox(height: 4),
              Wrap(spacing: 14, runSpacing: 2, children: [
                Text('Estoque ${_i(r.med.inventory)}'),
                Text('Cobertura ${r.coverageDays == null ? '-' : '${fmt(r.coverageDays!, 1)} d'}'),
                Text('Emergência ${r.safetyStock}'),
                Text('Ponto de pedido ${r.reorderPoint}'),
                Text('PADRÃO ${r.targetStock}'),
                Text('PEDIDO ${_i(r.suggestedOrder)}', style: const TextStyle(fontWeight: FontWeight.w800)),
              ]),
            ]),
          ),
        ),
    ]);
  }
}

/* ------------------------------------------------------------------ dados e método */

class _DataTab extends StatelessWidget {
  final StockStore store;
  final Catalog catalog;
  const _DataTab({required this.store, required this.catalog});

  Future<void> _importCodajas(BuildContext context) async {
    final CodajasList lista;
    try {
      lista = await CodajasList.load();
    } catch (_) {
      if (context.mounted) _snack(context, 'Não foi possível ler a lista da Policlínica Codajás.');
      return;
    }
    final have = store.meds.map((m) => m.name.toLowerCase()).toSet();
    final novos = lista.itens.where((i) => !have.contains(i.name.toLowerCase())).toList();
    if (novos.isEmpty) {
      if (context.mounted) _snack(context, 'Todos os itens da Policlínica Codajás já estão cadastrados.');
      return;
    }
    if (!context.mounted) return;
    final ok = await _confirm(context, 'Importar lista da Policlínica Codajás', 'Adicionar ${novos.length} itens com usuários ativos e custo unitário? Depois informe o estoque de cada um.');
    if (ok != true) return;
    store.addMany([
      for (final i in novos)
        Med(id: store.newId(), name: i.name, annual: i.activeUsers * 12, unitCost: i.unitCost)
    ]);
    if (context.mounted) _snack(context, '${novos.length} itens importados.');
  }

  Future<void> _importIcam(BuildContext context) async {
    final have = store.meds.map((m) => m.caf).where((x) => x.isNotEmpty).toSet();
    final novos = catalog.items.where((i) => !have.contains(i.code)).toList();
    if (novos.isEmpty) {
      _snack(context, 'Todos os itens da lista do ICAM já estão cadastrados.');
      return;
    }
    final ok = await _confirm(context, 'Importar lista do ICAM', 'Adicionar ${novos.length} itens? Depois informe consumo, custo e estoque de cada um.');
    if (ok != true) return;
    store.addMany([
      for (final i in novos)
        Med(
          id: store.newId(),
          name: i.desc,
          caf: i.code,
          form: catalog.sec[i.sec] ?? '',
          concentration: i.mgml != null ? '${fmtPlain(i.mgml!)} mg/mL' : '',
        )
    ]);
    if (context.mounted) _snack(context, '${novos.length} itens importados.');
  }

  Future<bool?> _confirm(BuildContext context, String title, String body) => showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text(title),
          content: Text(body),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Confirmar')),
          ],
        ),
      );

  Future<String?> _pasteDialog(BuildContext context, String title, String hint) {
    final ctl = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: SizedBox(
          width: double.maxFinite,
          child: TextField(controller: ctl, maxLines: 10, minLines: 5, decoration: InputDecoration(hintText: hint, border: const OutlineInputBorder())),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final d = await Clipboard.getData(Clipboard.kTextPlain);
              if (d?.text != null) ctl.text = d!.text!;
            },
            child: const Text('Colar'),
          ),
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(ctx, ctl.text), child: const Text('Importar')),
        ],
      ),
    );
  }

  Future<void> _importCsv(BuildContext context) async {
    final t = await _pasteDialog(context, 'Importar planilha (CSV)', 'Medicamento;Codigo;ConsumoMensal;Estoque;LeadTime\nDipirona 500 mg;12;100;40;10');
    if (t == null || t.trim().isEmpty) return;
    final list = parseCsv(t);
    if (!context.mounted) return;
    if (list.isEmpty) {
      _snack(context, 'Nada importado. A primeira linha deve ter o cabeçalho (coluna Medicamento ou Nome).');
      return;
    }
    store.addMany(list);
    _snack(context, '${list.length} itens importados.');
  }

  Future<void> _restore(BuildContext context) async {
    final t = await _pasteDialog(context, 'Restaurar backup (JSON)', 'Cole aqui o backup copiado deste app ou do app web.');
    if (t == null || t.trim().isEmpty) return;
    if (!context.mounted) return;
    try {
      final list = restoreBackup(t);
      final ok = await _confirm(context, 'Substituir dados?', 'Isto troca os ${store.meds.length} itens atuais por ${list.length} itens do backup.');
      if (ok == true) {
        store.replaceAll(list);
        if (context.mounted) _snack(context, 'Backup restaurado.');
      }
    } catch (_) {
      _snack(context, 'Backup inválido.');
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget btn(IconData ic, String label, VoidCallback f) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: OutlinedButton.icon(onPressed: f, icon: Icon(ic), label: Align(alignment: Alignment.centerLeft, child: Text(label))),
        );
    final r = catalog.refs;
    return ListView(padding: const EdgeInsets.all(14), children: [
      const Text('Seus dados ficam só neste aparelho (sem internet, sem conta).', style: TextStyle(fontWeight: FontWeight.w700)),
      const Text('Não registre dados de pacientes. Faça backup de vez em quando.', style: TextStyle(fontSize: 12)),
      const SizedBox(height: 10),
      btn(Icons.playlist_add, 'Importar lista do ICAM (${catalog.items.length} itens)', () => _importIcam(context)),
      btn(Icons.playlist_add, 'Importar lista da Policlínica Codajás', () => _importCodajas(context)),
      btn(Icons.content_paste, 'Importar planilha colada (CSV)', () => _importCsv(context)),
      btn(Icons.copy_all, 'Copiar planilha da curva ABC e do pedido (CSV)', () async {
        await Clipboard.setData(ClipboardData(text: resultsCsv(store.rows)));
        if (context.mounted) _snack(context, 'CSV copiado.');
      }),
      btn(Icons.backup_outlined, 'Copiar backup (JSON, igual ao do app web)', () async {
        await Clipboard.setData(ClipboardData(text: backupJson(store.meds)));
        if (context.mounted) _snack(context, 'Backup copiado. Cole em uma nota ou mensagem para guardar.');
      }),
      btn(Icons.restore, 'Restaurar backup colado', () => _restore(context)),
      btn(Icons.delete_forever_outlined, 'Apagar todos os itens', () async {
        final ok = await _confirm(context, 'Apagar tudo?', 'Remove os ${store.meds.length} itens deste aparelho. Não dá para desfazer.');
        if (ok == true) store.replaceAll([]);
      }),
      const Divider(height: 28),
      const Text('Método', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      const SizedBox(height: 6),
      const Text('Curva ABC: itens em ordem decrescente de valor anual (consumo x custo) ou de consumo. Classe A até 80% do acumulado, B até 95%, C o restante. '
          'Classe manual prevalece sobre a automática.\n\n'
          'CMD (consumo médio diário) = consumo mensal / 30. Estoque de emergência = (CMD máximo - CMD) x lead time; sem consumo máximo informado, estima-se 1,5 x a média (premissa do aplicativo, não de literatura).\n\n'
          'Ponto de pedido = CMD x lead time + estoque de emergência. PADRÃO = CMD x (lead time + ciclo de revisão) + estoque de emergência. '
          'PEDIDO = PADRÃO - estoque atual (mínimo 0). Cobertura = estoque / CMD. Os cálculos de ponto de pedido, PADRÃO e PEDIDO são uma proposta de método e devem ser ajustados ao protocolo do hospital.',
          style: TextStyle(fontSize: 13)),
      const SizedBox(height: 10),
      const Text('Referências (os links abrem no navegador e precisam de internet)', style: TextStyle(fontWeight: FontWeight.w700)),
      for (final k in ['ABCP', 'MSH', 'MSAF', 'CMED'])
        if (r.containsKey(k))
          ListTile(
            dense: true,
            contentPadding: EdgeInsets.zero,
            title: Text('[$k] ${r[k]!.text}', style: const TextStyle(fontSize: 12.5)),
            subtitle: Text('Link: ${r[k]!.levelLabel}', style: const TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.open_in_new, size: 18),
            onTap: () => openUrl(context, r[k]!.url),
          ),
    ]);
  }
}
