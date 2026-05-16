import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AgroCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Color? color;
  final double? borderRadius;

  const AgroCard({
    super.key,
    required this.child,
    this.padding,
    this.color,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color ?? AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(borderRadius ?? 8),
        border: Border.all(
          color: Colors.white12,
          width: 1,
        ),
      ),
      child: child,
    );
  }
}
