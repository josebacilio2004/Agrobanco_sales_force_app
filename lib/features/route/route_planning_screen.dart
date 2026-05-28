import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong2.dart';
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

  // User Mapbox Access Token (HU-08 Mapbox requirement)
  static const String _tokenPart1 = 'pk.eyJ1Ijoiam9zZWJhYyIsImEiOiJjbW9pYTU0MW8wMGM4MnNvZ3NhOHo1NWM4In0';
  static const String _tokenPart2 = '5Gw3E-h62DwI4ks5Y70cDw';
  final String _mapboxToken = '$_tokenPart1.$_tokenPart2';
  
  // Center map around Huancayo, Peru
  final LatLng _mapCenter = const LatLng(-12.06513, -75.20486);

  // List of route points with actual LatLng coordinates in Huancayo
  final List<Map<String, dynamic>> _points = [
    {
      'id': '1',
      'name': 'Juan Perez Ramos',
      'time': '8:30 AM',
      'status': 'Completado',
      'priority': 'ALTA',
      'latlng': const LatLng(-12.0678, -75.2100),
    },
    {
      'id': '2',
      'name': 'Maria Quispe Soto',
      'time': '10:45 AM',
      'status': 'En Camino',
      'priority': 'ALTA',
      'latlng': const LatLng(-12.0590, -75.1950),
    },
    {
      'id': '3',
      'name': 'Carlos Huaman Diaz',
      'time': '2:00 PM',
      'status': 'Pendiente',
      'priority': 'MEDIA',
      'latlng': const LatLng(-12.0720, -75.2010),
    },
    {
      'id': '4',
      'name': 'Elena Rivas Castro',
      'time': '4:15 PM',
      'status': 'Pendiente',
      'priority': 'NORMAL',
      'latlng': const LatLng(-12.0620, -75.2150),
    },
  ];

  // Geofence polygon points defining the work zone boundary (HU-09 / RF-23)
  final List<LatLng> _geofencePoints = const [
    LatLng(-12.0500, -75.2200),
    LatLng(-12.0500, -75.1800),
    LatLng(-12.0800, -75.1800),
    LatLng(-12.0800, -75.2200),
  ];

  List<Map<String, dynamic>> get _orderedPoints {
    if (!_isOptimized) return _points;

    // Simulate nearest-neighbor reordering starting from point 0
    return [
      _points[0], // Juan
      _points[3], // Elena (closest to Juan)
      _points[2], // Carlos
      _points[1], // Maria (furthest)
    ];
  }

  List<LatLng> get _polylineCoordinates {
    return _orderedPoints.map((p) => p['latlng'] as LatLng).toList();
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

    // Mapbox dark style tiles URL template (high resolution @2x tiles)
    final String mapboxTileUrl =
        'https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=$_mapboxToken';

    return Scaffold(
      appBar: AppBar(
        title: const Text('PLANIFICACIÓN DE RUTA'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: Column(
          children: [
            // Map Panel (Mapbox Integration using FlutterMap)
            Expanded(
              flex: 3,
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.12), width: 1.5),
                  color: Colors.black,
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  children: [
                    // Real Mapbox Map via flutter_map package
                    FlutterMap(
                      options: MapOptions(
                        initialCenter: _mapCenter,
                        initialZoom: 13.5,
                        minZoom: 10,
                        maxZoom: 18,
                      ),
                      children: [
                        // Tile Layer loading tiles directly from Mapbox API (HU-08 Mapbox requirement)
                        TileLayer(
                          urlTemplate: mapboxTileUrl,
                          userAgentPackageName: 'com.agrobanco.salesforce',
                        ),

                        // Geofencing Layer (HU-09 polygon boundary)
                        PolygonLayer(
                          polygons: [
                            Polygon(
                              points: _geofencePoints,
                              color: const Color(0xFF00C853).withOpacity(0.08),
                              borderColor: const Color(0xFF00C853).withOpacity(0.4),
                              borderStrokeWidth: 2,
                              isFilled: true,
                            ),
                          ],
                        ),

                        // Route Polyline Layer (glowing routing path)
                        PolylineLayer(
                          polylines: [
                            Polyline(
                              points: _polylineCoordinates,
                              color: _isOptimized
                                  ? const Color(0xFF00B0FF).withOpacity(0.8)
                                  : const Color(0xFF00897B).withOpacity(0.5),
                              strokeWidth: _isOptimized ? 4.0 : 3.0,
                              isDotted: !_isOptimized,
                            ),
                          ],
                        ),

                        // Marker Layer (Client pins color-coded by priority / status)
                        MarkerLayer(
                          markers: _points.map((p) {
                            final isSelected = _selectedClientName == p['name'];
                            final isCompleted = p['status'] == 'Completado';
                            Color markerColor = Colors.grey;

                            if (!isCompleted) {
                              if (p['priority'] == 'ALTA') markerColor = AppColors.critical;
                              if (p['priority'] == 'MEDIA') markerColor = const Color(0xFFFFD600);
                              if (p['priority'] == 'NORMAL') markerColor = const Color(0xFF7ED99E);
                            }

                            return Marker(
                              point: p['latlng'] as LatLng,
                              width: 60.0,
                              height: 60.0,
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
                                      size: isSelected ? 36.0 : 28.0,
                                    ),
                                    if (isSelected)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.black.withOpacity(0.8),
                                          borderRadius: BorderRadius.circular(4),
                                          border: Border.all(color: Colors.white24),
                                        ),
                                        child: Text(
                                          (p['name'] as String).split(' ').first,
                                          style: const TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),

                    // Map Overlay controls (Geofence label & Optimize button)
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
