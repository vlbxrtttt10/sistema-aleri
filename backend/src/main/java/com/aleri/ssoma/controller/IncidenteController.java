package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.IncidenteDetalleDto;
import com.aleri.ssoma.dto.IncidenteRequest;
import com.aleri.ssoma.dto.IncidenteResumenDto;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.service.IncidenteService;
import com.aleri.ssoma.service.ReporteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidentes")
@PreAuthorize("hasAnyRole('ADMIN','SUBADMIN','EMPRESA','SUPERVISOR','COLABORADOR')")
public class IncidenteController {

    private final IncidenteService service;
    private final ReporteService reporteService;

    public IncidenteController(IncidenteService service, ReporteService reporteService) {
        this.service = service;
        this.reporteService = reporteService;
    }

    @GetMapping
    public ResponseEntity<?> listar(@AuthenticationPrincipal Usuario solicitante) {
        try {
            List<IncidenteResumenDto> list = service.listar(solicitante);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detalle(@AuthenticationPrincipal Usuario solicitante,
            @PathVariable Long id) {
        try {
            IncidenteDetalleDto dto = service.detalle(solicitante, id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@AuthenticationPrincipal Usuario solicitante,
            @Valid @RequestBody IncidenteRequest req) {
        try {
            return ResponseEntity.ok(service.crear(solicitante, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@AuthenticationPrincipal Usuario solicitante,
            @PathVariable Long id,
            @Valid @RequestBody IncidenteRequest req) {
        try {
            return ResponseEntity.ok(service.actualizar(solicitante, id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@AuthenticationPrincipal Usuario solicitante,
            @PathVariable Long id) {
        try {
            service.eliminar(solicitante, id);
            return ResponseEntity.ok(Map.of("mensaje", "Incidente eliminado"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping("/exportar")
    public ResponseEntity<?> exportar(@AuthenticationPrincipal Usuario solicitante) {
        try {
            List<IncidenteResumenDto> lista = service.listar(solicitante);
            byte[] excel = reporteService.exportarIncidentes(lista);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=incidentes.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excel);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("mensaje", "Error al generar el reporte"));
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@AuthenticationPrincipal Usuario solicitante,
            @PathVariable Long id,
            @RequestParam String estado) {
        try {
            return ResponseEntity.ok(service.cambiarEstado(solicitante, id, estado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}
