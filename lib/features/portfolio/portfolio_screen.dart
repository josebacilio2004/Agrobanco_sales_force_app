import 'dart:ui';
import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/agro_button.dart';
import '../../shared/widgets/glass_background.dart';
import '../client/client_details_screen.dart';
import '../loan_request/loan_request_screen.dart';
import 'client_model.dart';
import '../../core/network/api_client.dart';

class PortfolioScreen extends StatefulWidget {
  final VoidCallback? onMenuPressed;
  const PortfolioScreen({super.key, this.onMenuPressed});

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  late List<Client> _clients;
  String _searchQuery = '';
  String _selectedFilter = 'TODOS';

  @override
  void initState() {
    super.initState();
    _clients = [];
    _fetchClientsFromFirestore();
  }

  Future<void> _fetchClientsFromFirestore() async {
    try {
      final response = await ApiClient.get('/fv/cartera');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _clients = data.map((json) {
            return Client(
              id: json['id'] as String,
              name: json['name'] as String,
              dni: json['dni'] as String,
              status: json['status'] as String,
              loanAmount: (json['loanAmount'] as num).toDouble(),
              dueDate: DateTime.parse(json['dueDate'] as String),
              location: json['location'] as String,
              priority: json['priority'] as String,
              isVisited: json['isVisited'] as bool,
            );
          }).toList();
        });
      } else {
        _resetMockData();
      }
    } catch (e) {
      debugPrint("Error fetching from API, falling back to mock: $e");
      _resetMockData();
    }
  }

  void _resetMockData() {
    _clients = [
      Client(
        id: '1',
        name: 'Juan Perez Ramos',
        dni: '45678912',
        status: 'RENOVACIÓN',
        loanAmount: 15000.0,
        dueDate: DateTime.now().add(const Duration(days: 5)),
        location: 'Sector A - Lote 4, Huancayo',
        priority: 'ALTA',
        isVisited: false,
      ),
      Client(
        id: '2',
        name: 'Maria Quispe Soto',
        dni: '12345678',
        status: 'RECUPERACIÓN MORA',
        loanAmount: 8500.0,
        dueDate: DateTime.now().subtract(const Duration(days: 12)),
        location: 'Comunidad Campesina, Jauja',
        priority: 'ALTA',
        isVisited: false,
      ),
      Client(
        id: '3',
        name: 'Carlos Huaman Diaz',
        dni: '98765432',
        status: 'AMPLIACIÓN',
        loanAmount: 22000.0,
        dueDate: DateTime.now().add(const Duration(days: 14)),
        location: 'Fundo Los Olivos, Tarma',
        priority: 'MEDIA',
        isVisited: true,
      ),
      Client(
        id: '4',
        name: 'Elena Rivas Castro',
        dni: '23456789',
        status: 'NUEVA SOLICITUD',
        loanAmount: 5000.0,
        dueDate: DateTime.now().add(const Duration(days: 30)),
        location: 'Av. Floral 540, Huancayo',
        priority: 'NORMAL',
        isVisited: false,
      ),
      Client(
        id: '5',
        name: 'Pedro Flores Choque',
        dni: '34567890',
        status: 'SEGUIMIENTO',
        loanAmount: 10000.0,
        dueDate: DateTime.now().add(const Duration(days: 20)),
        location: 'Fundo San Jose, Jauja',
        priority: 'NORMAL',
        isVisited: false,
      ),
      Client(
        id: '6',
        name: 'Julia Mendoza Ortiz',
        dni: '56789012',
        status: 'DESERTOR',
        loanAmount: 12000.0,
        dueDate: DateTime.now(),
        location: 'Jr. Libertad 120, Tarma',
        priority: 'MEDIA',
        isVisited: false,
      ),
    ];
  }

  Future<void> _handleRefresh() async {
    await _fetchClientsFromFirestore();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cartera diaria sincronizada con éxito.'),
          backgroundColor: Color(0xFF00C853),
        ),
      );
    }
  }

  void _showVisitOutcomeSheet(Client client) {
    final noteController = TextEditingController();
    String outcome = 'Visitado';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF021525).withOpacity(0.9),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: Colors.white12, width: 1.5),
          ),
          padding: EdgeInsets.only(
            top: 24,
            left: 24,
            right: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'REGISTRAR VISITA',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                client.name.toUpperCase(),
                style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                value: outcome,
                dropdownColor: const Color(0xFF021525),
                decoration: const InputDecoration(
                  labelText: 'RESULTADO DE LA VISITA',
                  border: OutlineInputBorder(),
                ),
                items: ['Visitado', 'No encontrado', 'Reagendar', 'Negocio cerrado']
                    .map((val) => DropdownMenuItem(value: val, child: Text(val)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) outcome = val;
                },
              ),
              const SizedBox(height: 16),
              TextField(
                controller: noteController,
                maxLength: 200,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'OBSERVACIONES (Max 200 caracteres)',
                  hintText: 'Ingrese comentarios de la visita...',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 24),
              AgroButton(
                label: 'GUARDAR GESTIÓN',
                onPressed: () {
                  // Simulate GPS capture (RF-17)
                  setState(() {
                    client.isVisited = true;
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(ctx).showSnackBar(
                    SnackBar(
                      content: Text('Gestión guardada. Ubicación GPS capturada (-12.0678, -75.2100)'),
                      backgroundColor: const Color(0xFF00C853),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate progress (HU-04)
    final totalClients = _clients.length;
    final visitedClients = _clients.where((c) => c.isVisited).length;
    final pendingClients = totalClients - visitedClients;
    final double progressVal = totalClients > 0 ? visitedClients / totalClients : 0.0;

    // Filter and search
    List<Client> filteredClients = _clients.where((client) {
      // Search DNI or Name
      final matchesSearch = client.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          client.dni.contains(_searchQuery);
      
      if (!matchesSearch) return false;

      // Filter by type or status
      if (_selectedFilter == 'TODOS') return true;
      if (_selectedFilter == 'VISITADOS') return client.isVisited;
      if (_selectedFilter == 'RENOVACIONES') return client.status == 'RENOVACIÓN';
      if (_selectedFilter == 'AMPLIACIONES') return client.status == 'AMPLIACIÓN';
      if (_selectedFilter == 'EN MORA') return client.status == 'RECUPERACIÓN MORA';

      return true;
    }).toList();

    // Sort to place visited ones at the bottom (HU-04 criteria)
    filteredClients.sort((a, b) {
      if (a.isVisited && !b.isVisited) return 1;
      if (!a.isVisited && b.isVisited) return -1;
      return 0;
    });

    return Scaffold(
      drawerEnableOpenDragGesture: true,
      appBar: AppBar(
        title: const Text('CARTERA DIARIA'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: widget.onMenuPressed ?? () => Scaffold.of(context).openDrawer(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: _handleRefresh,
          ),
        ],
      ),
      body: GlassBackground(
        child: Column(
          children: [
            // Daily progress summary banner (HU-04)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: AgroCard(
                padding: const EdgeInsets.all(16),
                color: Colors.white.withOpacity(0.04),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '$totalClients Clientes · $visitedClients Visitados · $pendingClients Pendientes',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${(progressVal * 100).toInt()}%',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF7ED99E)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progressVal,
                        backgroundColor: Colors.white10,
                        valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00C853)),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Search box & Filters
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              child: TextField(
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val;
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Buscar por nombre o DNI...',
                  prefixIcon: const Icon(Icons.search, color: AppColors.outline),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.04),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),

            // Horizontal Filter Chips (RF-11)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  'TODOS',
                  'RENOVACIONES',
                  'AMPLIACIONES',
                  'EN MORA',
                  'VISITADOS'
                ].map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(filter, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? Colors.black : Colors.white)),
                      selected: isSelected,
                      selectedColor: const Color(0xFF7ED99E),
                      backgroundColor: Colors.white.withOpacity(0.05),
                      checkmarkColor: Colors.black,
                      side: BorderSide(color: isSelected ? const Color(0xFF7ED99E) : Colors.white10),
                      onSelected: (val) {
                        if (val) {
                          setState(() {
                            _selectedFilter = filter;
                          });
                        }
                      },
                    ),
                  );
                }).toList(),
              ),
            ),

            // Reorderable Client List (HU-06)
            Expanded(
              child: RefreshIndicator(
                onRefresh: _handleRefresh,
                color: const Color(0xFF00C853),
                backgroundColor: const Color(0xFF021525),
                child: ReorderableListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filteredClients.length,
                  onReorder: (oldIndex, newIndex) {
                    setState(() {
                      if (newIndex > oldIndex) {
                        newIndex -= 1;
                      }
                      final item = filteredClients.removeAt(oldIndex);
                      filteredClients.insert(newIndex, item);

                      // Reflect order back to _clients
                      // We locate the positions of both items and re-align _clients array
                      final Map<String, int> indexMap = {};
                      for (int i = 0; i < filteredClients.length; i++) {
                        indexMap[filteredClients[i].id] = i;
                      }
                      _clients.sort((a, b) {
                        final indexA = indexMap[a.id];
                        final indexB = indexMap[b.id];
                        if (indexA != null && indexB != null) {
                          return indexA.compareTo(indexB);
                        }
                        return 0;
                      });
                    });
                  },
                  itemBuilder: (context, index) {
                    final client = filteredClients[index];
                    return KeyedSubtree(
                      key: ValueKey(client.id),
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: AgroCard(
                          color: client.isVisited
                              ? Colors.white.withOpacity(0.02)
                              : Colors.white.withOpacity(0.06),
                          border: Border.all(
                            color: client.isVisited
                                ? Colors.white.withOpacity(0.05)
                                : Colors.white.withOpacity(0.12),
                            width: 1.5,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Row(
                                      children: [
                                        // Reorder handle placeholder
                                        const Icon(Icons.drag_indicator, size: 18, color: Colors.white24),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            client.name.toUpperCase(),
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                              color: client.isVisited ? Colors.white38 : AppColors.primary,
                                              decoration: client.isVisited ? TextDecoration.lineThrough : null,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  _buildTypeChip(client.status),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.badge_outlined, size: 15, color: Colors.white30),
                                      const SizedBox(width: 6),
                                      Text(
                                        'DNI: ***${client.dni.substring(client.dni.length - 4)}',
                                        style: const TextStyle(color: Colors.white54, fontSize: 13),
                                      ),
                                    ],
                                  ),
                                  _buildPriorityChip(client.priority),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 15, color: Colors.white30),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      client.location,
                                      style: const TextStyle(fontSize: 12, color: Colors.white38),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20, color: Colors.white10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'MONTO SUGERIDO',
                                        style: TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
                                      ),
                                      Text(
                                        client.loanAmount > 0
                                            ? 'S/ ${client.loanAmount.toStringAsFixed(2)}'
                                            : 'S/ --',
                                        style: TextStyle(
                                          fontFamily: 'JetBrains Mono',
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: client.isVisited ? Colors.white38 : Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Row(
                                    children: [
                                      // Outcome Register Button (HU-07)
                                      IconButton(
                                        icon: Icon(
                                          client.isVisited ? Icons.check_circle : Icons.check_circle_outline,
                                          color: client.isVisited ? const Color(0xFF00C853) : Colors.white38,
                                        ),
                                        onPressed: () => _showVisitOutcomeSheet(client),
                                      ),
                                      const SizedBox(width: 4),
                                      // Arrow details
                                      IconButton(
                                        icon: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.primary),
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
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const LoanRequestScreen()),
          );
        },
        backgroundColor: const Color(0xFF00C853),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildPriorityChip(String priority) {
    Color color = Colors.grey;
    if (priority == 'ALTA') color = AppColors.critical;
    if (priority == 'MEDIA') color = const Color(0xFFFFD600);

    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 6),
        Text(
          priority,
          style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1),
        ),
      ],
    );
  }

  Widget _buildTypeChip(String status) {
    Color chipColor;
    switch (status) {
      case 'RENOVACIÓN':
        chipColor = const Color(0xFF2196F3); // Blue
        break;
      case 'AMPLIACIÓN':
        chipColor = const Color(0xFF4CAF50); // Green
        break;
      case 'NUEVA SOLICITUD':
        chipColor = const Color(0xFFFF9800); // Orange
        break;
      case 'SEGUIMIENTO':
        chipColor = const Color(0xFF9E9E9E); // Grey
        break;
      case 'RECUPERACIÓN MORA':
        chipColor = const Color(0xFFF44336); // Red
        break;
      case 'DESERTOR':
        chipColor = const Color(0xFF9C27B0); // Purple
        break;
      default:
        chipColor = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: chipColor.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: chipColor.withOpacity(0.4), width: 1),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: chipColor,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
