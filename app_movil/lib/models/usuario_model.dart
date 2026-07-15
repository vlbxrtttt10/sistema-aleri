class UsuarioModel {
  final int id;
  final String nombre;
  final String email;
  final String rol;
  final int? empresaId;
  final String? empresaNombre;
  final List<String> modulos;

  UsuarioModel({
    required this.id,
    required this.nombre,
    required this.email,
    required this.rol,
    this.empresaId,
    this.empresaNombre,
    required this.modulos,
  });

  // Para GET /auth/me (devuelve objeto con campo 'id')
  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    return UsuarioModel(
      id: json['id'] ?? 0,
      nombre: json['nombre'] ?? '',
      email: json['email'] ?? '',
      rol: json['rol'] ?? '',
      empresaId: json['empresaId'],
      empresaNombre: json['empresaNombre'],
      modulos: List<String>.from(json['modulos'] ?? []),
    );
  }

  // Para POST /auth/login (devuelve token + datos planos sin 'id')
  factory UsuarioModel.fromLoginJson(Map<String, dynamic> json) {
    return UsuarioModel(
      id: 0,
      nombre: json['nombre'] ?? '',
      email: json['email'] ?? '',
      rol: json['rol'] ?? '',
      empresaId: json['empresaId'],
      empresaNombre: json['empresaNombre'],
      modulos: List<String>.from(json['modulos'] ?? []),
    );
  }
}
