package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.DashboardResumenDto;
import com.aleri.ssoma.entity.*;
import com.aleri.ssoma.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final IncidenteRepository incidenteRepo;
    private final AsignacionEppRepository eppRepo;
    private final EppRepository catalogoEppRepo;
    private final ColaboradorRepository colaboradorRepo;
    private final SupervisorRepository supervisorRepo;
    private final EmpresaRepository empresaRepo;

    public DashboardService(IncidenteRepository incidenteRepo,
            AsignacionEppRepository eppRepo,
            EppRepository catalogoEppRepo,
            ColaboradorRepository colaboradorRepo,
            SupervisorRepository supervisorRepo,
            EmpresaRepository empresaRepo) {
        this.incidenteRepo = incidenteRepo;
        this.eppRepo = eppRepo;
        this.catalogoEppRepo = catalogoEppRepo;
        this.colaboradorRepo = colaboradorRepo;
        this.supervisorRepo = supervisorRepo;
        this.empresaRepo = empresaRepo;
    }

    public DashboardResumenDto getResumen(Usuario usuario, Long empresaId) {
        boolean esAdmin = usuario.getRol() == Rol.ADMIN || usuario.getRol() == Rol.SUBADMIN;

        if (esAdmin) {
            if (empresaId == null) {
                return getResumenGlobal();
            }
            Empresa empresa = empresaRepo.findById(empresaId)
                    .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
            return getResumenEmpresa(empresa);
        }

        // Usuario no admin: solo ve su empresa
        if (usuario.getEmpresa() == null) {
            return new DashboardResumenDto(0, 0, 0, 0, 0, 0,
                    "—", 0, null, 0);
        }
        return getResumenEmpresa(usuario.getEmpresa());
    }

    /* Resumen consolidado de toda la plataforma (solo admin sin filtro) */
    private DashboardResumenDto getResumenGlobal() {
        long totalColaboradores = colaboradorRepo.count();
        long totalIncidentes = incidenteRepo.count();
        long totalUnidadesEpp = catalogoEppRepo.sumStockTotalGlobal(); // suma stockTotal del catálogo
        long cerrados = incidenteRepo.countByEstado(EstadoIncidente.CERRADO);
        long totalSupervisores = supervisorRepo.count();

        return new DashboardResumenDto(
                totalIncidentes, 0L, 0L,
                totalColaboradores, cerrados, totalUnidadesEpp,
                "GLOBAL", (int) totalSupervisores, null, totalColaboradores
        );
    }

    /* Resumen filtrado para una empresa concreta */
    private DashboardResumenDto getResumenEmpresa(Empresa empresa) {
        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        LocalDate fin15dias = hoy.plusDays(15);

        long incidentesMes = incidenteRepo.countByEmpresaAndFechaOcurrenciaBetween(empresa, inicioMes, hoy);
        long accidentesMes = incidenteRepo.countByEmpresaAndTipo(empresa, TipoIncidente.ACCIDENTE_LEVE)
                + incidenteRepo.countByEmpresaAndTipo(empresa, TipoIncidente.ACCIDENTE_INCAPACITANTE)
                + incidenteRepo.countByEmpresaAndTipo(empresa, TipoIncidente.ACCIDENTE_MORTAL);
        long eppsVencer = eppRepo.findProximosAVencer(empresa, hoy, fin15dias).size();
        long colaboradores = colaboradorRepo.countByEmpresaAndActivoTrue(empresa);
        long cerrados = incidenteRepo.countByEmpresaAndEstado(empresa, EstadoIncidente.CERRADO);
        long eppsAsig = eppRepo.countByEmpresaAndActivoTrue(empresa);
        int supUsados = (int) supervisorRepo.countByEmpresaAndActivoTrue(empresa);
        Plan plan = empresa.getPlan();

        return new DashboardResumenDto(
                incidentesMes, accidentesMes, eppsVencer,
                colaboradores, cerrados, eppsAsig,
                plan != null ? plan.getNombre() : "—",
                supUsados,
                plan != null ? plan.getMaxSupervisores() : null,
                colaboradores
        );
    }
}
