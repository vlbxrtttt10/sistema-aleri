package com.aleri.ssoma.dto;

public class PerfilResponse {

    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private String empresaNombre;
    private String planNombre;

    public PerfilResponse() {}

    public PerfilResponse(Long id, String nombre, String email, String rol,
                          String empresaNombre, String planNombre) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.empresaNombre = empresaNombre;
        this.planNombre = planNombre;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }
    public String getPlanNombre() { return planNombre; }
    public void setPlanNombre(String planNombre) { this.planNombre = planNombre; }
}
