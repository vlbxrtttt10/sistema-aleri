package com.aleri.ssoma.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class ActualizarPerfilRequest {

    @Email
    private String email;

    private String passwordActual;

    @Size(min = 6, message = "La nueva contrasena debe tener al menos 6 caracteres")
    private String passwordNuevo;

    private String nombre;

    public ActualizarPerfilRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordActual() { return passwordActual; }
    public void setPasswordActual(String passwordActual) { this.passwordActual = passwordActual; }
    public String getPasswordNuevo() { return passwordNuevo; }
    public void setPasswordNuevo(String passwordNuevo) { this.passwordNuevo = passwordNuevo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
