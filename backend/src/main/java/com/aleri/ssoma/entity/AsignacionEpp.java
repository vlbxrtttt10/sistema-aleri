package com.aleri.ssoma.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asignacion_epps")
public class AsignacionEpp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoriaEpp categoria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "epp_id")
    @JsonIgnoreProperties({"empresa", "activo", "createdAt"})
    private Epp epp;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "colaborador_id", nullable = false)
    @JsonIgnoreProperties({"empresa", "supervisor", "activo", "createdAt"})
    private Colaborador colaborador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empresa_id", nullable = false)
    @JsonIgnoreProperties({"supervisores", "colaboradores", "plan", "usuario", "activo", "createdAt"})
    private Empresa empresa;

    @Column(name = "fecha_entrega", nullable = false)
    private LocalDate fechaEntrega;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public AsignacionEpp() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public CategoriaEpp getCategoria() { return categoria; }
    public void setCategoria(CategoriaEpp categoria) { this.categoria = categoria; }
    public Epp getEpp() { return epp; }
    public void setEpp(Epp epp) { this.epp = epp; }
    public Colaborador getColaborador() { return colaborador; }
    public void setColaborador(Colaborador colaborador) { this.colaborador = colaborador; }
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
    public LocalDate getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDate fechaEntrega) { this.fechaEntrega = fechaEntrega; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
