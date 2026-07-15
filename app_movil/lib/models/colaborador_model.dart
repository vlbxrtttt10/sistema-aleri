class ColaboradorModel {
  final int id;
  final String nombre;
  final String dni;
  final String cargo;
  final String area;

  ColaboradorModel({
    required this.id,
    required this.nombre,
    required this.dni,
    required this.cargo,
    required this.area,
  });

  factory ColaboradorModel.fromJson(Map<String, dynamic> json) {
    return ColaboradorModel(
      id: json['id'],
      nombre: json['nombre'] ?? '',
      dni: json['dni'] ?? '',
      cargo: json['cargo'] ?? '',
      area: json['area'] ?? '',
    );
  }

  String get displayName => '$nombre — $cargo';
}
