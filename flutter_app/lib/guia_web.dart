import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Controle terapêutico: a mesma interface do site (filtro por unidade, níveis de toxicidade com fonte,
/// duas abas, recentes e fichas), carregada de um arquivo dentro do app. Funciona offline.
class GuiaWeb extends StatefulWidget {
  const GuiaWeb({super.key, this.asset = 'assets/guia.html'});
  final String asset;
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
      ..addJavaScriptChannel('PCBridge', onMessageReceived: _onBridge)
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
    rootBundle.loadString(widget.asset).then((h) async {
      await _c.loadHtmlString(h, baseUrl: 'https://appassets.local/');
      if (mounted) setState(() => _ready = true);
    });
  }

  /// O WebView não baixa arquivos: o PDF gerado na página chega aqui em base64 e é entregue pela folha de compartilhamento.
  Future<void> _onBridge(JavaScriptMessage m) async {
    try {
      final o = jsonDecode(m.message) as Map<String, dynamic>;
      if (o['t'] != 'pdf') return;
      final name = (o['name'] as String).replaceAll(RegExp(r'[^A-Za-z0-9._-]'), '_');
      final dir = await getTemporaryDirectory();
      final f = File('${dir.path}/$name');
      await f.writeAsBytes(base64Decode(o['b64'] as String), flush: true);
      await Share.shareXFiles([XFile(f.path, mimeType: 'application/pdf')], subject: name);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Não foi possível compartilhar o PDF.')));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: _ready ? WebViewWidget(controller: _c) : const Center(child: CircularProgressIndicator()),
        ),
      );
}
