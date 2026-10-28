import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'calc.dart';
import 'models.dart';
import 'util.dart';
import 'triagem.dart';

const kAges = {'neo': 'Neonatos', 'ped': 'Lactentes e crianças', 'adu': 'Adultos (ref.)', 'ido': 'Idosos (ref.)'};
const kAgeFull = {
  'neo': 'Neonatos (0-28 dias)',
  'ped': 'Lactentes e crianças (29 dias - 17 anos)',
  'adu': 'Adultos (referência)',
  'ido': 'Idosos >= 65 anos (referência)',
};
const _warn = 'Apoio à decisão, não prescrição. Valores compilados das fontes citadas; exigem revisão por farmacêutico '
    'responsável e conferência com a bula vigente e os protocolos da instituição.';

class Home extends StatefulWidget {
  final Catalog catalog;
  final SharedPreferences prefs;
  const Home({super.key, required this.catalog, required this.prefs});
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  int tab = 0;
  late Set<int> favs = (widget.prefs.getStringList('fav') ?? <String>[]).map(int.parse).toSet();
  late String age = widget.prefs.getString('age') ?? 'ped';

  void toggleFav(int id) {
    setState(() => favs.contains(id) ? favs.remove(id) : favs.add(id));
    widget.prefs.setStringList('fav', favs.map((e) => e.toString()).toList());
  }

  void setAge(String a) {
    setState(() => age = a);
    widget.prefs.setString('age', a);
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      MedsPage(catalog: widget.catalog, favs: favs, age: age, onFav: toggleFav, onAge: setAge),
      CalcPage(catalog: widget.catalog),
      TriagemPage(catalog: widget.catalog),
      RefsPage(catalog: widget.catalog),
      AboutPage(catalog: widget.catalog),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('PosologiaPED · foco pediátrico'), toolbarHeight: 44),
      body: SafeArea(child: IndexedStack(index: tab, children: pages)),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.medication_outlined), label: 'Medicamentos'),
          NavigationDestination(icon: Icon(Icons.calculate_outlined), label: 'Calculadoras'),
          NavigationDestination(icon: Icon(Icons.fact_check_outlined), label: 'Triagem'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), label: 'Referências'),
          NavigationDestination(icon: Icon(Icons.info_outline), label: 'Sobre'),
        ],
      ),
    );
  }
}

/* ---------------------------------------------------------------- Medicamentos */

class MedsPage extends StatefulWidget {
  final Catalog catalog;
  final Set<int> favs;
  final String age;
  final void Function(int) onFav;
  final void Function(String) onAge;
  const MedsPage({super.key, required this.catalog, required this.favs, required this.age, required this.onFav, required this.onAge});
  @override
  State<MedsPage> createState() => _MedsPageState();
}

class _MedsPageState extends State<MedsPage> {
  String q = '';
  String cls = 'all';
  String tc = '', fc = '';
  final _ctl = TextEditingController();
  bool get browse => tc.isEmpty && q.isEmpty && cls == 'all';

  bool _match(Item it) {
    final c = widget.catalog;
    final m = c.mono[it.key]!, s = c.safety[it.key]!;
    if (tc.isNotEmpty && m.tc != tc) return false;
    if (fc.isNotEmpty && m.fc != fc) return false;
    if (cls == 'fav' && !widget.favs.contains(it.id)) return false;
    if (q.isEmpty) return true;
    final hay = norm('${it.code} ${it.desc} ${m.name} ${m.cls} ${m.tc} ${m.fc} ${m.en} ${s.ae}');
    return hay.contains(norm(q));
  }

  String _n(Catalog c, String t) {
    final n = c.items.where((i) => c.mono[i.key]!.tc == t).length;
    return '$n ${n == 1 ? 'item' : 'itens'}';
  }

