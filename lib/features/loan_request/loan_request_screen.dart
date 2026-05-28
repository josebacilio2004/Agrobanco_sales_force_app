import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/agro_button.dart';
import '../../shared/widgets/glass_background.dart';
import 'loan_request_provider.dart';

class LoanRequestScreen extends ConsumerStatefulWidget {
  final double? prefilledAmount;
  final int? prefilledTerm;

  const LoanRequestScreen({
    super.key,
    this.prefilledAmount,
    this.prefilledTerm,
  });

  @override
  ConsumerState<LoanRequestScreen> createState() => _LoanRequestScreenState();
}

class _LoanRequestScreenState extends ConsumerState<LoanRequestScreen> {
  // Step 1 Controllers
  final _nameController = TextEditingController();
  final _dniController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  String _civilStatus = 'Soltero';

  // Step 2 Controllers
  String _businessType = 'Agropecuario';
  final _businessNameController = TextEditingController();
  final _businessAddressController = TextEditingController();
  final _seniorityYearsController = TextEditingController(text: '1');
  final _seniorityMonthsController = TextEditingController(text: '0');
  final _revenueController = TextEditingController(text: '3000');
  final _expenseController = TextEditingController(text: '1200');
  String _ciiuCode = '0111 - Cultivo de cereales';

  // Step 3 Controllers
  double _requestedAmount = 15000.0;
  int _repaymentTerm = 12;
  String _currency = 'PEN';
  String _paymentFrequency = 'Mensual';
  String _warrantyType = 'Sin Garantía';

  // Step 4 Controllers
  bool _declarationAccepted = false;
  final List<Offset?> _signaturePoints = [];

