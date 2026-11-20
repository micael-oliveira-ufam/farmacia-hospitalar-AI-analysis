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
          Row(children: [
            Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFD6DFDF))),
              child: Image.asset('assets/ufam.png', height: 34),
            ),
            const SizedBox(width: 10),
            const Expanded(child: Text('UFAM · Micael Oliveira · Elias Barros\nOrient.: Profa. Dra. Clarice Veloso · Preceptora: Dra. Juliana Carvalho', style: TextStyle(fontSize: 11, height: 1.3))),
          ]),
          const SizedBox(height: 12),
          const Text('PLATAFORMA PARA QUALQUER HOSPITAL', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
          const SizedBox(height: 4),
          const Text('PharmaCentral', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('Quatro módulos em um só aplicativo, para qualquer hospital. Gratuito, sem cadastro e sem conta. Funciona offline: os dados ficam dentro do aplicativo.'),
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
            () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => StockUnitsPage(catalog: catalog, prefs: prefs))),
          ),
          const SizedBox(height: 10),
          tile(
            Icons.local_shipping_outlined,
            const Color(0xFFB7791F),
            'Pedidos',
            'Solicitação do CAF à CEMA e transferência do CAF para a Farmácia Clínica, com situação e registro do atendimento.',
            ['Pedido CAF para CEMA', 'Transferência CAF para Farmácia Clínica', 'Copia a solicitação para enviar'],
            () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const GuiaWeb(asset: 'assets/pedidos.html'))),
          ),
          const SizedBox(height: 10),
          tile(
            Icons.assignment_ind_outlined,
            const Color(0xFFC2410C),
            'Prontuário farmacêutico',
            'Acompanhamento por número de prontuário, sem nome: prescrição com alerta de fígado e rim, evoluções e notificação de reação adversa.',
            ['Alertas pela função renal e hepática', 'Escore de Naranjo e ficha em PDF', 'Dados só neste aparelho, com backup'],
            () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const GuiaWeb(asset: 'assets/prontuario.html'))),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.amber.shade50, border: Border.all(color: Colors.amber.shade300), borderRadius: BorderRadius.circular(10)),
            child: const Text('Apoio à decisão, não prescrição. As doses foram compiladas por IA a partir das fontes citadas e precisam de revisão por farmacêutico responsável. '
                'Não registre nome, CPF nem outro dado que identifique o paciente: use só o número do prontuário. Os dados ficam só neste aparelho. O aplicativo não pertence a nenhum hospital; a lista incluída é apenas um exemplo.', style: TextStyle(fontSize: 13)),
          ),
          const SizedBox(height: 18),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFD6DFDF))),
              child: Image.asset('assets/ufam.png', height: 56),
            ),
            const SizedBox(width: 12),
            const Text('Universidade Federal\ndo Amazonas', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ]),
          const SizedBox(height: 8),
          const Text('Autores: Micael Davi Lima de Oliveira e Elias de Souza Barros\nOrientadora: Profa. Dra. Clarice Veloso · Preceptora: Dra. Juliana Carvalho', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, height: 1.4)),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }
}
