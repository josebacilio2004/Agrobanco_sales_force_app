import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'collections.dart';

class DatabaseService {
  static late Isar _isar;

  static Future<void> init() async {
    final dir = await getApplicationDocumentsDirectory();
    _isar = await Isar.open(
      [ClientDbSchema, LoanRequestDbSchema],
      directory: dir.path,
    );
  }

  static Isar get instance => _isar;

  static Future<List<LoanRequestDb>> getUnsyncedRequests() async {
    return await _isar.loanRequestDbs.filter().isSyncedEqualTo(false).findAll();
  }

  static Future<void> saveLoanRequest(LoanRequestDb request) async {
    await _isar.writeTxn(() async {
      await _isar.loanRequestDbs.put(request);
    });
  }
}
