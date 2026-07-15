package com.aleri.ssoma.dto;

import java.util.List;

public class EmpresaEquipoDto {

    private List<SupervisorDto>        supervisores;
    private List<ColaboradorResumenDto> colaboradores;

    public EmpresaEquipoDto() {}

    public EmpresaEquipoDto(List<SupervisorDto> supervisores,
                             List<ColaboradorResumenDto> colaboradores) {
        this.supervisores  = supervisores;
        this.colaboradores = colaboradores;
    }

    public List<SupervisorDto> getSupervisores()              { return supervisores; }
    public List<ColaboradorResumenDto> getColaboradores()     { return colaboradores; }
}
