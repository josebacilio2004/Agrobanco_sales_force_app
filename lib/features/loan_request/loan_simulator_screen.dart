import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/agro_button.dart';
import '../../shared/widgets/glass_background.dart';
import 'loan_request_screen.dart';

class LoanSimulatorScreen extends StatefulWidget {
  const LoanSimulatorScreen({super.key});

  @override
  State<LoanSimulatorScreen> createState() => _LoanSimulatorScreenState();
}

class _LoanSimulatorScreenState extends State<LoanSimulatorScreen> {
  double _monto = 15000.0;
  int _plazo = 12;
  String _moneda = 'PEN';
  String _frecuencia = 'Mensual';

  // French Amortization Calculator
  Map<String, double> _calculateSimulation() {
    const double tea = 0.225; // 22.5% TEA
    final double rEquiv = pow(1.0 + tea, 1.0 / 12.0) - 1.0; // monthly rate
    final double quota = (_monto * rEquiv) / (1.0 - pow(1.0 + rEquiv, -_plazo));
    final double totalToPay = quota * _plazo;
    final double costFinancier = totalToPay - _monto;

    return {
      'quota': quota,
      'total': totalToPay,
      'cost': costFinancier,
      'tea': tea * 100,
    };
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final sim = _calculateSimulation();

    return Scaffold(
      appBar: AppBar(
        title: const Text('SIMULADOR RÁPIDO'),
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
                  'SIMULADOR DE CRÉDITO INDEPENDIENTE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Calcule cuotas rápidamente en campo sin necesidad de internet y proponga ofertas a su cliente de inmediato.',
                  style: TextStyle(fontSize: 12, color: Colors.white70),
                ),
                const SizedBox(height: 24),
                
                // Indicators Cards
                Row(
                  children: [
                    Expanded(
                      child: AgroCard(
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                        child: Column(
                          children: [
                            const Text('CUOTA MENSUAL', style: TextStyle(fontSize: 9, color: Colors.white38)),
                            const SizedBox(height: 6),
                            Text(
                              'S/ ${sim['quota']!.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'JetBrains Mono',
                                color: Color(0xFF7ED99E),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: AgroCard(
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                        child: Column(
                          children: [
                            const Text('COSTO DE INTERÉS', style: TextStyle(fontSize: 9, color: Colors.white38)),
                            const SizedBox(height: 6),
                            Text(
                              'S/ ${sim['cost']!.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'JetBrains Mono',
                                color: Color(0xFFFFB4AB),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Controls Card
                AgroCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('MONTO A FINANCIAR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text(
                            'S/ ${_monto.toInt()}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'JetBrains Mono',
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Slider(
                        value: _monto,
                        min: 500,
                        max: 150000,
                        divisions: 299,
                        activeColor: const Color(0xFF00C853),
                        inactiveColor: Colors.white10,
                        onChanged: (v) {
                          setState(() {
                            _monto = (v / 500).round() * 500.0;
                          });
                        },
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<int>(
                              value: _plazo,
                              dropdownColor: const Color(0xFF021525),
                              decoration: const InputDecoration(labelText: 'PLAZO'),
                              items: [3, 6, 12, 18, 24, 36, 48]
                                  .map((e) => DropdownMenuItem(value: e, child: Text('$e meses')))
                                  .toList(),
                              onChanged: (v) {
                                if (v != null) {
                                  setState(() {
                                    _plazo = v;
                                  });
                                }
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _moneda,
                              dropdownColor: const Color(0xFF021525),
                              decoration: const InputDecoration(labelText: 'MONEDA'),
                              items: ['PEN', 'USD']
                                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                                  .toList(),
                              onChanged: (v) {
                                if (v != null) {
                                  setState(() {
                                    _moneda = v;
                                  });
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _frecuencia,
                        dropdownColor: const Color(0xFF021525),
                        decoration: const InputDecoration(labelText: 'FRECUENCIA DE CUOTA'),
                        items: ['Mensual', 'Quincenal', 'Semanal']
                            .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                            .toList(),
                        onChanged: (v) {
                          if (v != null) {
                            setState(() {
                              _frecuencia = v;
                            });
                          }
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Metrics summary
                AgroCard(
                  color: Colors.white.withOpacity(0.02),
                  border: Border.all(color: Colors.white10),
                  child: Column(
                    children: [
                      _buildSummaryRow('Tasa Efectiva Anual (TEA)', '${sim['tea']!.toStringAsFixed(1)}%'),
                      const Divider(color: Colors.white10, height: 16),
                      _buildSummaryRow('Tasa Mensual Equivalente', '${( (pow(1.0 + 0.225, 1.0/12.0) - 1.0) * 100 ).toStringAsFixed(2)}%'),
                      const Divider(color: Colors.white10, height: 16),
                      _buildSummaryRow('Total Devolución', 'S/ ${sim['total']!.toStringAsFixed(2)}'),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Action to make loan request
                AgroButton(
                  label: 'CREAR SOLICITUD CON ESTOS DATOS',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => LoanRequestScreen(
                          prefilledAmount: _monto,
                          prefilledTerm: _plazo,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }
}
