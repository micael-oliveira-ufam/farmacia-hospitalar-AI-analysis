import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

double? parseNum(String? s) {
  if (s == null) return null;
  return double.tryParse(s.trim().replaceAll(',', '.'));
}

String fmt(double v, [int decimals = 2]) {
  if (v.isNaN || v.isInfinite) return '-';
  final d = v.abs() < 1 ? 3 : decimals;
  var s = v.toStringAsFixed(d);
  if (s.contains('.')) {
    s = s.replaceFirst(RegExp(r'0+$'), '').replaceFirst(RegExp(r'\.$'), '');
  }
  return s.replaceAll('.', ',');
}

String norm(String s) {
  const from = 'áàâãäéèêëíìîïóòôõöúùûüçñ';
  const to = 'aaaaaeeeeiiiiooooouuuucn';
  final b = StringBuffer();
  for (final ch in s.toLowerCase().split('')) {
    final i = from.indexOf(ch);
    b.write(i >= 0 ? to[i] : ch);
  }
  return b.toString();
}

Future<void> openUrl(BuildContext context, String url) async {
  final messenger = ScaffoldMessenger.of(context);
  try {
    final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    if (!ok) messenger.showSnackBar(const SnackBar(content: Text('Não foi possível abrir o link. O app funciona offline, mas o link precisa de internet no navegador.')));
  } catch (_) {
    messenger.showSnackBar(const SnackBar(content: Text('Não foi possível abrir o link. O app funciona offline, mas o link precisa de internet no navegador.')));
  }
}

class Tag extends StatelessWidget {
  final String text;
  final Color bg, fg;
  const Tag(this.text, this.bg, this.fg, {super.key});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(4)),
        child: Text(text.toUpperCase(),
            style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: fg, letterSpacing: 0.4)),
      );
}
