import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Controle terapêutico: a mesma interface do site (filtro por unidade, níveis de toxicidade com fonte,
/// duas abas, recentes e fichas), carregada de um arquivo dentro do app. Funciona offline.
class GuiaWeb extends StatefulWidget {
  const GuiaWeb({super.key});
  @override
  State<GuiaWeb> createState() => _GuiaWebState();
}

class _GuiaWebState extends State<GuiaWeb> {
  late final WebViewController _c;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _c = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFF4F8F8))
      ..setNavigationDelegate(NavigationDelegate(
        onNavigationRequest: (r) {
          if (r.url.startsWith('https://appassets.local')) return NavigationDecision.navigate;
          // links de fonte (bulas, LiverTox, artigos) abrem no navegador do aparelho
          launchUrl(Uri.parse(r.url), mode: LaunchMode.externalApplication);
          return NavigationDecision.prevent;
        },
      ));
    rootBundle.loadString('assets/guia.html').then((h) async {
      await _c.loadHtmlString(h, baseUrl: 'https://appassets.local/');
      if (mounted) setState(() => _ready = true);
    });
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: _ready ? WebViewWidget(controller: _c) : const Center(child: CircularProgressIndicator()),
        ),
      );
}
