import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../client/client_details_screen.dart';
import '../route/route_planning_screen.dart';
import 'client_model.dart';

class PortfolioScreen extends StatelessWidget {
  const PortfolioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    // Mock data based on Stitch design intent
    final clients = [
      Client(
        id: '1',
        name: 'Juan Perez Ramos',
        dni: '45678912',
        status: 'RENOVACIÓN',
        loanAmount: 15000.0,
        dueDate: DateTime.now().add(const Duration(days: 5)),
        location: 'Sector A - Lote 4, Huancayo',
      ),
      Client(
        id: '2',
        name: 'Maria Quispe Soto',
        dni: '12345678',
        status: 'PENDIENTE',
        loanAmount: 8500.0,
        dueDate: DateTime.now().add(const Duration(days: 2)),
        location: 'Comunidad Campesina, Jauja',
      ),
      Client(
        id: '3',
        name: 'Carlos Huaman Diaz',
        dni: '98765432',
        status: 'APROBADO',
        loanAmount: 22000.0,
        dueDate: DateTime.now().subtract(const Duration(days: 1)),
        location: 'Fundo Los Olivos, Tarma',
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('CARTERA DIARIA'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Offline Status Bar
          Container(
            height: 32,
            width: double.infinity,
            color: AppColors.primaryContainer,
            child: const Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.cloud_done, size: 16, color: AppColors.primary),
                  SizedBox(width: 8),
                  Text(
                    'Sincronizado - Modo Online',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: clients.length,
              itemBuilder: (context, index) {
                final client = clients[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: AgroCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              client.name.toUpperCase(),
                              style: theme.textTheme.bodyLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                            _StatusChip(status: client.status),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.badge, size: 16, color: AppColors.onSurfaceVariant),
                            const SizedBox(width: 8),
                            Text(
                              'DNI: ${client.dni}',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: AppColors.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 16, color: AppColors.onSurfaceVariant),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                client.location,
                                style: theme.textTheme.bodySmall,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 24, color: Colors.white10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'MONTO SOLICITADO',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: AppColors.onSurfaceVariant,
                                  ),
                                ),
                                Text(
                                  'S/ ${client.loanAmount.toStringAsFixed(2)}',
                                  style: theme.textTheme.headlineSmall?.copyWith(
                                    fontFamily: 'JetBrains Mono',
                                  ),
                                ),
                              ],
                            ),
                            IconButton(
                              icon: const Icon(Icons.arrow_forward_ios, size: 16),
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => ClientDetailsScreen(clientId: client.id),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: AppColors.onPrimary),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case 'RENOVACIÓN':
        color = AppColors.secondary;
        break;
      case 'PENDIENTE':
        color = AppColors.warning;
        break;
      case 'APROBADO':
        color = AppColors.success;
        break;
      default:
        color = AppColors.onSurfaceVariant;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: color, width: 1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