  void _openList(String src) => Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => HospitalListPage(catalog: widget.catalog, source: src, age: widget.age, favs: widget.favs, onFav: widget.onFav)));

  Widget _browseGrid(Catalog c, List<String> tcs) {
    return ListView(padding: const EdgeInsets.fromLTRB(12, 4, 12, 16), children: [
      const Padding(padding: EdgeInsets.fromLTRB(2, 8, 0, 8), child: Text('Escolha uma classe', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.black54))),
      GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 2.3,
        children: [
          if (widget.favs.isNotEmpty)
            _ClassTile('★ Meus favoritos', '${widget.favs.length} ${widget.favs.length == 1 ? 'item' : 'itens'}', 45, () => setState(() => cls = 'fav')),
          for (var i = 0; i < tcs.length; i++)
            _ClassTile(tcs[i], _n(c, tcs[i]), (i * 47 + 160) % 360, () => setState(() {
                  tc = tcs[i];
                  fc = '';
                })),
        ],
      ),
      const Padding(padding: EdgeInsets.fromLTRB(2, 18, 0, 8), child: Text('Listas do hospital', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.black54))),
      FilledButton.tonalIcon(onPressed: () => _openList('icam'), icon: const Icon(Icons.playlist_add), label: const Text('Importar lista do ICAM')),
      const SizedBox(height: 8),
      FilledButton.tonalIcon(onPressed: () => _openList('cod'), icon: const Icon(Icons.playlist_add), label: const Text('Importar lista da Policlínica Codajás')),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.catalog;
    final list = c.items.where(_match).toList();
    final tcs = c.mono.values.map((m) => m.tc).toSet().toList()..sort();
    final fcs = (c.mono.values.where((m) => tc.isEmpty || m.tc == tc).map((m) => m.fc).toSet().toList()..sort());
    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          TextField(
            controller: _ctl,
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Buscar medicamento', border: OutlineInputBorder(), isDense: true),
            onChanged: (v) => setState(() => q = v.trim()),
          ),
          if (!browse)
            Row(children: [
              TextButton.icon(
                  onPressed: () => setState(() {
                        tc = '';
                        fc = '';
                        q = '';
                        cls = 'all';
                        _ctl.clear();
                      }),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Classes')),
              Expanded(child: Text(tc.isNotEmpty ? tc : (cls == 'fav' ? 'Favoritos' : 'Resultados'), style: const TextStyle(fontWeight: FontWeight.w700), overflow: TextOverflow.ellipsis)),
              Text('${list.length} ${list.length == 1 ? 'item' : 'itens'}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
            ]),
          if (tc.isNotEmpty && fcs.length > 1)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [
                for (final f in fcs)
                  Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(label: Text(f), selected: fc == f, onSelected: (v) => setState(() => fc = v ? f : '')),
                  ),
              ]),
            ),
        ]),
      ),
      Expanded(
        child: browse
            ? _browseGrid(c, tcs)
            : list.isEmpty
                ? const Center(child: Text('Nenhum medicamento encontrado.'))
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                    itemCount: list.length,
                    itemBuilder: (context, i) => _MedTile(
                      item: list[i],
                      catalog: c,
                      age: widget.age,
                      fav: widget.favs.contains(list[i].id),
                      onFav: () => widget.onFav(list[i].id),
                    ),
                  ),
      ),
    ]);
  }
}

class _ClassTile extends StatelessWidget {
  final String title, sub;
  final int hue;
  final VoidCallback onTap;
  const _ClassTile(this.title, this.sub, this.hue, this.onTap);
  @override
  Widget build(BuildContext context) {
    final col = HSLColor.fromAHSL(1, hue.toDouble(), 0.55, 0.5).toColor();
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFD9E2E5))),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Row(children: [
          Container(width: 5, color: col),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
                Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5, height: 1.2)),
                Text(sub, style: const TextStyle(fontSize: 12, color: Colors.black54)),
              ]),
            ),
          ),
        ]),
      ),
    );
  }
}

/// Lista do hospital (ICAM ou Policlinica Codajas) cruzada com as monografias do guia.
class HospitalListPage extends StatefulWidget {
  final Catalog catalog;
  final String source; // 'icam' | 'cod'
  final String age;
  final Set<int> favs;
  final void Function(int) onFav;
  const HospitalListPage({super.key, required this.catalog, required this.source, required this.age, required this.favs, required this.onFav});
  @override
  State<HospitalListPage> createState() => _HospitalListPageState();
}

