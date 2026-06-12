package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.IncidenteResumenDto;

import java.io.IOException;
import java.util.List;

public interface ReporteService {
    byte[] exportarIncidentes(List<IncidenteResumenDto> incidentes) throws IOException;
}
