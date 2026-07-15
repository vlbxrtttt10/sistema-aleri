package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.EppAsignacionRequest;
import com.aleri.ssoma.dto.EppDto;
import com.aleri.ssoma.dto.EppRequest;
import com.aleri.ssoma.dto.EppResumenDto;
import com.aleri.ssoma.entity.AsignacionEpp;
import com.aleri.ssoma.entity.CategoriaEpp;
import com.aleri.ssoma.entity.Colaborador;
import com.aleri.ssoma.entity.Empresa;
import com.aleri.ssoma.entity.Epp;
import com.aleri.ssoma.entity.Plan;
import com.aleri.ssoma.repository.AsignacionEppRepository;
import com.aleri.ssoma.repository.ColaboradorRepository;
import com.aleri.ssoma.repository.EppRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EppService {

    private final EppRepository eppRepo;
    private final AsignacionEppRepository asignacionEppRepo;
    private final ColaboradorRepository colaboradorRepo;

    public EppService(EppRepository eppRepo,
                      AsignacionEppRepository asignacionEppRepo,
                      ColaboradorRepository colaboradorRepo) {
        this.eppRepo = eppRepo;
        this.asignacionEppRepo = asignacionEppRepo;
        this.colaboradorRepo = colaboradorRepo;
    }

    // ─── Catalog ───────────────────────────────────────────────────────────────

    public List<EppDto> listarCatalogoPorEmpresa(Empresa empresa) {
        return eppRepo.findByEmpresaAndActivoTrue(empresa)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EppDto crearEppParaEmpresa(Empresa empresa, EppRequest req) {
        Plan plan = empresa.getPlan();
        if (plan != null && plan.getMaxEpps() != null) {
            long actual = eppRepo.countByEmpresaAndActivoTrue(empresa);
            if (actual >= plan.getMaxEpps()) {
                throw new IllegalArgumentException(
                        "Límite de EPPs en catálogo alcanzado (" + plan.getMaxEpps()
                        + "). Escala tu plan para agregar más.");
            }
        }

        CategoriaEpp categoria = parseCategoriaOrThrow(req.getCategoria());

        Epp epp = new Epp();
        epp.setNombre(req.getNombre().trim());
        epp.setDescripcion(req.getDescripcion() != null ? req.getDescripcion().trim() : null);
        epp.setCategoria(categoria);
        epp.setStockTotal(req.getStockTotal());
        epp.setStockDisponible(req.getStockTotal());
        epp.setImagenUrl(req.getImagenUrl());
        epp.setEmpresa(empresa);
        epp.setActivo(true);

        return toDto(eppRepo.save(epp));
    }

    @Transactional
    public EppDto actualizarEppParaEmpresa(Empresa empresa, Long id, EppRequest req) {
        Epp epp = eppRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("EPP no encontrado"));

        if (!epp.getEmpresa().getId().equals(empresa.getId())) {
            throw new IllegalArgumentException("EPP no pertenece a esta empresa");
        }

        CategoriaEpp categoria = parseCategoriaOrThrow(req.getCategoria());

        int stockAsignado = epp.getStockTotal() - epp.getStockDisponible();
        int nuevoStock = req.getStockTotal();

        if (nuevoStock < stockAsignado) {
            throw new IllegalArgumentException(
                    "El nuevo stock total (" + nuevoStock
                    + ") no puede ser menor que el stock actualmente asignado ("
                    + stockAsignado + ").");
        }

        epp.setNombre(req.getNombre().trim());
        epp.setDescripcion(req.getDescripcion() != null ? req.getDescripcion().trim() : null);
        epp.setCategoria(categoria);
        epp.setStockTotal(nuevoStock);
        epp.setStockDisponible(nuevoStock - stockAsignado);
        epp.setImagenUrl(req.getImagenUrl());

        return toDto(eppRepo.save(epp));
    }

    @Transactional
    public void eliminarEppParaEmpresa(Empresa empresa, Long id) {
        Epp epp = eppRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("EPP no encontrado"));

        if (!epp.getEmpresa().getId().equals(empresa.getId())) {
            throw new IllegalArgumentException("EPP no pertenece a esta empresa");
        }

        int stockAsignado = epp.getStockTotal() - epp.getStockDisponible();
        if (stockAsignado > 0) {
            throw new IllegalArgumentException(
                    "No se puede eliminar el EPP porque tiene " + stockAsignado
                    + " unidad(es) asignada(s). Devuelve primero todos los equipos.");
        }

        epp.setActivo(false);
        eppRepo.save(epp);
    }

    // ─── Assignments ───────────────────────────────────────────────────────────

    public List<AsignacionEpp> listarAsignacionesPorEmpresa(Empresa empresa) {
        return asignacionEppRepo.findByEmpresaAndActivoTrue(empresa);
    }

    @Transactional
    public AsignacionEpp asignarParaEmpresa(Empresa empresa, EppAsignacionRequest req) {
        Epp epp = eppRepo.findById(req.getEppId())
                .orElseThrow(() -> new IllegalArgumentException("EPP no encontrado en el catálogo"));

        if (!epp.getEmpresa().getId().equals(empresa.getId())) {
            throw new IllegalArgumentException("EPP no pertenece a esta empresa");
        }

        if (!Boolean.TRUE.equals(epp.getActivo())) {
            throw new IllegalArgumentException("El EPP está inactivo en el catálogo");
        }

        int cantidad = (req.getCantidad() != null && req.getCantidad() > 0) ? req.getCantidad() : 1;

        if (epp.getStockDisponible() == null || epp.getStockDisponible() < cantidad) {
            throw new IllegalArgumentException(
                    "Stock insuficiente. Disponible: " + epp.getStockDisponible()
                    + ", solicitado: " + cantidad);
        }

        Colaborador colaborador = colaboradorRepo.findById(req.getColaboradorId())
                .orElseThrow(() -> new IllegalArgumentException("Colaborador no encontrado"));

        if (!colaborador.getEmpresa().getId().equals(empresa.getId())) {
            throw new IllegalArgumentException("Colaborador no pertenece a esta empresa");
        }

        epp.setStockDisponible(epp.getStockDisponible() - cantidad);
        eppRepo.save(epp);

        AsignacionEpp asignacion = new AsignacionEpp();
        asignacion.setEpp(epp);
        asignacion.setNombre(epp.getNombre());
        asignacion.setCategoria(epp.getCategoria());
        asignacion.setColaborador(colaborador);
        asignacion.setEmpresa(empresa);
        asignacion.setFechaEntrega(req.getFechaEntrega());
        asignacion.setFechaVencimiento(req.getFechaVencimiento());
        asignacion.setActivo(true);

        return asignacionEppRepo.save(asignacion);
    }

    @Transactional
    public void devolverEppParaEmpresa(Empresa empresa, Long asignacionId) {
        AsignacionEpp asignacion = asignacionEppRepo.findById(asignacionId)
                .orElseThrow(() -> new IllegalArgumentException("Asignación no encontrada"));

        if (!asignacion.getEmpresa().getId().equals(empresa.getId())) {
            throw new IllegalArgumentException("Asignación no pertenece a esta empresa");
        }

        if (!Boolean.TRUE.equals(asignacion.getActivo())) {
            throw new IllegalArgumentException("La asignación ya fue devuelta");
        }

        asignacion.setActivo(false);
        asignacionEppRepo.save(asignacion);

        Epp epp = asignacion.getEpp();
        if (epp != null) {
            epp.setStockDisponible(epp.getStockDisponible() + 1);
            eppRepo.save(epp);
        }
    }

    // ─── Summary / reporting ───────────────────────────────────────────────────

    public EppResumenDto resumenPorEmpresa(Empresa empresa) {
        LocalDate hoy = LocalDate.now();
        LocalDate limite30 = hoy.plusDays(30);

        long totalCatalogo        = eppRepo.countByEmpresaAndActivoTrue(empresa);
        long totalUnidades        = eppRepo.sumStockTotalByEmpresa(empresa);
        long unidadesDisponibles  = eppRepo.sumStockDisponibleByEmpresa(empresa);

        List<AsignacionEpp> todasActivas = asignacionEppRepo.findByEmpresaAndActivoTrue(empresa);
        long totalAsignaciones = todasActivas.size();

        long proximosAVencer = todasActivas.stream()
                .filter(a -> a.getFechaVencimiento() != null
                        && !a.getFechaVencimiento().isBefore(hoy)
                        && !a.getFechaVencimiento().isAfter(limite30))
                .count();

        long vencidos = todasActivas.stream()
                .filter(a -> a.getFechaVencimiento() != null
                        && a.getFechaVencimiento().isBefore(hoy))
                .count();

        long vigentes = todasActivas.stream()
                .filter(a -> a.getFechaVencimiento() == null
                        || a.getFechaVencimiento().isAfter(limite30))
                .count();

        List<Epp> catalogo = eppRepo.findByEmpresaAndActivoTrue(empresa);
        long stockBajo = catalogo.stream()
                .filter(e -> e.getStockDisponible() != null && e.getStockDisponible() <= 0)
                .count();

        Plan plan = empresa.getPlan();
        int limite = (plan != null && plan.getMaxEpps() != null) ? plan.getMaxEpps() : -1;

        Map<String, Long> porCategoria = todasActivas.stream()
                .filter(a -> a.getCategoria() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getCategoria().name(),
                        Collectors.counting()
                ));

        for (CategoriaEpp cat : CategoriaEpp.values()) {
            porCategoria.putIfAbsent(cat.name(), 0L);
        }

        return new EppResumenDto(totalCatalogo, totalUnidades, unidadesDisponibles,
                totalAsignaciones, proximosAVencer, vencidos, vigentes,
                stockBajo, limite, porCategoria);
    }

    public List<AsignacionEpp> proximosAVencerPorEmpresa(Empresa empresa) {
        LocalDate hoy = LocalDate.now();
        return asignacionEppRepo.findProximosAVencer(empresa, hoy, hoy.plusDays(15));
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private CategoriaEpp parseCategoriaOrThrow(String categoria) {
        try {
            return CategoriaEpp.valueOf(categoria.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Categoría inválida: " + categoria);
        }
    }

    private EppDto toDto(Epp epp) {
        int stockAsignado = epp.getStockTotal() - epp.getStockDisponible();
        return new EppDto(
                epp.getId(),
                epp.getNombre(),
                epp.getDescripcion(),
                epp.getCategoria(),
                epp.getStockTotal(),
                epp.getStockDisponible(),
                stockAsignado,
                epp.getImagenUrl(),
                epp.getActivo(),
                epp.getCreatedAt()
        );
    }
}
