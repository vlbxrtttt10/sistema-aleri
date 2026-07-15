package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.EppAsignacionRequest;
import com.aleri.ssoma.dto.EppDto;
import com.aleri.ssoma.dto.EppRequest;
import com.aleri.ssoma.dto.EppResumenDto;
import com.aleri.ssoma.entity.AsignacionEpp;
import com.aleri.ssoma.entity.Colaborador;
import com.aleri.ssoma.entity.Empresa;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.repository.ColaboradorRepository;
import com.aleri.ssoma.repository.EmpresaRepository;
import com.aleri.ssoma.service.EppService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/epps")
@PreAuthorize("hasAnyRole('ADMIN','SUBADMIN','EMPRESA','SUPERVISOR')")
public class EppController {

    private final EppService eppService;
    private final ColaboradorRepository colaboradorRepo;
    private final EmpresaRepository empresaRepo;

    public EppController(EppService eppService,
                         ColaboradorRepository colaboradorRepo,
                         EmpresaRepository empresaRepo) {
        this.eppService = eppService;
        this.colaboradorRepo = colaboradorRepo;
        this.empresaRepo = empresaRepo;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Empresa resolverEmpresa(Usuario usuario, Long empresaId) {
        String rol = usuario.getRol() != null ? usuario.getRol().name() : "";
        boolean esAdmin = rol.equals("ADMIN") || rol.equals("SUBADMIN");
        if (esAdmin && empresaId != null) {
            return empresaRepo.findById(empresaId)
                    .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        }
        Empresa empresa = usuario.getEmpresa();
        if (empresa == null) {
            throw new IllegalArgumentException("Usuario no tiene empresa asociada");
        }
        return empresa;
    }

    // ─── Catalog endpoints ────────────────────────────────────────────────────

    @GetMapping("/catalogo")
    public ResponseEntity<?> listarCatalogo(@AuthenticationPrincipal Usuario usuario,
                                             @RequestParam(required = false) Long empresaId) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            return ResponseEntity.ok(eppService.listarCatalogoPorEmpresa(empresa));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PostMapping("/catalogo")
    public ResponseEntity<?> crearEpp(@AuthenticationPrincipal Usuario usuario,
                                      @RequestParam(required = false) Long empresaId,
                                      @Valid @RequestBody EppRequest req) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            return ResponseEntity.ok(eppService.crearEppParaEmpresa(empresa, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PutMapping("/catalogo/{id}")
    public ResponseEntity<?> actualizarEpp(@AuthenticationPrincipal Usuario usuario,
                                            @PathVariable Long id,
                                            @RequestParam(required = false) Long empresaId,
                                            @Valid @RequestBody EppRequest req) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            return ResponseEntity.ok(eppService.actualizarEppParaEmpresa(empresa, id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @DeleteMapping("/catalogo/{id}")
    public ResponseEntity<?> eliminarEpp(@AuthenticationPrincipal Usuario usuario,
                                          @PathVariable Long id,
                                          @RequestParam(required = false) Long empresaId) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            eppService.eliminarEppParaEmpresa(empresa, id);
            return ResponseEntity.ok(Map.of("mensaje", "EPP eliminado del catálogo"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    // ─── Assignment endpoints ─────────────────────────────────────────────────

    @GetMapping("/asignaciones")
    public ResponseEntity<?> listarAsignaciones(@AuthenticationPrincipal Usuario usuario,
                                                 @RequestParam(required = false) Long empresaId) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            return ResponseEntity.ok(eppService.listarAsignacionesPorEmpresa(empresa));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PostMapping("/asignaciones")
    public ResponseEntity<?> asignar(@AuthenticationPrincipal Usuario usuario,
                                     @RequestParam(required = false) Long empresaId,
                                     @Valid @RequestBody EppAsignacionRequest req) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            return ResponseEntity.ok(eppService.asignarParaEmpresa(empresa, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @DeleteMapping("/asignaciones/{id}")
    public ResponseEntity<?> devolverEpp(@AuthenticationPrincipal Usuario usuario,
                                          @PathVariable Long id,
                                          @RequestParam(required = false) Long empresaId) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            eppService.devolverEppParaEmpresa(empresa, id);
            return ResponseEntity.ok(Map.of("mensaje", "EPP devuelto y stock restaurado"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    // ─── Dashboard / reporting endpoints ─────────────────────────────────────

    @GetMapping("/resumen")
    public ResponseEntity<?> resumen(@AuthenticationPrincipal Usuario usuario,
                                     @RequestParam(required = false) Long empresaId) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            return ResponseEntity.ok(eppService.resumenPorEmpresa(empresa));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping("/colaboradores")
    public ResponseEntity<?> colaboradores(@AuthenticationPrincipal Usuario usuario,
                                            @RequestParam(required = false) Long empresaId) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            return ResponseEntity.ok(colaboradorRepo.findByEmpresaAndActivoTrue(empresa));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping("/proximos-vencer")
    public ResponseEntity<?> proximosVencer(@AuthenticationPrincipal Usuario usuario,
                                             @RequestParam(required = false) Long empresaId) {
        try {
            Empresa empresa = resolverEmpresa(usuario, empresaId);
            return ResponseEntity.ok(eppService.proximosAVencerPorEmpresa(empresa));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
