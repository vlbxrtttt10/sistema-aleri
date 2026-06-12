package com.aleri.ssoma.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Acción correctiva o preventiva asociada a un incidente.
 * Plan de acciones para evitar la repetición.
 */
@Entity
@Table(name = "acciones_correctivas")
public class AccionCorrectiva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incidente_id", nullable = false)
    private Incidente incidente;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 150)
    private String responsable;

    @Column(name = "fecha_limite")
    private LocalDate fechaLimite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoAccion estado = EstadoAccion.PENDIENTE;

    public AccionCorrectiva() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Incidente getIncidente() { return incidente; }
    public void setIncidente(Incidente incidente) { this.incidente = incidente; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }
    public LocalDate getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(LocalDate v) { this.fechaLimite = v; }
    public EstadoAccion getEstado() { return estado; }
    public void setEstado(EstadoAccion estado) { this.estado = estado; }
}
