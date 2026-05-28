import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class GlassBackground extends StatelessWidget {
  final Widget child;

  const GlassBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Deep background gradient
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF03141F), // Very deep dark blue/green
                Color(0xFF010A10), // Almost black
              ],
            ),
          ),
        ),
        // Glowing organic blob 1 (Forest Green - represents agriculture/fields)
        Positioned(
          top: -80,
          right: -60,
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF00C853).withOpacity(0.12),
              shadows: [
                BoxShadow(
                  color: const Color(0xFF00C853).withOpacity(0.15),
                  blurRadius: 100,
                  spreadRadius: 40,
                ),
              ],
            ),
          ),
        ),
        // Glowing organic blob 2 (Harvest Gold - represents growth/harvest)
        Positioned(
          bottom: 100,
          left: -80,
          child: Container(
            width: 320,
            height: 320,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFFFD600).withOpacity(0.06),
              shadows: [
                BoxShadow(
                  color: const Color(0xFFFFD600).withOpacity(0.08),
                  blurRadius: 120,
                  spreadRadius: 50,
                ),
              ],
            ),
          ),
        ),
        // Glowing organic blob 3 (Water Blue - represents irrigation)
        Positioned(
          top: 350,
          right: -100,
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withOpacity(0.08),
              shadows: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.1),
                  blurRadius: 90,
                  spreadRadius: 30,
                ),
              ],
            ),
          ),
        ),
        // Actual Content
        child,
      ],
    );
  }
}