class _HospitalListPageState extends State<HospitalListPage> {
  String title = '';
  List<(String, Item?)> rows = [];
  bool loading = true;
  String filter = 'all';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final c = widget.catalog;
    if (widget.source == 'icam') {
      title = 'Lista do ICAM';
      rows = [for (final i in c.items) (i.desc, i)];
    } else {
      final l = await CodajasList.load();
      title = l.nome;
      final keys = [for (final e in c.mono.entries) (norm(e.value.name.split(RegExp(r'[\d(]')).first.trim()), e.key)].where((k) => k.$1.length >= 4).toList()
        ..sort((a, b) => b.$1.length.compareTo(a.$1.length));
      rows = [for (final it in l.itens) (it.name, _find(c, keys, norm(it.name)))];
    }
    if (mounted) setState(() => loading = false);
  }

  Item? _find(Catalog c, List<(String, String)> keys, String d) {
    for (final k in keys) {
      if (' $d '.contains(' ${k.$1} ')) {
        for (final i in c.items) {
          if (i.key == k.$2) return i;
        }
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final ok = rows.where((r) => r.$2 != null).length;
    final show = rows.where((r) => filter == 'all' || (filter == 'ok' ? r.$2 != null : r.$2 == null)).toList();
    return Scaffold(
      appBar: AppBar(title: Text(title.isEmpty ? 'Lista' : title), toolbarHeight: 48),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : Column(children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: Text('${rows.length} itens, $ok com monografia no guia. A associação é automática, pelo nome: confira sal, associação e apresentação.',
                    style: const TextStyle(fontSize: 12.5, color: Colors.black54)),
              ),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(children: [
                  for (final f in const {'all': 'Todos', 'ok': 'Com monografia', 'no': 'Sem monografia'}.entries)
                    Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ChoiceChip(label: Text(f.value), selected: filter == f.key, onSelected: (_) => setState(() => filter = f.key)),
                    ),
                ]),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: show.length,
                  itemBuilder: (ctx, i) {
                    final r = show[i];
                    final it = r.$2;
                    return ListTile(
                      title: Text(r.$1, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600)),
                      subtitle: it == null ? const Text('Sem monografia no guia') : Text('Guia: ${widget.catalog.mono[it.key]!.name}', maxLines: 1, overflow: TextOverflow.ellipsis),
                      trailing: it == null ? null : const Icon(Icons.chevron_right),
                      onTap: it == null
                          ? null
                          : () => Navigator.of(context).push(MaterialPageRoute(
                              builder: (_) => DetailPage(catalog: widget.catalog, item: it, age: widget.age, fav: widget.favs.contains(it.id), onFav: () => widget.onFav(it.id)))),
                    );
                  },
                ),
              ),
            ]),
    );
  }
}

List<Widget> _badges(Catalog c, Item it) {
  final s = c.safety[it.key]!;
  final out = <Widget>[];
  if (s.ismp.isNotEmpty) out.add(const Tag('Alta vigilância', Color(0xFFB42318), Colors.white));
  if (s.nef > 0) out.add(Tag(s.nef == 2 ? 'Nefrotóxico' : 'Nefro: atenção', const Color(0xFFEEE8F8), const Color(0xFF5B3A9E)));
  if (s.hep > 0) out.add(Tag(s.hep == 2 ? 'Hepatotóxico' : 'Hepato: atenção', const Color(0xFFF8EBDD), const Color(0xFF8A4B08)));
  if (controlledSections.contains(it.sec)) out.add(const Tag('Controlado', Color(0xFFDCE5E8), Color(0xFF16282D)));
  return out;
}

class _MedTile extends StatelessWidget {
  final Item item;
  final Catalog catalog;
  final String age;
  final bool fav;
  final VoidCallback onFav;
  const _MedTile({required this.item, required this.catalog, required this.age, required this.fav, required this.onFav});

