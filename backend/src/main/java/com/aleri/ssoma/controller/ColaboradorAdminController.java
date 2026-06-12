package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.ActualizarUsuarioAdminRequest;
import com.aleri.ssoma.dto.CrearUsuarioRequest;
import com.aleri.ssoma.dto.UsuarioResumenDto;
import com.aleri.ssoma.service.ColaboradorAdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios-admin")
@PreAuthorize("hasAnyRole('ADMIN','SUBADMIN')")
public class ColaboradorAdminController {

    private final ColaboradorAdminService service;

    public ColaboradorAdminController(ColaboradorAdminService service) {
        this.service = service;
    }

    /* GET /api/usuarios-admin — listar ADMIN y SUBADMIN */
    @GetMapping
    public ResponseEntity<List<UsuarioResumenDto>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    /* POST /api/usuarios-admin — crear nuevo ADMIN o SUBADMIN */
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CrearUsuarioRequest req) {
        try {
            UsuarioResumenDto dto = service.crear(req);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* PUT /api/usuarios-admin/{id} — actualizar nombre/email/tipo/password */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioAdminRequest req) {
        try {
            return ResponseEntity.ok(service.actualizar(id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* PUT /api/usuarios-admin/{id}/toggle — activar / desactivar */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        try {
            UsuarioResumenDto dto = service.toggleActivo(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}
