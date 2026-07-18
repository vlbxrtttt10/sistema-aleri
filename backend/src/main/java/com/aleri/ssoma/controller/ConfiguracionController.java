package com.aleri.ssoma.controller;

import com.aleri.ssoma.service.ConfiguracionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
@PreAuthorize("hasAnyRole('ADMIN','SUBADMIN')")
public class ConfiguracionController {

    private final ConfiguracionService service;

    public ConfiguracionController(ConfiguracionService service) {
        this.service = service;
    }

    @GetMapping("/anthropic-key")
    public ResponseEntity<?> obtener() {
        return ResponseEntity.ok(Map.of("apiKeyEnmascarada", service.obtenerAnthropicApiKeyEnmascarada()));
    }

    @PutMapping("/anthropic-key")
    public ResponseEntity<?> actualizar(@RequestBody Map<String, String> body) {
        String valor = body.get("apiKey");
        if (valor == null || valor.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La API key no puede estar vacía"));
        }
        service.guardarAnthropicApiKey(valor);
        return ResponseEntity.ok(Map.of("apiKeyEnmascarada", service.obtenerAnthropicApiKeyEnmascarada()));
    }
}
