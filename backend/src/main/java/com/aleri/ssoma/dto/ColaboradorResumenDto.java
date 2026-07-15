package com.aleri.ssoma.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ColaboradorResumenDto {

    private Long id;
    private String nombre;
    private String dni;
    private String cargo;
    private String area;
    private LocalDate fechaIngreso;
    private Boolean activo;
    private LocalDateTime createdAt;
    private Long supervisorId;
    private String supervisorNombre;

    public ColaboradorResumenDto() {}

    public ColaboradorResumenDto(Long id, String nombre, String dni, String cargo, String area,
                                  LocalDate fechaIngreso, Boolean activo, LocalDateTime createdAt,
                                  Long supervisorId, String supervisorNombre) {
        this.id               = id;
        this.nombre           = nombre;
        this.dni              = dni;
        this.cargo            = cargo;
        this.area             = area;
        this.fechaIngreso     = fechaIngreso;
        this.activo           = activo;
        this.createdAt        = createdAt;
        this.supervisorId     = supervisorId;
        this.supervisorNombre = supervisorNombre;
    }

    public Long getId()                   { return id; }
    public String getNombre()             { return nombre; }
    public String getDni()                { return dni; }
    public String getCargo()              { return cargo; }
    public String getArea()               { return area; }
    public LocalDate getFechaIngreso()    { return fechaIngreso; }
    public Boolean getActivo()            { return activo; }
    public LocalDateTime getCreatedAt()   { return createdAt; }
    public Long getSupervisorId()         { return supervisorId; }
    public String getSupervisorNombre()   { return supervisorNombre; }
}
