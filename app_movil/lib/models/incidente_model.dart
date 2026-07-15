class IncidenteResumen {
  final int id;
  final String codigo;
  final String tipo;
  final String estado;
  final String fechaOcurrencia;
  final String? area;
  final String? implicadoNombre;

  IncidenteResumen({
    required this.id,
    required this.codigo,
    required this.tipo,
    required this.estado,
    required this.fechaOcurrencia,
    this.area,
    this.implicadoNombre,
  });

  factory IncidenteResumen.fromJson(Map<String, dynamic> json) {
    return IncidenteResumen(
      id: json['id'],
      codigo: json['codigo'] ?? '',
      tipo: json['tipo'] ?? '',
      estado: json['estado'] ?? '',
      fechaOcurrencia: json['fechaOcurrencia'] ?? '',
      area: json['area'],
      implicadoNombre: json['implicadoNombre'],
    );
  }
}

class NuevoIncidenteRequest {
  final String tipo;
  final String fechaOcurrencia;
  final String horaOcurrencia;
  final String area;
  final String ubicacionDetalle;
  final String descripcion;
  final String tareaRealizada;
  final bool tareaRutinaria;
  final int? colaboradorId;
  final String implicadoNombre;
  final String implicadoDni;
  final String implicadoPuesto;
  final String implicadoArea;
  final String implicadoVinculacion;
  final String implicadoTurno;
  final int implicadoAntiguedadMeses;
  final String? agenteCausante;
  final String? parteCuerpoAfectada;
  final String? naturalezaLesion;
  final List<String> fotos;

  NuevoIncidenteRequest({
    required this.tipo,
    required this.fechaOcurrencia,
    required this.horaOcurrencia,
    required this.area,
    required this.ubicacionDetalle,
    required this.descripcion,
    required this.tareaRealizada,
    required this.tareaRutinaria,
    this.colaboradorId,
    required this.implicadoNombre,
    required this.implicadoDni,
    required this.implicadoPuesto,
    required this.implicadoArea,
    required this.implicadoVinculacion,
    required this.implicadoTurno,
    required this.implicadoAntiguedadMeses,
    this.agenteCausante,
    this.parteCuerpoAfectada,
    this.naturalezaLesion,
    required this.fotos,
  });

  Map<String, dynamic> toJson() => {
        'tipo': tipo,
        'fechaOcurrencia': fechaOcurrencia,
        'horaOcurrencia': horaOcurrencia,
        'area': area,
        'ubicacionDetalle': ubicacionDetalle,
        'descripcion': descripcion,
        'tareaRealizada': tareaRealizada,
        'tareaRutinaria': tareaRutinaria,
        'colaboradorId': colaboradorId,
        'implicadoNombre': implicadoNombre,
        'implicadoDni': implicadoDni,
        'implicadoPuesto': implicadoPuesto,
        'implicadoArea': implicadoArea,
        'implicadoVinculacion': implicadoVinculacion,
        'implicadoTurno': implicadoTurno,
        'implicadoAntiguedadMeses': implicadoAntiguedadMeses,
        if (agenteCausante != null) 'agenteCausante': agenteCausante,
        if (parteCuerpoAfectada != null) 'parteCuerpoAfectada': parteCuerpoAfectada,
        if (naturalezaLesion != null) 'naturalezaLesion': naturalezaLesion,
        if (fotos.isNotEmpty) 'fotos': fotos.map((f) => {'imagen': f}).toList(),
      };
}