  @override
  void initState() {
    super.initState();
    if (widget.prefilledAmount != null) {
      _requestedAmount = widget.prefilledAmount!;
    }
    if (widget.prefilledTerm != null) {
      _repaymentTerm = widget.prefilledTerm!;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _dniController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _businessNameController.dispose();
    _businessAddressController.dispose();
    _seniorityYearsController.dispose();
    _seniorityMonthsController.dispose();
    _revenueController.dispose();
    _expenseController.dispose();
    super.dispose();
  }

  // French Amortization Calculator (RF-47)
  Map<String, double> _calculateSimulation() {
    const double tea = 0.225; // 22.5% TEA
    final double rEquiv = pow(1.0 + tea, 1.0 / 12.0) - 1.0; // monthly rate
    final double quota = (_requestedAmount * rEquiv) / (1.0 - pow(1.0 + rEquiv, -_repaymentTerm));
    final double totalToPay = quota * _repaymentTerm;
    final double costFinancier = totalToPay - _requestedAmount;

    return {
      'quota': quota,
      'total': totalToPay,
      'cost': costFinancier,
      'tea': tea * 100,
    };
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(loanRequestProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('NUEVA SOLICITUD'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            // Confirm saving draft before exiting (HU-18 / RF-49)
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: AppColors.surfaceVariant,
                title: const Text('¿Guardar borrador?'),
                content: const Text('Puedes guardar esta solicitud incompleta para continuar editándola después.'),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx); // Close dialog
                      Navigator.pop(context); // Exit screen
                    },
                    child: const Text('DESCARTAR', style: TextStyle(color: AppColors.critical)),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Borrador guardado localmente.'),
                          backgroundColor: Color(0xFF00897B),
                        ),
                      );
                    },
                    child: const Text('GUARDAR BORRADOR', style: TextStyle(color: Color(0xFF7ED99E))),
                  ),
                ],
              ),
            );
          },
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: GlassBackground(
        child: SafeArea(
          child: Column(
            children: [
              _buildProgressIndicator(state.currentStep),
              Expanded(
                child: _buildStepContent(state.currentStep, theme),
              ),
              _buildNavigationButtons(state.currentStep, ref, context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressIndicator(int currentStep) {
    const totalSteps = 4;
    final stepLabels = ['Productor', 'Negocio', 'Crédito', 'Firma'];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        children: [
          Row(
            children: List.generate(totalSteps, (index) {
              bool isActive = index == currentStep;
              bool isCompleted = index < currentStep;
              return Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? const Color(0xFF00C853)
                            : isActive
                                ? AppColors.primary
                                : Colors.white.withOpacity(0.06),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isActive ? Colors.white : AppColors.glassBorder,
                          width: 1.5,
                        ),
                      ),
                      child: Center(
                        child: isCompleted
                            ? const Icon(Icons.check, size: 14, color: Colors.white)
                            : Text(
                                '${index + 1}',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isActive ? Colors.white : Colors.white54,
                                ),
                              ),
                      ),
                    ),
                    if (index < totalSteps - 1)
                      Expanded(
                        child: Container(
                          height: 2,
                          color: isCompleted
                              ? const Color(0xFF00C853)
                              : Colors.white.withOpacity(0.08),
                        ),
                      ),
                  ],
                ),
              );
            }),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(totalSteps, (index) {
              final isActive = index == currentStep;
              return Text(
                stepLabels[index],
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isActive ? Colors.white : Colors.white30,
                  letterSpacing: 0.5,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent(int step, ThemeData theme) {
    switch (step) {
      case 0:
        return _buildStepProductor(theme);
      case 1:
        return _buildStepNegocio(theme);
      case 2:
        return _buildStepCredito(theme);
      case 3:
        return _buildStepFirma(theme);
      default:
        return const SizedBox();
    }
  }

  Widget _buildStepProductor(ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'PASO 1: DATOS DEL PRODUCTOR',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'NOMBRES Y APELLIDOS',
              hintText: 'Ingrese nombre completo',
              prefixIcon: Icon(Icons.person_outline, color: AppColors.outline),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _dniController,
            keyboardType: TextInputType.number,
            maxLength: 8,
            decoration: const InputDecoration(
              labelText: 'DNI / DOCUMENTO DE IDENTIDAD',
              hintText: '8 dígitos exactos',
              prefixIcon: Icon(Icons.badge_outlined, color: AppColors.outline),
              counterText: '',
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            maxLength: 9,
            decoration: const InputDecoration(
              labelText: 'TELÉFONO CELULAR',
              hintText: '9 dígitos',
              prefixIcon: Icon(Icons.phone_android_outlined, color: AppColors.outline),
              counterText: '',
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'CORREO ELECTRÓNICO (OPCIONAL)',
              hintText: 'ejemplo@correo.com',
              prefixIcon: Icon(Icons.mail_outline, color: AppColors.outline),
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _civilStatus,
            dropdownColor: const Color(0xFF021525),
            decoration: const InputDecoration(
              labelText: 'ESTADO CIVIL',
              prefixIcon: Icon(Icons.favorite_border, color: AppColors.outline),
            ),
            items: ['Soltero', 'Casado', 'Conviviente', 'Divorciado', 'Viudo']
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: (v) {
              if (v != null) {
                setState(() {
                  _civilStatus = v;
                });
              }
            },
          ),
          if (_civilStatus == 'Casado' || _civilStatus == 'Conviviente') ...[
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'DNI DEL CÓNYUGE / GARANTE',
                prefixIcon: Icon(Icons.badge_outlined, color: AppColors.outline),
              ),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'NOMBRES DEL CÓNYUGE',
                prefixIcon: Icon(Icons.person_outline, color: AppColors.outline),
              ),
            ),
          ],
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStepNegocio(ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'PASO 2: DATOS DEL NEGOCIO / UNIDAD PRODUCTIVA',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _businessType,
            dropdownColor: const Color(0xFF021525),
            decoration: const InputDecoration(
              labelText: 'TIPO DE ACTIVIDAD / NEGOCIO',
              prefixIcon: Icon(Icons.category_outlined, color: AppColors.outline),
            ),
            items: ['Comercio', 'Servicios', 'Producción', 'Agropecuario']
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: (v) {
              if (v != null) {
                setState(() {
                  _businessType = v;
                });
              }
            },
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _businessNameController,
            decoration: const InputDecoration(
              labelText: 'NOMBRE DEL NEGOCIO / EXPRESIÓN AGRARIA',
              hintText: 'Ej. Fundo El Milagro',
              prefixIcon: Icon(Icons.store_outlined, color: AppColors.outline),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _businessAddressController,
            decoration: const InputDecoration(
              labelText: 'DIRECCIÓN O UBICACIÓN GEOGRÁFICA',
              prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.outline),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _seniorityYearsController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'ANTIGÜEDAD (AÑOS)',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _seniorityMonthsController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'ANTIGÜEDAD (MESES)',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _revenueController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'INGRESOS MENSUALES (S/)',
                    prefixText: 'S/ ',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _expenseController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'GASTOS MENSUALES (S/)',
                    prefixText: 'S/ ',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _ciiuCode,
            dropdownColor: const Color(0xFF021525),
            decoration: const InputDecoration(
              labelText: 'ACTIVIDAD ECONÓMICA CIIU',
              prefixIcon: Icon(Icons.settings_outlined, color: AppColors.outline),
            ),
            items: [
              '0111 - Cultivo de cereales',
              '0113 - Cultivo de hortalizas y raíces',
              '0121 - Cultivo de frutas tropicales',
              '0141 - Cría de ganado vacuno',
              '0145 - Cría de aves de corral'
            ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (v) {
              if (v != null) {
                setState(() {
                  _ciiuCode = v;
                });
              }
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStepCredito(ThemeData theme) {
    final sim = _calculateSimulation();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'PASO 3: CONDICIONES DEL CRÉDITO',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('MONTO SOLICITADO', style: TextStyle(fontWeight: FontWeight.bold)),
              Text(
                'S/ ${_requestedAmount.toInt()}',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'JetBrains Mono',
                  color: Color(0xFF7ED99E),
                ),
              ),
            ],
          ),
          Slider(
            value: _requestedAmount,
            min: 500,
            max: 150000,
            divisions: 299,
            activeColor: const Color(0xFF00C853),
            inactiveColor: Colors.white10,
            onChanged: (v) {
              setState(() {
                _requestedAmount = (v / 500).round() * 500.0;
              });
            },
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<int>(
                  value: _repaymentTerm,
                  dropdownColor: const Color(0xFF021525),
                  decoration: const InputDecoration(labelText: 'PLAZO (MESES)'),
                  items: [3, 6, 12, 18, 24, 36, 48]
                      .map((e) => DropdownMenuItem(value: e, child: Text('$e Meses')))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) {
                      setState(() {
                        _repaymentTerm = v;
                      });
                    }
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _currency,
                  dropdownColor: const Color(0xFF021525),
                  decoration: const InputDecoration(labelText: 'MONEDA'),
                  items: ['PEN', 'USD']
                      .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) {
                      setState(() {
                        _currency = v;
                      });
                    }
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _paymentFrequency,
                  dropdownColor: const Color(0xFF021525),
                  decoration: const InputDecoration(labelText: 'FRECUENCIA PAGO'),
                  items: ['Mensual', 'Quincenal', 'Semanal']
                      .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) {
                      setState(() {
                        _paymentFrequency = v;
                      });
                    }
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _warrantyType,
                  dropdownColor: const Color(0xFF021525),
                  decoration: const InputDecoration(labelText: 'GARANTÍA'),
                  items: ['Sin Garantía', 'Aval / Fiador Co.', 'Hipotecaria', 'Prendaria']
                      .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) {
                      setState(() {
                        _warrantyType = v;
                      });
                    }
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // French amortization simulator card (RF-47)
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF00C853).withOpacity(0.3), width: 1),
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF00C853).withOpacity(0.06),
                  Colors.white.withOpacity(0.02),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: AgroCard(
              color: Colors.transparent,
              border: Border.all(color: Colors.transparent),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.calculate, color: Color(0xFF7ED99E), size: 18),
                      const SizedBox(width: 8),
                      Text(
                        'SIMULACIÓN EN TIEMPO REAL (FRANCESA)',
                        style: theme.textTheme.labelLarge?.copyWith(
                          fontSize: 10,
                          color: const Color(0xFF7ED99E),
                          letterSpacing: 1,
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
                          const Text('CUOTA ESTIMADA', style: TextStyle(color: Colors.white38, fontSize: 9)),
                          Text(
                            'S/ ${sim['quota']!.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'JetBrains Mono',
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('COSTO FINANCIERO', style: TextStyle(color: Colors.white38, fontSize: 9)),
                          Text(
                            'S/ ${sim['cost']!.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'JetBrains Mono',
                              color: Color(0xFFFFB4AB),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Tasa TEA Aplicada: ${sim['tea']!.toStringAsFixed(1)}%',
                        style: const TextStyle(fontSize: 11, color: Colors.white54),
                      ),
                      Text(
                        'Total a Pagar: S/ ${sim['total']!.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 11, color: Colors.white54, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStepFirma(ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'PASO 4: CONFIRMACIÓN Y FIRMA DIGITAL',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 16),
          const Text(
            'El cliente solicitante debe firmar en pantalla para autorizar la consulta del buró de crédito y dar fe del expediente de crédito.',
            style: TextStyle(fontSize: 12, color: Colors.white70),
          ),
          const SizedBox(height: 16),
          
          // Signature Canvas (RF-48)
          Container(
            height: 180,
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.glassBorder, width: 1.5),
            ),
            child: Stack(
              children: [
                GestureDetector(
                  onPanUpdate: (DragUpdateDetails details) {
                    setState(() {
                      RenderBox object = context.findRenderObject() as RenderBox;
                      Offset localPosition = object.globalToLocal(details.globalPosition);
                      // Offset adjustment because of top bar and padding offset
                      _signaturePoints.add(localPosition);
                    });
                  },
                  onPanEnd: (DragEndDetails details) => _signaturePoints.add(null),
                  child: CustomPaint(
                    painter: SignaturePainter(points: _signaturePoints),
                    size: Size.infinite,
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: TextButton.icon(
                    icon: const Icon(Icons.clear, size: 16, color: AppColors.critical),
                    label: const Text('LIMPIAR', style: TextStyle(fontSize: 10, color: AppColors.critical, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      setState(() {
                        _signaturePoints.clear();
                      });
                    },
                  ),
                ),
                if (_signaturePoints.isEmpty)
                  const Center(
                    child: Text(
                      'FIRME AQUÍ CON EL DEDO',
                      style: TextStyle(fontSize: 11, color: Colors.white24, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Declaracion jurada checkbox
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                value: _declarationAccepted,
                activeColor: const Color(0xFF00C853),
                onChanged: (v) {
                  setState(() {
                    _declarationAccepted = v ?? false;
                  });
                },
              ),
              const Expanded(
                child: Padding(
                  padding: EdgeInsets.only(top: 8.0),
                  child: Text(
                    'El cliente declara bajo juramento que los datos proporcionados en este expediente son verídicos.',
                    style: TextStyle(fontSize: 11, color: Colors.white54, height: 1.4),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Ready for transmission banner (RF-64)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.02),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white10),
            ),
            child: const Row(
              children: [
                Icon(Icons.wifi_off, color: AppColors.primary, size: 20),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'MODO OFFLINE ACTIVADO. Al finalizar, la solicitud se guardará localmente y se transmitirá automáticamente al reconectar.',
                    style: TextStyle(fontSize: 10, color: Colors.white38),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons(int step, WidgetRef ref, BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
      ),
      child: Row(
        children: [
          if (step > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => ref.read(loanRequestProvider.notifier).prevStep(),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 54),
                  side: const BorderSide(color: AppColors.outline),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('ATRÁS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          if (step > 0) const SizedBox(width: 16),
          Expanded(
            flex: 2,
            child: AgroButton(
              label: step == 3 ? 'FINALIZAR' : 'CONTINUAR',
              onPressed: () {
                if (step < 3) {
                  // Basic inputs checks
                  if (step == 0 && _nameController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Por favor ingrese el nombre del productor.')),
                    );
                    return;
                  }
                  ref.read(loanRequestProvider.notifier).nextStep();
                } else {
                  // Submit
                  if (!_declarationAccepted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Debe aceptar la declaración jurada.')),
                    );
                    return;
                  }
                  
                  // Reset steps
                  while (ref.read(loanRequestProvider).currentStep > 0) {
                    ref.read(loanRequestProvider.notifier).prevStep();
                  }

                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('¡Solicitud registrada! Expediente N° EXP-2026-004 creado localmente.'),
                      backgroundColor: Color(0xFF00C853),
                    ),
                  );
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Digital Signature Canvas Painter (RF-48)
class SignaturePainter extends CustomPainter {
  final List<Offset?> points;

  SignaturePainter({required this.points});

  @override
  void paint(Canvas canvas, Size size) {
    Paint paint = Paint()
      ..color = Colors.white
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 3.0;

    for (int i = 0; i < points.length - 1; i++) {
      if (points[i] != null && points[i + 1] != null) {
        canvas.drawLine(points[i]!, points[i + 1]!, paint);
      }
    }
  }

  @override
  bool shouldRepaint(SignaturePainter oldDelegate) => oldDelegate.points != points;
}
