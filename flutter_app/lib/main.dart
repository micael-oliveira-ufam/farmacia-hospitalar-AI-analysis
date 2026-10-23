import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';
import 'launcher.dart';

void main() => runApp(const GuiaApp());

class GuiaApp extends StatelessWidget {
  const GuiaApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Farmácia Hospitalar Integrada',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0B6B70), brightness: Brightness.light),
          scaffoldBackgroundColor: const Color(0xFFF8FAFB),
        ),
        home: const Loader(),
      );
}

class Loader extends StatefulWidget {
  const Loader({super.key});
  @override
  State<Loader> createState() => _LoaderState();
}

class _LoaderState extends State<Loader> {
  late final Future<(Catalog, SharedPreferences)> _f = _load();
  Future<(Catalog, SharedPreferences)> _load() async => (await Catalog.load(), await SharedPreferences.getInstance());

  @override
  Widget build(BuildContext context) => FutureBuilder<(Catalog, SharedPreferences)>(
        future: _f,
        builder: (context, snap) {
          if (snap.hasError) {
            return Scaffold(body: Center(child: Padding(padding: const EdgeInsets.all(24), child: Text('Erro ao carregar o catálogo: ${snap.error}'))));
          }
          if (!snap.hasData) return const Scaffold(body: Center(child: CircularProgressIndicator()));
          return Launcher(catalog: snap.data!.$1, prefs: snap.data!.$2);
        },
      );
}
