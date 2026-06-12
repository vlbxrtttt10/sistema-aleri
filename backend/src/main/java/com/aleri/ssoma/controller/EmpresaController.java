package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.CrearEmpresaRequest;
import com.aleri.ssoma.dto.CrearUsuarioEmpresaRequest;
import com.aleri.ssoma.dto.EmpresaResumenDto;
import com.aleri.ssoma.dto.PlanDto;
import com.aleri.ssoma.dto.UsuarioResumenDto;
import com.aleri.ssoma.service.EmpresaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
@PreAuthorize("hasAnyRole('ADMIN','SUBADMIN')")
public class EmpresaController {

    private final EmpresaService service;

    public EmpresaController(EmpresaService service) {
        this.service = service;
    }

    /* GET /api/empresas */
    @GetMapping
    public ResponseEntity<List<EmpresaResumenDto>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    /* GET /api/empresas/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.obtener(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* GET /api/empresas/planes */
    @GetMapping("/planes")
    public ResponseEntity<List<PlanDto>> listarPlanes() {
        return ResponseEntity.ok(service.listarPlanes());
    }

    /* POST /api/empresas */
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CrearEmpresaRequest req) {
        try {
            return ResponseEntity.ok(service.crear(req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* PUT /api/empresas/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id,
            @Valid @RequestBody CrearEmpresaRequest req) {
        try {
            return ResponseEntity.ok(service.actualizar(id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* GET /api/empresas/{id}/contadores — registros que se borrarían al eliminar */
    @GetMapping("/{id}/contadores")
    public ResponseEntity<?> contadores(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.contadores(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* DELETE /api/empresas/{id} — elimina la empresa y todos sus registros relacionados */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            service.eliminar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Empresa eliminada"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* ───── Usuarios EMPRESA (login del dueño de la empresa) ───── */

 /* GET /api/empresas/{id}/usuarios — usuarios EMPRESA de esa empresa */
    @GetMapping("/{id}/usuarios")
    public ResponseEntity<?> listarUsuarios(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.listarUsuarios(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* POST /api/empresas/{id}/usuarios — crear usuario EMPRESA */
    @PostMapping("/{id}/usuarios")
    public ResponseEntity<?> crearUsuario(@PathVariable Long id,
            @Valid @RequestBody CrearUsuarioEmpresaRequest req) {
        try {
            return ResponseEntity.ok(service.crearUsuarioEmpresa(id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* PUT /api/empresas/usuarios/{usuarioId}/reset-password — body: {"password":"..."} */
    @PutMapping("/usuarios/{usuarioId}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long usuarioId,
            @RequestBody Map<String, String> body) {
        try {
            String nueva = body == null ? null : body.get("password");
            return ResponseEntity.ok(service.resetPasswordUsuarioEmpresa(usuarioId, nueva));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }

    /* PUT /api/empresas/usuarios/{usuarioId}/toggle — activar/desactivar usuario EMPRESA */
    @PutMapping("/usuarios/{usuarioId}/toggle")
    public ResponseEntity<?> toggleUsuario(@PathVariable Long usuarioId) {
        try {
            return ResponseEntity.ok(service.toggleUsuarioEmpresa(usuarioId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}
