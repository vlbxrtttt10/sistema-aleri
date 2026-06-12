package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.ActualizarSupervisorRequest;
import com.aleri.ssoma.dto.CrearSupervisorRequest;
import com.aleri.ssoma.dto.SupervisorDto;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.service.SupervisorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/supervisores")
@PreAuthorize("hasRole('EMPRESA')")
public class SupervisorController {

    private final SupervisorService service;

    public SupervisorController(SupervisorService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> listar(@AuthenticationPrincipal Usuario solicitante) {
        try {
            List<SupervisorDto> list = service.listar(solicitante);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@AuthenticationPrincipal Usuario solicitante,
            @Valid @RequestBody CrearSupervisorRequest req) {
        try {
            return ResponseEntity.ok(service.crear(solicitante, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@AuthenticationPrincipal Usuario solicitante,
            @PathVariable Long id,
            @Valid @RequestBody ActualizarSupervisorRequest req) {
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
            return ResponseEntity.ok(Map.of("mensaje", "Supervisor eliminado"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}
