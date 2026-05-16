import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../loan_request/loan_request_screen.dart';
import 'bureau_check_screen.dart';

class ClientDetailsScreen extends StatelessWidget {
  final String clientId;

  const ClientDetailsScreen({super.key, required this.clientId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('FICHA DEL CLIENTE'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProfileHeader(context, theme),
            const SizedBox(height: 24),
            _buildSectionTitle(theme, 'DATOS GENERALES'),
            const SizedBox(height: 12),
            AgroCard(
              child: Column(
                children: [
                  _buildDataRow('DNI', '45678912'),
                  _buildDataRow('TELÉFONO', '987 654 321'),
                  _buildDataRow('DIRECCIÓN', 'Sector A - Lote 4, Huancayo'),
                  _buildDataRow('ACTIVIDAD', 'CULTIVO DE PAPA'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            _buildSectionTitle(theme, 'HISTORIAL CREDITICIO'),
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
            const SizedBox(height: 24),
            _buildSectionTitle(theme, 'PRODUCTOS ACTIVOS'),
            const SizedBox(height: 12),
            AgroCard(
              color: AppColors.primaryContainer.withOpacity(0.3),
              child: Column(
                children: [
                  _buildHistoryItem(
                    'SOLICITUD EN CURSO',
                    'S/ 15,000.00',
                    'EVALUACIÓN',
                    AppColors.warning,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const LoanRequestScreen()),
                );
              },
              icon: const Icon(Icons.add_shopping_cart),
              label: const Text('NUEVA SOLICITUD'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondaryContainer,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, ThemeData theme) {
    return Row(
      children: [
        CircleAvatar(
          radius: 35,
          backgroundColor: AppColors.primaryContainer,
          child: const Icon(Icons.person, size: 40, color: AppColors.primary),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'JUAN PEREZ RAMOS',
                style: theme.textTheme.headlineSmall,
              ),
              const SizedBox(height: 4),
              const Text(
                'CLIENTE RECURRENTE - SCORING A+',
                style: TextStyle(
                  color: AppColors.secondary,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const BureauCheckScreen(dni: '45678912')),
                  );
                },
                child: Row(
                  children: [
                    const Icon(Icons.analytics_outlined, size: 14, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      'VER BURÓ CREDITICIO',
                      style: theme.textTheme.labelSmall?.copyWith(color: AppColors.primary),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(ThemeData theme, String title) {
    return Text(
      title,
      style: theme.textTheme.labelLarge?.copyWith(
        letterSpacing: 1.5,
        color: AppColors.primary,
      ),
    );
  }

  Widget _buildDataRow(String label, String value) {
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

  Widget _buildHistoryItem(String title, String amount, String status, Color statusColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                Text(amount, style: const TextStyle(fontFamily: 'JetBrains Mono', color: AppColors.onSurfaceVariant)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: statusColor, width: 0.5),
            ),
            child: Text(
              status,
              style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
