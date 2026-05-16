import 'package:flutter_riverpod/flutter_riverpod.dart';

class LoanRequestState {
  final int currentStep;
  final Map<String, dynamic> formData;

  LoanRequestState({
    this.currentStep = 0,
    this.formData = const {},
  });

  LoanRequestState copyWith({
    int? currentStep,
    Map<String, dynamic>? formData,
  }) {
    return LoanRequestState(
      currentStep: currentStep ?? this.currentStep,
      formData: formData ?? this.formData,
    );
  }
}

class LoanRequestNotifier extends StateNotifier<LoanRequestState> {
  LoanRequestNotifier() : super(LoanRequestState());

  void nextStep() => state = state.copyWith(currentStep: state.currentStep + 1);
  void prevStep() => state = state.copyWith(currentStep: state.currentStep - 1);
  
  void updateData(String key, dynamic value) {
    final newData = Map<String, dynamic>.from(state.formData);
    newData[key] = value;
    state = state.copyWith(formData: newData);
  }
}

final loanRequestProvider = StateNotifierProvider<LoanRequestNotifier, LoanRequestState>((ref) {
  return LoanRequestNotifier();
});
