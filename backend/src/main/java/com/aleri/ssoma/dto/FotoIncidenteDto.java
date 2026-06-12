package com.aleri.ssoma.dto;

public class FotoIncidenteDto {
    private Long id;
    private String descripcion;
    private String imagen;   // base64 (data URI)

    public FotoIncidenteDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String v) { this.descripcion = v; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
}
