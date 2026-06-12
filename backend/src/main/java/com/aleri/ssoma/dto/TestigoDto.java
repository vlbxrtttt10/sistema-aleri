package com.aleri.ssoma.dto;

public class TestigoDto {
    private Long id;
    private String nombre;
    private String dni;
    private String declaracion;

    public TestigoDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String v) { this.nombre = v; }
    public String getDni() { return dni; }
    public void setDni(String v) { this.dni = v; }
    public String getDeclaracion() { return declaracion; }
    public void setDeclaracion(String v) { this.declaracion = v; }
}
