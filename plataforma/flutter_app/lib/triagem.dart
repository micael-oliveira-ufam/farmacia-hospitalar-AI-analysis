import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle, Clipboard, ClipboardData;
import 'models.dart';
import 'util.dart';

/// Triagem de prescricao (interacoes, duplicidades, funcao renal/hepatica, faixa etaria).
/// Logica propria, inspirada nas categorias de alerta do NoHarm.ai (MIT, https://github.com/noharm-ai);
/// nenhum codigo ou dado do NoHarm foi copiado. Regras: assets/interacoes.json (compiladas por IA; exigem revisao farmaceutica).
class InterRule {
  final String id, titulo, mec, cond;
  final dynamic a, b;
  final int sev, min;
  final String? so;
  final List<String> ref;
  InterRule(this.id, this.a, this.b, this.sev, this.titulo, this.mec, this.cond, this.ref, this.so, this.min);
}

class InterData {
  final Map<String, List<String>> grupos;
  final List<InterRule> regras;
  InterData(this.grupos, this.regras);
  static Future<InterData> load() async {
    final j = jsonDecode(await rootBundle.loadString('assets/interacoes.json')) as Map<String, dynamic>;
    final g = (j['grupos'] as Map).map((k, v) => MapEntry(k as String, List<String>.from(v as List)));
    final r = (j['regras'] as List).map((e) {
      final m = e as Map<String, dynamic>;
      return InterRule(m['id'] as String, m['a'], m['b'], m['sev'] as int, m['titulo'] as String, m['mec'] as String, m['cond'] as String,
          List<String>.from(m['ref'] as List), m['so'] as String?, (m['min'] ?? 0) as int);
    }).toList();
    return InterData(g, r);
  }
}

class Alerta {
  final int sev; // 2 grave, 1 atencao, 0 informacao
  final String tipo, titulo, mec, cond;
  final List<Item> itens;
  Alerta(this.sev, this.tipo, this.titulo, this.itens, this.mec, this.cond);
}

String ingOf(String name) => norm(name.split(RegExp(r'[\d(]')).first).replaceAll(RegExp(r'[^a-z0-9+ ]'), ' ').replaceAll(RegExp(r'\s+'), ' ').trim();
String _short(String s) => s.split(RegExp(r'[\d(,]')).first.trim();

