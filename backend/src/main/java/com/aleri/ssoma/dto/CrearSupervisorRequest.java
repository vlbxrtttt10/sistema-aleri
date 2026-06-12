package com.aleri.ssoma.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CrearSupervisorRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo inválido")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "Mínimo 6 caracteres")
    private String password;

    @Size(max = 20)
    private String dni;

    @Size(max = 20)
    private String telefono;

    @Size(max = 100)
    private String cargo;

    @Size(max = 100)
    private String area;

    public String getNombre()           { return nombre; }
    public void   setNombre(String v)   { this.nombre = v; }
    public String getEmail()            { return email; }
    public void   setEmail(String v)    { this.email = v; }
    public String getPassword()         { return password; }
    public void   setPassword(String v) { this.password = v; }
    public String getDni()              { return dni; }
    public void   setDni(String v)      { this.dni = v; }
    public String getTelefono()         { return telefono; }
    public void   setTelefono(String v) { this.telefono = v; }
    public String getCargo()            { return cargo; }
    public void   setCargo(String v)    { this.cargo = v; }
    public String getArea()             { return area; }
    public void   setArea(String v)     { this.area = v; }
}
