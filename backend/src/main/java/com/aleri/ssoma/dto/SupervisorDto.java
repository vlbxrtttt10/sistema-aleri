package com.aleri.ssoma.dto;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para listar supervisores en el front.
 * Combina datos del Supervisor + del Usuario asociado (login).
 */
public class SupervisorDto {

    private Long id;
    private Long usuarioId;
    private String nombre;
    private String email;
    private String dni;
    private String telefono;
    private String cargo;
    private String area;
    private Boolean activo;
    private LocalDateTime createdAt;

    public SupervisorDto() {}

    public SupervisorDto(Long id, Long usuarioId, String nombre, String email,
                         String dni, String telefono, String cargo, String area,
                         Boolean activo, LocalDateTime createdAt) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.email = email;
        this.dni = dni;
        this.telefono = telefono;
        this.cargo = cargo;
        this.area = area;
        this.activo = activo;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
