import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class FirebaseSeeder {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;

  static Future<void> seedAll() async {
    try {
      debugPrint("Starting Firebase Seeding...");

      // 1. Seed Clients
      final clientsCol = _db.collection('clients');
      final clientsSnap = await clientsCol.get();
      for (var doc in clientsSnap.docs) {
        await doc.reference.delete();
      }
      final clientsData = [
        {
          'id': '1',
          'name': 'Juan Perez Ramos',
          'dni': '45678912',
          'status': 'RENOVACIÓN',
          'loanAmount': 15000.0,
          'dueDate': DateTime.now().add(const Duration(days: 5)).toIso8601String(),
          'location': 'Sector A - Lote 4, Huancayo',
          'priority': 'ALTA',
          'isVisited': false,
        },
        {
          'id': '2',
          'name': 'Maria Quispe Soto',
          'dni': '12345678',
          'status': 'RECUPERACIÓN MORA',
          'loanAmount': 8500.0,
          'dueDate': DateTime.now().subtract(const Duration(days: 12)).toIso8601String(),
          'location': 'Comunidad Campesina, Jauja',
          'priority': 'ALTA',
          'isVisited': false,
        },
        {
          'id': '3',
          'name': 'Carlos Huaman Diaz',
          'dni': '98765432',
          'status': 'AMPLIACIÓN',
          'loanAmount': 22000.0,
          'dueDate': DateTime.now().add(const Duration(days: 14)).toIso8601String(),
          'location': 'Fundo Los Olivos, Tarma',
          'priority': 'MEDIA',
          'isVisited': true,
        },
        {
          'id': '4',
          'name': 'Elena Rivas Castro',
          'dni': '23456789',
          'status': 'NUEVA SOLICITUD',
          'loanAmount': 5000.0,
          'dueDate': DateTime.now().add(const Duration(days: 30)).toIso8601String(),
          'location': 'Av. Floral 540, Huancayo',
          'priority': 'NORMAL',
          'isVisited': false,
        },
        {
          'id': '5',
          'name': 'Pedro Flores Choque',
          'dni': '34567890',
          'status': 'SEGUIMIENTO',
          'loanAmount': 10000.0,
          'dueDate': DateTime.now().add(const Duration(days: 20)).toIso8601String(),
          'location': 'Fundo San Jose, Jauja',
          'priority': 'NORMAL',
          'isVisited': false,
        },
        {
          'id': '6',
          'name': 'Julia Mendoza Ortiz',
          'dni': '56789012',
          'status': 'DESERTOR',
          'loanAmount': 12000.0,
          'dueDate': DateTime.now().toIso8601String(),
          'location': 'Jr. Libertad 120, Tarma',
          'priority': 'MEDIA',
          'isVisited': false,
        },
      ];
      for (var client in clientsData) {
        await clientsCol.doc(client['id'] as String).set(client);
      }

      // 2. Seed Routes
      final routesCol = _db.collection('routes');
      final routesSnap = await routesCol.get();
      for (var doc in routesSnap.docs) {
        await doc.reference.delete();
      }
      final routesData = [
        {
          'id': '1',
          'name': 'Juan Perez Ramos',
          'time': '8:30 AM',
          'status': 'Completado',
          'priority': 'ALTA',
          'latitude': -12.0678,
          'longitude': -75.2100,
        },
        {
          'id': '2',
          'name': 'Maria Quispe Soto',
          'time': '10:45 AM',
          'status': 'En Camino',
          'priority': 'ALTA',
          'latitude': -12.0590,
          'longitude': -75.1950,
        },
        {
          'id': '3',
          'name': 'Carlos Huaman Diaz',
          'time': '2:00 PM',
          'status': 'Pendiente',
          'priority': 'MEDIA',
          'latitude': -12.0720,
          'longitude': -75.2010,
        },
        {
          'id': '4',
          'name': 'Elena Rivas Castro',
          'time': '4:15 PM',
          'status': 'Pendiente',
          'priority': 'NORMAL',
          'latitude': -12.0620,
          'longitude': -75.2150,
        },
      ];
      for (var route in routesData) {
        await routesCol.doc(route['id'] as String).set(route);
      }

      // 3. Seed Requests
      final requestsCol = _db.collection('request_statuses');
      final requestsSnap = await requestsCol.get();
      for (var doc in requestsSnap.docs) {
        await doc.reference.delete();
      }
      final requestsData = [
        {
          'id': 'EXP-2026-001',
          'name': 'JUAN PEREZ RAMOS',
          'amount': 'S/ 15,000.00',
          'status': 'En Comité',
          'date': 'Enviado hace 2 horas',
          'colorValue': 0xFFFFD600,
          'progress': 0.4,
          'analyst': 'Ing. Carlos Mendoza',
          'notes': ['Cliente cuenta con aval de riego.', 'Firma digital validada.'],
        },
        {
          'id': 'EXP-2026-002',
          'name': 'MARIA QUISPE SOTO',
          'amount': 'S/ 8,500.00',
          'status': 'Aprobadas',
          'date': 'Pendiente desembolso',
          'colorValue': 0xFF00C853,
          'progress': 0.8,
          'analyst': 'Dra. Elena Ramos',
          'notes': [],
        },
        {
          'id': 'EXP-2026-003',
          'name': 'CARLOS HUAMAN DIAZ',
          'amount': 'S/ 22,000.00',
          'status': 'Desembolsadas',
          'date': 'Completado 15/05/2026',
          'colorValue': 0xFF7ED99E,
          'progress': 1.0,
          'analyst': 'Ing. Julio Flores',
          'notes': ['Monto desembolsado en caja Huancayo.'],
        },
      ];
      for (var req in requestsData) {
        await requestsCol.doc(req['id'] as String).set(req);
      }

      // 4. Seed Overdue Clients
      final overdueCol = _db.collection('overdue_clients');
      final overdueSnap = await overdueCol.get();
      for (var doc in overdueSnap.docs) {
        await doc.reference.delete();
      }
      final overdueData = [
        {
          'id': '1',
          'name': 'GUSTAVO MEZA ROJAS',
          'daysLate': 18,
          'amount': 450.0,
          'lastContact': 'Llamada el 20/05',
          'isVisited': false,
        },
        {
          'id': '2',
          'name': 'ROSA ALBA INGA',
          'daysLate': 45,
          'amount': 1200.0,
          'lastContact': 'Visita el 15/05',
          'isVisited': false,
        },
        {
          'id': '3',
          'name': 'FELIPE HUAMAN SOTO',
          'daysLate': 75,
          'amount': 3800.0,
          'lastContact': 'Sin contacto',
          'isVisited': false,
        },
      ];
      for (var oc in overdueData) {
        await overdueCol.doc(oc['id'] as String).set(oc);
      }

      // 5. Seed Campaigns
      final campaignsCol = _db.collection('campaigns');
      final campaignsSnap = await campaignsCol.get();
      for (var doc in campaignsSnap.docs) {
        await doc.reference.delete();
      }
      final campaignsData = [
        {
          'id': '1',
          'type': 'RENOVACIÓN',
          'client': 'Lucio Fernandez C.',
          'amount': 'S/ 18,000.00',
          'expiry': 'Expira en 5 días',
          'colorValue': 0xFF2196F3,
        },
        {
          'id': '2',
          'type': 'AMPLIACIÓN',
          'client': 'Gisela Diaz Palacios',
          'amount': 'S/ 25,000.00',
          'expiry': 'Expira en 12 días',
          'colorValue': 0xFF4CAF50,
        },
      ];
      for (var camp in campaignsData) {
        await campaignsCol.doc(camp['id'] as String).set(camp);
      }

      debugPrint("Firebase Seeding Completed Successfully!");
    } catch (e) {
      debugPrint("Error seeding Firebase: $e");
      rethrow;
    }
  }
}
