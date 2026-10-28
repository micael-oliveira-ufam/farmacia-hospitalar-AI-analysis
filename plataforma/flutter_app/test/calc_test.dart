import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:farmacia_integrada/calc.dart';
import 'package:farmacia_integrada/models.dart';

void main() {
  test('Mosteller', () {
    expect(Calc.bsa(70, 175), closeTo(1.8446, 0.001));
    expect(Calc.bsa(10, 75), closeTo(0.4564, 0.001));
  });
  test('Cockcroft-Gault', () {
    expect(Calc.crclCG(60, 70, 1, false), closeTo(77.78, 0.01));
    expect(Calc.crclCG(60, 70, 1, true), closeTo(66.11, 0.01));
  });
  test('Schwartz', () => expect(Calc.schwartz(100, 0.5), closeTo(82.6, 0.01)));
  test('CKD-EPI 2021', () => expect(Calc.ckdepi2021(50, 1.0, false), closeTo(91.7, 0.3)));
  test('Holliday-Segar', () {
    expect(Calc.hollidayDay(8), 800);
    expect(Calc.hollidayDay(15), 1250);
    expect(Calc.hollidayDay(30), 1700);
    expect(Calc.hollidayHour(8), 32);
    expect(Calc.hollidayHour(15), 50);
    expect(Calc.hollidayHour(30), 70);
  });
  test('Infusao, gotejamento, diluicao, dose', () {
    expect(Calc.infusionMlH(5, 10, 1), closeTo(3, 1e-9));
    expect(Calc.dropsMin(500, 8, 20), closeTo(20.83, 0.01));
    expect(Calc.dilutionV1(10, 1, 100), closeTo(10, 1e-9));
    final r = Calc.doseMg(20, 15, 250);
    expect(r.mg, 250);
    expect(r.capped, true);
  });
  test('catalogo carrega e e coerente', () {
    final c = Catalog.parse(File('assets/catalog.json').readAsStringSync());
    expect(c.items.length, 224);
    expect(c.mono.length, 192);
    for (final it in c.items) {
      expect(c.mono.containsKey(it.key), true, reason: it.key);
      expect(c.safety.containsKey(it.key), true, reason: it.key);
      for (final k in c.refsFor(it)) {
        expect(c.refs.containsKey(k), true, reason: k);
      }
    }
    expect(jsonDecode('{}'), isA<Map>());
  });
  test('catálogo embutido está completo (offline)', () {
    final j = jsonDecode(File('assets/catalog.json').readAsStringSync()) as Map<String, dynamic>;
    final items = j['items'] as List;
    final mono = j['mono'] as Map<String, dynamic>;
    final safety = j['safety'] as Map<String, dynamic>;
    final refs = j['refs'] as Map<String, dynamic>;
    expect(items.length, 224);
    for (final it in items) {
      final k = (it as Map<String, dynamic>)['key'] as String;
      expect(mono.containsKey(k), true, reason: 'monografia ausente: $k');
      expect(safety.containsKey(k), true, reason: 'segurança ausente: $k');
      for (final r in (mono[k]['r'] as List)) {
        expect(refs.containsKey(r), true, reason: 'referência ausente: $r');
      }
    }
  });
}
