import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';
import 'pages.dart';
import 'stock.dart';
import 'account.dart';

/// Tela inicial: o usuário escolhe o módulo. Tudo funciona offline (dados dentro do app).
class Launcher extends StatelessWidget {
  final Catalog catalog;
  final SharedPreferences prefs;
  final AccountApi api;
  final AccountState account;
  final Future<void> Function() onSignOut;
  final Future<void> Function() onRefresh;
  const Launcher({super.key, required this.catalog, required this.prefs, required this.api, required this.account, required this.onSignOut, required this.onRefresh});

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
          Align(
            alignment: Alignment.centerRight,
            child: ActionChip(
              avatar: const Icon(Icons.account_circle_outlined, size: 18),
              label: Text(account.plan.label + (account.offline ? ' · offline' : '')),
              onPressed: () => showAccountSheet(context, api, account, onSignOut, onRefresh),
            ),
          ),
          const Text('PLATAFORMA PARA QUALQUER HOSPITAL', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
          const SizedBox(height: 4),
          const Text('Farmácia Hospitalar Integrada', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('Dois módulos em um só aplicativo, com destaque para hospitais pediátricos. Funciona offline depois do login (a conta é verificada a cada 7 dias).'),
          const SizedBox(height: 14),
          tile(
            Icons.medication_liquid_outlined,
            const Color(0xFF12808A),
            'PosologiaPED · foco pediátrico',
            'Posologia para hospitais pediátricos: doses por faixa etária (neonatos, lactentes e crianças em destaque), alertas pediátricos e calculadoras, com referência e link em cada informação.',
            ['${catalog.items.length} medicamentos na lista de exemplo', 'Alerta pediátrico antes da dose; cálculo por peso e por m²', 'Adultos e idosos só como referência'],
            () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => Home(catalog: catalog, prefs: prefs))),
          ),
          const SizedBox(height: 10),
          tile(
            Icons.inventory_2_outlined,
            const Color(0xFF2F6FDE),
            'FarmaGestão · estoque e Curva ABC',
            'Gerenciador de estoque com classificação A/B/C, estoque de emergência e pedido semanal (PADRÃO e PEDIDO).',
            ['Importa a planilha do seu hospital (colada) ou a lista de exemplo', 'Backup compatível com o app web', 'Link para a monografia no PosologiaPED'],
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
