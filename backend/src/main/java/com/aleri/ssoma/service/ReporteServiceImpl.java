package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.IncidenteResumenDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ReporteServiceImpl implements ReporteService {

    private static final String[] CABECERAS = {
        "Código", "Tipo", "Estado", "Fecha Ocurrencia",
        "Hora", "Área", "Implicado", "Fecha Registro"
    };

    @Override
    public byte[] exportarIncidentes(List<IncidenteResumenDto> incidentes) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Incidentes");

            CellStyle estiloEncabezado = crearEstiloEncabezado(workbook);

            Row encabezado = sheet.createRow(0);
            for (int i = 0; i < CABECERAS.length; i++) {
                Cell cell = encabezado.createCell(i);
                cell.setCellValue(CABECERAS[i]);
                cell.setCellStyle(estiloEncabezado);
                sheet.setColumnWidth(i, 5000);
            }

            int fila = 1;
            for (IncidenteResumenDto inc : incidentes) {
                Row row = sheet.createRow(fila++);
                row.createCell(0).setCellValue(inc.getCodigo());
                row.createCell(1).setCellValue(inc.getTipo());
                row.createCell(2).setCellValue(inc.getEstado());
                row.createCell(3).setCellValue(
                    inc.getFechaOcurrencia() != null ? inc.getFechaOcurrencia().toString() : "");
                row.createCell(4).setCellValue(inc.getHoraOcurrencia());
                row.createCell(5).setCellValue(inc.getArea());
                row.createCell(6).setCellValue(inc.getImplicadoNombre());
                row.createCell(7).setCellValue(
                    inc.getCreatedAt() != null ? inc.getCreatedAt().toLocalDate().toString() : "");
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private CellStyle crearEstiloEncabezado(Workbook workbook) {
        CellStyle estilo = workbook.createCellStyle();
        Font fuente = workbook.createFont();
        fuente.setBold(true);
        fuente.setColor(IndexedColors.WHITE.getIndex());
        estilo.setFont(fuente);
        estilo.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        estilo.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        estilo.setAlignment(HorizontalAlignment.CENTER);
        return estilo;
    }
}