  @override
  Widget build(BuildContext context) {
    final m = catalog.mono[item.key]!;
    final s = catalog.safety[item.key]!;
    final badges = _badges(catalog, item);
    final isPed = age == 'ped' || age == 'neo';
    final usual = age == 'ido' ? m.ido : (age == 'ped' ? m.ped[0] : age == 'neo' ? m.neo[0] : m.adu[0]);
    final max = age == 'ido' ? '' : (age == 'ped' ? m.ped[1] : age == 'neo' ? m.neo[1] : m.adu[1]);
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: s.ismp.isNotEmpty ? const Color(0xFFB42318) : const Color(0xFFDCE5E8)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(
            builder: (_) => DetailPage(catalog: catalog, item: item, age: age, fav: fav, onFav: onFav))),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Cód. ${item.code}', style: const TextStyle(fontSize: 11, color: Colors.black54)),
                  Text(item.desc, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  Text('${m.tc} · ${m.fc}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                ]),
              ),
              IconButton(
                  tooltip: 'Favoritar',
                  onPressed: onFav,
                  icon: Icon(fav ? Icons.star : Icons.star_border, color: fav ? const Color(0xFFD9A300) : null)),
            ]),
            if (badges.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 6), child: Wrap(spacing: 6, runSpacing: 4, children: badges)),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isPed ? const Color(0xFFFFF8DB) : const Color(0xFFF1F5F6),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: isPed ? const Color(0xFFD9A300) : const Color(0xFFDCE5E8)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(kAgeFull[age]!.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
                const SizedBox(height: 2),
                Text(usual, maxLines: 4, overflow: TextOverflow.ellipsis),
                if (max.isNotEmpty) Text('Máxima: $max', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

/* ---------------------------------------------------------------- Detalhe */

class DetailPage extends StatefulWidget {
  final Catalog catalog;
  final Item item;
  final String age;
  final bool fav;
  final VoidCallback onFav;
  const DetailPage({super.key, required this.catalog, required this.item, required this.age, required this.fav, required this.onFav});
  @override
  State<DetailPage> createState() => _DetailPageState();
}

class _DetailPageState extends State<DetailPage> {
  late bool fav = widget.fav;
  late final TextEditingController p = TextEditingController();
  late final TextEditingController d = TextEditingController();
  late final TextEditingController x = TextEditingController();
  late final TextEditingController c =
      TextEditingController(text: widget.item.mgml == null ? '' : fmt(widget.item.mgml!));

  @override
  void dispose() {
    p.dispose();
    d.dispose();
    x.dispose();
    c.dispose();
    super.dispose();
  }

  Widget _dose(String title, String usual, String max, bool ped) => Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: ped ? const Color(0xFFFFF8DB) : Colors.white,
          border: Border.all(color: ped ? const Color(0xFFD9A300) : const Color(0xFFDCE5E8)),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title.toUpperCase(), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
          const SizedBox(height: 4),
          const Text('Dose usual', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.black54)),
          Text(usual),
          if (max.isNotEmpty) ...[
            const SizedBox(height: 4),
            const Text('Dose máxima', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.black54)),
            Text(max),
          ],
        ]),
      );

  String _result() {
    final kg = parseNum(p.text), mgKg = parseNum(d.text);
    if (kg == null || mgKg == null || kg <= 0 || mgKg <= 0) return 'Informe peso e dose em mg/kg.';
    final r = Calc.doseMg(kg, mgKg, parseNum(x.text) ?? 0);
    final conc = parseNum(c.text) ?? 0;
    var s = 'Dose: ${fmt(r.mg)} mg';
    if (conc > 0) s += ' = ${fmt(r.mg / conc)} mL a ${fmt(conc)} mg/mL';
    if (r.capped) s += '\nLimitada à dose máxima (calculado ${fmt(r.raw)} mg).';
    return s;
  }

  Widget _field(TextEditingController ctl, String label) => SizedBox(
        width: 150,
        child: TextField(
          controller: ctl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: label, border: const OutlineInputBorder(), isDense: true),
          onChanged: (_) => setState(() {}),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final cat = widget.catalog, it = widget.item;
    final m = cat.mono[it.key]!, s = cat.safety[it.key]!;
    final en = Uri.encodeComponent(m.en);
    final ptName = Uri.encodeComponent(norm(m.name.split(RegExp(r'[\d(]'))[0].trim().split(' ')[0]));
    final links = <(String, String)>[
      ('DailyMed (bula FDA)', 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=$en'),
      ('PubMed', 'https://pubmed.ncbi.nlm.nih.gov/?term=$en+dosing'),
      ('BNFc', 'https://bnfc.nice.org.uk/search/?q=$en'),
      ('Bulário Anvisa', 'https://consultas.anvisa.gov.br/#/bulario/q/?nomeProduto=$ptName'),
      if (s.hep > 0) ('LiverTox', 'https://www.ncbi.nlm.nih.gov/books/?term=$en+livertox'),
    ];
    return Scaffold(
      appBar: AppBar(
        title: Text(it.desc, style: const TextStyle(fontSize: 16)),
        actions: [
          IconButton(
            tooltip: 'Favoritar',
            icon: Icon(fav ? Icons.star : Icons.star_border),
            onPressed: () {
              widget.onFav();
              setState(() => fav = !fav);
            },
          ),
        ],
      ),
      body: ListView(padding: const EdgeInsets.all(14), children: [
        Text('Cód. ${it.code} · ${m.name}', style: const TextStyle(color: Colors.black54)),
        Text(m.cls, style: const TextStyle(color: Colors.black54)),
        Text('Classe terapêutica: ${m.tc} · Classe farmacológica: ${m.fc}', style: const TextStyle(color: Colors.black54, fontSize: 13)),
        const SizedBox(height: 4),
        Text('Via: ${m.routes}', style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Wrap(spacing: 6, runSpacing: 4, children: _badges(cat, it)),
        if (s.ismp.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text('Medicamento potencialmente perigoso (ISMP Brasil): ${s.ismp}. Dupla checagem na prescrição, no preparo e na administração.',
                style: const TextStyle(color: Color(0xFFB42318), fontWeight: FontWeight.w600, fontSize: 13)),
          ),
        if ((m.pa ?? '').isNotEmpty)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(color: Color(0xFFFDEFED), border: Border(left: BorderSide(color: Color(0xFFB42318), width: 3))),
            child: Text('Alerta pediátrico: ${m.pa}'),
          ),
        const SizedBox(height: 10),
        _dose(kAgeFull['neo']!, m.neo[0], m.neo[1], true),
        _dose(kAgeFull['ped']!, m.ped[0], m.ped[1], true),
        _dose(kAgeFull['adu']!, m.adu[0], m.adu[1], false),
        _dose(kAgeFull['ido']!, m.ido.isEmpty ? '-' : m.ido, '', false),
        const Text('Efeitos adversos comuns', style: TextStyle(fontWeight: FontWeight.w700)),
        Text(s.comuns.isEmpty ? '-' : s.comuns),
        const SizedBox(height: 6),
        const Text('Efeitos adversos graves', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFFB42318))),
        Text(s.graves.isEmpty ? '-' : s.graves),
        if (s.nef > 0) ...[const SizedBox(height: 6), Text('Rim: ${s.nefN}')],
        if (s.hep > 0) ...[const SizedBox(height: 6), Text('Fígado: ${s.hepN}')],
        const Divider(height: 28),
        const Text('Cálculo por peso', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Wrap(spacing: 8, runSpacing: 8, children: [
          _field(p, 'Peso (kg)'),
          _field(d, 'Dose (mg/kg)'),
          _field(x, 'Dose max. (mg)'),
          _field(c, 'Conc. (mg/mL)'),
        ]),
        const SizedBox(height: 8),
        Text(_result(), style: const TextStyle(fontWeight: FontWeight.w700)),
        const Text('mg = peso x mg/kg (limitada à dose máxima); mL = mg / concentração', style: TextStyle(fontSize: 12, color: Colors.black54)),
        const Divider(height: 28),
        const Text('Referências', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        ...cat.refsFor(it).map((k) {
          final r = cat.refs[k]!;
          return ListTile(
            dense: true,
            contentPadding: EdgeInsets.zero,
            title: Text('[$k] ${r.text}', style: const TextStyle(fontSize: 13)),
            subtitle: Text('Link: ${r.levelLabel}', style: const TextStyle(fontSize: 11)),
            trailing: const Icon(Icons.open_in_new, size: 18),
            onTap: () => openUrl(context, r.url),
          );
        }),
        const SizedBox(height: 8),
        const Text('Pesquisar este fármaco em (links de pesquisa pelo nome internacional):', style: TextStyle(fontSize: 12, color: Colors.black54)),
        Wrap(
          spacing: 6,
          children: links.map((l) => ActionChip(label: Text(l.$1), onPressed: () => openUrl(context, l.$2))).toList(),
        ),
        const SizedBox(height: 12),
        const Text(_warn, style: TextStyle(fontSize: 12, color: Color(0xFFB42318))),
      ]),
    );
  }
}

