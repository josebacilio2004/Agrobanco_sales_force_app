import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';

class BureauCheckScreen extends StatelessWidget {
  final String dni;

  const BureauCheckScreen({super.key, required this.dni});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('CONSULTA DE BURÓ'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildScoreHeader(theme),
            const SizedBox(height: 24),
            _buildRiskIndicator(theme),
            const SizedBox(height: 24),
            _buildDetailsSection(theme),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('VOLVER A FICHA'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreHeader(ThemeData theme) {
    return AgroCard(
      color: AppColors.primaryContainer.withOpacity(0.2),
      child: Column(
        children: [
          const Text('SCORING CREDITICIO', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
          const SizedBox(height: 12),
          Text(
            '850',
            style: theme.textTheme.displayLarge?.copyWith(
              color: AppColors.secondary,
              fontSize: 64,
              fontFamily: 'JetBrains Mono',
            ),
          ),
          const Text('CALIFICACIÓN: EXCELENTE', style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildRiskIndicator(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('NIVEL DE RIESGO', style: theme.textTheme.labelLarge),
        const SizedBox(height: 12),
        Row(
          children: [
            _RiskBar(color: AppColors.secondary, isActive: true, label: 'BAJO'),
            _RiskBar(color: AppColors.warning, isActive: false, label: 'MEDIO'),
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
          _DetailRow('DEUDAS VIGENTES', 'S/ 2,400.00'),
          _DetailRow('ATRASO MÁXIMO', '0 DÍAS'),
          _DetailRow('ENTIDADES', '3 BANCOS'),
          _DetailRow('JUDICIALES', 'NINGUNO'),
        ],
      ),
    );
  }

  Widget _DetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.onSurfaceVariant, fontSize: 12)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
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
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: BoxDecoration(
              color: isActive ? color : color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 9, color: isActive ? color : Colors.white24)),
        ],
      ),
    );
  }
}
