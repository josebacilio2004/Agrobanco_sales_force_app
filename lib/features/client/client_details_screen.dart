import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/glass_background.dart';
import '../loan_request/loan_request_screen.dart';
import 'bureau_check_screen.dart';
import '../../core/network/api_client.dart';

class ClientDetailsScreen extends StatefulWidget {
  final String clientId;

  const ClientDetailsScreen({super.key, required this.clientId});

  @override
  State<ClientDetailsScreen> createState() => _ClientDetailsScreenState();
}

class _ClientDetailsScreenState extends State<ClientDetailsScreen> {
  Map<String, dynamic>? _clientData;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchClientDetails();
  }

  Future<void> _fetchClientDetails() async {
    try {
      final response = await ApiClient.get('/fv/cliente/${widget.clientId}');
      if (response.statusCode == 200) {
        setState(() {
          _clientData = jsonDecode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Error al cargar ficha de cliente (${response.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error de conexión: No se pudo conectar al servidor.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('FICHA DEL CLIENTE'), backgroundColor: Colors.transparent),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('FICHA DEL CLIENTE'), backgroundColor: Colors.transparent),
        body: Center(child: Text(_error!, style: const TextStyle(color: Colors.white70))),
      );
    }

    final data = _clientData!;
    final double preapprovedAmount = (data['solicitud_monto'] ?? 10000.0).toDouble();
    final int preapprovedTerm = data['solicitud_plazo'] ?? 12;
    const double preapprovedTea = 40.92;
    final double scoringConfidence = (data['scoring_confianza'] ?? 85) / 100.0;
    final String sbsRating = data['calificacion_sbs'] ?? 'NORMAL';

    return Scaffold(
      appBar: AppBar(
        title: const Text('FICHA DEL CLIENTE'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProfileHeader(context, theme, data),
                const SizedBox(height: 24),
                
                // Call & Contacts Row
                _buildQuickActionsRow(context, data['dni'] ?? '', data['telefono'] ?? ''),
                const SizedBox(height: 24),

                // SBS Risk Semaphore (RF-28)
                _buildRiskSemaphore(theme, sbsRating),
                const SizedBox(height: 24),

                // General Information
                _buildSectionTitle(theme, 'DATOS GENERALES'),
                const SizedBox(height: 12),
                AgroCard(
                  child: Column(
                    children: [
                      _buildDataRow('DNI / RUC', data['dni'] ?? ''),
                      _buildDataRow('TELÉFONO', data['telefono'] ?? ''),
                      _buildDataRow('DIRECCIÓN', data['direccion'] ?? ''),
                      _buildDataRow('ACTIVIDAD ECONÓMICA', data['nombre_negocio'] ?? ''),
                      _buildDataRow('ANTIGÜEDAD NEGOCIO', '${data['antiguedad_meses']} MESES'),
                      _buildDataRow('INGRESOS MENSUALES EST.', 'S/ ${(data['ingresos'] ?? 0.0).toStringAsFixed(2)}'),
                      _buildDataRow('GASTOS MENSUALES EST.', 'S/ ${(data['gastos'] ?? 0.0).toStringAsFixed(2)}'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Preapproved offer (HU-13)
                _buildPreapprovedOfferCard(context, theme, preapprovedAmount, preapprovedTerm, preapprovedTea, scoringConfidence),
                const SizedBox(height: 24),

                // Payment History Graph
                _buildSectionTitle(theme, 'COMPORTAMIENTO DE PAGOS (12 MESES)'),
                const SizedBox(height: 12),
                _buildPaymentsHistoryChart(theme),
                const SizedBox(height: 24),

                // Credit History List
                _buildSectionTitle(theme, 'HISTORIAL CREDITICIO INTERNO'),
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
                const SizedBox(height: 32),

                // New Application Action (Only if status is NUEVA_SOLICITUD)
                if (data['solicitud_estado'] == 'enviado') ...[
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => LoanRequestScreen(
                            prefilledAmount: preapprovedAmount,
                            prefilledTerm: preapprovedTerm,
                            clientDni: data['dni'] ?? '',
                            clientName: '${data['nombres'] ?? ''} ${data['apellidos'] ?? ''}'.trim(),
                            clientPhone: data['telefono'] ?? '',
                            clientBusinessName: data['nombre_negocio'] ?? '',
                            clientAddress: data['direccion'] ?? '',
                            solicitudId: data['solicitud_id'] ?? '',
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
                    label: const Text('EVALUAR Y PROMOVER SOLICITUD'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00897B),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, ThemeData theme, Map<String, dynamic> data) {
    final rating = data['scoring_apto'] ?? 'APTO';
    
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF7ED99E), width: 1.5),
          ),
          child: const CircleAvatar(
            radius: 32,
            backgroundColor: Color(0x207ED99E),
            child: Icon(Icons.person, size: 36, color: Color(0xFF7ED99E)),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${data['nombres']} ${data['apellidos']}'.toUpperCase(),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: rating == 'APTO' ? const Color(0xFF7ED99E).withOpacity(0.12) : AppColors.critical.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'SCORING: $rating',
                      style: TextStyle(
                        color: rating == 'APTO' ? const Color(0xFF7ED99E) : AppColors.critical,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'DNI: ${data['dni']}',
                    style: const TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionsRow(BuildContext context, String dni, String telefono) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Lanzando marcador telefónico a: +51 $telefono'),
                  backgroundColor: const Color(0xFF00897B),
                ),
              );
            },
            child: AgroCard(
              padding: const EdgeInsets.symmetric(vertical: 12),
              color: Colors.white.withOpacity(0.04),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.phone_in_talk, color: Color(0xFF7ED99E), size: 18),
                  SizedBox(width: 8),
                  Text('LLAMAR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => BureauCheckScreen(dni: dni)),
              );
            },
            child: AgroCard(
              padding: const EdgeInsets.symmetric(vertical: 12),
              color: Colors.white.withOpacity(0.04),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bar_chart_outlined, color: AppColors.primary, size: 18),
                  SizedBox(width: 8),
                  Text('VER BURÓ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRiskSemaphore(ThemeData theme, String activeRating) {
    final rating = activeRating.toUpperCase();
    final isNormal = rating == 'NORMAL';
    final isCpp = rating == 'CPP';
    final Color sColor = isNormal ? const Color(0xFF4CAF50) : (isCpp ? const Color(0xFFFFD600) : AppColors.critical);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'SEMÁFORO DE RIESGO SBS',
          style: theme.textTheme.labelLarge?.copyWith(color: Colors.white54, fontSize: 11, letterSpacing: 1),
        ),
        const SizedBox(height: 12),
        AgroCard(
          border: Border.all(color: sColor.withOpacity(0.3)),
          color: sColor.withOpacity(0.06),
          child: Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(shape: BoxShape.circle, color: sColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'CALIFICACIÓN: $rating',
                      style: TextStyle(fontWeight: FontWeight.bold, color: sColor, fontSize: 13),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isNormal ? 'Cliente al día en sus pagos' : (isCpp ? 'Pequeño atraso potencial' : 'Alto riesgo de pérdida'),
                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                    )
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
        color: Colors.white38,
        fontWeight: FontWeight.bold,
        fontSize: 11,
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _buildDataRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildPreapprovedOfferCard(BuildContext context, ThemeData theme, double amount, int term, double tea, double confidence) {
    return AgroCard(
      color: const Color(0xFF00C853).withOpacity(0.06),
      border: Border.all(color: const Color(0xFF00C853).withOpacity(0.2)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'OFERTA PREAPROBADA SCORING',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF7ED99E), letterSpacing: 1),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: const Color(0xFF00C853).withOpacity(0.15), borderRadius: BorderRadius.circular(4)),
                child: Text(
                  'CONF. ${(confidence * 100).toInt()}%',
                  style: const TextStyle(color: Color(0xFF7ED99E), fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('MONTO RECOMENDADO', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  const SizedBox(height: 4),
                  Text('S/ ${amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('PLAZO sugerido', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  const SizedBox(height: 4),
                  Text('$term MESES', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                ],
              ),
            ],
          ),
          const Divider(color: Colors.white12, height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('TASA REFERENCIAL (TEA)', style: TextStyle(fontSize: 11, color: Colors.white38)),
              Text('${tea.toStringAsFixed(2)}%', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF7ED99E))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentsHistoryChart(ThemeData theme) {
    return AgroCard(
      child: SizedBox(
        height: 120,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: List.generate(12, (index) {
            final double height = 40.0 + (index % 3) * 20.0 + (index % 5) * 8.0;
            final bool isDelayed = index == 4 || index == 9; // Simulated delay months
            return Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  width: 14,
                  height: height,
                  decoration: BoxDecoration(
                    color: isDelayed ? AppColors.critical.withOpacity(0.7) : const Color(0xFF7ED99E).withOpacity(0.7),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index],
                  style: const TextStyle(fontSize: 9, color: Colors.white38),
                )
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _buildHistoryItem(String title, String amount, String status, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 2),
              Text(amount, style: const TextStyle(fontSize: 11, color: Colors.white38)),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
            child: Text(status, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
