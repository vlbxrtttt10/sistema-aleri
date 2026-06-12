package com.aleri.ssoma.dto;

public class DashboardResumenDto {

    private long totalIncidentesMes;
    private long totalAccidentesMes;
    private long eppsProximosVencer;
    private long colaboradoresActivos;
    private long incidentesCerrados;
    private long eppsAsignados;
    private String planNombre;
    private int supervisoresUsados;
    private Integer supervisoresMaximo;
    private long colaboradoresUsados;

    public DashboardResumenDto() {}

    public DashboardResumenDto(long totalIncidentesMes, long totalAccidentesMes, long eppsProximosVencer,
                               long colaboradoresActivos, long incidentesCerrados, long eppsAsignados,
                               String planNombre, int supervisoresUsados, Integer supervisoresMaximo,
                               long colaboradoresUsados) {
        this.totalIncidentesMes = totalIncidentesMes;
        this.totalAccidentesMes = totalAccidentesMes;
        this.eppsProximosVencer = eppsProximosVencer;
        this.colaboradoresActivos = colaboradoresActivos;
        this.incidentesCerrados = incidentesCerrados;
        this.eppsAsignados = eppsAsignados;
        this.planNombre = planNombre;
        this.supervisoresUsados = supervisoresUsados;
        this.supervisoresMaximo = supervisoresMaximo;
        this.colaboradoresUsados = colaboradoresUsados;
    }

    public long getTotalIncidentesMes() { return totalIncidentesMes; }
    public void setTotalIncidentesMes(long v) { this.totalIncidentesMes = v; }
    public long getTotalAccidentesMes() { return totalAccidentesMes; }
    public void setTotalAccidentesMes(long v) { this.totalAccidentesMes = v; }
    public long getEppsProximosVencer() { return eppsProximosVencer; }
    public void setEppsProximosVencer(long v) { this.eppsProximosVencer = v; }
    public long getColaboradoresActivos() { return colaboradoresActivos; }
    public void setColaboradoresActivos(long v) { this.colaboradoresActivos = v; }
    public long getIncidentesCerrados() { return incidentesCerrados; }
    public void setIncidentesCerrados(long v) { this.incidentesCerrados = v; }
    public long getEppsAsignados() { return eppsAsignados; }
    public void setEppsAsignados(long v) { this.eppsAsignados = v; }
    public String getPlanNombre() { return planNombre; }
    public void setPlanNombre(String v) { this.planNombre = v; }
    public int getSupervisoresUsados() { return supervisoresUsados; }
    public void setSupervisoresUsados(int v) { this.supervisoresUsados = v; }
    public Integer getSupervisoresMaximo() { return supervisoresMaximo; }
    public void setSupervisoresMaximo(Integer v) { this.supervisoresMaximo = v; }
    public long getColaboradoresUsados() { return colaboradoresUsados; }
    public void setColaboradoresUsados(long v) { this.colaboradoresUsados = v; }
}
