package com.aleri.ssoma.dto;

import java.time.LocalDateTime;

public class EmpresaResumenDto {

    private Long    id;
    private String  nombre;
    private String  ruc;
    private String  direccion;
    private String  contactoEmail;
    private String  contactoTelefono;
    private Long    planId;
    private String  planNombre;
    private Integer planMaxSupervisores;
    private Integer planMaxColaboradoresPorSupervisor;
    private Boolean activo;
    private LocalDateTime createdAt;

    public EmpresaResumenDto() {}

    public EmpresaResumenDto(Long id, String nombre, String ruc, String direccion,
                             String contactoEmail, String contactoTelefono,
                             Long planId, String planNombre,
                             Integer planMaxSupervisores,
                             Integer planMaxColaboradoresPorSupervisor,
                             Boolean activo, LocalDateTime createdAt) {
        this.id                               = id;
        this.nombre                           = nombre;
        this.ruc                              = ruc;
        this.direccion                        = direccion;
        this.contactoEmail                    = contactoEmail;
        this.contactoTelefono                 = contactoTelefono;
        this.planId                           = planId;
        this.planNombre                       = planNombre;
        this.planMaxSupervisores              = planMaxSupervisores;
        this.planMaxColaboradoresPorSupervisor = planMaxColaboradoresPorSupervisor;
        this.activo                           = activo;
        this.createdAt                        = createdAt;
    }

    public Long          getId()                                { return id; }
    public String        getNombre()                            { return nombre; }
    public String        getRuc()                               { return ruc; }
    public String        getDireccion()                         { return direccion; }
    public String        getContactoEmail()                     { return contactoEmail; }
    public String        getContactoTelefono()                  { return contactoTelefono; }
    public Long          getPlanId()                            { return planId; }
    public String        getPlanNombre()                        { return planNombre; }
    public Integer       getPlanMaxSupervisores()               { return planMaxSupervisores; }
    public Integer       getPlanMaxColaboradoresPorSupervisor() { return planMaxColaboradoresPorSupervisor; }
    public Boolean       getActivo()                            { return activo; }
    public LocalDateTime getCreatedAt()                         { return createdAt; }

    public void setId(Long v)               { this.id = v; }
    public void setNombre(String v)         { this.nombre = v; }
    public void setRuc(String v)            { this.ruc = v; }
    public void setDireccion(String v)      { this.direccion = v; }
    public void setContactoEmail(String v)  { this.contactoEmail = v; }
    public void setContactoTelefono(String v){ this.contactoTelefono = v; }
    public void setPlanId(Long v)           { this.planId = v; }
    public void setPlanNombre(String v)     { this.planNombre = v; }
    public void setPlanMaxSupervisores(Integer v)               { this.planMaxSupervisores = v; }
    public void setPlanMaxColaboradoresPorSupervisor(Integer v) { this.planMaxColaboradoresPorSupervisor = v; }
    public void setActivo(Boolean v)        { this.activo = v; }
    public void setCreatedAt(LocalDateTime v){ this.createdAt = v; }
}
