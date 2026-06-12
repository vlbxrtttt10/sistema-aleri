package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.DashboardResumenDto;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/resumen")
    public ResponseEntity<?> resumen(@AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) Long empresaId) {
        try {
            DashboardResumenDto dto = dashboardService.getResumen(usuario, empresaId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}
