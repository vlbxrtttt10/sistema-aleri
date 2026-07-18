package com.aleri.ssoma.controller;

import com.aleri.ssoma.dto.IncidenteDetalleDto;
import com.aleri.ssoma.entity.Incidente;
import com.aleri.ssoma.entity.FotoIncidente;
import com.aleri.ssoma.entity.ReporteAnalisis;
import com.aleri.ssoma.entity.Rol;
import com.aleri.ssoma.entity.Usuario;
import com.aleri.ssoma.repository.IncidenteRepository;
import com.aleri.ssoma.repository.ReporteAnalisisRepository;
import com.aleri.ssoma.service.ConfiguracionService;
import com.aleri.ssoma.service.IncidenteService;
import com.aleri.ssoma.service.InformePdfService;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/reportes")
@PreAuthorize("hasAnyRole('ADMIN','SUBADMIN','EMPRESA','SUPERVISOR','COLABORADOR')")
public class AnalisisController {

    private final IncidenteRepository incidenteRepo;
    private final ReporteAnalisisRepository analisisRepo;
    private final IncidenteService incidenteService;
    private final InformePdfService informePdfService;
    private final ConfiguracionService configuracionService;
    private final RestTemplate restTemplate = new RestTemplate();

    public AnalisisController(IncidenteRepository incidenteRepo,
                              ReporteAnalisisRepository analisisRepo,
                              IncidenteService incidenteService,
                              InformePdfService informePdfService,
                              ConfiguracionService configuracionService) {
        this.incidenteRepo = incidenteRepo;
        this.analisisRepo  = analisisRepo;
        this.incidenteService = incidenteService;
        this.informePdfService = informePdfService;
        this.configuracionService = configuracionService;
    }

    /** Devuelve análisis cacheado si ya existe; si no, llama a Claude y lo guarda. */
    @PostMapping("/analizar/{incidenteId}")
    public ResponseEntity<?> analizar(@AuthenticationPrincipal Usuario usuario,
                                      @PathVariable Long incidenteId) {
        Incidente inc = incidenteRepo.findById(incidenteId).orElse(null);
        if (inc == null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Incidente no encontrado"));
        }

        // Devolver análisis cacheado si ya existe
        Optional<ReporteAnalisis> existente = analisisRepo.findTopByIncidenteIdOrderByCreatedAtDesc(incidenteId);
        if (existente.isPresent()) {
            ReporteAnalisis ra = existente.get();
            return ResponseEntity.ok(Map.of(
                "analisis",      ra.getAnalisis(),
                "cacheado",      true,
                "fechaAnalisis", ra.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            ));
        }

        List<Map<String, Object>> content = new ArrayList<>();

        for (FotoIncidente foto : inc.getFotos()) {
            String raw = foto.getImagen();
            if (raw == null || !raw.contains(",")) continue;
            String[] parts   = raw.split(",", 2);
            String header    = parts[0];
            String base64    = parts[1];
            String mediaType = header.contains("png") ? "image/png"
                             : header.contains("webp") ? "image/webp" : "image/jpeg";

            content.add(Map.of(
                "type", "image",
                "source", Map.of(
                    "type", "base64",
                    "media_type", mediaType,
                    "data", base64
                )
            ));
        }

        content.add(Map.of("type", "text", "text", construirPrompt(inc)));

        String apiKey = configuracionService.obtenerAnthropicApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.internalServerError()
                .body(Map.of("mensaje", "No hay una API key de Anthropic configurada. Ve a Administradores y configúrala."));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
            "model", "claude-sonnet-4-5",
            "max_tokens", 4000,
            "messages", List.of(Map.of("role", "user", "content", content))
        );

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.anthropic.com/v1/messages", request, Map.class);

            List<Map<String, Object>> respContent = (List<Map<String, Object>>) response.getBody().get("content");
            String texto = (String) respContent.get(0).get("text");

            ReporteAnalisis nuevo = new ReporteAnalisis();
            nuevo.setIncidente(inc);
            nuevo.setAnalisis(texto);
            analisisRepo.save(nuevo);

