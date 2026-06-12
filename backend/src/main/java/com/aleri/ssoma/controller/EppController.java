package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.AsignacionEppRequest;
import com.aleri.ssoma.entity.*;
import com.aleri.ssoma.repository.AsignacionEppRepository;
import com.aleri.ssoma.repository.ColaboradorRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/epps")
public class EppController {

    private final AsignacionEppRepository eppRepo;
    private final ColaboradorRepository   colaboradorRepo;

    public EppController(AsignacionEppRepository eppRepo, ColaboradorRepository colaboradorRepo) {
        this.eppRepo         = eppRepo;
        this.colaboradorRepo = colaboradorRepo;
    }

    @GetMapping
    public ResponseEntity<List<AsignacionEpp>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(eppRepo.findByEmpresaAndActivoTrue(usuario.getEmpresa()));
    }

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> resumen(@AuthenticationPrincipal Usuario usuario) {
        LocalDate hoy = LocalDate.now();
        List<AsignacionEpp> todos    = eppRepo.findByEmpresaAndActivoTrue(usuario.getEmpresa());
        List<AsignacionEpp> proximos = eppRepo.findProximosAVencer(usuario.getEmpresa(), hoy, hoy.plusDays(30));
        long vigentes = todos.stream()
            .filter(e -> e.getFechaVencimiento() == null || e.getFechaVencimiento().isAfter(hoy))
            .count();
        Integer maxEpps = usuario.getEmpresa() != null && usuario.getEmpresa().getPlan() != null
            ? usuario.getEmpresa().getPlan().getMaxEpps() : null;
        return ResponseEntity.ok(Map.of(
            "total",           todos.size(),
            "proximosAVencer", proximos.size(),
            "vigentes",        vigentes,
            "limite",          maxEpps != null ? maxEpps : -1
        ));
    }

    @GetMapping("/colaboradores")
    public ResponseEntity<List<Colaborador>> colaboradores(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(colaboradorRepo.findByEmpresaAndActivoTrue(usuario.getEmpresa()));
    }

    @PostMapping
    public ResponseEntity<?> crear(@AuthenticationPrincipal Usuario usuario,
                                   @Valid @RequestBody AsignacionEppRequest req) {
        // Validar límite de EPPs según plan
        Integer maxEpps = usuario.getEmpresa() != null && usuario.getEmpresa().getPlan() != null
            ? usuario.getEmpresa().getPlan().getMaxEpps() : null;
        if (maxEpps != null) {
            long actual = eppRepo.countByEmpresaAndActivoTrue(usuario.getEmpresa());
            if (actual >= maxEpps) {
                return ResponseEntity.badRequest().body(Map.of(
                    "mensaje", "Límite de EPPs alcanzado (" + maxEpps + "). Escala tu plan para agregar más.",
                    "limiteSuperado", true,
                    "limite", maxEpps
                ));
            }
        }

        Colaborador colab = colaboradorRepo.findById(req.getColaboradorId())
            .orElseThrow(() -> new IllegalArgumentException("Colaborador no encontrado"));

        if (!colab.getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Colaborador no pertenece a tu empresa"));
        }

        AsignacionEpp epp = new AsignacionEpp();
        epp.setNombre(req.getNombre());
        epp.setCategoria(CategoriaEpp.valueOf(req.getCategoria()));
        epp.setColaborador(colab);
        epp.setEmpresa(usuario.getEmpresa());
        epp.setFechaEntrega(req.getFechaEntrega());
        epp.setFechaVencimiento(req.getFechaVencimiento());
        epp.setActivo(true);

        return ResponseEntity.ok(eppRepo.save(epp));
    }

    @GetMapping("/proximos-vencer")
    public ResponseEntity<List<AsignacionEpp>> proximosVencer(@AuthenticationPrincipal Usuario usuario) {
        LocalDate hoy = LocalDate.now();
        return ResponseEntity.ok(eppRepo.findProximosAVencer(usuario.getEmpresa(), hoy, hoy.plusDays(15)));
    }
}
