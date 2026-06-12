package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.*;
import com.aleri.ssoma.entity.*;
import com.aleri.ssoma.repository.ColaboradorRepository;
import com.aleri.ssoma.repository.IncidenteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IncidenteService {

    private final IncidenteRepository  incidenteRepo;
    private final ColaboradorRepository colaboradorRepo;

    public IncidenteService(IncidenteRepository incidenteRepo,
                            ColaboradorRepository colaboradorRepo) {
        this.incidenteRepo   = incidenteRepo;
        this.colaboradorRepo = colaboradorRepo;
    }

    /* ───────── Helpers ───────── */

    private boolean esAdmin(Usuario u) {
        return u.getRol() == Rol.ADMIN || u.getRol() == Rol.SUBADMIN;
    }

    /**
     * Empresa del usuario para crear/editar/eliminar.
     * - ADMIN/SUBADMIN: requieren tener empresa asignada para crear (usualmente no la tienen,
     *   por eso solo crean a través del flujo de empresa). Para listar/ver detalle, usan vista global.
     * - EMPRESA/SUPERVISOR/COLABORADOR: la suya.
     */
    private Empresa empresaDelSolicitante(Usuario solicitante) {
        if (solicitante.getEmpresa() == null) {
            throw new IllegalArgumentException("Tu cuenta no está asociada a una empresa");
        }
        return solicitante.getEmpresa();
    }

    /**
     * ¿El solicitante puede ver este incidente?
     * Admin: sí, cualquiera.
     * Resto: solo si es de su empresa.
     */
    private void verificarAcceso(Usuario solicitante, Incidente i) {
        if (esAdmin(solicitante)) return;
        if (solicitante.getEmpresa() == null
            || !i.getEmpresa().getId().equals(solicitante.getEmpresa().getId())) {
            throw new IllegalArgumentException("Este incidente no pertenece a tu empresa");
        }
    }

    /**
     * Genera un código incremental por empresa y año: INC-2026-001
     */
    private String generarCodigo(Empresa empresa) {
        int year = Year.now().getValue();
        String prefijo = "INC-" + year + "-";
        long count = incidenteRepo.countByEmpresaAndCodigoPrefijo(empresa, prefijo + "%");
        long siguiente = count + 1;
        return prefijo + String.format("%03d", siguiente);
    }

    /* ───────── Listar / detalle ───────── */

    public List<IncidenteResumenDto> listar(Usuario solicitante) {
        // Admin: vista global (todos los incidentes de todas las empresas)
        if (esAdmin(solicitante)) {
            return incidenteRepo.findAll().stream()
                    .sorted((a, b) -> {
                        if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                        if (a.getCreatedAt() == null) return 1;
                        if (b.getCreatedAt() == null) return -1;
                        return b.getCreatedAt().compareTo(a.getCreatedAt());
                    })
                    .map(this::toResumen)
                    .collect(Collectors.toList());
        }
        // Resto: solo los de su empresa
        Empresa empresa = empresaDelSolicitante(solicitante);
        return incidenteRepo.findByEmpresaOrderByCreatedAtDesc(empresa).stream()
                .map(this::toResumen)
                .collect(Collectors.toList());
    }

    public IncidenteDetalleDto detalle(Usuario solicitante, Long id) {
        Incidente i = incidenteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incidente no encontrado"));
        verificarAcceso(solicitante, i);
        return toDetalle(i);
    }

    /* ───────── Crear ───────── */

    @Transactional
    public IncidenteDetalleDto crear(Usuario solicitante, IncidenteRequest req) {
        Empresa empresa = empresaDelSolicitante(solicitante);

        Incidente i = new Incidente();
        i.setEmpresa(empresa);
        i.setRegistradoPor(solicitante);
        i.setCodigo(generarCodigo(empresa));
        i.setEstado(EstadoIncidente.REGISTRADO);
        if (req.getFechaReporte() == null) i.setFechaReporte(LocalDate.now());

        aplicarRequest(i, req);
        incidenteRepo.save(i);

        return toDetalle(i);
    }

    /* ───────── Actualizar ───────── */

    @Transactional
    public IncidenteDetalleDto actualizar(Usuario solicitante, Long id, IncidenteRequest req) {
        Incidente i = incidenteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incidente no encontrado"));
        verificarAcceso(solicitante, i);

        aplicarRequest(i, req);

        if (req.getEstado() != null && !req.getEstado().isBlank()) {
            try {
                i.setEstado(EstadoIncidente.valueOf(req.getEstado().toUpperCase()));
            } catch (IllegalArgumentException ignored) { /* deja el actual */ }
        }

        incidenteRepo.save(i);
        return toDetalle(i);
    }

    /* ───────── Eliminar ───────── */

    @Transactional
    public void eliminar(Usuario solicitante, Long id) {
        Incidente i = incidenteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incidente no encontrado"));
        verificarAcceso(solicitante, i);
        // Las relaciones se borran por orphanRemoval=true del entity
        incidenteRepo.delete(i);
    }

    /* ───────── Cambio rápido de estado ───────── */

    @Transactional
    public IncidenteDetalleDto cambiarEstado(Usuario solicitante, Long id, String nuevoEstado) {
        Incidente i = incidenteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incidente no encontrado"));
        verificarAcceso(solicitante, i);
        try {
            i.setEstado(EstadoIncidente.valueOf(nuevoEstado.toUpperCase()));
        } catch (IllegalArgumentException ignored) {
            throw new IllegalArgumentException("Estado inválido");
        }
        incidenteRepo.save(i);
        return toDetalle(i);
    }

    /* ───────── Aplicar request → entity ───────── */

    private void aplicarRequest(Incidente i, IncidenteRequest req) {
        // Sección 1
        try {
            i.setTipo(TipoIncidente.valueOf(req.getTipo().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo de evento inválido");
        }
        i.setFechaOcurrencia(req.getFechaOcurrencia());
        i.setHoraOcurrencia(trimOrNull(req.getHoraOcurrencia()));
        if (req.getFechaReporte() != null) i.setFechaReporte(req.getFechaReporte());
        i.setArea(req.getArea().trim());
        i.setPlanta(trimOrNull(req.getPlanta()));
        i.setProyecto(trimOrNull(req.getProyecto()));
        i.setUbicacionDetalle(trimOrNull(req.getUbicacionDetalle()));

        // Sección 2 — implicado
        if (req.getColaboradorId() != null) {
            Optional<Colaborador> col = colaboradorRepo.findById(req.getColaboradorId());
            i.setColaborador(col.orElse(null));
        } else {
            i.setColaborador(null);
        }
        i.setImplicadoNombre(trimOrNull(req.getImplicadoNombre()));
        i.setImplicadoDni(trimOrNull(req.getImplicadoDni()));
        i.setImplicadoPuesto(trimOrNull(req.getImplicadoPuesto()));
        i.setImplicadoArea(trimOrNull(req.getImplicadoArea()));
        i.setImplicadoAntiguedadMeses(req.getImplicadoAntiguedadMeses());
        i.setImplicadoVinculacion(parseEnum(TipoVinculacion.class, req.getImplicadoVinculacion()));
        i.setImplicadoTurno(parseEnum(TurnoTrabajo.class, req.getImplicadoTurno()));

        // Sección 3 — descripción
        i.setDescripcion(req.getDescripcion().trim());
        i.setTareaRealizada(trimOrNull(req.getTareaRealizada()));
        i.setTareaRutinaria(req.getTareaRutinaria());
        i.setAgenteCausante(trimOrNull(req.getAgenteCausante()));
        i.setParteCuerpoAfectada(trimOrNull(req.getParteCuerpoAfectada()));
        i.setNaturalezaLesion(trimOrNull(req.getNaturalezaLesion()));

        // Sección 4 — análisis
        i.setActosSubestandares(trimOrNull(req.getActosSubestandares()));
        i.setCondicionesSubestandares(trimOrNull(req.getCondicionesSubestandares()));
        i.setFactoresPersonales(trimOrNull(req.getFactoresPersonales()));
        i.setFactoresTrabajo(trimOrNull(req.getFactoresTrabajo()));

        // Sección 5 — acciones (1-N): reemplazo completo
        i.getAcciones().clear();
        if (req.getAcciones() != null) {
            for (AccionCorrectivaDto dto : req.getAcciones()) {
                if (dto.getDescripcion() == null || dto.getDescripcion().isBlank()) continue;
                AccionCorrectiva a = new AccionCorrectiva();
                a.setIncidente(i);
                a.setDescripcion(dto.getDescripcion().trim());
                a.setResponsable(trimOrNull(dto.getResponsable()));
                a.setFechaLimite(dto.getFechaLimite());
                EstadoAccion es = parseEnum(EstadoAccion.class, dto.getEstado());
                a.setEstado(es != null ? es : EstadoAccion.PENDIENTE);
                i.getAcciones().add(a);
            }
        }

        // Sección 6 — testigos
        i.getTestigos().clear();
        if (req.getTestigos() != null) {
            for (TestigoDto t : req.getTestigos()) {
                if (t.getNombre() == null || t.getNombre().isBlank()) continue;
                TestigoIncidente te = new TestigoIncidente();
                te.setIncidente(i);
                te.setNombre(t.getNombre().trim());
                te.setDni(trimOrNull(t.getDni()));
                te.setDeclaracion(trimOrNull(t.getDeclaracion()));
                i.getTestigos().add(te);
            }
        }

        // Sección 6 — fotos
        i.getFotos().clear();
        if (req.getFotos() != null) {
            for (FotoIncidenteDto f : req.getFotos()) {
                if (f.getImagen() == null || f.getImagen().isBlank()) continue;
                FotoIncidente fo = new FotoIncidente();
                fo.setIncidente(i);
                fo.setDescripcion(trimOrNull(f.getDescripcion()));
                fo.setImagen(f.getImagen());
                i.getFotos().add(fo);
            }
        }

        // Sección 6 — costos y firmas
        i.setCostosEstimados(req.getCostosEstimados());
        i.setFirmaReportante(req.getFirmaReportante());
        i.setFirmaJefeArea(req.getFirmaJefeArea());
        i.setFirmaResponsableSeguridad(req.getFirmaResponsableSeguridad());
    }

    /* ───────── Mappers ───────── */

    private IncidenteResumenDto toResumen(Incidente i) {
        return new IncidenteResumenDto(
                i.getId(),
                i.getCodigo(),
                i.getTipo() != null ? i.getTipo().name() : null,
                i.getEstado() != null ? i.getEstado().name() : null,
                i.getFechaOcurrencia(),
                i.getHoraOcurrencia(),
                i.getArea(),
                i.getImplicadoNombre(),
                i.getCreatedAt()
        );
    }

    private IncidenteDetalleDto toDetalle(Incidente i) {
        IncidenteDetalleDto d = new IncidenteDetalleDto();
        d.setId(i.getId());
        d.setCodigo(i.getCodigo());
        d.setTipo(i.getTipo() != null ? i.getTipo().name() : null);
        d.setEstado(i.getEstado() != null ? i.getEstado().name() : null);

        d.setFechaOcurrencia(i.getFechaOcurrencia());
        d.setHoraOcurrencia(i.getHoraOcurrencia());
        d.setFechaReporte(i.getFechaReporte());
        d.setArea(i.getArea());
        d.setPlanta(i.getPlanta());
        d.setProyecto(i.getProyecto());
        d.setUbicacionDetalle(i.getUbicacionDetalle());

        d.setColaboradorId(i.getColaborador() != null ? i.getColaborador().getId() : null);
        d.setImplicadoNombre(i.getImplicadoNombre());
        d.setImplicadoDni(i.getImplicadoDni());
        d.setImplicadoPuesto(i.getImplicadoPuesto());
        d.setImplicadoArea(i.getImplicadoArea());
        d.setImplicadoAntiguedadMeses(i.getImplicadoAntiguedadMeses());
        d.setImplicadoVinculacion(i.getImplicadoVinculacion() != null ? i.getImplicadoVinculacion().name() : null);
        d.setImplicadoTurno(i.getImplicadoTurno() != null ? i.getImplicadoTurno().name() : null);

        d.setDescripcion(i.getDescripcion());
        d.setTareaRealizada(i.getTareaRealizada());
        d.setTareaRutinaria(i.getTareaRutinaria());
        d.setAgenteCausante(i.getAgenteCausante());
        d.setParteCuerpoAfectada(i.getParteCuerpoAfectada());
        d.setNaturalezaLesion(i.getNaturalezaLesion());

        d.setActosSubestandares(i.getActosSubestandares());
        d.setCondicionesSubestandares(i.getCondicionesSubestandares());
        d.setFactoresPersonales(i.getFactoresPersonales());
        d.setFactoresTrabajo(i.getFactoresTrabajo());

        List<AccionCorrectivaDto> acs = new ArrayList<>();
        if (i.getAcciones() != null) {
            for (AccionCorrectiva a : i.getAcciones()) {
                AccionCorrectivaDto x = new AccionCorrectivaDto();
                x.setId(a.getId());
                x.setDescripcion(a.getDescripcion());
                x.setResponsable(a.getResponsable());
                x.setFechaLimite(a.getFechaLimite());
                x.setEstado(a.getEstado() != null ? a.getEstado().name() : null);
                acs.add(x);
            }
        }
        d.setAcciones(acs);

        List<TestigoDto> tes = new ArrayList<>();
        if (i.getTestigos() != null) {
            for (TestigoIncidente t : i.getTestigos()) {
                TestigoDto x = new TestigoDto();
                x.setId(t.getId());
                x.setNombre(t.getNombre());
                x.setDni(t.getDni());
                x.setDeclaracion(t.getDeclaracion());
                tes.add(x);
            }
        }
        d.setTestigos(tes);

        List<FotoIncidenteDto> fos = new ArrayList<>();
        if (i.getFotos() != null) {
            for (FotoIncidente f : i.getFotos()) {
                FotoIncidenteDto x = new FotoIncidenteDto();
                x.setId(f.getId());
                x.setDescripcion(f.getDescripcion());
                x.setImagen(f.getImagen());
                fos.add(x);
            }
        }
        d.setFotos(fos);

        d.setCostosEstimados(i.getCostosEstimados());
        d.setFirmaReportante(i.getFirmaReportante());
        d.setFirmaJefeArea(i.getFirmaJefeArea());
        d.setFirmaResponsableSeguridad(i.getFirmaResponsableSeguridad());

        d.setRegistradoPorNombre(i.getRegistradoPor() != null ? i.getRegistradoPor().getNombre() : null);
        d.setCreatedAt(i.getCreatedAt());
        return d;
    }

    /* ───────── Utils ───────── */

    private static String trimOrNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String v) {
        if (v == null || v.isBlank()) return null;
        try { return Enum.valueOf(type, v.trim().toUpperCase()); }
        catch (IllegalArgumentException ex) { return null; }
    }
}