/* ---------------------------------------------------------------- Calculadoras */

enum FType { num, sex, drip }

class FieldDef {
  final String key, label;
  final FType type;
  const FieldDef(this.key, this.label, [this.type = FType.num]);
}

class CalcDef {
  final String title, formula;
  final List<FieldDef> fields;
  final List<String> refs;
  final String? Function(Map<String, String> v) run;
  const CalcDef(this.title, this.formula, this.fields, this.refs, this.run);
}

String? _n(Map<String, String> v, List<String> keys, String Function(List<double>) f) {
  final xs = <double>[];
  for (final k in keys) {
    final x = parseNum(v[k]);
    if (x == null || x <= 0) return null;
    xs.add(x);
  }
  return f(xs);
}

final List<CalcDef> kCalcs = [
  CalcDef('Dose por peso (mg/kg) -> volume · pediatria', 'mg = kg x mg/kg (teto = dose máxima); mL = mg / (mg/mL)',
      const [FieldDef('p', 'Peso (kg)'), FieldDef('d', 'Dose (mg/kg)'), FieldDef('x', 'Dose max. (mg)'), FieldDef('c', 'Conc. (mg/mL)')],
      const ['ANSEL'], (v) {
    final r = _n(v, ['p', 'd'], (xs) {
      final res = Calc.doseMg(xs[0], xs[1], parseNum(v['x']) ?? 0);
      final conc = parseNum(v['c']) ?? 0;
      return 'Dose: ${fmt(res.mg)} mg${conc > 0 ? ' = ${fmt(res.mg / conc)} mL' : ''}${res.capped ? ' (limitada ao maximo; calc. ${fmt(res.raw)} mg)' : ''}';
    });
    return r;
  }),
  CalcDef('Manutenção hídrica pediátrica (Holliday-Segar)', 'Dia: 100 mL/kg (<=10 kg) + 50 mL/kg (10-20) + 20 mL/kg (>20) · Hora (4-2-1): 4/2/1 mL/kg/h',
      const [FieldDef('p', 'Peso (kg)')], const ['HS', 'NICE'], (v) {
    return _n(v, ['p'], (xs) =>
        'Por dia: ${fmt(Calc.hollidayDay(xs[0]), 0)} mL · Por hora (4-2-1): ${fmt(Calc.hollidayHour(xs[0]), 1)} mL/h\nVolume basal; ajustar a perdas, febre, função renal e tipo de solução.');
  }),
  CalcDef('Superfície corporal (Mosteller)', 'SC (m2) = raiz(altura[cm] x peso[kg] / 3600)',
      const [FieldDef('p', 'Peso (kg)'), FieldDef('h', 'Altura (cm)'), FieldDef('d', 'Dose por m2 (opcional)')], const ['MOST'], (v) {
    return _n(v, ['p', 'h'], (xs) {
      final b = Calc.bsa(xs[0], xs[1]);
      final dm2 = parseNum(v['d']) ?? 0;
      return 'SC: ${fmt(b, 3)} m2${dm2 > 0 ? ' · dose = ${fmt(b * dm2)} (unidade da dose/m2)' : ''}';
    });
  }),
  CalcDef('TFG pediátrica (Schwartz) · pediatria', 'TFGe (mL/min/1,73 m2) = 0,413 x altura[cm] / SCr',
      const [FieldDef('h', 'Altura (cm)'), FieldDef('s', 'Creatinina (mg/dL)')], const ['SCHW'], (v) {
    return _n(v, ['h', 's'], (xs) =>
        'TFGe: ${fmt(Calc.schwartz(xs[0], xs[1]), 1)} mL/min/1,73 m2\nEquação para crianças com DRC; menos confiável em neonatos e na lesão renal aguda.');
  }),
  CalcDef('Bomba de infusão (mcg/kg/min -> mL/h)', 'mL/h = dose x peso x 60 / (conc[mg/mL] x 1000); conc = mg / mL',
      const [FieldDef('d', 'Dose (mcg/kg/min)'), FieldDef('p', 'Peso (kg)'), FieldDef('c', 'Conc. (mg/mL)'), FieldDef('m', 'ou droga total (mg)'), FieldDef('vf', 'e volume final (mL)')],
      const ['ANSEL'], (v) {
    final d = parseNum(v['d']), p = parseNum(v['p']);
    if (d == null || p == null || d <= 0 || p <= 0) return null;
    var conc = parseNum(v['c']) ?? 0;
    if (conc <= 0) {
      final m = parseNum(v['m']) ?? 0, vf = parseNum(v['vf']) ?? 0;
      if (m > 0 && vf > 0) conc = m / vf;
    }
    if (conc <= 0) return 'Informe a concentração ou a droga total e o volume final.';
    return 'Concentração: ${fmt(conc, 4)} mg/mL · Vazão: ${fmt(Calc.infusionMlH(d, p, conc))} mL/h\nDroga de alta vigilância? Confira a concentração padrão da instituição e faça dupla checagem.';
  }),
  CalcDef('Gotejamento de soro', 'gotas/min = volume x fator / (horas x 60); macro 20 gts/mL, micro 60 gts/mL',
      const [FieldDef('v', 'Volume (mL)'), FieldDef('h', 'Tempo (h)'), FieldDef('k', 'Fator', FType.drip)], const ['ANSEL'], (v) {
    return _n(v, ['v', 'h'], (xs) {
      final f = double.tryParse(v['k'] ?? '20') ?? 20;
      return '${fmt(Calc.dropsMin(xs[0], xs[1], f), 1)} gotas/min · ${fmt(xs[0] / xs[1])} mL/h';
    });
  }),
  CalcDef('Diluição (C1 x V1 = C2 x V2)', 'V1 = C2 x V2 / C1 (mesma unidade em C1 e C2)',
      const [FieldDef('c1', 'Conc. do estoque (C1)'), FieldDef('c2', 'Conc. desejada (C2)'), FieldDef('v2', 'Volume final (V2, mL)')], const ['ANSEL'], (v) {
    return _n(v, ['c1', 'c2', 'v2'], (xs) {
      if (xs[1] > xs[0]) return 'C2 não pode ser maior que C1.';
      final v1 = Calc.dilutionV1(xs[0], xs[1], xs[2]);
      return 'Retirar ${fmt(v1)} mL do estoque e completar até ${fmt(xs[2])} mL (diluente: ${fmt(xs[2] - v1)} mL)';
    });
  }),
  CalcDef('Depuração de creatinina (Cockcroft-Gault) · adulto', 'ClCr (mL/min) = (140 - idade) x peso / (72 x SCr) x 0,85 se mulher',
      const [FieldDef('a', 'Idade (anos)'), FieldDef('p', 'Peso (kg)'), FieldDef('s', 'Creatinina (mg/dL)'), FieldDef('g', 'Sexo', FType.sex)],
      const ['CG'], (v) {
    return _n(v, ['a', 'p', 's'], (xs) =>
        'ClCr: ${fmt(Calc.crclCG(xs[0], xs[1], xs[2], v['g'] == 'f'), 1)} mL/min\nValidada em adultos; não usar em crianças. Escolha o peso conforme o protocolo do serviço.');
  }),
  CalcDef('TFG adulto (CKD-EPI 2021) · só adultos', '142 x min(SCr/k,1)^a x max(SCr/k,1)^-1,200 x 0,9938^idade x 1,012 (mulher); k=0,7 F / 0,9 M; a=-0,241 F / -0,302 M',
      const [FieldDef('a', 'Idade (anos)'), FieldDef('s', 'Creatinina (mg/dL)'), FieldDef('g', 'Sexo', FType.sex)], const ['CKDEPI'], (v) {
    return _n(v, ['a', 's'], (xs) => 'TFGe: ${fmt(Calc.ckdepi2021(xs[0], xs[1], v['g'] == 'f'), 1)} mL/min/1,73 m2');
  }),
];

