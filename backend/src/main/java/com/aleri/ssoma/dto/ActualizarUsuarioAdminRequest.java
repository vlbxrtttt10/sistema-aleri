package com.aleri.ssoma.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class ActualizarUsuarioAdminRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo inválido")
    @Size(max = 150)
    private String email;

    /* Si viene null o vacío, no se cambia la contraseña */
    @Size(min = 6, message = "Mínimo 6 caracteres")
    private String password;

    /* ADMIN o SUBADMIN */
    @NotBlank(message = "El tipo es obligatorio")
    private String tipo;

    public String getNombre()           { return nombre; }
    public void   setNombre(String v)   { this.nombre = v; }
    public String getEmail()            { return email; }
    public void   setEmail(String v)    { this.email = v; }
    public String getPassword()         { return password; }
    public void   setPassword(String v) { this.password = v; }
    public String getTipo()             { return tipo; }
    public void   setTipo(String v)     { this.tipo = v; }
}
