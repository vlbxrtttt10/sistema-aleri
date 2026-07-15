package com.aleri.ssoma.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EppAsignacionRequest {

    @NotNull
    private Long eppId;

    @NotNull
    private Long colaboradorId;

    @NotNull
    private LocalDate fechaEntrega;

    private LocalDate fechaVencimiento;

    private Integer cantidad; // defaults to 1 when null

    public Long getEppId() { return eppId; }
    public void setEppId(Long eppId) { this.eppId = eppId; }

    public Long getColaboradorId() { return colaboradorId; }
    public void setColaboradorId(Long colaboradorId) { this.colaboradorId = colaboradorId; }

    public LocalDate getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDate fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