class CalcPage extends StatelessWidget {
  final Catalog catalog;
  const CalcPage({super.key, required this.catalog});
  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(12), children: [
        const Text('Calculadoras clínicas', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
        const Text('Fórmula e fonte em cada calculadora. Resultados são auxiliares.', style: TextStyle(color: Colors.black54)),
        const SizedBox(height: 8),
        ...kCalcs.map((c) => CalcCard(def: c, catalog: catalog)),
      ]);
}

class CalcCard extends StatefulWidget {
  final CalcDef def;
  final Catalog catalog;
  const CalcCard({super.key, required this.def, required this.catalog});
  @override
  State<CalcCard> createState() => _CalcCardState();
}

class _CalcCardState extends State<CalcCard> {
  final Map<String, TextEditingController> ctl = {};
  final Map<String, String> pick = {'g': 'm', 'k': '20'};

  @override
  void initState() {
    super.initState();
    for (final f in widget.def.fields) {
      if (f.type == FType.num) ctl[f.key] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (final c in ctl.values) {
      c.dispose();
    }
    super.dispose();
  }

  Widget _input(FieldDef f) {
    if (f.type == FType.sex) {
      return SizedBox(
        width: 160,
        child: DropdownButtonFormField<String>(
          value: pick['g'],
          decoration: InputDecoration(labelText: f.label, border: const OutlineInputBorder(), isDense: true),
          items: const [DropdownMenuItem(value: 'm', child: Text('Masculino')), DropdownMenuItem(value: 'f', child: Text('Feminino'))],
          onChanged: (v) => setState(() => pick['g'] = v ?? 'm'),
        ),
      );
    }
    if (f.type == FType.drip) {
      return SizedBox(
        width: 170,
        child: DropdownButtonFormField<String>(
          value: pick['k'],
          decoration: InputDecoration(labelText: f.label, border: const OutlineInputBorder(), isDense: true),
          items: const [DropdownMenuItem(value: '20', child: Text('Macro (20)')), DropdownMenuItem(value: '60', child: Text('Micro (60)'))],
          onChanged: (v) => setState(() => pick['k'] = v ?? '20'),
        ),
      );
    }
    return SizedBox(
      width: 150,
      child: TextField(
        controller: ctl[f.key],
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        decoration: InputDecoration(labelText: f.label, border: const OutlineInputBorder(), isDense: true),
        onChanged: (_) => setState(() {}),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.def;
    final values = <String, String>{...pick};
    ctl.forEach((k, c) => values[k] = c.text);
    final res = d.run(values);
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: Color(0xFFDCE5E8))),
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(d.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 8, children: d.fields.map(_input).toList()),
          const SizedBox(height: 8),
          Text(res ?? 'Preencha os campos.', style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text(d.formula, style: const TextStyle(fontFamily: 'monospace', fontSize: 11.5, color: Colors.black54)),
          Wrap(
            spacing: 6,
            children: d.refs.where(widget.catalog.refs.containsKey).map((k) {
              final r = widget.catalog.refs[k]!;
              return ActionChip(label: Text('[$k]'), visualDensity: VisualDensity.compact, onPressed: () => openUrl(context, r.url));
            }).toList(),
          ),
        ]),
      ),
    );
  }
}

