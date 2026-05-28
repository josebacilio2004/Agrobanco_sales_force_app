import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AgroCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Color? color;
  final double? borderRadius;
  final Border? border;

  const AgroCard({
    super.key,
    required this.child,
    this.padding,
    this.color,
    this.borderRadius,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    final finalBorderRadius = BorderRadius.circular(borderRadius ?? 16);
    return ClipRRect(
      borderRadius: finalBorderRadius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          padding: padding ?? const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: color ?? AppColors.glassBg,
            borderRadius: finalBorderRadius,
            border: border ?? Border.all(
              color: AppColors.glassBorder,
              width: 1.5,
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}
