import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle, Clipboard, ClipboardData;
import 'models.dart';
import 'util.dart';

/// Dose do paciente (calculadora do ICAM unificada ao PosologiaPED). Faixas: assets/dose.json
/// (base ICAM compilada por IA; revisao farmaceutica obrigatoria). Espelha guia/dose.js.
class DoseMed {
  final String id, n, c, cat;
  final List<String> v, mono;
  final List<({String f, double k, String u})> ap;
  final double? min, max, dia, abs, imin, imax;
  final String? obs, p344;
  final bool ctl, du, fd, col;
  DoseMed(this.id, this.n, this.c, this.cat, this.v, this.mono, this.ap, this.min, this.max, this.dia, this.abs, this.imin, this.imax, this.obs, this.p344, this.ctl, this.du, this.fd, this.col);
  factory DoseMed.fromJson(Map<String, dynamic> j) {
    double? d(dynamic x) => x == null ? null : (x as num).toDouble();
    return DoseMed(j['id'] as String, j['n'] as String, j['c'] as String, j['cat'] as String, List<String>.from(j['v'] as List), List<String>.from(j['mono'] as List),
        (j['ap'] as List).map((e) => (f: (e as Map)['f'] as String, k: (e['k'] as num).toDouble(), u: e['u'] as String)).toList(),
        d(j['min']), d(j['max']), d(j['dia']), d(j['abs']), d(j['imin']), d(j['imax']), j['obs'] as String?, j['p344']?.toString(), j['ctl'] == true, j['du'] == true, j['fd'] == true, j['col'] == true);
  }
  static Future<List<DoseMed>> load() async {
    final j = jsonDecode(await rootBundle.loadString('assets/dose.json')) as Map<String, dynamic>;
    return (j['itens'] as List).map((e) => DoseMed.fromJson(e as Map<String, dynamic>)).toList();
  }
}

class Paciente {
  double idadeAnos = double.nan, peso = double.nan;
  String sexo = '', renal = 'normal', hepatica = 'normal';
  bool gestante = false, prematuro = false, desid = false, desn = false, outra = false;
}

class Aviso {
  final int sev; // 2 grave, 1 atencao
  final String txt;
  Aviso(this.sev, this.txt);
}

class DoseRes {
  final double mg, dia, kgDia;
  final bool capped;
  final String? uq, un;
  DoseRes(this.mg, this.dia, this.kgDia, this.capped, this.uq, this.un);
}

class Resultado {
  final List<Aviso> avisos = [];
  DoseRes? min, rec, max;
  bool conservadora = false, semFaixa = false;
  double intervalo = 8, dosesDia = 3;
  String fe = 'ped';
}

const _std = [1, 2, 3, 4, 6, 8, 12, 24, 48];
List<double> intervalosPermitidos(DoseMed m) {
  final lo = m.imin ?? 4, hi = m.imax ?? 24;
  final l = _std.where((h) => h >= lo && h <= hi).map((e) => e.toDouble()).toList();
  return l.isEmpty ? [m.imin ?? m.imax ?? 8] : l;
}

double intervaloPadrao(DoseMed m) {
  final l = intervalosPermitidos(m);
  return l.contains(8) && (m.imin == null || m.imin! <= 8) ? 8 : l.first;
}

String faixaEtaria(double a) => a * 365.25 <= 28 ? 'neo' : a < 18 ? 'ped' : a < 65 ? 'adu' : 'ido';
String fq(double q) => (q >= 100 ? q.round().toString() : q >= 10 ? q.toStringAsFixed(1) : q.toStringAsFixed(2)).replaceAll('.', ',');

