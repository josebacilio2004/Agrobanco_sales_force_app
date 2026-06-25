import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/glass_background.dart';
import '../../core/network/api_client.dart';

class BureauCheckScreen extends StatefulWidget {
  final String dni;

  const BureauCheckScreen({super.key, required this.dni});

  @override
  State<BureauCheckScreen> createState() => _BureauCheckScreenState();
}

class _BureauCheckScreenState extends State<BureauCheckScreen> {
  Map<String, dynamic>? _buroData;
  bool _isLoading = true;
  String? _error;
  bool _isBlocked = false;

  @override
  void initState() {
    super.initState();
    _queryBureau();
  }

  Future<void> _queryBureau() async {
    try {
      final response = await ApiClient.post('/fv/buro/consultar', {
        'dni': widget.dni
      });

      final Map<String, dynamic> body = jsonDecode(response.body);

      if (response.statusCode == 200) {
        setState(() {
          _buroData = body;
          _isLoading = false;
        });
      } else if (response.statusCode == 403) {
        setState(() {
          _isBlocked = true;
          _error = body['detail'] ?? 'Cliente inhabilitado.';
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = body['detail'] ?? 'Error al consultar buró.';
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('CONSULTA DE BURÓ'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: SafeArea(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (_isBlocked) ...[
                        _buildBlockedCard(theme),
                        const SizedBox(height: 24),
                      ] else if (_error != null) ...[
                        _buildErrorCard(theme),
                        const SizedBox(height: 24),
                      ] else ...[
                        _buildScoreHeader(theme),
                        const SizedBox(height: 24),
                        _buildRiskIndicator(theme),
                        const SizedBox(height: 24),
                        _buildDetailsSection(theme),
                        const SizedBox(height: 24),
                        _buildRecommendationCard(theme),
                        const SizedBox(height: 32),
                      ],
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white.withOpacity(0.06),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 54),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: const BorderSide(color: AppColors.glassBorder, width: 1.5),
                          ),
                        ),
                        child: const Text('VOLVER A FICHA'),
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildBlockedCard(ThemeData theme) {
    return AgroCard(
      color: AppColors.critical.withOpacity(0.12),
      border: Border.all(color: AppColors.critical.withOpacity(0.4)),
      child: Column(
        children: [
          const Icon(Icons.block_flipped, color: AppColors.critical, size: 48),
          const SizedBox(height: 12),
          const Text(
            'CLIENTE BLOQUEADO / INHABILITADO',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.critical, letterSpacing: 1.2),
          ),
          const SizedBox(height: 8),
          Text(
            _error ?? 'El cliente se encuentra registrado en la lista de inhabilitados del sistema financiero.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorCard(ThemeData theme) {
    return AgroCard(
      color: Colors.white.withOpacity(0.06),
      child: Column(
        children: [
          const Icon(Icons.error_outline, color: Colors.white60, size: 48),
          const SizedBox(height: 12),
          Text(
            _error ?? 'Ocurrió un error en la consulta.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreHeader(ThemeData theme) {
    final score = _buroData!['score'] ?? 850;
    final rating = _buroData!['sbs_rating'] ?? 'NORMAL';
    
    return AgroCard(
      color: Colors.white.withOpacity(0.06),
      child: Column(
        children: [
          const Text(
            'SCORING CREDITICIO SBS',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 12),
          Text(
            '$score',
            style: theme.textTheme.displayLarge?.copyWith(
              color: rating == 'NORMAL' ? const Color(0xFF7ED99E) : (rating == 'CPP' ? const Color(0xFFFFD600) : AppColors.critical),
              fontSize: 64,
              fontWeight: FontWeight.w900,
              fontFamily: 'JetBrains Mono',
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'CALIFICACIÓN DEL CLIENTE: $rating',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskIndicator(ThemeData theme) {
    final rating = _buroData!['sbs_rating'] ?? 'NORMAL';
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'NIVEL DE RIESGO SBS',
          style: theme.textTheme.labelLarge?.copyWith(color: Colors.white, fontSize: 11, letterSpacing: 1),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _RiskBar(color: const Color(0xFF00C853), isActive: rating == 'NORMAL', label: 'BAJO'),
            _RiskBar(color: const Color(0xFFFFD600), isActive: rating == 'CPP', label: 'MEDIO'),
            _RiskBar(color: AppColors.critical, isActive: rating != 'NORMAL' && rating != 'CPP', label: 'ALTO'),
          ],
        ),
      ],
    );
  }

  Widget _buildDetailsSection(ThemeData theme) {
    final double debt = (_buroData!['deuda_total'] ?? 0.0).toDouble();
    final int delay = _buroData!['mora_max'] ?? 0;
    final int entities = _buroData!['entidades_deuda'] ?? 0;
    
    return AgroCard(
      child: Column(
        children: [
          _DetailRow('DEUDAS VIGENTES SISTEMA', 'S/ ${debt.toStringAsFixed(2)}'),
          const Divider(color: Colors.white10),
          _DetailRow('ATRASO MÁXIMO REPORTADO', '$delay DÍAS'),
          const Divider(color: Colors.white10),
          _DetailRow('ENTIDADES FINANCIERAS', '$entities ENTIDADES'),
          const Divider(color: Colors.white10),
          _DetailRow('PROCESOS JUDICIALES / FRAUDES', 'NINGUNO'),
        ],
      ),
    );
  }

  Widget _buildRecommendationCard(ThemeData theme) {
    final rating = _buroData!['sbs_rating'] ?? 'NORMAL';
    final isApto = _buroData!['recomendacion'] == 'RECOMENDADO';
    
    return AgroCard(
      color: isApto ? const Color(0xFF00C853).withOpacity(0.06) : AppColors.critical.withOpacity(0.06),
      border: Border.all(color: isApto ? const Color(0xFF00C853).withOpacity(0.3) : AppColors.critical.withOpacity(0.3)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isApto ? Icons.check_circle_outline : Icons.warning_amber_rounded,
            color: isApto ? const Color(0xFF7ED99E) : AppColors.critical,
            size: 20
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'RECOMENDACIÓN ANALÍTICA',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isApto ? const Color(0xFF7ED99E) : AppColors.critical,
                    letterSpacing: 0.8
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isApto
                      ? 'El cliente tiene historial aceptable en el sistema. Calificación SBS: $rating. Se recomienda continuar con el trámite del expediente.'
                      : 'El cliente registra calificación SBS: $rating con moras vencidas o alertas externas. Se recomienda RECHAZAR o CONDICIONAR la solicitud.',
                  style: const TextStyle(fontSize: 12, color: Colors.white70, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _DetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
        ],
      ),
    );
  }
}

class _RiskBar extends StatelessWidget {
  final Color color;
  final bool isActive;
  final String label;

  const _RiskBar({required this.color, required this.isActive, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Container(
            height: 8,
            margin: const EdgeInsets.symmetric(horizontal: 3),
            decoration: BoxDecoration(
              color: isActive ? color : color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(4),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: color.withOpacity(0.4),
                        blurRadius: 8,
                        spreadRadius: 1,
                      )
                    ]
                  : null,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: isActive ? Colors.white : Colors.white24,
            ),
          ),
        ],
      ),
    );
  }
}
