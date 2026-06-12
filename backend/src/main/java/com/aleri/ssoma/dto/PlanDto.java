package com.aleri.ssoma.dto;

public class PlanDto {

    private Long    id;
    private String  nombre;
    private Integer maxSupervisores;
    private Integer maxColaboradoresPorSupervisor;

    public PlanDto() {}

    public PlanDto(Long id, String nombre, Integer maxSupervisores, Integer maxColaboradoresPorSupervisor) {
        this.id                           = id;
        this.nombre                       = nombre;
        this.maxSupervisores              = maxSupervisores;
        this.maxColaboradoresPorSupervisor = maxColaboradoresPorSupervisor;
    }

    public Long    getId()                           { return id; }
    public String  getNombre()                       { return nombre; }
    public Integer getMaxSupervisores()              { return maxSupervisores; }
    public Integer getMaxColaboradoresPorSupervisor(){ return maxColaboradoresPorSupervisor; }

    public void setId(Long v)                            { this.id = v; }
    public void setNombre(String v)                      { this.nombre = v; }
    public void setMaxSupervisores(Integer v)             { this.maxSupervisores = v; }
    public void setMaxColaboradoresPorSupervisor(Integer v){ this.maxColaboradoresPorSupervisor = v; }
}
