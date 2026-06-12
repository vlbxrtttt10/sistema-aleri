package com.aleri.ssoma.dto;

import java.util.List;

public class LoginResponse {

    private String token;
    private String nombre;
    private String email;
    private String rol;
    private Long empresaId;
    private String empresaNombre;
    private String planNombre;
    private List<String> modulos;

    public LoginResponse() {}

    public LoginResponse(String token, String nombre, String email, String rol,
                         Long empresaId, String empresaNombre,
                         String planNombre, List<String> modulos) {
        this.token = token;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.empresaId = empresaId;
        this.empresaNombre = empresaNombre;
        this.planNombre = planNombre;
        this.modulos = modulos;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }
    public String getEmpresaNombre() { return empresaNombre; }
    public void setEmpresaNombre(String empresaNombre) { this.empresaNombre = empresaNombre; }
    public String getPlanNombre() { return planNombre; }
    public void setPlanNombre(String planNombre) { this.planNombre = planNombre; }
    public List<String> getModulos() { return modulos; }
    public void setModulos(List<String> modulos) { this.modulos = modulos; }
}
