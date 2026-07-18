package com.aleri.ssoma.service;

import com.aleri.ssoma.entity.ConfiguracionSistema;
import com.aleri.ssoma.repository.ConfiguracionSistemaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ConfiguracionService {

    private static final String CLAVE_ANTHROPIC = "ANTHROPIC_API_KEY";

    private final ConfiguracionSistemaRepository repo;

    @Value("${app.anthropic.api-key:}")
    private String apiKeyPorDefecto;

    public ConfiguracionService(ConfiguracionSistemaRepository repo) {
        this.repo = repo;
    }

    /** La key guardada en BD tiene prioridad; si no existe, usa la de application.yml/env. */
    public String obtenerAnthropicApiKey() {
        return repo.findById(CLAVE_ANTHROPIC)
                .map(ConfiguracionSistema::getValor)
                .filter(v -> v != null && !v.isBlank())
                .orElse(apiKeyPorDefecto);
    }

    public void guardarAnthropicApiKey(String valor) {
        String limpio = valor == null ? "" : valor.trim();
        ConfiguracionSistema cfg = repo.findById(CLAVE_ANTHROPIC)
                .orElse(new ConfiguracionSistema(CLAVE_ANTHROPIC, null));
        cfg.setValor(limpio);
        repo.save(cfg);
    }

    /** Para mostrar en el panel sin revelar la key completa. */
    public String obtenerAnthropicApiKeyEnmascarada() {
        String key = obtenerAnthropicApiKey();
        if (key == null || key.isBlank()) return "";
        if (key.length() <= 8) return "••••••••";
        return key.substring(0, 6) + "••••••••" + key.substring(key.length() - 4);
    }
}