const _risk = <(String, String, String)>[
  ('antimicrob|antibi|penicil|cefalo|aminoglic|glicopept|carbapen|macrol|quinolon|sulfa|polimix|nitroimid', 'falha do tratamento, persistência ou recidiva da infecção e seleção de resistência bacteriana', 'toxicidade dose-dependente do antimicrobiano (renal, auditiva, neurológica ou hematológica) e superinfecção'),
  ('antifung|antivir|antiparasit|antihelm', 'falha terapêutica e persistência da infecção ou parasitose', 'toxicidade hepática, renal e neurológica dose-dependente'),
  ('anticonvuls|antiepilep|barbit|benzodiaz', 'perda do controle das crises e risco de estado de mal epiléptico', 'sedação excessiva, ataxia, depressão respiratória e toxicidade hepática ou hematológica'),
  ('opioide|opiaceo', 'analgesia inadequada e, em uso contínuo, síndrome de abstinência', 'depressão respiratória, sedação profunda, bradicardia e parada respiratória (reverter com naloxona)'),
  ('analges|antiterm|anti-inflam|aine|antipir', 'dor ou febre não controladas', 'hepatotoxicidade (paracetamol), lesão renal e sangramento gastrointestinal (AINEs)'),
  ('corticoid|glicocort', 'controle insuficiente da inflamação ou do broncoespasmo; insuficiência adrenal se uso prolongado e suspensão', 'hiperglicemia, hipertensão, retenção hídrica, supressão adrenal e imunossupressão'),
  ('broncodilat|beta-2|agonista|asma', 'broncoespasmo e dispneia não controlados', 'taquicardia, tremores, hipocalemia e arritmias'),
  ('antifibrin|hemostat|fitomenadiona', 'sangramento não controlado ou recorrente', 'tromboembolismo, convulsões (doses altas) e alterações visuais'),
  ('anticoag|heparin|antitromb', 'trombose e embolia por anticoagulação insuficiente', 'hemorragia grave'),
  ('insulin|hipoglic|antidiab', 'hiperglicemia persistente e risco de cetoacidose', 'hipoglicemia grave, convulsão e coma'),
  ('vasopress|inotr|cardiot|catecol', 'hipotensão e perfusão inadequada', 'taquiarritmias, isquemia, hipertensão grave e necrose por extravasamento'),
  ('hipert|diuret|vasodilat|betabloq', 'controle inadequado da pressão arterial ou do volume', 'hipotensão, bradicardia, distúrbios eletrolíticos e lesão renal'),
  ('sedat|hipn|anest|bloqueador neuro|relaxante', 'sedação, analgesia ou bloqueio insuficientes, com consciência e dor durante procedimentos', 'depressão respiratória e cardiovascular, apneia e hipotensão'),
  ('eletrolit|potassio|magnes|calcio|sodio', 'distúrbio hidroeletrolítico não corrigido', 'distúrbios graves do eletrólito, arritmias cardíacas e parada'),
  ('antipsic|neurolept', 'controle inadequado da agitação ou dos sintomas psicóticos', 'sintomas extrapiramidais, prolongamento do QT, sedação e síndrome neuroléptica maligna'),
];

String _riscoClasse(DoseMed m, bool sup) {
  final c = norm('${m.c} ${m.cat}');
  for (final r in _risk) {
    if (RegExp(r.$1).hasMatch(c)) return sup ? r.$3 : r.$2;
  }
  return sup ? 'toxicidade dose-dependente com efeitos adversos graves, maior em neonatos, lactentes e na disfunção renal ou hepática' : 'efeito terapêutico insuficiente, falha do tratamento e atraso na resposta clínica';
}

