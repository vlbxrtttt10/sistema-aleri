package com.aleri.ssoma.dto;

import com.aleri.ssoma.entity.CategoriaEpp;
import java.time.LocalDateTime;

public class EppDto {

    private Long id;
    private String nombre;
    private String descripcion;
    private CategoriaEpp categoria;
    private Integer stockTotal;
    private Integer stockDisponible;
    private Integer stockAsignado;
    private String imagenUrl;
    private Boolean activo;
    private LocalDateTime createdAt;

    public EppDto() {}

    public EppDto(Long id, String nombre, String descripcion, CategoriaEpp categoria,
                  Integer stockTotal, Integer stockDisponible, Integer stockAsignado,
                  String imagenUrl, Boolean activo, LocalDateTime createdAt) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.stockTotal = stockTotal;
        this.stockDisponible = stockDisponible;
        this.stockAsignado = stockAsignado;
        this.imagenUrl = imagenUrl;
        this.activo = activo;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public CategoriaEpp getCategoria() { return categoria; }
    public void setCategoria(CategoriaEpp categoria) { this.categoria = categoria; }

    public Integer getStockTotal() { return stockTotal; }
    public void setStockTotal(Integer stockTotal) { this.stockTotal = stockTotal; }

    public Integer getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(Integer stockDisponible) { this.stockDisponible = stockDisponible; }

    public Integer getStockAsignado() { return stockAsignado; }
    public void setStockAsignado(Integer stockAsignado) { this.stockAsignado = stockAsignado; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
