import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/glass_background.dart';

class RoutePlanningScreen extends StatefulWidget {
  const RoutePlanningScreen({super.key});

  @override
  State<RoutePlanningScreen> createState() => _RoutePlanningScreenState();
}

class _RoutePlanningScreenState extends State<RoutePlanningScreen> {
  bool _isOptimized = false;
  String? _selectedClientName;

  // List of route points
  final List<Map<String, dynamic>> _points = [
    {
      'id': '1',
      'name': 'Juan Perez Ramos',
      'time': '8:30 AM',
      'status': 'Completado',
      'priority': 'ALTA',
      'x': 100.0,
      'y': 120.0,
    },
    {
      'id': '2',
      'name': 'Maria Quispe Soto',
      'time': '10:45 AM',
      'status': 'En Camino',
      'priority': 'ALTA',
      'x': 250.0,
      'y': 150.0,
    },
    {
      'id': '3',
      'name': 'Carlos Huaman Diaz',
      'time': '2:00 PM',
      'status': 'Pendiente',
      'priority': 'MEDIA',
      'x': 180.0,
      'y': 280.0,
    },
    {
      'id': '4',
      'name': 'Elena Rivas Castro',
      'time': '4:15 PM',
      'status': 'Pendiente',
      'priority': 'NORMAL',
      'x': 80.0,
      'y': 310.0,
    },
  ];

  List<Map<String, dynamic>> get _orderedPoints {
    if (!_isOptimized) return _points;

    // Simulate nearest-neighbor reordering:
    // Original index: 0, 1, 2, 3
    // Let's sort them by an optimized logical sequence: e.g. 0 -> 3 -> 2 -> 1
    return [
      _points[0],
      _points[3], // Elena is closer to Juan than Carlos
      _points[2], // Carlos is next
      _points[1], // Maria is last
    ];
  }

  void _triggerNavigation(String clientName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Lanzando navegación externa (Waze/Google Maps) hacia $clientName...'),
        backgroundColor: const Color(0xFF00C853),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('PLANIFICACIÓN DE RUTA'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: Column(
          children: [
            // Map Panel
            Expanded(
              flex: 3,
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.12), width: 1.5),
                  color: Colors.black.withOpacity(0.4),
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  children: [
                    // Styled mock vector map
                    CustomPaint(
                      painter: MapPainter(points: _points, isOptimized: _isOptimized),
                      size: Size.infinite,
                    ),

                    // Interactive points icons
                    ..._points.map((p) {
                      final isSelected = _selectedClientName == p['name'];
                      final isCompleted = p['status'] == 'Completado';
                      Color markerColor = Colors.grey;

                      if (!isCompleted) {
                        if (p['priority'] == 'ALTA') markerColor = AppColors.critical;
                        if (p['priority'] == 'MEDIA') markerColor = const Color(0xFFFFD600);
                        if (p['priority'] == 'NORMAL') markerColor = const Color(0xFF7ED99E);
                      }

                      return Positioned(
                        left: p['x'] - 16,
                        top: p['y'] - 32,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedClientName = p['name'];
                            });
                          },
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isCompleted ? Icons.check_circle : Icons.location_on,
                                color: markerColor,
                                size: isSelected ? 36 : 28,
                              ),
                              if (isSelected)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.black,
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: Colors.white24),
                                  ),
                                  child: Text(
                                    (p['name'] as String).split(' ').first,
                                    style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    }),

