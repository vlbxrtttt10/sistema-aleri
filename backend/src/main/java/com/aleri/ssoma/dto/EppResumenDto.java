package com.aleri.ssoma.dto;

import java.util.Map;

public class EppResumenDto {

    private long totalCatalogo;
    private long totalUnidades;       // suma de stockTotal de todos los EPPs activos
    private long unidadesDisponibles; // suma de stockDisponible
    private long unidadesAsignadas;   // totalUnidades - unidadesDisponibles
    private long totalAsignaciones;
    private long proximosAVencer;
    private long vencidos;
    private long vigentes;
    private long stockBajo;
    private int limite;
    private Map<String, Long> porCategoria;

    public EppResumenDto() {}

    public EppResumenDto(long totalCatalogo, long totalUnidades, long unidadesDisponibles,
                         long totalAsignaciones, long proximosAVencer,
                         long vencidos, long vigentes, long stockBajo,
                         int limite, Map<String, Long> porCategoria) {
        this.totalCatalogo = totalCatalogo;
        this.totalUnidades = totalUnidades;
        this.unidadesDisponibles = unidadesDisponibles;
        this.unidadesAsignadas = totalUnidades - unidadesDisponibles;
        this.totalAsignaciones = totalAsignaciones;
        this.proximosAVencer = proximosAVencer;
        this.vencidos = vencidos;
        this.vigentes = vigentes;
        this.stockBajo = stockBajo;
        this.limite = limite;
        this.porCategoria = porCategoria;
    }

    public long getTotalCatalogo() { return totalCatalogo; }
    public void setTotalCatalogo(long totalCatalogo) { this.totalCatalogo = totalCatalogo; }

    public long getTotalUnidades() { return totalUnidades; }
    public void setTotalUnidades(long totalUnidades) { this.totalUnidades = totalUnidades; }

    public long getUnidadesDisponibles() { return unidadesDisponibles; }
    public void setUnidadesDisponibles(long unidadesDisponibles) { this.unidadesDisponibles = unidadesDisponibles; }

    public long getUnidadesAsignadas() { return unidadesAsignadas; }
    public void setUnidadesAsignadas(long unidadesAsignadas) { this.unidadesAsignadas = unidadesAsignadas; }

    public long getTotalAsignaciones() { return totalAsignaciones; }
    public void setTotalAsignaciones(long totalAsignaciones) { this.totalAsignaciones = totalAsignaciones; }

    public long getProximosAVencer() { return proximosAVencer; }
    public void setProximosAVencer(long proximosAVencer) { this.proximosAVencer = proximosAVencer; }

    public long getVencidos() { return vencidos; }
    public void setVencidos(long vencidos) { this.vencidos = vencidos; }

    public long getVigentes() { return vigentes; }
    public void setVigentes(long vigentes) { this.vigentes = vigentes; }

    public long getStockBajo() { return stockBajo; }
    public void setStockBajo(long stockBajo) { this.stockBajo = stockBajo; }

    public int getLimite() { return limite; }
    public void setLimite(int limite) { this.limite = limite; }

    public Map<String, Long> getPorCategoria() { return porCategoria; }
    public void setPorCategoria(Map<String, Long> porCategoria) { this.porCategoria = porCategoria; }
}
