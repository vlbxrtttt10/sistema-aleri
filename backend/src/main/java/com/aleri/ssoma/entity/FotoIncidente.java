package com.aleri.ssoma.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * Imagen de evidencia del incidente.
 * Se almacena como base64 en la columna `imagen` (TEXT).
 */
@Entity
@Table(name = "fotos_incidente")
public class FotoIncidente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incidente_id", nullable = false)
    private Incidente incidente;

    @Column(length = 200)
    private String descripcion;

    @Column(name = "imagen", columnDefinition = "TEXT", nullable = false)
    private String imagen;     // data:image/png;base64,...

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public FotoIncidente() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Incidente getIncidente() { return incidente; }
    public void setIncidente(Incidente incidente) { this.incidente = incidente; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
