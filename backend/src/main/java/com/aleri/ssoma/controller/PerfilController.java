package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.ActualizarPerfilRequest;
import com.aleri.ssoma.dto.PerfilResponse;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.service.PerfilService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public ResponseEntity<PerfilResponse> getPerfil(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(perfilService.getPerfil(usuario));
    }

    @PutMapping
    public ResponseEntity<?> actualizar(@AuthenticationPrincipal Usuario usuario,
                                        @Valid @RequestBody ActualizarPerfilRequest req) {
        try {
            PerfilResponse response = perfilService.actualizar(usuario, req);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}
