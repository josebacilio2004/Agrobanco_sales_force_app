import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/agro_card.dart';
import '../../shared/widgets/agro_button.dart';
import 'loan_request_provider.dart';

class LoanRequestScreen extends ConsumerWidget {
  const LoanRequestScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(loanRequestProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('NUEVA SOLICITUD'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          _buildProgressIndicator(state.currentStep),
          Expanded(
            child: _buildStepContent(state.currentStep, theme, ref),
          ),
          _buildNavigationButtons(state.currentStep, ref, context),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator(int currentStep) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: List.generate(3, (index) {
          bool isActive = index == currentStep;
          bool isCompleted = index < currentStep;
          return Expanded(
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? AppColors.secondary
                        : isActive
                            ? AppColors.primary
                            : AppColors.surfaceVariant,
                    shape: BoxShape.circle,
                    border: isActive ? Border.all(color: Colors.white, width: 2) : null,
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : Text(
                            '${index + 1}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
                if (index < 2)
                  Expanded(
                    child: Container(
                      height: 2,
                      color: isCompleted ? AppColors.secondary : AppColors.surfaceVariant,
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStepContent(int step, ThemeData theme, WidgetRef ref) {
    switch (step) {
      case 0:
        return _buildStep1(theme, ref);
      case 1:
        return _buildStep2(theme, ref);
      case 2:
        return _buildStep3(theme, ref);
      default:
        return const SizedBox();
    }
  }

  Widget _buildStep1(ThemeData theme, WidgetRef ref) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('DATOS DEL PRODUCTOR', style: theme.textTheme.labelLarge),
          const SizedBox(height: 16),
          const TextField(
            decoration: InputDecoration(
              labelText: 'DNI / RUC',
              hintText: 'Ingrese documento',
            ),
          ),
          const SizedBox(height: 16),
          const TextField(
            decoration: InputDecoration(
              labelText: 'NOMBRES Y APELLIDOS',
              hintText: 'Capture en campo',
            ),
          ),
          const SizedBox(height: 16),
          const TextField(
            decoration: InputDecoration(
              labelText: 'DIRECCIÓN DE UNIDAD PRODUCTIVA',
              prefixIcon: Icon(Icons.location_on_outlined),
            ),
          ),
          const SizedBox(height: 16),
          const TextField(
            decoration: InputDecoration(
              labelText: 'CELULAR DE CONTACTO',
              prefixIcon: Icon(Icons.phone_android),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2(ThemeData theme, WidgetRef ref) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('DETALLES DEL PROYECTO', style: theme.textTheme.labelLarge),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: 'TIPO DE CULTIVO'),
            items: ['Papa', 'Café', 'Cacao', 'Maíz'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (v) {},
          ),
          const SizedBox(height: 16),
          const TextField(
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'MONTO SOLICITADO (S/)',
              prefixText: 'S/ ',
            ),
          ),
          const SizedBox(height: 16),
          const TextField(
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'PLAZO (MESES)',
            ),
          ),
          const SizedBox(height: 24),
          const AgroCard(
            child: Row(
              children: [
                Icon(Icons.info_outline, color: AppColors.primary),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'La tasa de interés se calculará automáticamente según el perfil de riesgo.',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3(ThemeData theme, WidgetRef ref) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('CAPTURAR DOCUMENTACIÓN', style: theme.textTheme.labelLarge),
          const SizedBox(height: 16),
          _buildDocTile('DNI (Frontal y Posterior)', Icons.badge, true),
          _buildDocTile('Título de Propiedad / Constancia', Icons.description, false),
          _buildDocTile('Recibo de Luz/Agua', Icons.receipt_long, false),
          const SizedBox(height: 24),
          const AgroCard(
            color: Colors.transparent,
            child: Column(
              children: [
                Icon(Icons.cloud_upload_outlined, size: 48, color: AppColors.primary),
                SizedBox(height: 12),
                Text(
                  'LISTO PARA TRANSMISIÓN',
                  style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
                Text(
                  'La solicitud se guardará localmente y se enviará al recuperar conexión.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocTile(String title, IconData icon, bool isCaptured) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: AgroCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: AppColors.onSurfaceVariant),
            const SizedBox(width: 16),
            Expanded(
              child: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
            ),
            if (isCaptured)
              const Icon(Icons.check_circle, color: AppColors.secondary)
            else
              IconButton(
                icon: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
                onPressed: () {
                  // TODO: Document capture
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavigationButtons(int step, WidgetRef ref, BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: Colors.white10)),
      ),
      child: Row(
        children: [
          if (step > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => ref.read(loanRequestProvider.notifier).prevStep(),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 56),
                  side: const BorderSide(color: AppColors.outline),
                ),
                child: const Text('ATRÁS'),
              ),
            ),
          if (step > 0) const SizedBox(width: 16),
          Expanded(
            flex: 2,
            child: AgroButton(
              label: step == 2 ? 'FINALIZAR' : 'CONTINUAR',
              onPressed: () {
                if (step < 2) {
                  ref.read(loanRequestProvider.notifier).nextStep();
                } else {
                  // TODO: Submit / Save
                  Navigator.of(context).pop();
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}
