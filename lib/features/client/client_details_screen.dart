import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/glass_background.dart';
import '../loan_request/loan_request_screen.dart';
import 'bureau_check_screen.dart';

class ClientDetailsScreen extends StatelessWidget {
  final String clientId;

  const ClientDetailsScreen({super.key, required this.clientId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Mock data for scoring offer
    const double preapprovedAmount = 15000.0;
    const int preapprovedTerm = 12;
    const double preapprovedTea = 18.5;
    const double scoringConfidence = 0.85;

    return Scaffold(
      appBar: AppBar(
        title: const Text('FICHA DEL CLIENTE'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProfileHeader(context, theme),
                const SizedBox(height: 24),
                
                // Call & Contacts Row
                _buildQuickActionsRow(context),
                const SizedBox(height: 24),

                // SBS Risk Semaphore (RF-28)
                _buildRiskSemaphore(theme, 'CPP'), // Simulated rating is CPP
                const SizedBox(height: 24),

                // General Information
                _buildSectionTitle(theme, 'DATOS GENERALES'),
                const SizedBox(height: 12),
                AgroCard(
                  child: Column(
                    children: [
                      _buildDataRow('DNI', '45678912'),
                      _buildDataRow('TELÉFONO', '+51 987 654 321'),
                      _buildDataRow('DIRECCIÓN', 'Sector A - Lote 4, Huancayo'),
                      _buildDataRow('ACTIVIDAD ECONÓMICA', 'CULTIVO DE PAPA - CIIU 0111'),
                      _buildDataRow('ANTIGÜEDAD NEGOCIO', '4 AÑOS y 6 MESES'),
                      _buildDataRow('INGRESOS MENSUALES EST.', 'S/ 4,500.00'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Preapproved offer (HU-13)
                _buildPreapprovedOfferCard(context, theme, preapprovedAmount, preapprovedTerm, preapprovedTea, scoringConfidence),
                const SizedBox(height: 24),

                // Payment History Graph (HU-12 / RF-31 / RF-32)
                _buildSectionTitle(theme, 'COMPORTAMIENTO DE PAGOS (12 MESES)'),
                const SizedBox(height: 12),
                _buildPaymentsHistoryChart(theme),
                const SizedBox(height: 24),

                // Credit History List
                _buildSectionTitle(theme, 'HISTORIAL CREDITICIO INTERNO'),
                const SizedBox(height: 12),
                AgroCard(
                  child: Column(
                    children: [
                      _buildHistoryItem(
                        'CRÉDITO AGRÍCOLA 2025',
                        'S/ 12,000.00',
                        'CANCELADO',
                        AppColors.success,
                      ),
                      const Divider(color: Colors.white10),
                      _buildHistoryItem(
                        'CRÉDITO EQUIPAMIENTO',
                        'S/ 5,000.00',
                        'CANCELADO',
                        AppColors.success,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // New Application Action
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const LoanRequestScreen()),
                    );
                  },
                  icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
                  label: const Text('NUEVA SOLICITUD FORMAL'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00897B),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, ThemeData theme) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF7ED99E), width: 1.5),
          ),
          child: const CircleAvatar(
            radius: 32,
            backgroundColor: Color(0x207ED99E),
            child: Icon(Icons.person, size: 36, color: Color(0xFF7ED99E)),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'JUAN PEREZ RAMOS',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF7ED99E).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'SCORING: A+',
                      style: TextStyle(
                        color: Color(0xFF7ED99E),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'DNI: 45678912',
                    style: TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionsRow(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Lanzando marcador telefónico a: +51 987 654 321'),
                  backgroundColor: Color(0xFF00897B),
                ),
              );
            },
            child: AgroCard(
              padding: const EdgeInsets.symmetric(vertical: 12),
              color: Colors.white.withOpacity(0.04),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.phone_in_talk, color: Color(0xFF7ED99E), size: 18),
                  SizedBox(width: 8),
                  Text('LLAMAR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const BureauCheckScreen(dni: '45678912')),
              );
            },
            child: AgroCard(
              padding: const EdgeInsets.symmetric(vertical: 12),
              color: Colors.white.withOpacity(0.04),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bar_chart_outlined, color: AppColors.primary, size: 18),
                  SizedBox(width: 8),
                  Text('VER BURÓ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRiskSemaphore(ThemeData theme, String activeRating) {
    final ratings = [
      {'code': 'Normal', 'color': const Color(0xFF4CAF50), 'desc': 'Sin observaciones'},
      {'code': 'CPP', 'color': const Color(0xFFFFEB3B), 'desc': 'Con Probabilidades'},
      {'code': 'Deficiente', 'color': const Color(0xFFFF9800), 'desc': 'Riesgo medio'},
      {'code': 'Dudoso', 'color': const Color(0xFFF44336), 'desc': 'Riesgo alto'},
      {'code': 'Pérdida', 'color': const Color(0xFF757575), 'desc': 'Pérdida total'}
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('SEMÁFORO DE RIESGO SBS', style: theme.textTheme.labelLarge?.copyWith(color: Colors.white)),
            Text(
              activeRating.toUpperCase(),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: ratings.firstWhere((r) => r['code'] == activeRating)['color'] as Color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: ratings.map((rating) {
            final isActive = rating['code'] == activeRating;
            final color = rating['color'] as Color;
            return Expanded(
              child: Column(
                children: [
                  Container(
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 2.0),
                    decoration: BoxDecoration(
                      color: isActive ? color : color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                      boxShadow: isActive
                          ? [
                              BoxShadow(
                                color: color.withOpacity(0.5),
                                blurRadius: 8,
                                spreadRadius: 1,
                              )
                            ]
                          : null,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    (rating['code'] as String).substring(0, 3).toUpperCase(),
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      color: isActive ? Colors.white : Colors.white24,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPreapprovedOfferCard(
    BuildContext context,
    ThemeData theme,
    double amount,
    int term,
    double tea,
    double confidence,
  ) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF7ED99E).withOpacity(0.4), width: 1.5),
        gradient: LinearGradient(
          colors: [
            const Color(0xFF00E676).withOpacity(0.08),
            const Color(0xFF009688).withOpacity(0.02),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: AgroCard(
        color: Colors.transparent,
        border: Border.all(color: Colors.transparent),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.star, color: Color(0xFF7ED99E), size: 18),
                const SizedBox(width: 8),
                Text(
                  'OFERTA PREAPROBADA VIGENTE',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: const Color(0xFF7ED99E),
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('MONTO MÁXIMO', style: TextStyle(color: Colors.white38, fontSize: 10)),
                    Text(
                      'S/ ${amount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'JetBrains Mono',
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('PLAZO SUGERIDO', style: TextStyle(color: Colors.white38, fontSize: 10)),
                    Text(
                      '$term MESES',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Tasa TEA Referencial: ${tea.toStringAsFixed(1)}%',
                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                ),
                Row(
                  children: [
                    const Text('Confianza: ', style: TextStyle(fontSize: 11, color: Colors.white38)),
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(2),
                      ),
                      alignment: Alignment.centerLeft,
                      child: Container(
                        width: 40 * confidence,
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFF7ED99E),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${(confidence * 100).toInt()}%',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF7ED99E)),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(height: 24, color: Colors.white10),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => LoanRequestScreen(
                      prefilledAmount: amount,
                      prefilledTerm: term,
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00C853).withOpacity(0.2),
                foregroundColor: const Color(0xFF7ED99E),
                shadowColor: Colors.transparent,
                minimumSize: const Size(double.infinity, 44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: const BorderSide(color: Color(0xFF00C853), width: 1),
                ),
              ),
              child: const Text('USAR ESTA OFERTA'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentsHistoryChart(ThemeData theme) {
    // 12 months data representation: true = punctual payment, false = late, null = no-payment/empty
    final history = [
      {'month': 'M', 'state': true},
      {'month': 'J', 'state': true},
      {'month': 'J', 'state': true},
      {'month': 'A', 'state': false},
      {'month': 'S', 'state': true},
      {'month': 'O', 'state': null},
      {'month': 'N', 'state': true},
      {'month': 'D', 'state': true},
      {'month': 'E', 'state': true},
      {'month': 'F', 'state': false},
      {'month': 'M', 'state': true},
      {'month': 'A', 'state': true},
    ];

    return AgroCard(
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildChartSummaryItem('Puntualidad', '81.8%', const Color(0xFF7ED99E)),
              _buildChartSummaryItem('Mora Prom.', '4.2 Días', const Color(0xFFFFB4AB)),
              _buildChartSummaryItem('Total Pagado', 'S/ 9,400', Colors.white70),
            ],
          ),
          const SizedBox(height: 20),
          // Custom glass bars
          Container(
            height: 100,
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: history.map((h) {
                final isPunctual = h['state'] == true;
                final isLate = h['state'] == false;
                final isEmpty = h['state'] == null;

                Color barColor = Colors.grey.withOpacity(0.1);
                double height = 20.0;
                if (isPunctual) {
                  barColor = const Color(0xFF4CAF50);
                  height = 70.0;
                } else if (isLate) {
                  barColor = const Color(0xFFF44336);
                  height = 50.0;
                }

                return Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      width: 14,
                      height: height,
                      decoration: BoxDecoration(
                        color: barColor.withOpacity(0.85),
                        borderRadius: BorderRadius.circular(3),
                        boxShadow: isLate || isPunctual
                            ? [
                                BoxShadow(
                                  color: barColor.withOpacity(0.2),
                                  blurRadius: 4,
                                  spreadRadius: 0.5,
                                )
                              ]
                            : null,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      h['month'] as String,
                      style: const TextStyle(fontSize: 10, color: Colors.white30, fontWeight: FontWeight.bold),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          // Legend row
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _ChartLegend(color: Color(0xFF4CAF50), label: 'Puntual'),
              SizedBox(width: 16),
              _ChartLegend(color: Color(0xFFF44336), label: 'Con mora'),
              SizedBox(width: 16),
              _ChartLegend(color: Colors.white24, label: 'Sin cuota'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChartSummaryItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white30, fontSize: 10)),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: color, fontFamily: 'JetBrains Mono'),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(ThemeData theme, String title) {
    return Text(
      title,
      style: theme.textTheme.labelLarge?.copyWith(
        letterSpacing: 1.2,
        color: AppColors.primary,
        fontSize: 12,
      ),
    );
  }

  Widget _buildDataRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryItem(String title, String amount, String status, Color statusColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 2),
                Text(amount, style: const TextStyle(fontFamily: 'JetBrains Mono', color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: statusColor.withOpacity(0.4), width: 1),
            ),
            child: Text(
              status,
              style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChartLegend extends StatelessWidget {
  final Color color;
  final String label;

  const _ChartLegend({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 9, color: Colors.white38, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
