import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../features/portfolio/portfolio_screen.dart';
import '../../features/status/request_status_screen.dart';
import '../../features/route/route_planning_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/loan_request/loan_simulator_screen.dart';
import '../../features/client/prospect_evaluation_screen.dart';
import '../../features/portfolio/recovery_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  final String userCode;
  final String userRole;

  const MainNavigationScreen({
    super.key,
    this.userCode = '1001',
    this.userRole = 'Operador',
  });

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      PortfolioScreen(onMenuPressed: () => _scaffoldKey.currentState?.openDrawer()),
      RoutePlanningScreen(onMenuPressed: () => _scaffoldKey.currentState?.openDrawer()),
      RequestStatusScreen(onMenuPressed: () => _scaffoldKey.currentState?.openDrawer()),
    ];
  }

  void _handleLogout() {
    // Simulated check for unsynced forms (HU-03 / RF-08)
    // We will simulate that there is 1 unsynced request for demonstration.
    final bool hasUnsyncedRequests = true;

    if (hasUnsyncedRequests) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.surfaceVariant,
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: AppColors.tertiary),
              SizedBox(width: 8),
              Text('Advertencia'),
            ],
          ),
          content: const Text(
            'Tienes 1 solicitud sin sincronizar en la cola local. '
            'Si cierra la sesión, se borrará el caché y podría perder estos datos.\n\n'
            '¿Cerrar sesión de todas formas?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('CANCELAR', style: TextStyle(color: Colors.white70)),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop(); // Close dialog
                // Navigate back to login
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              child: const Text('CERRAR SESIÓN', style: TextStyle(color: AppColors.critical)),
            ),
          ],
        ),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      key: _scaffoldKey,
      drawer: Drawer(
        backgroundColor: Colors.transparent,
        elevation: 0,
        child: ClipRRect(
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(24),
            bottomRight: Radius.circular(24),
          ),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
            child: Material(
              color: Colors.black.withOpacity(0.4),
              child: SafeArea(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Glassmorphic Drawer Header
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: Colors.white.withOpacity(0.1), width: 1),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 30,
                                backgroundColor: const Color(0xFF00C853).withOpacity(0.15),
                                child: const Icon(
                                  Icons.account_circle,
                                  size: 40,
                                  color: Color(0xFF7ED99E),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'José Bacilio',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    Text(
                                      'Oficial de Crédito',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.white.withOpacity(0.6),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF00C853).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: const Color(0xFF00C853).withOpacity(0.3)),
                                ),
                                child: Text(
                                  widget.userRole.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF7ED99E),
                                  ),
                                ),
                              ),
                              Text(
                                'Cód: ${widget.userCode}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontFamily: 'JetBrains Mono',
                                  color: Colors.white38,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    
                    // Drawer Items
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        children: [
                          // SectionTitle
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Text(
                              'MÓDULOS DISPONIBLES',
                              style: theme.textTheme.labelLarge?.copyWith(
                                fontSize: 10,
                                color: AppColors.primary,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ),
                          _buildDrawerItem(
                            icon: Icons.assignment_outlined,
                            title: 'Cartera Diaria',
                            subtitle: 'Clientes asignados',
                            onTap: () {
                              Navigator.pop(context);
                              setState(() => _selectedIndex = 0);
                            },
                          ),
                          _buildDrawerItem(
                            icon: Icons.map_outlined,
                            title: 'Ruta del Día',
                            subtitle: 'Mapa y optimización',
                            onTap: () {
                              Navigator.pop(context);
                              setState(() => _selectedIndex = 1);
                            },
                          ),
                          _buildDrawerItem(
                            icon: Icons.analytics_outlined,
                            title: 'Estados de Crédito',
                            subtitle: 'Mis solicitudes',
                            onTap: () {
                              Navigator.pop(context);
                              setState(() => _selectedIndex = 2);
                            },
                          ),
                          _buildDrawerItem(
                            icon: Icons.calculate_outlined,
                            title: 'Simulador Rápido',
                            subtitle: 'Cálculo de cuotas',
                            onTap: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const LoanSimulatorScreen()),
                              );
                            },
                          ),
                          _buildDrawerItem(
                            icon: Icons.fact_check_outlined,
                            title: 'Pre-evaluación',
                            subtitle: 'Prospección (M4)',
                            onTap: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const ProspectEvaluationScreen()),
                              );
                            },
                          ),
                          _buildDrawerItem(
                            icon: Icons.assignment_late_outlined,
                            title: 'Cobranza y Mora',
                            subtitle: 'Recuperación cartera (M10)',
                            onTap: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const RecoveryScreen()),
                              );
                            },
                          ),
                          
                          // Supervisor extra features
                          if (widget.userRole == 'Supervisor' || widget.userRole == 'Administrador') ...[
                            const Divider(color: Colors.white10),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              child: Text(
                                'GESTIÓN Y SUPERVISIÓN',
                                style: theme.textTheme.labelLarge?.copyWith(
                                  fontSize: 10,
                                  color: const Color(0xFFFFD600),
                                  letterSpacing: 1.5,
                                ),
                              ),
                            ),
                            _buildDrawerItem(
                              icon: Icons.bar_chart_outlined,
                              title: 'Reportes de Cobertura',
                              subtitle: 'Supervisión en mapa',
                              onTap: () {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Accediendo a Reportes de Cobertura (M11)...')),
                                );
                              },
                            ),
                            _buildDrawerItem(
                              icon: Icons.people_outline,
                              title: 'Reasignación de Tareas',
                              subtitle: 'Gestión de asesores',
                              onTap: () {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Abriendo panel de reasignación...')),
                                );
                              },
                            ),
                          ],
                        ],
                      ),
                    ),
                    
                    // Logout
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(
                        border: Border(
                          top: BorderSide(color: Colors.white10, width: 1),
                        ),
                      ),
                      child: OutlinedButton.icon(
                        onPressed: _handleLogout,
                        icon: const Icon(Icons.logout, color: AppColors.critical, size: 18),
                        label: const Text(
                          'CERRAR SESIÓN',
                          style: TextStyle(
                            color: AppColors.critical,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.critical, width: 1.5),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: Colors.white.withOpacity(0.08),
              width: 1,
            ),
          ),
        ),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
            child: BottomNavigationBar(
              currentIndex: _selectedIndex,
              onTap: (index) => setState(() => _selectedIndex = index),
              backgroundColor: Colors.black.withOpacity(0.3),
              selectedItemColor: const Color(0xFF7ED99E),
              unselectedItemColor: Colors.white.withOpacity(0.4),
              type: BottomNavigationBarType.fixed,
              elevation: 0,
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.assignment_outlined),
                  activeIcon: Icon(Icons.assignment, color: Color(0xFF7ED99E)),
                  label: 'Cartera',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.map_outlined),
                  activeIcon: Icon(Icons.map, color: Color(0xFF7ED99E)),
                  label: 'Ruta',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.analytics_outlined),
                  activeIcon: Icon(Icons.analytics, color: Color(0xFF7ED99E)),
                  label: 'Estados',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.white.withOpacity(0.7)),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.5)),
      ),
      onTap: onTap,
      dense: true,
      visualDensity: VisualDensity.compact,
    );
  }
}
