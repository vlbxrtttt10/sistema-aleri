package com.aleri.ssoma.entity;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "planes")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(name = "max_supervisores")
    private Integer maxSupervisores;

    @Column(name = "max_colaboradores_por_supervisor")
    private Integer maxColaboradoresPorSupervisor;

    @Column(name = "max_epps")
    private Integer maxEpps;

    @Column(nullable = false)
    private Boolean activo = true;

    @ElementCollection(fetch = FetchType.EAGER, targetClass = Modulo.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "plan_modulos",
            joinColumns = @JoinColumn(name = "plan_id")
    )
    @Column(name = "modulo", nullable = false, length = 30)
    private Set<Modulo> modulos = new HashSet<>();

    public Plan() {}

    public Plan(Long id, String nombre, Integer maxSupervisores, Integer maxColaboradoresPorSupervisor, Boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.maxSupervisores = maxSupervisores;
        this.maxColaboradoresPorSupervisor = maxColaboradoresPorSupervisor;
        this.activo = activo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Integer getMaxSupervisores() { return maxSupervisores; }
    public void setMaxSupervisores(Integer maxSupervisores) { this.maxSupervisores = maxSupervisores; }
    public Integer getMaxColaboradoresPorSupervisor() { return maxColaboradoresPorSupervisor; }
    public void setMaxColaboradoresPorSupervisor(Integer v) { this.maxColaboradoresPorSupervisor = v; }
    public Integer getMaxEpps() { return maxEpps; }
    public void setMaxEpps(Integer maxEpps) { this.maxEpps = maxEpps; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public Set<Modulo> getModulos() { return modulos; }
    public void setModulos(Set<Modulo> modulos) { this.modulos = modulos; }
}
