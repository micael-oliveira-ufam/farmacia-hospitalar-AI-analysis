import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';
import 'guia_web.dart';
import 'stock.dart';

/// Tela inicial: o usuário escolhe o módulo. Tudo funciona offline (dados dentro do app).
class Launcher extends StatelessWidget {
  final Catalog catalog;
  final SharedPreferences prefs;
  const Launcher({super.key, required this.catalog, required this.prefs});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    Widget tile(IconData icon, Color accent, String title, String body, List<String> bullets, VoidCallback onTap) => Card(
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  CircleAvatar(radius: 24, backgroundColor: accent, foregroundColor: Colors.white, child: Icon(icon, size: 28)),
                  const SizedBox(width: 12),
                  Expanded(child: Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700))),
                  const Icon(Icons.chevron_right),
                ]),
                const SizedBox(height: 10),
                Text(body),
                const SizedBox(height: 6),
                for (final b in bullets) Text('•  $b', style: const TextStyle(fontSize: 13)),
              ]),
            ),
          ),
        );
    return Scaffold(
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(16), children: [
          const Text('PLATAFORMA PARA QUALQUER HOSPITAL', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
          const SizedBox(height: 4),
          const Text('FarmaLink', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('Dois módulos em um só aplicativo, para qualquer hospital. Gratuito, sem cadastro e sem conta. Funciona offline: os dados ficam dentro do aplicativo.'),
          const SizedBox(height: 14),
          tile(
            Icons.medication_liquid_outlined,
            const Color(0xFF12808A),
            'Controle terapêutico · prematuro ao idoso',
            'Posologia do prematuro ao idoso: doses por faixa etária, alertas e calculadoras, com referência e link em cada informação.',
            ['${catalog.items.length} medicamentos na lista de exemplo', 'Todas as faixas etárias, do prematuro ao idoso', 'Cálculo por peso e por m²'],
            () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const GuiaWeb())),
          ),
          const SizedBox(height: 10),
          tile(
            Icons.inventory_2_outlined,
            const Color(0xFF2F6FDE),
            'Estoque e Curva ABC',
            'Gerenciador de estoque com classificação A/B/C, estoque de emergência e pedido semanal (PADRÃO e PEDIDO).',
            ['Importa a planilha do seu hospital (colada) ou a lista de exemplo', 'Backup compatível com o app web', 'Link para a monografia no módulo Controle terapêutico'],
            () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => StockHome(catalog: catalog, prefs: prefs))),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.amber.shade50, border: Border.all(color: Colors.amber.shade300), borderRadius: BorderRadius.circular(10)),
            child: const Text('Apoio à decisão, não prescrição. As doses foram compiladas por IA a partir das fontes citadas e precisam de revisão por farmacêutico responsável. '
                'Não registre dados de pacientes. Os dados de estoque ficam só neste aparelho. O aplicativo não pertence a nenhum hospital; a lista incluída é apenas um exemplo.', style: TextStyle(fontSize: 13)),
          ),
        ]),
      ),
    );
  }
}
