import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/agro_button.dart';
import '../../shared/widgets/glass_background.dart';

class RecoveryScreen extends StatefulWidget {
  const RecoveryScreen({super.key});

  @override
  State<RecoveryScreen> createState() => _RecoveryScreenState();
}

class _RecoveryScreenState extends State<RecoveryScreen> {
  // Mock recovery data (HU-30)
  final List<Map<String, dynamic>> _overdueClients = [
    {
      'name': 'GUSTAVO MEZA ROJAS',
      'daysLate': 18,
      'amount': 450.0,
      'lastContact': 'Llamada el 20/05',
      'isVisited': false,
    },
    {
      'name': 'ROSA ALBA INGA',
      'daysLate': 45,
      'amount': 1200.0,
      'lastContact': 'Visita el 15/05',
      'isVisited': false,
    },
    {
      'name': 'FELIPE HUAMAN SOTO',
      'daysLate': 75,
      'amount': 3800.0,
      'lastContact': 'Sin contacto',
      'isVisited': false,
    },
  ];

  void _showCollectionActionSheet(Map<String, dynamic> client) {
    String actionType = 'Visita';
    String outcome = 'Compromiso de pago';
    final noteController = TextEditingController();
    final amountController = TextEditingController();

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
                'REGISTRAR ACCIÓN DE COBRANZA',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                client['name'].toString().toUpperCase(),
                style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: actionType,
                      dropdownColor: const Color(0xFF021525),
                      decoration: const InputDecoration(labelText: 'TIPO DE GESTIÓN'),
                      items: ['Visita', 'Llamada', 'Mensaje']
                          .map((val) => DropdownMenuItem(value: val, child: Text(val)))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) actionType = val;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: outcome,
                      dropdownColor: const Color(0xFF021525),
                      decoration: const InputDecoration(labelText: 'RESULTADO'),
                      items: ['Compromiso de pago', 'Pago parcial', 'Sin contacto', 'Se niega a pagar']
                          .map((val) => DropdownMenuItem(value: val, child: Text(val)))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) outcome = val;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'MONTO DEL COMPROMISO / PAGO (S/)',
                  prefixText: 'S/ ',
                ),
              ),
              const SizedBox(height: 16),
              
              TextField(
                controller: noteController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'OBSERVACIONES DE COBRANZA',
                  hintText: 'Ingrese detalles...',
                ),
              ),
              const SizedBox(height: 24),
              
              AgroButton(
                label: 'REGISTRAR GESTIÓN',
                onPressed: () {
                  setState(() {
                    client['isVisited'] = true;
                    client['lastContact'] = '$actionType: $outcome';
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(ctx).showSnackBar(
                    const SnackBar(
                      content: Text('Acción de cobranza guardada. Ubicación GPS registrada.'),
                      backgroundColor: Color(0xFF00C853),
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

    // Sum total overdue
    double totalOverdue = _overdueClients.fold(0, (sum, item) => sum + item['amount']);

    return Scaffold(
      appBar: AppBar(
        title: const Text('RECUPERACIÓN DE MORA'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Overdue Summary (HU-30 counter banner)
              Container(
                margin: const EdgeInsets.all(16),
                child: AgroCard(
                  color: AppColors.critical.withOpacity(0.06),
                  border: Border.all(color: AppColors.critical.withOpacity(0.3)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('MOROSIDAD TOTAL CARTERA', style: TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.bold)),
                          SizedBox(height: 4),
                          Text('3 Clientes en Mora', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('SALDO VENCIDO', style: TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.bold)),
                          SizedBox(height: 4),
                          Text(
                            'S/ ${totalOverdue.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'JetBrains Mono',
                              color: AppColors.critical,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              
              // Overdue List
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _overdueClients.length,
                  itemBuilder: (context, index) {
                    final client = _overdueClients[index];
                    final isVisited = client['isVisited'];
                    final int days = client['daysLate'];
                    
                    // Semaphore coloring
                    Color semColor = Colors.grey;
                    if (days <= 30) semColor = const Color(0xFFFFD600); // Yellow
                    if (days > 30 && days <= 60) semColor = const Color(0xFFFF9800); // Orange
                    if (days > 60) semColor = AppColors.critical; // Red

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: AgroCard(
                        color: isVisited ? Colors.white.withOpacity(0.02) : Colors.white.withOpacity(0.06),
                        border: Border.all(
                          color: isVisited ? Colors.white10 : AppColors.glassBorder,
                          width: 1.5,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  client['name'].toString().toUpperCase(),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: isVisited ? Colors.white38 : Colors.white,
                                    decoration: isVisited ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(shape: BoxShape.circle, color: semColor),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Días de atraso: $days Días',
                                  style: TextStyle(color: semColor, fontWeight: FontWeight.bold, fontSize: 12),
                                ),
                                Text(
                                  'S/ ${client['amount'].toStringAsFixed(2)}',
                                  style: const TextStyle(fontFamily: 'JetBrains Mono', fontWeight: FontWeight.bold, fontSize: 14),
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
                                    const Text('ÚLTIMA GESTIÓN', style: TextStyle(color: Colors.white30, fontSize: 9)),
                                    const SizedBox(height: 2),
                                    Text(
                                      client['lastContact'],
                                      style: const TextStyle(color: Colors.white54, fontSize: 11),
                                    ),
                                  ],
                                ),
                                TextButton.icon(
                                  icon: Icon(isVisited ? Icons.check : Icons.add_moderator, size: 16),
                                  label: Text(
                                    isVisited ? 'GESTIONADO' : 'GESTIONAR',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                  style: TextButton.styleFrom(
                                    foregroundColor: isVisited ? Colors.white30 : const Color(0xFF7ED99E),
                                  ),
                                  onPressed: () => _showCollectionActionSheet(client),
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
        ),
      ),
    );
  }
}