/* ---------------------------------------------------------------- Referências / Sobre */

class RefsPage extends StatelessWidget {
  final Catalog catalog;
  const RefsPage({super.key, required this.catalog});
  @override
  Widget build(BuildContext context) {
    final keys = catalog.refs.keys.toList()..sort();
    return ListView(padding: const EdgeInsets.all(12), children: [
      const Text('Referências', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
      const Text(
          'Nível do link: conferido = endereço aberto e conferido na elaboração; DOI = identificador registrado, não testado automaticamente; '
          'site oficial = página do órgão/editora; busca = link de pesquisa (não foi possível confirmar endereço direto).',
          style: TextStyle(fontSize: 12, color: Colors.black54)),
      const SizedBox(height: 8),
      ...keys.map((k) {
        final r = catalog.refs[k]!;
        return ListTile(
          dense: true,
          contentPadding: EdgeInsets.zero,
          title: Text('[$k] ${r.text}', style: const TextStyle(fontSize: 13)),
          subtitle: Text(r.levelLabel, style: TextStyle(fontSize: 11, color: r.level == 'ok' ? const Color(0xFF18794E) : Colors.black54)),
          trailing: const Icon(Icons.open_in_new, size: 18),
          onTap: () => openUrl(context, r.url),
        );
      }),
    ]);
  }
}

class AboutPage extends StatelessWidget {
  final Catalog catalog;
  const AboutPage({super.key, required this.catalog});
  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(14), children: [
        const Text('Sobre', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        const Text(_warn, style: TextStyle(color: Color(0xFFB42318), fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        const Text(
            'O PosologiaPED é voltado a hospitais pediátricos: a faixa padrão é lactentes e crianças, neonatos têm seleção própria, o alerta pediátrico aparece antes das doses e as calculadoras pediátricas vêm primeiro. Adultos e idosos são só referência. '
            'O aplicativo não pertence a nenhum hospital. A lista de exemplo (224 itens, 16 seções) foi transcrita de um PDF escaneado de uma lista institucional usada apenas como exemplo. Posologias, efeitos adversos e alertas foram '
            'compilados por um assistente de IA a partir do conhecimento das fontes citadas, sem consulta item a item aos compêndios pagos. '
            'Confira toda dose com um farmacêutico.'),
        const SizedBox(height: 10),
        const Text('Classificações', style: TextStyle(fontWeight: FontWeight.w700)),
        const Text('- Alta vigilância: lista ISMP Brasil 2019 (documento conferido).\n'
            '- Nefro/Hepato "tóxico" e "atenção": escala interna e não oficial deste guia, apoiada em Perazella 2018 e LiverTox.\n'
            '- Controlado: seções de controle especial (Portaria SVS/MS 344/98).'),
        const SizedBox(height: 10),
        const Text('Privacidade', style: TextStyle(fontWeight: FontWeight.w700)),
        const Text('Favoritos ficam só neste aparelho. O aplicativo funciona 100% offline (os 224 medicamentos, doses, segurança, calculadoras e referências já vêm dentro do APK), não pede permissão de internet e não envia dados. Só os links das referências precisam de conexão, no navegador.'),
        const SizedBox(height: 10),
        Text('Versão ${catalog.version} · ${catalog.items.length} itens · ${catalog.mono.length} monografias',
            style: const TextStyle(color: Colors.black54, fontSize: 12)),
      ]);
}
