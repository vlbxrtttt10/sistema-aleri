package com.aleri.ssoma.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Para mostrar en la tabla principal — solo campos clave.
 */
public class IncidenteResumenDto {
    private Long id;
    private String codigo;
    private String tipo;
    private String estado;
    private LocalDate fechaOcurrencia;
    private String horaOcurrencia;
    private String area;
    private String implicadoNombre;
    private LocalDateTime createdAt;

    public IncidenteResumenDto() {}

    public IncidenteResumenDto(Long id, String codigo, String tipo, String estado,
                               LocalDate fechaOcurrencia, String horaOcurrencia,
                               String area, String implicadoNombre, LocalDateTime createdAt) {
        this.id = id;
        this.codigo = codigo;
        this.tipo = tipo;
        this.estado = estado;
        this.fechaOcurrencia = fechaOcurrencia;
        this.horaOcurrencia = horaOcurrencia;
        this.area = area;
        this.implicadoNombre = implicadoNombre;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getTipo() { return tipo; }
    public String getEstado() { return estado; }
    public LocalDate getFechaOcurrencia() { return fechaOcurrencia; }
    public String getHoraOcurrencia() { return horaOcurrencia; }
    public String getArea() { return area; }
    public String getImplicadoNombre() { return implicadoNombre; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setCodigo(String v) { this.codigo = v; }
    public void setTipo(String v) { this.tipo = v; }
    public void setEstado(String v) { this.estado = v; }
    public void setFechaOcurrencia(LocalDate v) { this.fechaOcurrencia = v; }
    public void setHoraOcurrencia(String v) { this.horaOcurrencia = v; }
    public void setArea(String v) { this.area = v; }
    public void setImplicadoNombre(String v) { this.implicadoNombre = v; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}