List<Alerta> analisar(Catalog c, InterData d, List<Item> itens, {required String age, double? crcl, bool hepatic = false}) {
  final out = <Alerta>[];
  final seen = <String>{};
  void add(Alerta a) {
    final k = '${a.tipo}|${a.titulo}|${(a.itens.map((i) => i.id).toList()..sort()).join(",")}';
    if (seen.add(k)) out.add(a);
  }

  final ing = {for (final i in itens) i.id: ingOf(c.mono[i.key]!.name)};
  List<String> exp(dynamic s) => s == null ? <String>[] : (s as String).startsWith('@') ? (d.grupos[s.substring(1)] ?? <String>[]) : [s];
  bool has(Item i, List<String> toks) => toks.any((t) => ' ${ing[i.id]} '.contains(' $t '));
  final done = <String>{};
  final rules = [...d.regras]..sort((x, y) => (y.so != null ? 1 : 0) - (x.so != null ? 1 : 0));
  for (final r in rules) {
    if (r.so != null && r.so != age) continue;
    final A = exp(r.a), B = exp(r.b);
    if (r.min > 0) {
      final hit = itens.where((i) => has(i, A)).toList();
      if (hit.length >= r.min) add(Alerta(r.sev, 'interacao', r.titulo, hit, r.mec, r.cond));
      continue;
    }
    for (final x in itens) {
      for (final y in itens) {
        if (x.id == y.id || !has(x, A) || !has(y, B)) continue;
        final pk = ([x.id, y.id]..sort()).join('-');
        if (done.contains('p:$pk:${r.titulo}')) continue;
        if (r.so == null && done.contains('s:$pk:${r.titulo}')) continue;
        done.add('p:$pk:${r.titulo}');
        if (r.so != null) done.add('s:$pk:${r.titulo}');
        add(Alerta(r.sev, 'interacao', r.titulo, [x, y], r.mec, r.cond));
      }
    }
  }
  final byIng = <String, List<Item>>{}, byCls = <String, List<Item>>{};
  for (final i in itens) {
    (byIng[ing[i.id]!] ??= []).add(i);
    (byCls[c.mono[i.key]!.cls] ??= []).add(i);
  }
  byIng.forEach((n, a) {
    if (a.length > 1 && n.isNotEmpty) add(Alerta(2, 'duplicidade', 'Mesmo princípio ativo em duplicidade', a, 'O mesmo medicamento aparece mais de uma vez.', 'Confirmar se é intencional e somar a dose diária total.'));
  });
  byCls.forEach((cl, a) {
    if (a.map((i) => ing[i.id]).toSet().length > 1) add(Alerta(1, 'duplicidade', 'Mesma classe/função: $cl', a, 'Possível duplicidade terapêutica.', 'Confirmar a intenção clínica.'));
  });
  if (crcl != null && crcl < 60) {
    final hit = itens.where((i) => c.safety[i.key]!.nef > 0).toList();
    if (hit.isNotEmpty) {
      add(Alerta(crcl < 30 || hit.any((i) => c.safety[i.key]!.nef == 2) ? 2 : 1, 'renal', 'Função renal reduzida (ClCr ${_f(crcl)} mL/min)', hit,
          hit.map((i) => '${_short(i.desc)}: ${c.safety[i.key]!.nefN}').join(' • '), 'Checar ajuste de dose/intervalo e monitorar creatinina.'));
    }
  }
  if (hepatic) {
    final hit = itens.where((i) => c.safety[i.key]!.hep > 0).toList();
    if (hit.isNotEmpty) {
      add(Alerta(hit.any((i) => c.safety[i.key]!.hep == 2) ? 2 : 1, 'hepatica', 'Insuficiência hepática informada', hit,
          hit.map((i) => '${_short(i.desc)}: ${c.safety[i.key]!.hepN}').join(' • '), 'Checar ajuste de dose e monitorar enzimas.'));
    }
  }
  final nef = itens.where((i) => c.safety[i.key]!.nef == 2).toList();
  if (nef.length >= 2) add(Alerta(2, 'soma', 'Vários fármacos nefrotóxicos', nef, 'Nefrotoxicidade somada.', 'Verificar função renal, hidratação e necessidade de cada item.'));
  final hep = itens.where((i) => c.safety[i.key]!.hep == 2).toList();
  if (hep.length >= 2) add(Alerta(1, 'soma', 'Vários fármacos hepatotóxicos', hep, 'Hepatotoxicidade somada.', 'Verificar função hepática e o uso de cada item.'));
  if (age == 'neo' || age == 'ped') {
    for (final i in itens) {
      final pa = c.mono[i.key]!.pa;
      if (pa != null && pa.isNotEmpty) {
        add(Alerta(age == 'neo' && RegExp(r'contraindic|evitar|n[aã]o usar', caseSensitive: false).hasMatch(pa) ? 2 : 1, 'faixa', 'Alerta pediátrico: ${_short(i.desc)}', [i], pa, 'Conferir indicação, dose por peso e faixa etária.'));
      }
    }
  }
  final mav = itens.where((i) => c.safety[i.key]!.ismp.isNotEmpty).toList();
  if (mav.isNotEmpty) add(Alerta(0, 'info', 'Alta vigilância (ISMP Brasil)', mav, 'Medicamentos potencialmente perigosos de uso hospitalar.', 'Dupla checagem independente.'));
  final ctl = itens.where((i) => controlledSections.contains(i.sec)).toList();
  if (ctl.isNotEmpty) add(Alerta(0, 'info', 'Medicamentos controlados', ctl, 'Exigem receituário e registro (Portaria SVS/MS 344/98).', 'Conferir notificação/receita.'));
  out.sort((a, b) => b.sev.compareTo(a.sev));
  return out;
}

String parecer(List<Alerta> al, String age, double? crcl, bool hep, List<Item> itens) {
  const sv = {2: 'GRAVE', 1: 'ATENÇÃO', 0: 'INFORMAÇÃO'};
  final b = StringBuffer('TRIAGEM DE PRESCRIÇÃO (apoio à decisão; não substitui a análise farmacêutica)\n');
  b.writeln('Paciente: faixa $age${crcl != null ? '; ClCr ${_f(crcl)} mL/min' : ''}${hep ? '; insuficiência hepática' : ''}');
  b.writeln('Itens: ${itens.map((i) => i.desc).join('; ')}\n');
  if (al.isEmpty) b.writeln('Nenhum alerta pelas regras cadastradas (isso NÃO exclui interações não cobertas).');
  for (var n = 0; n < al.length; n++) {
    final a = al[n];
    b.writeln('${n + 1}. [${sv[a.sev]}] ${a.titulo} — ${a.itens.map((i) => _short(i.desc)).join(' + ')}\n   Mecanismo/risco: ${a.mec}\n   Conduta sugerida: ${a.cond}\n');
  }
  return b.toString();
}

class TriagemPage extends StatefulWidget {
  final Catalog catalog;
  const TriagemPage({super.key, required this.catalog});
  @override
  State<TriagemPage> createState() => _TriagemPageState();
}

class _TriagemPageState extends State<TriagemPage> {
  InterData? data;
  final itens = <Item>[];
  String age = 'adu';
  bool hep = false;
  final crclCtl = TextEditingController();
  final qCtl = TextEditingController();
  String q = '';

