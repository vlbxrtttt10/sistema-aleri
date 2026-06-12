package com.aleri.ssoma.dto;

import java.time.LocalDateTime;

public class UsuarioResumenDto {

    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private Boolean activo;
    private LocalDateTime createdAt;

    public UsuarioResumenDto() {}

    public UsuarioResumenDto(Long id, String nombre, String email,
                             String rol, Boolean activo, LocalDateTime createdAt) {
        this.id        = id;
        this.nombre    = nombre;
        this.email     = email;
        this.rol       = rol;
        this.activo    = activo;
        this.createdAt = createdAt;
    }

    public Long          getId()        { return id; }
    public String        getNombre()    { return nombre; }
    public String        getEmail()     { return email; }
    public String        getRol()       { return rol; }
    public Boolean       getActivo()    { return activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id)               { this.id = id; }
    public void setNombre(String nombre)     { this.nombre = nombre; }
    public void setEmail(String email)       { this.email = email; }
    public void setRol(String rol)           { this.rol = rol; }
    public void setActivo(Boolean activo)    { this.activo = activo; }
    public void setCreatedAt(LocalDateTime v){ this.createdAt = v; }
}
