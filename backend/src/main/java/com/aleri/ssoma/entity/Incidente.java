package com.aleri.ssoma.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidentes")
public class Incidente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ───────── Sección 1 — Identificación ───────── */

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;          // INC-2026-001

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoIncidente tipo;

    @Column(name = "fecha_ocurrencia", nullable = false)
    private LocalDate fechaOcurrencia;

    @Column(name = "hora_ocurrencia", length = 8)
    private String horaOcurrencia;  // HH:mm — formato simple

    @Column(name = "fecha_reporte")
    private LocalDate fechaReporte;

    @Column(nullable = false, length = 100)
    private String area;            // alias "ubicación / área"

    @Column(length = 100)
    private String planta;

    @Column(length = 100)
    private String proyecto;

    @Column(name = "ubicacion_detalle", length = 200)
    private String ubicacionDetalle; // texto libre / coordenadas

    /* ───────── Sección 2 — Datos del implicado ───────── */

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "colaborador_id")
    private Colaborador colaborador; // opcional, si está en sistema

    @Column(name = "implicado_nombre", length = 150)
    private String implicadoNombre;

    @Column(name = "implicado_dni", length = 20)
    private String implicadoDni;

    @Column(name = "implicado_puesto", length = 100)
    private String implicadoPuesto;

    @Column(name = "implicado_area", length = 100)
    private String implicadoArea;

    @Column(name = "implicado_antiguedad_meses")
    private Integer implicadoAntiguedadMeses;

    @Enumerated(EnumType.STRING)
    @Column(name = "implicado_vinculacion", length = 30)
    private TipoVinculacion implicadoVinculacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "implicado_turno", length = 20)
    private TurnoTrabajo implicadoTurno;

    /* ───────── Sección 3 — Descripción detallada ───────── */

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tarea_realizada", columnDefinition = "TEXT")
    private String tareaRealizada;

    @Column(name = "tarea_rutinaria")
    private Boolean tareaRutinaria;

    @Column(name = "agente_causante", length = 200)
    private String agenteCausante;

    @Column(name = "parte_cuerpo_afectada", length = 100)
    private String parteCuerpoAfectada;

    @Column(name = "naturaleza_lesion", length = 100)
    private String naturalezaLesion;

    /* ───────── Sección 4 — Análisis de causas ───────── */

    @Column(name = "actos_subestandares", columnDefinition = "TEXT")
    private String actosSubestandares;

    @Column(name = "condiciones_subestandares", columnDefinition = "TEXT")
    private String condicionesSubestandares;

    @Column(name = "factores_personales", columnDefinition = "TEXT")
    private String factoresPersonales;

    @Column(name = "factores_trabajo", columnDefinition = "TEXT")
    private String factoresTrabajo;

    /* ───────── Sección 6 — Evidencia y cierre ───────── */

    @Column(name = "costos_estimados", precision = 12, scale = 2)
    private java.math.BigDecimal costosEstimados;

    @Column(name = "firma_reportante", columnDefinition = "TEXT")
    private String firmaReportante;   // base64 PNG

    @Column(name = "firma_jefe_area", columnDefinition = "TEXT")
    private String firmaJefeArea;

    @Column(name = "firma_responsable_seguridad", columnDefinition = "TEXT")
    private String firmaResponsableSeguridad;

    /* ───────── Comunes / metadata ───────── */

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoIncidente estado = EstadoIncidente.REGISTRADO;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registrado_por")
    private Usuario registradoPor;

    /* Acciones correctivas (1-N) */
    @OneToMany(mappedBy = "incidente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AccionCorrectiva> acciones = new ArrayList<>();

    /* Testigos (1-N) */
    @OneToMany(mappedBy = "incidente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TestigoIncidente> testigos = new ArrayList<>();

    /* Fotos (1-N), guardadas como base64 */
    @OneToMany(mappedBy = "incidente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FotoIncidente> fotos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Incidente() {}

    /* ───── Getters / Setters ───── */
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public TipoIncidente getTipo() { return tipo; }
    public void setTipo(TipoIncidente tipo) { this.tipo = tipo; }
    public LocalDate getFechaOcurrencia() { return fechaOcurrencia; }
    public void setFechaOcurrencia(LocalDate v) { this.fechaOcurrencia = v; }
    public String getHoraOcurrencia() { return horaOcurrencia; }
    public void setHoraOcurrencia(String v) { this.horaOcurrencia = v; }
    public LocalDate getFechaReporte() { return fechaReporte; }
    public void setFechaReporte(LocalDate v) { this.fechaReporte = v; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getPlanta() { return planta; }
    public void setPlanta(String v) { this.planta = v; }
    public String getProyecto() { return proyecto; }
    public void setProyecto(String v) { this.proyecto = v; }
    public String getUbicacionDetalle() { return ubicacionDetalle; }
    public void setUbicacionDetalle(String v) { this.ubicacionDetalle = v; }

    public Colaborador getColaborador() { return colaborador; }
    public void setColaborador(Colaborador colaborador) { this.colaborador = colaborador; }
    public String getImplicadoNombre() { return implicadoNombre; }
    public void setImplicadoNombre(String v) { this.implicadoNombre = v; }
    public String getImplicadoDni() { return implicadoDni; }
    public void setImplicadoDni(String v) { this.implicadoDni = v; }
    public String getImplicadoPuesto() { return implicadoPuesto; }
    public void setImplicadoPuesto(String v) { this.implicadoPuesto = v; }
    public String getImplicadoArea() { return implicadoArea; }
    public void setImplicadoArea(String v) { this.implicadoArea = v; }
    public Integer getImplicadoAntiguedadMeses() { return implicadoAntiguedadMeses; }
    public void setImplicadoAntiguedadMeses(Integer v) { this.implicadoAntiguedadMeses = v; }
    public TipoVinculacion getImplicadoVinculacion() { return implicadoVinculacion; }
    public void setImplicadoVinculacion(TipoVinculacion v) { this.implicadoVinculacion = v; }
    public TurnoTrabajo getImplicadoTurno() { return implicadoTurno; }
    public void setImplicadoTurno(TurnoTrabajo v) { this.implicadoTurno = v; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getTareaRealizada() { return tareaRealizada; }
    public void setTareaRealizada(String v) { this.tareaRealizada = v; }
    public Boolean getTareaRutinaria() { return tareaRutinaria; }
    public void setTareaRutinaria(Boolean v) { this.tareaRutinaria = v; }
    public String getAgenteCausante() { return agenteCausante; }
    public void setAgenteCausante(String v) { this.agenteCausante = v; }
    public String getParteCuerpoAfectada() { return parteCuerpoAfectada; }
    public void setParteCuerpoAfectada(String v) { this.parteCuerpoAfectada = v; }
    public String getNaturalezaLesion() { return naturalezaLesion; }
    public void setNaturalezaLesion(String v) { this.naturalezaLesion = v; }

    public String getActosSubestandares() { return actosSubestandares; }
    public void setActosSubestandares(String v) { this.actosSubestandares = v; }
    public String getCondicionesSubestandares() { return condicionesSubestandares; }
    public void setCondicionesSubestandares(String v) { this.condicionesSubestandares = v; }
    public String getFactoresPersonales() { return factoresPersonales; }
    public void setFactoresPersonales(String v) { this.factoresPersonales = v; }
    public String getFactoresTrabajo() { return factoresTrabajo; }
    public void setFactoresTrabajo(String v) { this.factoresTrabajo = v; }

    public java.math.BigDecimal getCostosEstimados() { return costosEstimados; }
    public void setCostosEstimados(java.math.BigDecimal v) { this.costosEstimados = v; }
    public String getFirmaReportante() { return firmaReportante; }
    public void setFirmaReportante(String v) { this.firmaReportante = v; }
    public String getFirmaJefeArea() { return firmaJefeArea; }
    public void setFirmaJefeArea(String v) { this.firmaJefeArea = v; }
    public String getFirmaResponsableSeguridad() { return firmaResponsableSeguridad; }
    public void setFirmaResponsableSeguridad(String v) { this.firmaResponsableSeguridad = v; }

    public EstadoIncidente getEstado() { return estado; }
    public void setEstado(EstadoIncidente estado) { this.estado = estado; }
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
    public Usuario getRegistradoPor() { return registradoPor; }
    public void setRegistradoPor(Usuario registradoPor) { this.registradoPor = registradoPor; }

    public List<AccionCorrectiva> getAcciones() { return acciones; }
    public void setAcciones(List<AccionCorrectiva> v) { this.acciones = v; }
    public List<TestigoIncidente> getTestigos() { return testigos; }
    public void setTestigos(List<TestigoIncidente> v) { this.testigos = v; }
    public List<FotoIncidente> getFotos() { return fotos; }
    public void setFotos(List<FotoIncidente> v) { this.fotos = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