            return ResponseEntity.ok(Map.of(
                "analisis", texto,
                "cacheado", false
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("mensaje", "Error al contactar la IA: " + e.getMessage()));
        }
    }

    /** Descarga el informe PDF con los datos del incidente y el análisis de la IA ya generado. */
    @GetMapping("/analizar/{incidenteId}/pdf")
    public ResponseEntity<?> descargarPdf(@AuthenticationPrincipal Usuario usuario,
                                          @PathVariable Long incidenteId) {
        ReporteAnalisis ra = analisisRepo.findTopByIncidenteIdOrderByCreatedAtDesc(incidenteId).orElse(null);
        if (ra == null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Este incidente aún no tiene un análisis generado"));
        }

        try {
            IncidenteDetalleDto detalle = incidenteService.detalle(usuario, incidenteId);
            String fecha = ra.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            byte[] pdf = informePdfService.generarInformeAnalisis(detalle, ra.getAnalisis(), fecha);

            String nombreArchivo = "informe-" + (detalle.getCodigo() != null ? detalle.getCodigo() : incidenteId) + ".pdf";
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("mensaje", "Error al generar el PDF"));
        }
    }

    /** Elimina un registro de análisis del historial (limpieza de duplicados). */
    @DeleteMapping("/analisis/{id}")
    public ResponseEntity<?> eliminarAnalisis(@AuthenticationPrincipal Usuario usuario,
                                              @PathVariable Long id) {
        boolean esAdmin = usuario.getRol() == Rol.ADMIN || usuario.getRol() == Rol.SUBADMIN;
        ReporteAnalisis ra = analisisRepo.findById(id).orElse(null);
        if (ra == null || (!esAdmin && (usuario.getEmpresa() == null
                || !ra.getIncidente().getEmpresa().getId().equals(usuario.getEmpresa().getId())))) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Análisis no encontrado"));
        }
        analisisRepo.delete(ra);
        return ResponseEntity.ok(Map.of("mensaje", "Análisis eliminado"));
    }

    /** Historial de análisis: global para ADMIN/SUBADMIN, o de la empresa del usuario autenticado. */
    @GetMapping("/historial")
    public ResponseEntity<?> historial(@AuthenticationPrincipal Usuario usuario) {
        boolean esAdmin = usuario.getRol() == Rol.ADMIN || usuario.getRol() == Rol.SUBADMIN;
        List<ReporteAnalisis> lista = esAdmin
                ? analisisRepo.findAllByOrderByCreatedAtDesc()
                : analisisRepo.findByIncidenteEmpresaIdOrderByCreatedAtDesc(usuario.getEmpresa().getId());

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        List<Map<String, Object>> result = lista.stream().map(ra -> {
            String preview = ra.getAnalisis()
                .replaceAll("##[^\\n]*", "")
                .replaceAll("\\*+", "")
                .replaceAll("-{3,}", "")
                .replaceAll("\\n+", " ")
                .trim();
            if (preview.length() > 120) preview = preview.substring(0, 120) + "...";

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", ra.getId());
            item.put("incidenteId", ra.getIncidente().getId());
            item.put("codigo", ra.getIncidente().getCodigo());
            item.put("tipo", ra.getIncidente().getTipo());
            item.put("area", ra.getIncidente().getArea() != null ? ra.getIncidente().getArea() : "");
            if (esAdmin) {
                item.put("empresa", ra.getIncidente().getEmpresa() != null ? ra.getIncidente().getEmpresa().getNombre() : "");
            }
            item.put("fecha", fmt.format(ra.getCreatedAt()));
            item.put("preview", preview);
            item.put("analisis", ra.getAnalisis());
            return item;
        }).toList();

        return ResponseEntity.ok(result);
    }

    private String construirPrompt(Incidente inc) {
        return """
            Eres un experto en Seguridad y Salud Ocupacional (SSOMA). Analiza el siguiente incidente/accidente laboral y proporciona un informe estructurado en español.

            DATOS DEL INCIDENTE:
            - Código: %s
            - Tipo: %s
            - Fecha: %s | Hora: %s
            - Área: %s
            - Descripción: %s
            - Tarea realizada: %s
            - Agente causante: %s
            - Parte del cuerpo afectada: %s
            - Naturaleza de la lesión: %s
            - Actos subestándares: %s
            - Condiciones subestándares: %s
            - Factores personales: %s
            - Factores de trabajo: %s

            Proporciona tu análisis en el siguiente formato exacto:

            ## 🔍 Análisis del Incidente
            [Explica qué ocurrió y por qué, en 2-3 párrafos claros]

            ## ⚠️ Causas Raíz Identificadas
            [Lista las causas raíz inmediatas y subyacentes]

            ## ✅ Acciones Correctivas Recomendadas
            [Lista acciones concretas para corregir la situación actual]

            ## 🛡️ Medidas Preventivas (que NO vuelva a ocurrir)
            [Lista medidas específicas para prevenir recurrencia]

            ## 📋 Lecciones Aprendidas
            [Puntos clave que toda la empresa debe conocer]
            """.formatted(
                inc.getCodigo(), inc.getTipo(),
                inc.getFechaOcurrencia(), inc.getHoraOcurrencia(),
                inc.getArea(), inc.getDescripcion(),
                inc.getTareaRealizada(), inc.getAgenteCausante(),
                inc.getParteCuerpoAfectada(), inc.getNaturalezaLesion(),
                inc.getActosSubestandares(), inc.getCondicionesSubestandares(),
                inc.getFactoresPersonales(), inc.getFactoresTrabajo()
        );
    }
}
