import 'package:flutter_test/flutter_test.dart';
import 'package:ssoma_movil/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SsomaApp());
  });
}
