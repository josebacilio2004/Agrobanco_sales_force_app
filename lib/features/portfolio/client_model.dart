class Client {
  final String id;
  final String name;
  final String dni;
  final String status;
  final double loanAmount;
  final DateTime dueDate;
  final String location;
  final String priority;
  bool isVisited;

  Client({
    required this.id,
    required this.name,
    required this.dni,
    required this.status,
    required this.loanAmount,
    required this.dueDate,
    required this.location,
    this.priority = 'NORMAL',
    this.isVisited = false,
  });
}
