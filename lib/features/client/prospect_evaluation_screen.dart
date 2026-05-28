import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/agro_button.dart';
import '../../shared/widgets/glass_background.dart';
import '../loan_request/loan_request_screen.dart';

class ProspectEvaluationScreen extends StatefulWidget {
  const ProspectEvaluationScreen({super.key});

  @override
  State<ProspectEvaluationScreen> createState() => _ProspectEvaluationScreenState();
}

class _ProspectEvaluationScreenState extends State<ProspectEvaluationScreen> {
  final _dniController = TextEditingController();
  final _nameController = TextEditingController();
  final _revenueController = TextEditingController();
  double _requestedAmount = 10000.0;
  String _businessType = 'Agropecuario';
  String _destination = 'Compra de Semillas';

  // Result state
  bool _hasEvaluated = false;
  bool _isLoading = false;
  String _result = 'APTO'; // APTO, REVISAR, NO PROCEDE
  String _reason = '';

  @override
  void dispose() {
    _dniController.dispose();
    _nameController.dispose();
    _revenueController.dispose();
    super.dispose();
  }

  void _runPreEvaluation() {
    final dni = _dniController.text.trim();
    final name = _nameController.text.trim();
    
    if (dni.isEmpty || name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, ingrese DNI y Nombres completos.')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    // Simulate query delay
    Future.delayed(const Duration(seconds: 1500 ~/ 1000), () {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _hasEvaluated = true;
        
        // Simulation result based on DNI digits sum
        // Just a fun mock logic
        int sum = 0;
        for (var char in dni.runes) {
          sum += int.tryParse(String.fromCharCode(char)) ?? 0;
        }
        
        if (sum % 3 == 0) {
          _result = 'APTO';
          _reason = 'Cliente califica con Scoring B+. Sin antecedentes morosos históricos en centrales.';
        } else if (sum % 3 == 1) {
          _result = 'REVISAR';
          _reason = 'Registra deuda vigente de S/ 4,500 en Caja Arequipa. Requiere justificación de endeudamiento.';
        } else {
          _result = 'NO PROCEDE';
          _reason = 'Cliente reporta calificación PÉRDIDA en SBS durante el último periodo reportado.';
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Mock campaigns list (HU-16)
    final campaigns = [
      {
        'type': 'RENOVACIÓN',
        'client': 'Lucio Fernandez C.',
        'amount': 'S/ 18,000.00',
        'expiry': 'Expira en 5 días',
        'color': const Color(0xFF2196F3)
      },
      {
        'type': 'AMPLIACIÓN',
        'client': 'Gisela Diaz Palacios',
        'amount': 'S/ 25,000.00',
        'expiry': 'Expira en 12 días',
        'color': const Color(0xFF4CAF50)
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('PRE-EVALUACIÓN'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'M4 - PRE-EVALUACIÓN Y PROSPECCIÓN EN CAMPO',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 1.2),
                ),
                const SizedBox(height: 16),
                
                // Form Card
                AgroCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'DATOS BÁSICOS DEL PROSPECTO',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _dniController,
                        keyboardType: TextInputType.number,
                        maxLength: 8,
                        decoration: const InputDecoration(
                          labelText: 'DNI DEL PROSPECTO',
                          counterText: '',
                          prefixIcon: Icon(Icons.badge_outlined, color: AppColors.outline),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'NOMBRES Y APELLIDOS',
                          prefixIcon: Icon(Icons.person_outline, color: AppColors.outline),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _businessType,
                              dropdownColor: const Color(0xFF021525),
                              decoration: const InputDecoration(labelText: 'ACTIVIDAD'),
                              items: ['Agropecuario', 'Comercio', 'Producción', 'Servicios']
                                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                                  .toList(),
                              onChanged: (v) {
                                if (v != null) setState(() => _businessType = v);
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextField(
                              controller: _revenueController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'INGRESOS MENSUALES',
                                prefixText: 'S/ ',
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _destination,
                        dropdownColor: const Color(0xFF021525),
                        decoration: const InputDecoration(
                          labelText: 'DESTINO DEL CRÉDITO',
                          prefixIcon: Icon(Icons.info_outline, color: AppColors.outline),
                        ),
                        items: ['Compra de Semillas', 'Capital de Trabajo', 'Maquinaria', 'Infraestructura Riego']
                            .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                            .toList(),
                        onChanged: (v) {
                          if (v != null) setState(() => _destination = v);
                        },
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('MONTO SOLICITADO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          Text(
                            'S/ ${_requestedAmount.toInt()}',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'JetBrains Mono', color: Color(0xFF7ED99E)),
                          ),
                        ],
                      ),
                      Slider(
                        value: _requestedAmount,
                        min: 500,
                        max: 50000,
                        divisions: 99,
                        activeColor: const Color(0xFF00C853),
                        inactiveColor: Colors.white10,
                        onChanged: (v) {
                          setState(() {
                            _requestedAmount = (v / 500).round() * 500.0;
                          });
                        },
                      ),
                      const SizedBox(height: 16),
                      AgroButton(
                        label: 'PRE-EVALUAR PROSPECTO',
                        isLoading: _isLoading,
                        onPressed: _runPreEvaluation,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Evaluation Results (HU-15)
                if (_hasEvaluated) ...[
                  _buildEvaluationResultCard(theme),
                  const SizedBox(height: 24),
                ],

                // Campaigns Section (HU-16)
                const Text(
                  'CAMPANAS COMERCIALES ACTIVAS',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 1.2),
                ),
                const SizedBox(height: 12),
                ...campaigns.map((camp) => Padding(
                  padding: const EdgeInsets.only(bottom: 10.0),
                  child: AgroCard(
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: (camp['color'] as Color).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: (camp['color'] as Color).withOpacity(0.4)),
                          ),
                          child: Text(
                            camp['type'] as String,
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: camp['color'] as Color),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(camp['client'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              Text(camp['expiry'] as String, style: const TextStyle(fontSize: 11, color: Colors.white38)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              camp['amount'] as String,
                              style: const TextStyle(fontFamily: 'JetBrains Mono', fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => LoanRequestScreen(
                                      prefilledAmount: double.tryParse((camp['amount'] as String).replaceAll('S/ ', '').replaceAll(',', '')),
                                    ),
                                  ),
                                );
                              },
                              child: const Text(
                                'Gestionar',
                                style: TextStyle(color: Color(0xFF7ED99E), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                )),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEvaluationResultCard(ThemeData theme) {
    Color cardColor = Colors.grey;
    Color textColor = Colors.white;
    IconData icon = Icons.info_outline;

    if (_result == 'APTO') {
      cardColor = const Color(0xFF00C853);
      textColor = const Color(0xFF7ED99E);
      icon = Icons.check_circle_outline;
    } else if (_result == 'REVISAR') {
      cardColor = const Color(0xFFFFD600);
      textColor = const Color(0xFFFFD600);
      icon = Icons.warning_amber_rounded;
    } else if (_result == 'NO PROCEDE') {
      cardColor = AppColors.critical;
      textColor = AppColors.critical;
      icon = Icons.cancel_outlined;
    }

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardColor.withOpacity(0.4), width: 1.5),
        gradient: LinearGradient(
          colors: [
            cardColor.withOpacity(0.08),
            Colors.white.withOpacity(0.01),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: AgroCard(
        color: Colors.transparent,
        border: Border.all(color: Colors.transparent),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Icon(icon, color: textColor, size: 20),
                const SizedBox(width: 8),
                Text(
                  'RESULTADO DE PRE-EVALUACIÓN',
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontSize: 10,
                    color: textColor,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'ESTADO: $_result',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor),
            ),
            const SizedBox(height: 6),
            Text(
              _reason,
              style: const TextStyle(fontSize: 12, color: Colors.white70, height: 1.4),
            ),
            if (_result != 'NO PROCEDE') ...[
              const Divider(height: 24, color: Colors.white10),
              ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => LoanRequestScreen(
                        prefilledAmount: _requestedAmount,
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: cardColor.withOpacity(0.2),
                  foregroundColor: textColor,
                  shadowColor: Colors.transparent,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(color: cardColor, width: 1),
                  ),
                ),
                child: Text(_result == 'APTO' ? 'INICIAR SOLICITUD FORMAL' : 'REGISTRAR OBSERVACIONES'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
