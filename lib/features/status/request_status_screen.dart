import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';

class RequestStatusScreen extends StatelessWidget {
  const RequestStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ESTADO DE SOLICITUDES'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildStatusGroup('RECIENTES', [
            _buildStatusCard(
              'JUAN PEREZ RAMOS',
              'S/ 15,000.00',
              'EVALUACIÓN',
              'Enviado hace 2 horas',
              AppColors.warning,
              0.4,
            ),
            _buildStatusCard(
              'MARIA QUISPE SOTO',
              'S/ 8,500.00',
              'APROBADO',
              'Pendiente desembolso',
              AppColors.success,
              0.8,
            ),
          ]),
          const SizedBox(height: 24),
          _buildStatusGroup('HISTORIAL', [
            _buildStatusCard(
              'CARLOS HUAMAN DIAZ',
              'S/ 22,000.00',
              'DESEMBOLSADO',
              'Completado 15/05/2026',
              AppColors.primary,
              1.0,
            ),
          ]),
        ],
      ),
    );
  }

  Widget _buildStatusGroup(String title, List<Widget> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: AppColors.onSurfaceVariant)),
        const SizedBox(height: 12),
        ...items,
      ],
    );
  }

  Widget _buildStatusCard(String name, String amount, String status, String subtitle, Color statusColor, double progress) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: AgroCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(status, style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 4),
            Text(amount, style: const TextStyle(fontFamily: 'JetBrains Mono', fontSize: 16)),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.white10,
                color: statusColor,
                minHeight: 4,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.access_time, size: 14, color: AppColors.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
                const Spacer(),
                const Icon(Icons.chevron_right, size: 16, color: AppColors.onSurfaceVariant),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