Resultado calcular(DoseMed m, Paciente p, Catalog? cat, {double? intervalo, int ap = 0}) {
  final r = Resultado();
  r.fe = faixaEtaria(p.idadeAnos);
  r.intervalo = intervalo ?? intervaloPadrao(m);
  final n = 24 / r.intervalo;
  r.dosesDia = n;
  final key = m.mono.isNotEmpty ? m.mono.first : null;
  final mono = key != null ? cat?.mono[key] : null, saf = key != null ? cat?.safety[key] : null;
  final nef = saf?.nef ?? 0, hep = saf?.hep ?? 0;
  final renalImp = p.renal == 'moderada' || p.renal == 'grave' || p.renal == 'dialise';
  final hepImp = p.hepatica == 'moderada' || p.hepatica == 'grave';
  var cons = false;
  if (renalImp && nef > 0) {
    cons = true;
    r.avisos.add(Aviso(2, 'Função renal ${p.renal}: este medicamento tem alerta renal (${saf!.nefN}). A faixa padrão vale para função normal; ajuste de dose/intervalo é necessário. Use a dose conservadora só como ponto de partida e confirme em referência renal.'));
  } else if (renalImp) {
    r.avisos.add(Aviso(1, 'Função renal ${p.renal}: confirme se o fármaco é de eliminação renal e se há ajuste de dose/intervalo.'));
  }
  if (hepImp && hep > 0) {
    cons = true;
    r.avisos.add(Aviso(2, 'Insuficiência hepática ${p.hepatica}: este medicamento tem alerta hepático (${saf!.hepN}). Use a dose conservadora como ponto de partida e confirme o ajuste.'));
  } else if (hepImp) {
    r.avisos.add(Aviso(1, 'Insuficiência hepática ${p.hepatica}: confirme metabolismo hepático e a necessidade de redução de dose.'));
  }
  if (r.fe == 'neo' || p.prematuro) {
    cons = true;
    r.avisos.add(Aviso(2, '${p.prematuro ? 'Prematuro' : 'Neonato'}: a faixa por peso pode não se aplicar (imaturidade renal e hepática). Confirme dose e intervalo em referência neonatal. A dose mostrada é conservadora.'));
  }
  if ((mono?.pa ?? '').isNotEmpty && (r.fe == 'neo' || r.fe == 'ped')) r.avisos.add(Aviso(2, 'Alerta pediátrico: ${mono!.pa}'));
  if (r.fe == 'ido') r.avisos.add(Aviso(1, 'Idoso: iniciar com doses menores e considerar função renal/hepática reduzida e interações.'));
  if (p.gestante) r.avisos.add(Aviso(1, 'Gestante/lactante: segurança fetal e na amamentação não consta na base; confira o medicamento.'));
  if (p.desid) r.avisos.add(Aviso(1, 'Desidratação: reduz a depuração renal e aumenta o risco de toxicidade; reavalie a dose.'));
  if (p.desn) r.avisos.add(Aviso(1, 'Desnutrição: pode alterar distribuição e ligação a proteínas; monitore resposta e toxicidade.'));
  if (p.outra) r.avisos.add(Aviso(1, 'Condição grave informada: a base não ajusta a dose por ela; decisão clínica individualizada.'));
  if (r.fe == 'adu' || r.fe == 'ido') r.avisos.add(Aviso(1, 'A base de faixas é pediátrica (mg/kg). Em adultos a dose é limitada pela dose máxima cadastrada; confira a dose de adulto da monografia.'));
  if (m.min == null || m.max == null) {
    r.semFaixa = true;
    r.avisos.add(Aviso(1, 'Sem faixa de dose em mg/kg cadastrada para este item. Avalie clinicamente.'));
    return r;
  }
  r.conservadora = cons;
  final capDose = math.min(m.abs ?? double.infinity, m.dia != null ? m.dia! * p.peso : double.infinity) / n;
  final a = m.ap[math.min(ap, m.ap.length - 1)];
  DoseRes mk(double kg) {
    var mg = kg * p.peso;
    var capped = false;
    if (mg > capDose) {
      mg = capDose;
      capped = true;
    }
    final un = a.u.contains('/') ? a.u.split('/').last : 'unidade(s)';
    return DoseRes(mg, mg * n, mg * n / p.peso, capped, a.k > 0 ? fq(mg / a.k) : null, un);
  }

  r.min = mk(m.min!);
  r.max = mk(m.max!);
  r.rec = mk(cons ? m.min! : (m.min! + m.max!) / 2);
  return r;
}

