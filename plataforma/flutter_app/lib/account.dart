import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

/// Endereço do servidor da plataforma. Pode ser fixado no build: --dart-define=API_BASE=https://seu-dominio
const kApiBaseDefault = String.fromEnvironment('API_BASE', defaultValue: '');
const _graceMs = 7 * 24 * 3600 * 1000; // carência offline: 7 dias desde a última verificação

class ApiError implements Exception {
  final String message;
  final int status;
  ApiError(this.message, {this.status = 0});
  @override
  String toString() => message;
}

class PlanInfo {
  final String status;
  final bool access;
  final int daysLeft;
  final int trialEndsAt;
  final int renewsAt;
  final bool cancelAtPeriodEnd;
  PlanInfo(this.status, this.access, this.daysLeft, this.trialEndsAt, this.renewsAt, this.cancelAtPeriodEnd);
  factory PlanInfo.fromJson(Map<String, dynamic> j) => PlanInfo(
        (j['status'] ?? 'expired') as String,
        j['access'] == true,
        (j['daysLeft'] ?? 0) as int,
        (j['trialEndsAt'] ?? 0) as int,
        (j['renewsAt'] ?? 0) as int,
        j['cancelAtPeriodEnd'] == true,
      );
  Map<String, dynamic> toJson() => {
        'status': status, 'access': access, 'daysLeft': daysLeft, 'trialEndsAt': trialEndsAt, 'renewsAt': renewsAt, 'cancelAtPeriodEnd': cancelAtPeriodEnd,
      };
  String get label {
    switch (status) {
      case 'trial':
        return 'Demonstração: $daysLeft ${daysLeft == 1 ? 'dia restante' : 'dias restantes'}';
      case 'active':
        return 'Assinatura ativa';
      case 'past_due':
        return 'Pagamento pendente';
      default:
        return 'Sem acesso';
    }
  }
}

class AccountState {
  final String nome, email;
  final PlanInfo plan;
  final int verifiedAt;
  final bool offline;
  AccountState(this.nome, this.email, this.plan, this.verifiedAt, {this.offline = false});
}

class AccountApi {
  final SharedPreferences prefs;
  AccountApi(this.prefs);

  String get base => (prefs.getString('api_base') ?? kApiBaseDefault).trim().replaceAll(RegExp(r'/+$'), '');
  Future<void> setBase(String v) => prefs.setString('api_base', v.trim());
  String? get token => prefs.getString('token');

  Map<String, String> get _headers => {'content-type': 'application/json', if (token != null) 'authorization': 'Bearer $token'};

  Future<Map<String, dynamic>> _call(String method, String path, [Map<String, dynamic>? body]) async {
    if (base.isEmpty) throw ApiError('Informe o endereço do servidor (campo “Servidor”).');
    final uri = Uri.parse('$base$path');
    final http.Response r = method == 'GET'
        ? await http.get(uri, headers: _headers).timeout(const Duration(seconds: 8))
        : await http.post(uri, headers: _headers, body: jsonEncode(body ?? <String, dynamic>{})).timeout(const Duration(seconds: 8));
    Map<String, dynamic> j = <String, dynamic>{};
    try {
      j = jsonDecode(r.body) as Map<String, dynamic>;
    } catch (_) {}
    if (r.statusCode >= 400) throw ApiError((j['error'] ?? 'Erro ${r.statusCode}').toString(), status: r.statusCode);
    return j;
  }

  Future<AccountState> _save(Map<String, dynamic> j) async {
    if (j['token'] is String) await prefs.setString('token', j['token'] as String);
    final user = j['user'] as Map<String, dynamic>;
    final plan = PlanInfo.fromJson(j['plan'] as Map<String, dynamic>);
    final now = DateTime.now().millisecondsSinceEpoch;
    await prefs.setString('acc_cache', jsonEncode({'nome': user['nome'], 'email': user['email'], 'plan': plan.toJson(), 'at': now}));
    return AccountState(user['nome'] as String, user['email'] as String, plan, now);
  }

  Future<AccountState> login(String email, String senha) async =>
      _save(await _call('POST', '/api/auth/login', {'email': email, 'senha': senha, 'client': 'app'}));
  Future<AccountState> register(String nome, String email, String senha) async =>
      _save(await _call('POST', '/api/auth/register', {'nome': nome, 'email': email, 'senha': senha, 'aceite': true, 'client': 'app'}));
  Future<AccountState> verify() async => _save(await _call('GET', '/api/me'));
  Future<String> checkoutUrl() async => (await _call('POST', '/api/billing/checkout'))['url'] as String;
  Future<String> portalUrl() async => (await _call('POST', '/api/billing/portal'))['url'] as String;

  Future<void> signOut() async {
    await prefs.remove('token');
    await prefs.remove('acc_cache');
  }

