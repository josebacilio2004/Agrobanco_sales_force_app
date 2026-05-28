import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AgroButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool isLoading;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double? borderRadius;
  final IconData? icon;

  const AgroButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.backgroundColor,
    this.foregroundColor,
    this.borderRadius,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isPrimary = backgroundColor == null;
    
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius ?? 12),
        gradient: isPrimary
            ? const LinearGradient(
                colors: [
                  Color(0xFF00C853), // Agrobanco Green
                  Color(0xFF00897B), // Rich Teal
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        boxShadow: isPrimary
            ? [
                BoxShadow(
                  color: const Color(0xFF00C853).withOpacity(0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: isPrimary ? Colors.transparent : (backgroundColor ?? Colors.white.withOpacity(0.05)),
          foregroundColor: foregroundColor ?? Colors.white,
          shadowColor: Colors.transparent,
          minimumSize: const Size(double.infinity, 54),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius ?? 12),
            side: isPrimary
                ? BorderSide.none
                : BorderSide(color: AppColors.glassBorder, width: 1.5),
          ),
          textStyle: theme.textTheme.labelLarge?.copyWith(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 18, color: foregroundColor ?? Colors.white),
                    const SizedBox(width: 8),
                  ],
                  Text(label.toUpperCase()),
                ],
              ),
      ),
    );
  }
}
