package com.aleri.ssoma.dto;

import java.time.LocalDate;

public class AccionCorrectivaDto {
    private Long id;
    private String descripcion;
    private String responsable;
    private LocalDate fechaLimite;
    private String estado;       // PENDIENTE, EN_PROCESO, EJECUTADA, VERIFICADA

    public AccionCorrectivaDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String v) { this.descripcion = v; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String v) { this.responsable = v; }
    public LocalDate getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(LocalDate v) { this.fechaLimite = v; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
