import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;

class RefInfo {
  final String key, text, url, level;
  RefInfo(this.key, this.text, this.url, this.level);
  String get levelLabel => const {
        'ok': 'conferido',
        'doi': 'DOI',
        'inst': 'site oficial',
        'busca': 'busca',
      }[level] ?? level;
}

class Mono {
  final String name, cls, routes, ido, en, tc, fc;
  final String? pa;
  final List<String> neo, ped, adu; // [usual, maxima]
  final List<String> refs;
  Mono({required this.name, required this.cls, required this.routes, required this.ido, required this.en, required this.tc, required this.fc,
      required this.pa, required this.neo, required this.ped, required this.adu, required this.refs});
  factory Mono.fromJson(Map<String, dynamic> j) => Mono(
        name: j['n'] as String,
        cls: j['c'] as String,
        routes: j['v'] as String,
        ido: (j['ido'] ?? '') as String,
        en: (j['en'] ?? '') as String,
        tc: (j['tc'] ?? '') as String,
        fc: (j['fc'] ?? '') as String,
        pa: j['pa'] as String?,
        neo: List<String>.from(j['neo'] as List),
        ped: List<String>.from(j['ped'] as List),
        adu: List<String>.from(j['adu'] as List),
        refs: List<String>.from(j['r'] as List),
      );
}

class Safety {
  final int nef, hep;
  final String nefN, hepN, ismp, ae;
  Safety(this.nef, this.nefN, this.hep, this.hepN, this.ismp, this.ae);
  factory Safety.fromJson(Map<String, dynamic> j) => Safety(
      (j['nef'] ?? 0) as int, (j['nefN'] ?? '') as String, (j['hep'] ?? 0) as int,
      (j['hepN'] ?? '') as String, (j['ismp'] ?? '') as String, (j['ae'] ?? '') as String);
  String get comuns => _part('Comuns');
  String get graves => _part('Graves');
  String _part(String k) {
    for (final p in ae.split('|')) {
      if (p.startsWith(k)) {
        final i = p.indexOf(':');
        return i >= 0 ? p.substring(i + 1).trim() : p;
      }
    }
    return '';
  }
}

class Item {
  final int id;
  final String sec, code, desc, key;
  final double? mgml;
  Item(this.id, this.sec, this.code, this.desc, this.key, this.mgml);
  factory Item.fromJson(Map<String, dynamic> j) => Item(j['id'] as int, j['sec'] as String, j['code'].toString(),
      j['desc'] as String, j['key'] as String, (j['mgml'] as num?)?.toDouble());
}

const controlledSections = {'cinj', 'canest', 'cgts', 'ccp'};

class Catalog {
  final String version;
  final Map<String, String> sec;
  final List<Item> items;
  final Map<String, Mono> mono;
  final Map<String, Safety> safety;
  final Map<String, RefInfo> refs;
  final List<String> materiais;
  Catalog(this.version, this.sec, this.items, this.mono, this.safety, this.refs, this.materiais);

  static Catalog parse(String source) {
    final j = jsonDecode(source) as Map<String, dynamic>;
    return Catalog(
      (j['meta'] as Map)['versao'] as String,
      Map<String, String>.from(j['sec'] as Map),
      (j['items'] as List).map((e) => Item.fromJson(e as Map<String, dynamic>)).toList(),
      (j['mono'] as Map).map((k, v) => MapEntry(k as String, Mono.fromJson(v as Map<String, dynamic>))),
      (j['safety'] as Map).map((k, v) => MapEntry(k as String, Safety.fromJson(v as Map<String, dynamic>))),
      (j['refs'] as Map).map((k, v) {
        final m = v as Map<String, dynamic>;
        return MapEntry(k as String, RefInfo(k, m['t'] as String, m['u'] as String, m['l'] as String));
      }),
      List<String>.from(j['materiais'] as List),
    );
  }

  static Future<Catalog> load() async => parse(await rootBundle.loadString('assets/catalog.json'));

  /// Referencias do item: as da monografia + as derivadas das classificacoes (ISMP, nefro, figado, controlado).
  List<String> refsFor(Item it) {
    final m = mono[it.key]!, s = safety[it.key]!;
    final r = [...m.refs];
    void add(String k) {
      if (refs.containsKey(k) && !r.contains(k)) r.add(k);
    }
    if (s.ismp.isNotEmpty) add('ISMP');
    if (s.nef > 0) add('NEFRO');
    if (s.hep > 0) add('LTOX');
    if (controlledSections.contains(it.sec)) add('P344');
    return r;
  }
}

/// Item da lista da Policlinica Codajas (assets/codajas.json).
class CodajasItem {
  final String name;
  final double activeUsers, unitCost;
  CodajasItem(this.name, this.activeUsers, this.unitCost);
}

class CodajasList {
  final String nome;
  final List<CodajasItem> itens;
  CodajasList(this.nome, this.itens);
  static Future<CodajasList> load() async {
    final j = jsonDecode(await rootBundle.loadString('assets/codajas.json')) as Map<String, dynamic>;
    return CodajasList(
      (j['nome'] ?? 'Policlínica Codajás') as String,
      (j['itens'] as List).map((e) {
        final x = e as Map<String, dynamic>;
        return CodajasItem(x['name'] as String, ((x['activeUsers'] ?? 0) as num).toDouble(), ((x['unitCost'] ?? 0) as num).toDouble());
      }).toList(),
    );
  }
}
