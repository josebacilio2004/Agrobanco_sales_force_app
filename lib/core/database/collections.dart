import 'package:isar/isar.dart';

part 'collections.g.dart';

@collection
class ClientDb {
  Id id = Isar.autoIncrement;

  @Index(unique: true)
  late String remoteId;

  late String name;
  late String dni;
  late String status;
  late double loanAmount;
  late DateTime dueDate;
  late String location;
  late DateTime lastSync;
}

@collection
class LoanRequestDb {
  Id id = Isar.autoIncrement;

  late String clientName;
  late String dni;
  late String location;
  late String cropType;
  late double requestedAmount;
  late int termMonths;
  
  List<String>? documentPaths;

  bool isSynced = false;
  DateTime createdAt = DateTime.now();
}
