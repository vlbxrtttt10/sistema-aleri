package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.LoginRequest;
import com.aleri.ssoma.dto.LoginResponse;
import com.aleri.ssoma.dto.MeResponse;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /* GET /api/auth/me — sesión actual con módulos calculados */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal Usuario usuario) {
        Long   empresaId     = usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null;
        String empresaNombre = usuario.getEmpresa() != null ? usuario.getEmpresa().getNombre() : null;
        String planNombre    = usuario.getEmpresa() != null && usuario.getEmpresa().getPlan() != null
                ? usuario.getEmpresa().getPlan().getNombre() : null;

        return ResponseEntity.ok(new MeResponse(
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                empresaId,
                empresaNombre,
                planNombre,
                authService.calcularModulos(usuario)
        ));
    }
}
