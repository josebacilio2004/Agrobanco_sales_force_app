import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/agro_button.dart';
import '../../shared/widgets/glass_background.dart';

class RequestStatusScreen extends StatefulWidget {
  const RequestStatusScreen({super.key});

  @override
  State<RequestStatusScreen> createState() => _RequestStatusScreenState();
}

class _RequestStatusScreenState extends State<RequestStatusScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _tabNames = ['Enviadas', 'En Comité', 'Aprobadas', 'Desembolsadas', 'Rechazadas'];
  
  // Mock requests data
  final List<Map<String, dynamic>> _requests = [
    {
      'id': 'EXP-2026-001',
      'name': 'JUAN PEREZ RAMOS',
      'amount': 'S/ 15,000.00',
      'status': 'En Comité',
      'date': 'Enviado hace 2 horas',
      'color': const Color(0xFFFFD600),
      'progress': 0.4,
      'analyst': 'Ing. Carlos Mendoza',
      'notes': ['Cliente cuenta con aval de riego.', 'Firma digital validada.']
    },
    {
      'id': 'EXP-2026-002',
      'name': 'MARIA QUISPE SOTO',
      'amount': 'S/ 8,500.00',
      'status': 'Aprobadas',
      'date': 'Pendiente desembolso',
      'color': const Color(0xFF00C853),
      'progress': 0.8,
      'analyst': 'Dra. Elena Ramos',
      'notes': []
    },
    {
      'id': 'EXP-2026-003',
      'name': 'CARLOS HUAMAN DIAZ',
      'amount': 'S/ 22,000.00',
      'status': 'Desembolsadas',
      'date': 'Completado 15/05/2026',
      'color': AppColors.primary,
      'progress': 1.0,
      'analyst': 'Ing. Julio Flores',
      'notes': ['Monto desembolsado en caja Huancayo.']
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabNames.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  int _countForStatus(String tabName) {
    return _requests.where((r) => r['status'] == tabName).length;
  }

  void _showDetailsAndNotesSheet(Map<String, dynamic> request) {
    final noteController = TextEditingController();
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => BackdropFilter(
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
              bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'EXPEDIENTE: ${request['id']}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: (request['color'] as Color).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: (request['color'] as Color).withOpacity(0.4)),
                      ),
                      child: Text(
                        request['status'].toString().toUpperCase(),
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: request['color']),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  request['name'],
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                Text(
                  'Monto Solicitado: ${request['amount']} · Analista: ${request['analyst']}',
                  style: const TextStyle(fontSize: 12, color: Colors.white54),
                ),
                const SizedBox(height: 20),
                const Divider(color: Colors.white10),
                const SizedBox(height: 8),
                const Text(
                  'NOTAS INTERNAS (PRIVADO SUPERVISIÓN)',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white54, letterSpacing: 0.8),
                ),
                const SizedBox(height: 8),
                
                // Notes List
                if ((request['notes'] as List).isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8.0),
                    child: Text('No hay notas registradas para este expediente.', style: TextStyle(fontSize: 11, color: Colors.white24)),
                  )
                else
                  ... (request['notes'] as List).map((note) => Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.03),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.note_alt_outlined, size: 14, color: Color(0xFF7ED99E)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            note,
                            style: const TextStyle(fontSize: 11, color: Colors.white70),
                          ),
                        ),
                      ],
                    ),
                  )),
                const SizedBox(height: 16),
                
                // Add new note
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: noteController,
                        style: const TextStyle(fontSize: 13, color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'Agregar nota privada...',
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.send, color: Color(0xFF7ED99E)),
                      onPressed: () {
                        final noteText = noteController.text.trim();
                        if (noteText.isNotEmpty) {
                          setModalState(() {
                            (request['notes'] as List).add(noteText);
                          });
                          setState(() {}); // refresh root screen
                          noteController.clear();
                        }
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                
                AgroButton(
                  label: 'CERRAR DETALLE',
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ESTADO DE SOLICITUDES'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: const Color(0xFF7ED99E),
          unselectedLabelColor: Colors.white30,
          indicatorColor: const Color(0xFF7ED99E),
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: _tabNames.map((tabName) {
            final count = _countForStatus(tabName);
            return Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(tabName),
                  if (count > 0) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF7ED99E).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$count',
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF7ED99E)),
                      ),
                    ),
                  ],
                ],
              ),
            );
          }).toList(),
        ),
      ),
      body: GlassBackground(
        child: TabBarView(
          controller: _tabController,
          children: _tabNames.map((tabName) {
            final tabRequests = _requests.where((r) => r['status'] == tabName).toList();
            
            if (tabRequests.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.analytics_outlined, size: 64, color: Colors.white12),
                    const SizedBox(height: 16),
                    Text(
                      'No hay solicitudes en la etapa "$tabName"',
                      style: const TextStyle(color: Colors.white24, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: tabRequests.length,
              itemBuilder: (context, index) {
                final req = tabRequests[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: GestureDetector(
                    onTap: () => _showDetailsAndNotesSheet(req),
                    child: AgroCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                req['name'],
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                              ),
                              Text(
                                req['status'].toString().toUpperCase(),
                                style: TextStyle(color: req['color'], fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            req['amount'],
                            style: const TextStyle(fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 12),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(3),
                            child: LinearProgressIndicator(
                              value: req['progress'],
                              backgroundColor: Colors.white.withOpacity(0.06),
                              color: req['color'],
                              minHeight: 5,
                            ),
                          ),
                          const SizedBox(height: 14),
                          Row(
                            children: [
                              const Icon(Icons.access_time_outlined, size: 14, color: Colors.white38),
                              const SizedBox(width: 6),
                              Text(req['date'], style: const TextStyle(fontSize: 11, color: Colors.white38)),
                              const Spacer(),
                              if ((req['notes'] as List).isNotEmpty) ...[
                                const Icon(Icons.sticky_note_2_outlined, size: 14, color: Color(0xFF7ED99E)),
                                const SizedBox(width: 4),
                                Text(
                                  '${(req['notes'] as List).length} Notas',
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF7ED99E), fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(width: 8),
                              ],
                              const Icon(Icons.chevron_right, size: 16, color: AppColors.primary),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          }).toList(),
        ),
      ),
    );
  }
}
