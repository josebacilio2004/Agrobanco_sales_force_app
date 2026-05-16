import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';

class RoutePlanningScreen extends StatelessWidget {
  const RoutePlanningScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('PLANIFICACIÓN DE RUTA'),
      ),
      body: Column(
        children: [
          // Map Placeholder
          Expanded(
            flex: 3,
            child: Container(
              width: double.infinity,
              color: AppColors.surfaceVariant,
              child: Stack(
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.map, size: 64, color: Colors.white24),
                        const SizedBox(height: 16),
                        Text(
                          'MAPA INTERACTIVO',
                          style: theme.textTheme.headlineSmall?.copyWith(color: Colors.white24),
                        ),
                        const Text(
                          '(Se requiere Google Maps API Key)',
                          style: TextStyle(color: Colors.white24, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  // Mock map pins
                  const Positioned(
                    top: 100,
                    left: 150,
                    child: Icon(Icons.location_on, color: AppColors.primary, size: 32),
                  ),
                  const Positioned(
                    bottom: 120,
                    right: 80,
                    child: Icon(Icons.location_on, color: AppColors.secondary, size: 32),
                  ),
                ],
              ),
            ),
          ),
          // Route Details
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('VISITAS DEL DÍA', style: theme.textTheme.labelLarge),
                      const Text('3 PUNTOS', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView(
                      children: [
                        _buildRouteItem('1', 'Juan Perez Ramos', '8:30 AM', 'Completado'),
                        const SizedBox(height: 8),
                        _buildRouteItem('2', 'Maria Quispe Soto', '10:45 AM', 'En Camino'),
                        const SizedBox(height: 8),
                        _buildRouteItem('3', 'Carlos Huaman Diaz', '2:00 PM', 'Pendiente'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteItem(String index, String name, String time, String status) {
    bool isCompleted = status == 'Completado';
    return AgroCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          CircleAvatar(
            radius: 12,
            backgroundColor: isCompleted ? AppColors.secondary : AppColors.primary,
            child: Text(index, style: const TextStyle(fontSize: 12, color: Colors.white)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(time, style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
              ],
            ),
          ),
          Text(
            status,
            style: TextStyle(
              fontSize: 12,
              color: isCompleted ? AppColors.secondary : AppColors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
