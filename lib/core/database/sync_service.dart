import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'database_service.dart';

class SyncService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static void startSyncLoop() {
    Timer.periodic(const Duration(minutes: 5), (timer) async {
      await syncPendingRequests();
    });
  }

  static Future<void> syncPendingRequests() async {
    final pending = await DatabaseService.getUnsyncedRequests();
    
    for (final request in pending) {
      try {
        await _firestore.collection('loan_requests').add({
          'clientName': request.clientName,
          'dni': request.dni,
          'amount': request.requestedAmount,
          'status': 'EN_EVALUACION',
          'createdAt': FieldValue.serverTimestamp(),
        });
        
        // Mark as synced locally
        request.isSynced = true;
        await DatabaseService.saveLoanRequest(request);
      } catch (e) {
        print('Error syncing request: $e');
      }
    }
  }
}
