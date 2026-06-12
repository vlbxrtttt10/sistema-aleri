package com.aleri.ssoma.dto;


public class EmpresaContadoresDto {

    private long usuarios;
    private long supervisores;
    private long colaboradores;
    private long incidentes;
    private long asignacionesEpp;

    public EmpresaContadoresDto() {}

    public EmpresaContadoresDto(long usuarios, long supervisores, long colaboradores,
                                long incidentes, long asignacionesEpp) {
        this.usuarios          = usuarios;
        this.supervisores      = supervisores;
        this.colaboradores     = colaboradores;
        this.incidentes        = incidentes;
        this.asignacionesEpp   = asignacionesEpp;
    }

    public long getUsuarios()         { return usuarios; }
    public long getSupervisores()     { return supervisores; }
    public long getColaboradores()    { return colaboradores; }
    public long getIncidentes()       { return incidentes; }
    public long getAsignacionesEpp()  { return asignacionesEpp; }

    public void setUsuarios(long v)        { this.usuarios = v; }
    public void setSupervisores(long v)    { this.supervisores = v; }
    public void setColaboradores(long v)   { this.colaboradores = v; }
    public void setIncidentes(long v)      { this.incidentes = v; }
    public void setAsignacionesEpp(long v) { this.asignacionesEpp = v; }

    /** ¿Tiene algún registro asociado? */
    public boolean hayRegistros() {
        return usuarios + supervisores + colaboradores + incidentes + asignacionesEpp > 0;
    }
}