  /// Última verificação salva, se ainda dentro da carência offline e do período de direito.
  AccountState? cached() {
    final s = prefs.getString('acc_cache');
    if (s == null) return null;
    try {
      final m = jsonDecode(s) as Map<String, dynamic>;
      final at = m['at'] as int;
      final plan = PlanInfo.fromJson(m['plan'] as Map<String, dynamic>);
      final now = DateTime.now().millisecondsSinceEpoch;
      if (now - at > _graceMs) return null;
      if (plan.status == 'trial' && now / 1000 >= plan.trialEndsAt) return null;
      if (!plan.access) return null;
      return AccountState(m['nome'] as String, m['email'] as String, plan, at, offline: true);
    } catch (_) {
      return null;
    }
  }
}

/// Porta de entrada do app: exige conta com demonstração vigente ou assinatura ativa.
class AccountGate extends StatefulWidget {
  final SharedPreferences prefs;
  final Widget Function(BuildContext, AccountApi, AccountState, Future<void> Function() signOut, Future<void> Function() refresh) builder;
  const AccountGate({super.key, required this.prefs, required this.builder});
  @override
  State<AccountGate> createState() => _AccountGateState();
}

enum _Phase { loading, auth, paywall, ready, blocked }

class _AccountGateState extends State<AccountGate> {
  late final AccountApi api = AccountApi(widget.prefs);
  _Phase phase = _Phase.loading;
  AccountState? st;
  String? note;

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    setState(() {
      phase = _Phase.loading;
      note = null;
    });
    if (api.token == null) {
      setState(() => phase = _Phase.auth);
      return;
    }
    try {
      _apply(await api.verify());
    } on ApiError catch (e) {
      if (e.status == 401) {
        await api.signOut();
        if (mounted) setState(() => phase = _Phase.auth);
      } else {
        _offline(e.message);
      }
    } catch (_) {
      _offline('Sem conexão com o servidor.');
    }
  }

  void _offline(String why) {
    final c = api.cached();
    if (c != null) {
      st = c;
      if (mounted) setState(() => phase = _Phase.ready);
    } else if (mounted) {
      setState(() {
        note = '$why Conecte-se à internet para verificar a conta (a última verificação vale por 7 dias).';
        phase = _Phase.blocked;
      });
    }
  }

  void _apply(AccountState s) {
    st = s;
    if (mounted) setState(() => phase = s.plan.access ? _Phase.ready : _Phase.paywall);
  }

  Future<void> _signOut() async {
    await api.signOut();
    if (mounted) setState(() => phase = _Phase.auth);
  }

  @override
  Widget build(BuildContext context) {
    switch (phase) {
      case _Phase.loading:
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      case _Phase.auth:
        return AuthPage(api: api, onDone: _apply);
      case _Phase.paywall:
        return PaywallPage(api: api, state: st!, onRecheck: _check, onSignOut: _signOut);
      case _Phase.blocked:
        return Scaffold(
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.wifi_off, size: 48),
                const SizedBox(height: 12),
                Text(note ?? 'Sem conexão.', textAlign: TextAlign.center),
                const SizedBox(height: 16),
                FilledButton(onPressed: _check, child: const Text('Tentar de novo')),
                TextButton(onPressed: _signOut, child: const Text('Sair')),
              ]),
            ),
          ),
        );
      case _Phase.ready:
        return widget.builder(context, api, st!, _signOut, _check);
    }
  }
}

class AuthPage extends StatefulWidget {
  final AccountApi api;
  final void Function(AccountState) onDone;
  const AuthPage({super.key, required this.api, required this.onDone});
  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  bool signup = false, accept = false, busy = false;
  String? error;
  final nome = TextEditingController(), email = TextEditingController(), senha = TextEditingController();
  late final TextEditingController server = TextEditingController(text: widget.api.base);

