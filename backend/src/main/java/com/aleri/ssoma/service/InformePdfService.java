package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.IncidenteDetalleDto;

import java.io.IOException;

public interface InformePdfService {
    byte[] generarInformeAnalisis(IncidenteDetalleDto incidente, String analisisIA, String fechaAnalisis) throws IOException;
}
