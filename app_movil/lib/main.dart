import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const SsomaApp());
}

class SsomaApp extends StatelessWidget {
  const SsomaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ALERI SSOMA',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const _SplashRouter(),
    );
  }
}

/// Verifica si hay sesión activa al abrir la app.
class _SplashRouter extends StatefulWidget {
  const _SplashRouter();

  @override
  State<_SplashRouter> createState() => _SplashRouterState();
}

class _SplashRouterState extends State<_SplashRouter> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  } 

  Future<void> _checkSession() async {
    final api = ApiService();
    final usuario = await api.getMe();

    if (!mounted) return;

    if (usuario != null && usuario.rol == 'SUPERVISOR') {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => HomeScreen(usuario: usuario)),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'aleri',
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontSize: 52,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1,
                    height: 1.0,
                  ),
                ),
                const SizedBox(height: 5),
                Container(
                  height: 3.5,
                  width: 96,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.accent],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2.5,
            ),
          ],
        ),
      ),
    );
  }
}
