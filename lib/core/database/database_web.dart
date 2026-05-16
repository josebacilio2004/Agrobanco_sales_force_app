// Mock implementation for Web to avoid Isar JS Integer overflow issues

class LoanRequestDb {
  String? clientName;
  String? dni;
  double? requestedAmount;
  bool isSynced = false;
}

class DatabaseService {
  static Future<void> init() async {
    print('DATABASE: Running on Web - Isar is disabled to avoid JS Integer overflow');
  }

  static dynamic get instance => null;

  static Future<List<LoanRequestDb>> getUnsyncedRequests() async {
    return [];
  }

  static Future<void> saveLoanRequest(LoanRequestDb request) async {
    print('DATABASE: Save request called on Web (Mock)');
  }
}