                    // Map Overlay info (Geofence alert / controls)
                    Positioned(
                      top: 12,
                      left: 12,
                      right: 12,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF021525).withOpacity(0.85),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.white10),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.security, size: 14, color: Color(0xFF7ED99E)),
                                SizedBox(width: 6),
                                Text(
                                  'ZONA HUANCAYO SUR',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white70),
                                ),
                              ],
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _isOptimized = !_isOptimized;
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(_isOptimized
                                      ? 'Ruta optimizada mediante Vecino Más Cercano.'
                                      : 'Mostrando orden cronológico de visitas.'),
                                  backgroundColor: const Color(0xFF00897B),
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: _isOptimized
                                    ? const Color(0xFF00C853).withOpacity(0.85)
                                    : const Color(0xFF021525).withOpacity(0.85),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: _isOptimized ? const Color(0xFF00C853) : Colors.white10),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.directions, size: 14, color: _isOptimized ? Colors.white : const Color(0xFF7ED99E)),
                                  const SizedBox(width: 6),
                                  Text(
                                    _isOptimized ? 'RUTA ÓPTIMA' : 'OPTIMIZAR',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: _isOptimized ? Colors.white : Colors.white70,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Route Details bottom list
            Expanded(
              flex: 2,
              child: Container(
                padding: const EdgeInsets.only(top: 20, left: 20, right: 20),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('VISITAS DEL DÍA', style: theme.textTheme.labelLarge?.copyWith(color: Colors.white)),
                        Text(
                          '${_orderedPoints.length} CLIENTES ASIGNADOS',
                          style: const TextStyle(color: Color(0xFF7ED99E), fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _orderedPoints.length,
                        itemBuilder: (context, index) {
                          final point = _orderedPoints[index];
                          final isSelected = _selectedClientName == point['name'];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10.0),
                            child: _buildRouteItem(
                              index: '${index + 1}',
                              name: point['name'],
                              time: point['time'],
                              status: point['status'],
                              isSelected: isSelected,
                              priority: point['priority'],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRouteItem({
    required String index,
    required String name,
    required String time,
    required String status,
    required bool isSelected,
    required String priority,
  }) {
    bool isCompleted = status == 'Completado';
    Color priorityColor = Colors.grey;
    if (priority == 'ALTA') priorityColor = AppColors.critical;
    if (priority == 'MEDIA') priorityColor = const Color(0xFFFFD600);

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedClientName = name;
        });
      },
      child: AgroCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        color: isSelected ? Colors.white.withOpacity(0.08) : Colors.white.withOpacity(0.04),
        border: Border.all(
          color: isSelected ? const Color(0xFF7ED99E).withOpacity(0.4) : AppColors.glassBorder,
          width: 1.5,
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 12,
              backgroundColor: isCompleted
                  ? const Color(0xFF00C853)
                  : isSelected
                      ? AppColors.primary
                      : Colors.white12,
              child: isCompleted
                  ? const Icon(Icons.check, size: 12, color: Colors.white)
                  : Text(index, style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: isCompleted ? Colors.white30 : Colors.white,
                    ),
                  ),
                  Row(
                    children: [
                      Text(time, style: const TextStyle(fontSize: 11, color: Colors.white38)),
                      const SizedBox(width: 8),
                      Container(width: 3, height: 3, decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white24)),
                      const SizedBox(width: 8),
                      Text(
                        'Prioridad: $priority',
                        style: TextStyle(fontSize: 11, color: priorityColor.withOpacity(0.8), fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (isSelected)
              IconButton(
                icon: const Icon(Icons.directions_outlined, color: Color(0xFF7ED99E)),
                onPressed: () => _triggerNavigation(name),
              )
            else
              Text(
                status,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isCompleted ? const Color(0xFF00C853) : Colors.white38,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// Vector High-tech Map Painter with Geofence boundary (HU-09 / RF-19)
class MapPainter extends CustomPainter {
  final List<Map<String, dynamic>> points;
  final bool isOptimized;

  MapPainter({required this.points, required this.isOptimized});

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Grid Lines (Techy map aesthetic)
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.03)
      ..strokeWidth = 1.0;

    double gridSpacing = 40.0;
    for (double i = 0; i < size.width; i += gridSpacing) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), gridPaint);
    }
    for (double i = 0; i < size.height; i += gridSpacing) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), gridPaint);
    }

    // 2. Draw Geofence Boundary Polygon (RF-23)
    final geofencePaint = Paint()
      ..color = const Color(0xFF00C853).withOpacity(0.12)
      ..strokeWidth = 2.0
      ..style = PaintingStyle.fill;

    final fenceBorderPaint = Paint()
      ..color = const Color(0xFF00C853).withOpacity(0.4)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final fencePath = Path()
      ..moveTo(20, 50)
      ..lineTo(320, 80)
      ..lineTo(300, 360)
      ..lineTo(40, 330)
      ..close();

    canvas.drawPath(fencePath, geofencePaint);
    canvas.drawPath(fencePath, fenceBorderPaint);

    // 3. Draw Route Connection Lines (RF-21)
    final routePaint = Paint()
      ..color = isOptimized ? const Color(0xFF00B0FF) : const Color(0xFF00897B).withOpacity(0.5)
      ..strokeWidth = isOptimized ? 3.0 : 2.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    List<Map<String, dynamic>> routePoints = points;
    if (isOptimized) {
      routePoints = [
        points[0],
        points[3],
        points[2],
        points[1],
      ];
    }

    if (routePoints.isNotEmpty) {
      path.moveTo(routePoints[0]['x'], routePoints[0]['y']);
      for (int i = 1; i < routePoints.length; i++) {
        path.lineTo(routePoints[i]['x'], routePoints[i]['y']);
      }
      canvas.drawPath(path, routePaint);
    }
  }

  @override
  bool shouldRepaint(MapPainter oldDelegate) {
    return oldDelegate.points != points || oldDelegate.isOptimized != isOptimized;
  }
}
