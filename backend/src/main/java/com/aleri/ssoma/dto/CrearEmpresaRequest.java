package com.aleri.ssoma.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CrearEmpresaRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "El RUC es obligatorio")
    @Size(min = 11, max = 20, message = "RUC inválido")
    private String ruc;

    @Size(max = 200)
    private String direccion;

    @Size(max = 100)
    private String contactoEmail;

    @Size(max = 20)
    private String contactoTelefono;

    @NotNull(message = "El plan es obligatorio")
    private Long planId;

    public String getNombre()             { return nombre; }
    public void   setNombre(String v)     { this.nombre = v; }
    public String getRuc()                { return ruc; }
    public void   setRuc(String v)        { this.ruc = v; }
    public String getDireccion()          { return direccion; }
    public void   setDireccion(String v)  { this.direccion = v; }
    public String getContactoEmail()      { return contactoEmail; }
    public void   setContactoEmail(String v) { this.contactoEmail = v; }
    public String getContactoTelefono()   { return contactoTelefono; }
    public void   setContactoTelefono(String v) { this.contactoTelefono = v; }
    public Long   getPlanId()             { return planId; }
    public void   setPlanId(Long v)       { this.planId = v; }
}