/// Avalia uma dose prescrita (mg por administracao); devolve (rotulo, nivel 0 ok/1 atencao/2 grave, linhas).
(String, int, List<String>) avaliar(DoseMed m, Paciente p, Resultado r, double mg, Catalog? cat) {
  final n = r.dosesDia, kgDia = mg / p.peso * n, mgDia = mg * n;
  final key = m.mono.isNotEmpty ? m.mono.first : null;
  final saf = key != null ? cat?.safety[key] : null;
  final linhas = <String>[];
  var nivel = 0;
  var rot = 'Dose dentro da faixa';
  final minMg = r.min!.mg, maxMg = r.max!.mg;
  if (mg < minMg * 0.999) {
    rot = mg < minMg * 0.5 ? 'SUBDOSE IMPORTANTE' : 'SUBDOSE';
    nivel = 1;
    linhas.add('Dose de ${fq(mg)} mg está ${(mg / minMg * 100).round()}% da dose mínima (${fq(minMg)} mg por dose).');
    linhas.add('Risco da subdose: ${_riscoClasse(m, false)}.');
  }
  final exAbs = m.abs != null && mgDia > m.abs! * 1.0001, exKg = m.dia != null && kgDia > m.dia! * 1.0001;
  if (mg > maxMg * 1.0001 || exAbs || exKg) {
    rot = mg > maxMg * 2 || (m.abs != null && mgDia > m.abs! * 2) ? 'SUPERDOSE IMPORTANTE' : 'SUPERDOSE';
    nivel = 2;
    if (mg > maxMg * 1.0001) linhas.add('Dose de ${fq(mg)} mg está ${(mg / maxMg * 100).round()}% da dose máxima (${fq(maxMg)} mg por dose).');
    if (exKg) linhas.add('Dose diária de ${kgDia.toStringAsFixed(1)} mg/kg/dia excede o máximo de ${m.dia} mg/kg/dia.');
    if (exAbs) linhas.add('Dose diária de ${mgDia.toStringAsFixed(0)} mg/dia excede o teto absoluto de ${m.abs} mg/dia.');
    var sup = _riscoClasse(m, true);
    final g = saf?.graves ?? '';
    if (g.isNotEmpty) sup = 'efeitos graves descritos na monografia: $g. Também: $sup';
    if ((saf?.ismp ?? '').isNotEmpty) sup += '. Medicamento de ALTA VIGILÂNCIA (${saf!.ismp}): erro de dose pode causar dano grave';
    linhas.add('Risco da superdose: $sup.');
    if (p.peso < 15 || r.fe == 'neo') linhas.add('Em neonatos e crianças pequenas a margem de segurança é estreita; um erro de dose (inclusive de 10 vezes por vírgula) pode ser fatal. Reconfira o cálculo e a diluição.');
    if (p.renal != 'normal' || p.hepatica != 'normal') linhas.add('Com insuficiência renal ou hepática o fármaco acumula e o risco de toxicidade é maior.');
  }
  linhas.add('Apoio à decisão: confirme com o prescritor e o farmacêutico responsável antes de dispensar ou administrar.');
  return (rot, nivel, linhas);
}

class DosePage extends StatefulWidget {
  final Catalog catalog;
  const DosePage({super.key, required this.catalog});
  @override
  State<DosePage> createState() => _DosePageState();
}

class _DosePageState extends State<DosePage> {
  List<DoseMed>? meds;
  final p = Paciente();
  final idadeC = TextEditingController(), pesoC = TextEditingController(), qC = TextEditingController(), prescC = TextEditingController();
  String un = 'anos', q = '';
  DoseMed? sel;
  int ap = 0;
  double? iv;

  @override
  void initState() {
    super.initState();
    DoseMed.load().then((l) {
      if (mounted) setState(() => meds = l);
    });
  }

  void _sync() {
    final i = parseNum(idadeC.text);
    p.idadeAnos = i == null ? double.nan : (un == 'dias' ? i / 365.25 : un == 'meses' ? i / 12 : i);
    p.peso = parseNum(pesoC.text) ?? double.nan;
  }

