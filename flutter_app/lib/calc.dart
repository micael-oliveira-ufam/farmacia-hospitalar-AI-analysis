// Formulas clinicas (porte de guia/calc.js). Fontes: [MOST] Mosteller 1987, [CG] Cockcroft-Gault 1976,
// [SCHW] Schwartz 2009, [CKDEPI] CKD-EPI 2021, [HS] Holliday-Segar 1957.
import 'dart:math' as math;

class Calc {
  static double bsa(double kg, double cm) => math.sqrt(kg * cm / 3600);

  static double crclCG(double age, double kg, double scr, bool female) =>
      ((140 - age) * kg) / (72 * scr) * (female ? 0.85 : 1.0);

  static double schwartz(double cm, double scr) => 0.413 * cm / scr;

  static double ckdepi2021(double age, double scr, bool female) {
    final k = female ? 0.7 : 0.9;
    final a = female ? -0.241 : -0.302;
    final v = 142 *
        math.pow(math.min(scr / k, 1.0), a) *
        math.pow(math.max(scr / k, 1.0), -1.2) *
        math.pow(0.9938, age) *
        (female ? 1.012 : 1.0);
    return v.toDouble();
  }

  static double hollidayDay(double kg) =>
      kg <= 10 ? 100 * kg : (kg <= 20 ? 1000 + 50 * (kg - 10) : 1500 + 20 * (kg - 20));

  static double hollidayHour(double kg) =>
      kg <= 10 ? 4 * kg : (kg <= 20 ? 40 + 2 * (kg - 10) : 60 + (kg - 20));

  /// dose mcg/kg/min, peso kg, concentracao mg/mL -> mL/h
  static double infusionMlH(double mcgKgMin, double kg, double mgMl) =>
      mcgKgMin * kg * 60 / (mgMl * 1000);

  static double dropsMin(double ml, double hours, double factor) => ml * factor / (hours * 60);

  static double dilutionV1(double c1, double c2, double v2) => c2 * v2 / c1;

  /// (mg, limitado?, bruto)
  static ({double mg, bool capped, double raw}) doseMg(double kg, double mgKg, double maxMg) {
    final raw = kg * mgKg;
    final capped = maxMg > 0 && raw > maxMg;
    return (mg: capped ? maxMg : raw, capped: capped, raw: raw);
  }
}
