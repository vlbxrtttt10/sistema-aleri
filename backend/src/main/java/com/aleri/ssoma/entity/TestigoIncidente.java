package com.aleri.ssoma.entity;

import jakarta.persistence.*;

/**
 * Testigo presencial del incidente: nombre y declaración.
 */
@Entity
@Table(name = "testigos_incidente")
public class TestigoIncidente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incidente_id", nullable = false)
    private Incidente incidente;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 20)
    private String dni;

    @Column(columnDefinition = "TEXT")
    private String declaracion;

    public TestigoIncidente() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Incidente getIncidente() { return incidente; }
    public void setIncidente(Incidente incidente) { this.incidente = incidente; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }
    public String getDeclaracion() { return declaracion; }
    public void setDeclaracion(String declaracion) { this.declaracion = declaracion; }
}
