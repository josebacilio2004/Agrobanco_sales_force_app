import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/glass_background.dart';

class BureauCheckScreen extends StatelessWidget {
  final String dni;

  const BureauCheckScreen({super.key, required this.dni});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('CONSULTA DE BURÓ'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildScoreHeader(theme),
                const SizedBox(height: 24),
                _buildRiskIndicator(theme),
                const SizedBox(height: 24),
                _buildDetailsSection(theme),
                const SizedBox(height: 24),
                
                // Recommendation
                AgroCard(
                  color: const Color(0xFF00C853).withOpacity(0.06),
                  border: Border.all(color: const Color(0xFF00C853).withOpacity(0.3)),
                  child: const Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.check_circle_outline, color: Color(0xFF7ED99E), size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'RECOMENDACIÓN ANALÍTICA',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF7ED99E), letterSpacing: 0.8),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'El cliente tiene historial limpio en 3 entidades financieras. No registra cuotas vencidas ni procesos judiciales. Recomendado: proceder con la aprobación.',
                              style: TextStyle(fontSize: 12, color: Colors.white70, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(0.06),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 54),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: AppColors.glassBorder, width: 1.5),
                    ),
                  ),
                  child: const Text('VOLVER A FICHA'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildScoreHeader(ThemeData theme) {
    return AgroCard(
      color: Colors.white.withOpacity(0.06),
      child: Column(
        children: [
          const Text(
            'SCORING CREDITICIO SBS',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 12),
          Text(
            '850',
            style: theme.textTheme.displayLarge?.copyWith(
              color: const Color(0xFF7ED99E),
              fontSize: 64,
              fontWeight: FontWeight.w900,
              fontFamily: 'JetBrains Mono',
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'CALIFICACIÓN DEL CLIENTE: EXCELENTE',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskIndicator(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'NIVEL DE RIESGO SBS',
          style: theme.textTheme.labelLarge?.copyWith(color: Colors.white, fontSize: 11, letterSpacing: 1),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _RiskBar(color: const Color(0xFF00C853), isActive: true, label: 'BAJO'),
            _RiskBar(color: const Color(0xFFFFD600), isActive: false, label: 'MEDIO'),
            _RiskBar(color: AppColors.critical, isActive: false, label: 'ALTO'),
          ],
        ),
      ],
    );
  }

  Widget _buildDetailsSection(ThemeData theme) {
    return AgroCard(
      child: Column(
        children: [
          _DetailRow('DEUDAS VIGENTES SISTEMA', 'S/ 2,400.00'),
          const Divider(color: Colors.white10),
          _DetailRow('ATRASO MÁXIMO REPORTADO', '0 DÍAS'),
          const Divider(color: Colors.white10),
          _DetailRow('ENTIDADES FINANCIERAS', '3 BANCOS'),
          const Divider(color: Colors.white10),
          _DetailRow('PROCESOS JUDICIALES / FRAUDES', 'NINGUNO'),
        ],
      ),
    );
  }

  Widget _DetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
        ],
      ),
    );
  }
}

class _RiskBar extends StatelessWidget {
  final Color color;
  final bool isActive;
  final String label;

  const _RiskBar({required this.color, required this.isActive, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Container(
            height: 8,
            margin: const EdgeInsets.symmetric(horizontal: 3),
            decoration: BoxDecoration(
              color: isActive ? color : color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(4),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: color.withOpacity(0.4),
                        blurRadius: 8,
                        spreadRadius: 1,
                      )
                    ]
                  : null,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: isActive ? Colors.white : Colors.white24,
            ),
          ),
        ],
      ),
    );
  }
}
