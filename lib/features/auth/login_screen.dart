import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/agro_button.dart';
import '../../shared/widgets/glass_background.dart';
import '../../shared/widgets/main_navigation_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  
  bool _obscurePassword = true;
  int _failedAttempts = 0;
  bool _isLocked = false;
  int _lockSecondsRemaining = 0;
  Timer? _lockTimer;
  String? _errorMessage;

  @override
  void dispose() {
    _codeController.dispose();
    _passwordController.dispose();
    _lockTimer?.cancel();
    super.dispose();
  }

  void _startLockTimer() {
    setState(() {
      _isLocked = true;
      _lockSecondsRemaining = 1800; // 30 minutes in seconds
      _errorMessage = 'Cuenta bloqueada por seguridad.';
    });

    _lockTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_lockSecondsRemaining > 0) {
        setState(() {
          _lockSecondsRemaining--;
        });
      } else {
        _lockTimer?.cancel();
        setState(() {
          _isLocked = false;
          _failedAttempts = 0;
          _errorMessage = null;
        });
      }
    });
  }

  String _formatDuration(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void _handleLogin() {
    if (_isLocked) return;

    final code = _codeController.text.trim();
    final password = _passwordController.text;

    if (code.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Por favor, complete todos los campos.';
      });
      return;
    }

    // Validate that employee code is purely numeric
    if (int.tryParse(code) == null) {
      setState(() {
        _errorMessage = 'El código de empleado debe ser numérico.';
      });
      return;
    }

    // Simulation logic:
    // Success: code is '1001' (Operador), '2002' (Supervisor), or '3003' (Administrador).
    // Any other code will fail and increment failed attempts.
    if ((code == '1001' || code == '2002' || code == '3003') && password == 'agrobanco') {
      setState(() {
        _errorMessage = null;
        _failedAttempts = 0;
      });

      // Save role profile to navigate
      String profileRole = 'Operador';
      if (code == '2002') profileRole = 'Supervisor';
      if (code == '3003') profileRole = 'Administrador';

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => MainNavigationScreen(
            userCode: code,
            userRole: profileRole,
          ),
        ),
      );
    } else {
      setState(() {
        _failedAttempts++;
        if (_failedAttempts >= 5) {
          _startLockTimer();
        } else {
          _errorMessage = 'Credenciales incorrectas. Intento $_failedAttempts de 5.';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      body: GlassBackground(
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 20),
                  // Agrobanco Logo Icon
                  Hero(
                    tag: 'logo',
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF00C853).withOpacity(0.1),
                        border: Border.all(
                          color: const Color(0xFF00C853).withOpacity(0.3),
                          width: 1.5,
                        ),
                      ),
                      child: const Icon(
                        Icons.agriculture_rounded,
                        size: 64,
                        color: Color(0xFF7ED99E),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'AGROBANCO',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.displayLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Fuerza de Ventas Digital',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppColors.onSurfaceVariant.withOpacity(0.8),
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 32),
                  // Glassmorphic Login Card
                  AgroCard(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'INICIAR SESIÓN',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Employee code
                        TextField(
                          controller: _codeController,
                          enabled: !_isLocked,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'CÓDIGO DE EMPLEADO',
                            hintText: 'Ej. 1001, 2002',
                            prefixIcon: const Icon(Icons.badge_outlined, color: AppColors.outline),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.04),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Password
                        TextField(
                          controller: _passwordController,
                          enabled: !_isLocked,
                          obscureText: _obscurePassword,
                          decoration: InputDecoration(
                            labelText: 'CONTRASEÑA',
                            hintText: 'Ingrese contraseña',
                            prefixIcon: const Icon(Icons.lock_outline, color: AppColors.outline),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                color: AppColors.outline,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.04),
                          ),
                        ),
                        const SizedBox(height: 12),
                        // Error message or lock timer
                        if (_errorMessage != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Row(
                              children: [
                                Icon(
                                  _isLocked ? Icons.lock_clock : Icons.error_outline,
                                  color: _isLocked ? AppColors.critical : AppColors.tertiary,
                                  size: 16,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _isLocked
                                        ? 'Bloqueado. Reintente en ${_formatDuration(_lockSecondsRemaining)}'
                                        : _errorMessage!,
                                    style: TextStyle(
                                      color: _isLocked ? AppColors.critical : AppColors.tertiary,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        const SizedBox(height: 24),
                        AgroButton(
                          label: _isLocked ? 'BLOQUEADO' : 'INGRESAR',
                          onPressed: _isLocked ? () {} : _handleLogin,
                          backgroundColor: _isLocked ? Colors.grey.withOpacity(0.1) : null,
                          foregroundColor: _isLocked ? Colors.white24 : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: AppColors.surfaceVariant,
                          title: const Text('Problemas para ingresar?'),
                          content: const Text(
                            'Las cuentas de oficiales de crédito son gestionadas por el Administrador de la Agencia. Use la contraseña por defecto "agrobanco" con los códigos de prueba:\n\n'
                            '- 1001: Operador en Campo\n'
                            '- 2002: Supervisor de Agencia\n'
                            '- 3003: Administrador de Sistemas',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(ctx).pop(),
                              child: const Text('ENTENDIDO', style: TextStyle(color: AppColors.primary)),
                            ),
                          ],
                        ),
                      );
                    },
                    child: Text(
                      '¿Problemas para ingresar?',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'Versión 2.0.0 - Offline Sync Ready\nSupabase & Isar DB Enabled',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.white30,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