  @override
  void initState() {
    super.initState();
    InterData.load().then((d) {
      if (mounted) setState(() => data = d);
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.catalog;
    if (data == null) return const Center(child: CircularProgressIndicator());
    final crcl = parseNum(crclCtl.text);
    final al = analisar(c, data!, itens, age: age, crcl: crcl, hepatic: hep);
    final nG = al.where((a) => a.sev == 2).length;
    final sugg = q.length < 2 ? <Item>[] : c.items.where((i) => !itens.any((x) => x.id == i.id) && norm(i.desc).contains(norm(q))).take(6).toList();
    Color col(int s) => s == 2 ? const Color(0xFFC0392B) : s == 1 ? const Color(0xFFE0A800) : const Color(0xFF12808A);
    return ListView(padding: const EdgeInsets.all(12), children: [
      const Text('Triagem de prescrição', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
      const SizedBox(height: 8),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: SegmentedButton<String>(
          showSelectedIcon: false,
          segments: const [
            ButtonSegment(value: 'neo', label: Text('Neonato')),
            ButtonSegment(value: 'ped', label: Text('Criança')),
            ButtonSegment(value: 'adu', label: Text('Adulto')),
            ButtonSegment(value: 'ido', label: Text('Idoso')),
          ],
          selected: {age},
          onSelectionChanged: (s) => setState(() => age = s.first),
        ),
      ),
      const SizedBox(height: 8),
      Row(children: [
        SizedBox(
            width: 130,
            child: TextField(
                controller: crclCtl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'ClCr (mL/min)', border: OutlineInputBorder(), isDense: true),
                onChanged: (_) => setState(() {}))),
        const SizedBox(width: 8),
        Expanded(child: CheckboxListTile(dense: true, contentPadding: EdgeInsets.zero, value: hep, onChanged: (v) => setState(() => hep = v ?? false), title: const Text('Insuficiência hepática'))),
      ]),
      TextField(
          controller: qCtl,
          decoration: const InputDecoration(prefixIcon: Icon(Icons.add), hintText: 'Adicionar medicamento', border: OutlineInputBorder(), isDense: true),
          onChanged: (v) => setState(() => q = v.trim())),
      for (final i in sugg)
        ListTile(
            dense: true,
            title: Text(i.desc),
            trailing: const Icon(Icons.add),
            onTap: () => setState(() {
                  itens.add(i);
                  qCtl.clear();
                  q = '';
                })),
      if (itens.isNotEmpty)
        Container(
          margin: const EdgeInsets.only(top: 10),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: nG > 0 ? const Color(0xFFFDEEEC) : const Color(0xFFE8F6EE), borderRadius: BorderRadius.circular(12)),
          child: Text(nG > 0 ? '$nG ${nG == 1 ? 'alerta grave' : 'alertas graves'}' : 'Nenhum alerta grave', style: const TextStyle(fontWeight: FontWeight.w700)),
        ),
      for (final a in al)
        Container(
          margin: const EdgeInsets.only(top: 8),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border(left: BorderSide(color: col(a.sev), width: 6))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(a.titulo, style: const TextStyle(fontWeight: FontWeight.w700)),
            Text(a.itens.map((i) => _short(i.desc)).join(' + '), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 4),
            Text(a.mec, style: const TextStyle(fontSize: 13.5)),
            Text('Conduta sugerida: ${a.cond}', style: const TextStyle(fontSize: 13.5)),
          ]),
        ),
      if (itens.isNotEmpty) ...[
        const Padding(padding: EdgeInsets.only(top: 12), child: Text('Itens da prescrição', style: TextStyle(fontWeight: FontWeight.w700))),
        for (final i in itens) ListTile(dense: true, title: Text(i.desc), trailing: IconButton(icon: const Icon(Icons.close), onPressed: () => setState(() => itens.remove(i)))),
        Row(children: [
          FilledButton(onPressed: () => Clipboard.setData(ClipboardData(text: parecer(al, age, crcl, hep, itens))), child: const Text('Copiar parecer')),
          const SizedBox(width: 8),
          OutlinedButton(onPressed: () => setState(itens.clear), child: const Text('Limpar')),
        ]),
      ],
      const SizedBox(height: 10),
      const Text(
          'Apoio à decisão, não prescrição. Cobre apenas os medicamentos do guia e as regras cadastradas (compiladas por IA; revisão farmacêutica obrigatória). Não avalia dose total nem alergias. Inspirada nas categorias de alerta do NoHarm.ai (MIT, github.com/noharm-ai); nenhum código ou dado do NoHarm foi copiado.',
          style: TextStyle(fontSize: 12, color: Colors.black54)),
    ]);
  }
}

String _f(double v) => v == v.roundToDouble() ? v.toInt().toString() : v.toString();