  Future<void> _submit() async {
    if (signup && !accept) {
      setState(() => error = 'É necessário aceitar os termos e a política de privacidade.');
      return;
    }
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await widget.api.setBase(server.text);
      final s = signup
          ? await widget.api.register(nome.text.trim(), email.text.trim(), senha.text)
          : await widget.api.login(email.text.trim(), senha.text);
      widget.onDone(s);
    } on ApiError catch (e) {
      if (mounted) setState(() => error = e.message);
    } catch (_) {
      if (mounted) setState(() => error = 'Não foi possível falar com o servidor. Confira o endereço e a internet.');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(20), children: [
          const SizedBox(height: 12),
          Center(child: CircleAvatar(radius: 32, backgroundColor: cs.primary, foregroundColor: cs.onPrimary, child: const Icon(Icons.add, size: 36))),
          const SizedBox(height: 12),
          const Text('Farmácia Hospitalar Integrada', textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text('7 dias grátis, sem cartão. Depois R\$ 29,99 por mês.', textAlign: TextAlign.center, style: TextStyle(color: cs.onSurfaceVariant)),
          const SizedBox(height: 16),
          SegmentedButton<bool>(
            showSelectedIcon: false,
            segments: const [ButtonSegment(value: false, label: Text('Entrar')), ButtonSegment(value: true, label: Text('Criar conta'))],
            selected: {signup},
            onSelectionChanged: (s) => setState(() {
              signup = s.first;
              error = null;
            }),
          ),
          const SizedBox(height: 14),
          if (signup) ...[
            TextField(controller: nome, decoration: const InputDecoration(labelText: 'Nome', border: OutlineInputBorder()), textCapitalization: TextCapitalization.words),
            const SizedBox(height: 10),
          ],
          TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'E-mail', border: OutlineInputBorder())),
          const SizedBox(height: 10),
          TextField(
              controller: senha, obscureText: true, decoration: InputDecoration(labelText: signup ? 'Senha (mínimo 8 caracteres)' : 'Senha', border: const OutlineInputBorder())),
          if (signup)
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              value: accept,
              onChanged: (v) => setState(() => accept = v ?? false),
              title: const Text('Li e aceito os termos de uso e a política de privacidade (disponíveis em /termos no site).', style: TextStyle(fontSize: 13)),
            ),
          if (error != null)
            Padding(padding: const EdgeInsets.only(top: 8), child: Text(error!, style: TextStyle(color: cs.error))),
          const SizedBox(height: 12),
          FilledButton(onPressed: busy ? null : _submit, child: Text(busy ? 'Aguarde…' : (signup ? 'Criar conta e começar os 7 dias' : 'Entrar'))),
          const SizedBox(height: 8),
          ExpansionTile(
            title: const Text('Servidor', style: TextStyle(fontSize: 14)),
            initiallyExpanded: widget.api.base.isEmpty,
            children: [
              TextField(controller: server, keyboardType: TextInputType.url, decoration: const InputDecoration(hintText: 'https://seu-servidor.exemplo', border: OutlineInputBorder(), isDense: true)),
              const SizedBox(height: 8),
              const Text('Endereço do servidor da plataforma (o mesmo do site). Pode vir já preenchido no APK.', style: TextStyle(fontSize: 12)),
            ],
          ),
        ]),
      ),
    );
  }
}

class PaywallPage extends StatefulWidget {
  final AccountApi api;
  final AccountState state;
  final Future<void> Function() onRecheck;
  final Future<void> Function() onSignOut;
  const PaywallPage({super.key, required this.api, required this.state, required this.onRecheck, required this.onSignOut});
  @override
  State<PaywallPage> createState() => _PaywallPageState();
}

class _PaywallPageState extends State<PaywallPage> {
  bool busy = false;
  String? error;

  Future<void> _pay() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final url = await widget.api.checkoutUrl();
      final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      if (!ok && mounted) setState(() => error = 'Não foi possível abrir o navegador.');
    } on ApiError catch (e) {
      if (mounted) setState(() => error = e.message);
    } catch (_) {
      if (mounted) setState(() => error = 'Sem conexão com o servidor.');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Assinatura'), toolbarHeight: 48),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        Text('Olá, ${widget.state.nome.split(' ').first}. Sua demonstração terminou.', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        const Text('R\$ 29,99 por mês', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text('•  PosologiaPED e FarmaGestão\n•  Uso offline no aparelho\n•  Cancele quando quiser, em Minha conta'),
        const SizedBox(height: 16),
        FilledButton.icon(onPressed: busy ? null : _pay, icon: const Icon(Icons.credit_card), label: const Text('Assinar com cartão de crédito')),
        const SizedBox(height: 8),
        OutlinedButton.icon(onPressed: widget.onRecheck, icon: const Icon(Icons.refresh), label: const Text('Já paguei: verificar de novo')),
        if (error != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(error!, style: TextStyle(color: cs.error))),
        const SizedBox(height: 12),
        const Text('O número do cartão é digitado na página segura do Stripe, aberta no navegador. Os dados do cartão não passam pelo aplicativo nem pelo nosso servidor.', style: TextStyle(fontSize: 12)),
        const SizedBox(height: 12),
        TextButton(onPressed: widget.onSignOut, child: const Text('Sair da conta')),
      ]),
    );
  }
}

/// Folha "Minha conta" aberta pelo ícone da tela inicial.
Future<void> showAccountSheet(BuildContext context, AccountApi api, AccountState st, Future<void> Function() signOut, Future<void> Function() refresh) {
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (ctx) => Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(st.nome, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        Text(st.email),
        const SizedBox(height: 8),
        Text('${st.plan.label}${st.offline ? ' · verificado offline' : ''}'),
        const SizedBox(height: 14),
        Wrap(spacing: 8, children: [
          if (st.plan.status == 'active' || st.plan.status == 'past_due')
            FilledButton(
                onPressed: () async {
                  try {
                    await launchUrl(Uri.parse(await api.portalUrl()), mode: LaunchMode.externalApplication);
                  } catch (_) {}
                },
                child: const Text('Gerenciar assinatura')),
          if (st.plan.status == 'trial')
            FilledButton(
                onPressed: () async {
                  try {
                    await launchUrl(Uri.parse(await api.checkoutUrl()), mode: LaunchMode.externalApplication);
                  } catch (_) {}
                },
                child: const Text('Assinar por R\$ 29,99/mês')),
          OutlinedButton(onPressed: () { Navigator.pop(ctx); refresh(); }, child: const Text('Atualizar')),
          TextButton(onPressed: () { Navigator.pop(ctx); signOut(); }, child: const Text('Sair')),
        ]),
      ]),
    ),
  );
}