  @override
  Widget build(BuildContext context) {
    if (meds == null) return const Center(child: CircularProgressIndicator());
    _sync();
    final c = widget.catalog;
    final sugg = q.length < 2 ? <DoseMed>[] : meds!.where((d) => norm('${d.n} ${d.c}').contains(norm(q))).take(8).toList();
    Color col(int s) => s == 2 ? const Color(0xFFC0392B) : s == 1 ? const Color(0xFFE0A800) : const Color(0xFF18794E);
    final ready = sel != null && p.idadeAnos >= 0 && p.peso > 0;
    Resultado? r;
    if (ready) r = calcular(sel!, p, c, intervalo: iv, ap: ap);
    final pr = parseNum(prescC.text);
    Widget card(String t, DoseRes? d, bool rec) => Expanded(
          child: Container(
            margin: const EdgeInsets.all(3),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: rec ? const Color(0xFFE3F3F4) : Colors.white, border: Border.all(color: rec ? const Color(0xFF12808A) : const Color(0xFFE1EAEC), width: rec ? 2 : 1), borderRadius: BorderRadius.circular(12)),
            child: Column(children: [
              Text(t, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.black54)),
              Text('${fq(d!.mg)} mg', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              if (d.uq != null) Text('= ${d.uq} ${d.un}', style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF12808A), fontSize: 13)),
              Text('${fq(d.dia)} mg/dia', style: const TextStyle(fontSize: 11, color: Colors.black54)),
            ]),
          ),
        );
    return ListView(padding: const EdgeInsets.all(12), children: [
      const Text('Dose do paciente', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
      const SizedBox(height: 8),
      Row(children: [
        Expanded(child: TextField(controller: idadeC, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Idade', border: OutlineInputBorder(), isDense: true), onChanged: (_) => setState(() {}))),
        const SizedBox(width: 8),
        DropdownButton<String>(value: un, items: const [DropdownMenuItem(value: 'anos', child: Text('anos')), DropdownMenuItem(value: 'meses', child: Text('meses')), DropdownMenuItem(value: 'dias', child: Text('dias'))], onChanged: (v) => setState(() => un = v ?? 'anos')),
        const SizedBox(width: 8),
        Expanded(child: TextField(controller: pesoC, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Peso (kg)', border: OutlineInputBorder(), isDense: true), onChanged: (_) => setState(() {}))),
      ]),
      const SizedBox(height: 8),
      SegmentedButton<String>(
        showSelectedIcon: false,
        emptySelectionAllowed: true,
        segments: const [ButtonSegment(value: 'F', label: Text('Feminino')), ButtonSegment(value: 'M', label: Text('Masculino'))],
        selected: p.sexo.isEmpty ? <String>{} : {p.sexo},
        onSelectionChanged: (s) => setState(() => p.sexo = s.isEmpty ? '' : s.first),
      ),
      const SizedBox(height: 8),
      Row(children: [
        Expanded(
            child: DropdownButtonFormField<String>(
          isExpanded: true,
          value: p.renal,
          decoration: const InputDecoration(labelText: 'Função renal', border: OutlineInputBorder(), isDense: true),
          items: const [
            DropdownMenuItem(value: 'normal', child: Text('Normal')),
            DropdownMenuItem(value: 'leve', child: Text('Leve (TFG 60–89)')),
            DropdownMenuItem(value: 'moderada', child: Text('Moderada (30–59)')),
            DropdownMenuItem(value: 'grave', child: Text('Grave (< 30)')),
            DropdownMenuItem(value: 'dialise', child: Text('Diálise')),
          ],
          onChanged: (v) => setState(() => p.renal = v ?? 'normal'),
        )),
        const SizedBox(width: 8),
        Expanded(
            child: DropdownButtonFormField<String>(
          isExpanded: true,
          value: p.hepatica,
          decoration: const InputDecoration(labelText: 'Função hepática', border: OutlineInputBorder(), isDense: true),
          items: const [
            DropdownMenuItem(value: 'normal', child: Text('Normal')),
            DropdownMenuItem(value: 'leve', child: Text('Leve (Child A)')),
            DropdownMenuItem(value: 'moderada', child: Text('Moderada (Child B)')),
            DropdownMenuItem(value: 'grave', child: Text('Grave (Child C)')),
          ],
          onChanged: (v) => setState(() => p.hepatica = v ?? 'normal'),
        )),
      ]),
      Wrap(spacing: 6, children: [
        FilterChip(label: const Text('Gestante/lactante'), selected: p.gestante, onSelected: (v) => setState(() => p.gestante = v)),
        FilterChip(label: const Text('Prematuro'), selected: p.prematuro, onSelected: (v) => setState(() => p.prematuro = v)),
        FilterChip(label: const Text('Desidratação'), selected: p.desid, onSelected: (v) => setState(() => p.desid = v)),
        FilterChip(label: const Text('Desnutrição'), selected: p.desn, onSelected: (v) => setState(() => p.desn = v)),
        FilterChip(label: const Text('Outra condição grave'), selected: p.outra, onSelected: (v) => setState(() => p.outra = v)),
      ]),
      const Divider(height: 24),
      TextField(controller: qC, decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Buscar medicamento', border: OutlineInputBorder(), isDense: true), onChanged: (v) => setState(() => q = v.trim())),
      for (final d in sugg)
        ListTile(
            dense: true,
            title: Text(d.n),
            subtitle: Text(d.c, maxLines: 1, overflow: TextOverflow.ellipsis),
            onTap: () => setState(() {
                  sel = d;
                  ap = 0;
                  iv = intervaloPadrao(d);
                  prescC.clear();
                  qC.clear();
                  q = '';
                })),
      if (sel != null) ...[
        Padding(padding: const EdgeInsets.only(top: 8), child: Text(sel!.n, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700))),
        Row(children: [
          Expanded(
              child: DropdownButtonFormField<int>(
            isExpanded: true,
            value: ap,
            decoration: const InputDecoration(labelText: 'Apresentação', border: OutlineInputBorder(), isDense: true),
            items: [for (var i = 0; i < sel!.ap.length; i++) DropdownMenuItem(value: i, child: Text(sel!.ap[i].f, overflow: TextOverflow.ellipsis))],
            onChanged: (v) => setState(() => ap = v ?? 0),
          )),
          const SizedBox(width: 8),
          SizedBox(
              width: 120,
              child: DropdownButtonFormField<double>(
                isExpanded: true,
                value: intervalosPermitidos(sel!).contains(iv) ? iv : intervaloPadrao(sel!),
                decoration: const InputDecoration(labelText: 'Intervalo', border: OutlineInputBorder(), isDense: true),
                items: [for (final h in intervalosPermitidos(sel!)) DropdownMenuItem(value: h, child: Text('${h.toInt()} h'))],
                onChanged: (v) => setState(() => iv = v),
              )),
        ]),
      ],
      if (sel != null && !ready) const Padding(padding: EdgeInsets.all(12), child: Text('Informe a idade e o peso do paciente para calcular a dose.')),
      if (r != null) ...[
        if (!r.semFaixa) ...[
          Padding(padding: const EdgeInsets.only(top: 10, bottom: 4), child: Text('Dose por administração (a cada ${r.intervalo.toInt()} h)', style: const TextStyle(fontWeight: FontWeight.w700))),
          Row(children: [card('MÍNIMA', r.min, false), card(r.conservadora ? 'RECOMENDADA (conservadora)' : 'RECOMENDADA', r.rec, true), card('MÁXIMA', r.max, false)]),
          Text('A recomendada é o ponto médio da faixa de ${sel!.min}–${sel!.max} mg/kg/dose${r.conservadora ? '; nas condições informadas foi reduzida ao limite inferior' : ''}.', style: const TextStyle(fontSize: 12, color: Colors.black54)),
        ],
        for (final a in r.avisos)
          Container(
            margin: const EdgeInsets.only(top: 6),
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(color: a.sev == 2 ? const Color(0xFFFDEEEC) : const Color(0xFFFFF6D6), borderRadius: BorderRadius.circular(10), border: Border(left: BorderSide(color: col(a.sev), width: 5))),
            child: Text(a.txt, style: const TextStyle(fontSize: 13.5)),
          ),
        if (!r.semFaixa) ...[
          const SizedBox(height: 10),
          TextField(controller: prescC, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Dose prescrita (mg por administração)', border: OutlineInputBorder(), isDense: true), onChanged: (_) => setState(() {})),
          if (pr != null && pr > 0) ...() {
            final e = avaliar(sel!, p, r, pr, c);
            return [
              Container(
                margin: const EdgeInsets.only(top: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: e.$2 == 2 ? const Color(0xFFFDEEEC) : e.$2 == 1 ? const Color(0xFFFFF6D6) : const Color(0xFFE8F6EE), borderRadius: BorderRadius.circular(12)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(e.$1, style: const TextStyle(fontWeight: FontWeight.w800)),
                  for (final l in e.$3) Padding(padding: const EdgeInsets.only(top: 4), child: Text('• $l', style: const TextStyle(fontSize: 13.5))),
                ]),
              ),
            ];
          }(),
          TextButton.icon(
              onPressed: () => Clipboard.setData(ClipboardData(text: 'DOSE DO PACIENTE (apoio à decisão)\n${sel!.n} (${sel!.ap[ap].f}) a cada ${r!.intervalo.toInt()} h\nMínima: ${fq(r.min!.mg)} mg | Recomendada: ${fq(r.rec!.mg)} mg | Máxima: ${fq(r.max!.mg)} mg\n${r.avisos.map((a) => '- ${a.txt}').join('\n')}')),
              icon: const Icon(Icons.copy),
              label: const Text('Copiar parecer')),
        ],
      ],
      const SizedBox(height: 10),
      const Text('Faixas da base ICAM compiladas por IA; apoio à decisão, revisão farmacêutica obrigatória.', style: TextStyle(fontSize: 12, color: Colors.black54)),
    ]);
  }
}
