package com.aleri.ssoma.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Vista completa de un incidente con todas sus relaciones.
 * Lo devuelve GET /api/incidentes/{id} para la vista de detalle / edición.
 */
public class IncidenteDetalleDto {

    private Long id;
    private String codigo;
    private String tipo;
    private String estado;

    /* Sección 1 */
    private LocalDate fechaOcurrencia;
    private String horaOcurrencia;
    private LocalDate fechaReporte;
    private String area;
    private String planta;
    private String proyecto;
    private String ubicacionDetalle;

    /* Sección 2 */
    private Long colaboradorId;
    private String implicadoNombre;
    private String implicadoDni;
    private String implicadoPuesto;
    private String implicadoArea;
    private Integer implicadoAntiguedadMeses;
    private String implicadoVinculacion;
    private String implicadoTurno;

    /* Sección 3 */
    private String descripcion;
    private String tareaRealizada;
    private Boolean tareaRutinaria;
    private String agenteCausante;
    private String parteCuerpoAfectada;
    private String naturalezaLesion;

    /* Sección 4 */
    private String actosSubestandares;
    private String condicionesSubestandares;
    private String factoresPersonales;
    private String factoresTrabajo;

    /* Sección 5 / 6 */
    private List<AccionCorrectivaDto> acciones;
    private List<TestigoDto> testigos;
    private List<FotoIncidenteDto> fotos;
    private BigDecimal costosEstimados;
    private String firmaReportante;
    private String firmaJefeArea;
    private String firmaResponsableSeguridad;

    /* Metadatos */
    private String registradoPorNombre;
    private LocalDateTime createdAt;

    public IncidenteDetalleDto() {}

    /* Getters / setters (todos) */
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String v) { this.codigo = v; }
    public String getTipo() { return tipo; }
    public void setTipo(String v) { this.tipo = v; }
    public String getEstado() { return estado; }
    public void setEstado(String v) { this.estado = v; }
    public LocalDate getFechaOcurrencia() { return fechaOcurrencia; }
    public void setFechaOcurrencia(LocalDate v) { this.fechaOcurrencia = v; }
    public String getHoraOcurrencia() { return horaOcurrencia; }
    public void setHoraOcurrencia(String v) { this.horaOcurrencia = v; }
    public LocalDate getFechaReporte() { return fechaReporte; }
    public void setFechaReporte(LocalDate v) { this.fechaReporte = v; }
    public String getArea() { return area; }
    public void setArea(String v) { this.area = v; }
    public String getPlanta() { return planta; }
    public void setPlanta(String v) { this.planta = v; }
    public String getProyecto() { return proyecto; }
    public void setProyecto(String v) { this.proyecto = v; }
    public String getUbicacionDetalle() { return ubicacionDetalle; }
    public void setUbicacionDetalle(String v) { this.ubicacionDetalle = v; }

    public Long getColaboradorId() { return colaboradorId; }
    public void setColaboradorId(Long v) { this.colaboradorId = v; }
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
    public String getImplicadoVinculacion() { return implicadoVinculacion; }
    public void setImplicadoVinculacion(String v) { this.implicadoVinculacion = v; }
    public String getImplicadoTurno() { return implicadoTurno; }
    public void setImplicadoTurno(String v) { this.implicadoTurno = v; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String v) { this.descripcion = v; }
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

    public List<AccionCorrectivaDto> getAcciones() { return acciones; }
    public void setAcciones(List<AccionCorrectivaDto> v) { this.acciones = v; }
    public List<TestigoDto> getTestigos() { return testigos; }
    public void setTestigos(List<TestigoDto> v) { this.testigos = v; }
    public List<FotoIncidenteDto> getFotos() { return fotos; }
    public void setFotos(List<FotoIncidenteDto> v) { this.fotos = v; }

    public BigDecimal getCostosEstimados() { return costosEstimados; }
    public void setCostosEstimados(BigDecimal v) { this.costosEstimados = v; }
    public String getFirmaReportante() { return firmaReportante; }
    public void setFirmaReportante(String v) { this.firmaReportante = v; }
    public String getFirmaJefeArea() { return firmaJefeArea; }
    public void setFirmaJefeArea(String v) { this.firmaJefeArea = v; }
    public String getFirmaResponsableSeguridad() { return firmaResponsableSeguridad; }
    public void setFirmaResponsableSeguridad(String v) { this.firmaResponsableSeguridad = v; }

    public String getRegistradoPorNombre() { return registradoPorNombre; }
    public void setRegistradoPorNombre(String v) { this.registradoPorNombre = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}
