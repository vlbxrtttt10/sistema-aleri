package com.aleri.ssoma.service;

import com.aleri.ssoma.dto.AccionCorrectivaDto;
import com.aleri.ssoma.dto.FotoIncidenteDto;
import com.aleri.ssoma.dto.IncidenteDetalleDto;
import com.aleri.ssoma.dto.TestigoDto;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

@Service
public class InformePdfServiceImpl implements InformePdfService {

    private static final Color ROSA    = new Color(0xaf, 0x21, 0x54);
    private static final Color NARANJA = new Color(0xf5, 0x82, 0x27);
    private static final Color MORADO  = new Color(0x7c, 0x3a, 0xed);
    private static final Color GRIS_TX = new Color(0x37, 0x41, 0x51);
    private static final Color GRIS_BG = new Color(0xf8, 0xfa, 0xfc);
    private static final Color GRIS_BD = new Color(0xe2, 0xe8, 0xf0);

    private static final Font F_MARCA     = new Font(Font.HELVETICA, 26, Font.BOLD, ROSA);
    private static final Font F_SUBMARCA  = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(0x6b, 0x72, 0x80));
    private static final Font F_TITULO    = new Font(Font.HELVETICA, 15, Font.BOLD, new Color(0x11, 0x18, 0x27));
    private static final Font F_SECCION   = new Font(Font.HELVETICA, 11, Font.BOLD, ROSA);
    private static final Font F_SECCION_IA= new Font(Font.HELVETICA, 11, Font.BOLD, MORADO);
    private static final Font F_LABEL     = new Font(Font.HELVETICA, 8, Font.BOLD, new Color(0x6b, 0x72, 0x80));
    private static final Font F_VALOR     = new Font(Font.HELVETICA, 9.5f, Font.NORMAL, GRIS_TX);
    private static final Font F_TEXTO     = new Font(Font.HELVETICA, 9.5f, Font.NORMAL, GRIS_TX);
    private static final Font F_FOOTER    = new Font(Font.HELVETICA, 7.5f, Font.NORMAL, new Color(0x9c, 0xa3, 0xaf));

    private static final DateTimeFormatter FMT_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public byte[] generarInformeAnalisis(IncidenteDetalleDto inc, String analisisIA, String fechaAnalisis) throws IOException {
        Document doc = new Document(PageSize.A4, 42, 42, 100, 55);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            writer.setPageEvent(new EncabezadoPiePagina(inc.getCodigo()));
            doc.open();

            agregarTitulo(doc, inc);
            agregarSeccionIdentificacion(doc, inc);
            agregarSeccionImplicado(doc, inc);
            agregarSeccionDescripcion(doc, inc);
            agregarSeccionCausas(doc, inc);
            agregarSeccionAcciones(doc, inc);
            agregarSeccionTestigos(doc, inc);
            agregarSeccionEvidencia(doc, inc);
            agregarSeccionAnalisisIA(doc, analisisIA, fechaAnalisis);

            doc.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new IOException("Error al generar el PDF: " + e.getMessage(), e);
        }
    }

    /* ───────── Encabezado / pie de página en cada hoja ───────── */

    private static class EncabezadoPiePagina extends PdfPageEventHelper {
        private final String codigo;
        EncabezadoPiePagina(String codigo) { this.codigo = codigo; }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();

            // Barra degradada superior (simulada con dos rectángulos)
            float ancho = document.getPageSize().getWidth();
            cb.saveState();
            cb.setColorFill(ROSA);
            cb.rectangle(0, document.getPageSize().getHeight() - 6, ancho / 2, 6);
            cb.fill();
            cb.setColorFill(NARANJA);
            cb.rectangle(ancho / 2, document.getPageSize().getHeight() - 6, ancho / 2, 6);
            cb.fill();
            cb.restoreState();

            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                new Phrase("aleri", F_MARCA), 42, document.getPageSize().getHeight() - 45, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                new Phrase("Sistema SSOMA · Informe de Análisis de Incidente", F_SUBMARCA),
                42, document.getPageSize().getHeight() - 62, 0);
            if (codigo != null) {
                ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase(codigo, F_SECCION), ancho - 42, document.getPageSize().getHeight() - 50, 0);
            }

            // Pie de página
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                new Phrase("ALERI SSOMA — Informe generado automáticamente. Documento de uso interno.", F_FOOTER),
                ancho / 2, 30, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                new Phrase("Página " + writer.getPageNumber(), F_FOOTER),
                ancho - 42, 30, 0);
        }
    }

    /* ───────── Secciones ───────── */

    private void agregarTitulo(Document doc, IncidenteDetalleDto inc) throws DocumentException {
        Paragraph titulo = new Paragraph("Informe de Análisis de Incidente", F_TITULO);
        titulo.setSpacingAfter(2);
        doc.add(titulo);

        String tipoLegible = legibleTipo(inc.getTipo());
        Paragraph sub = new Paragraph(
            tipoLegible + "  ·  " + (inc.getArea() != null ? inc.getArea() : "—") +
            "  ·  " + (inc.getFechaOcurrencia() != null ? inc.getFechaOcurrencia().format(FMT_FECHA) : "—"),
            F_SUBMARCA);
        sub.setSpacingAfter(16);
        doc.add(sub);
    }

    private void agregarSeccionIdentificacion(Document doc, IncidenteDetalleDto inc) throws DocumentException {
        agregarEncabezadoSeccion(doc, "1. Identificación del Evento");
        PdfPTable t = tablaDatos(2);
        agregarFila(t, "Código", inc.getCodigo());
        agregarFila(t, "Tipo", legibleTipo(inc.getTipo()));
        agregarFila(t, "Estado", inc.getEstado());
        agregarFila(t, "Fecha de ocurrencia", fmt(inc.getFechaOcurrencia()));
        agregarFila(t, "Hora", inc.getHoraOcurrencia());
        agregarFila(t, "Fecha de reporte", fmt(inc.getFechaReporte()));
        agregarFila(t, "Área", inc.getArea());
        agregarFila(t, "Planta", inc.getPlanta());
        agregarFila(t, "Proyecto", inc.getProyecto());
        agregarFila(t, "Ubicación detalle", inc.getUbicacionDetalle());
        doc.add(t);
    }

    private void agregarSeccionImplicado(Document doc, IncidenteDetalleDto inc) throws DocumentException {
        agregarEncabezadoSeccion(doc, "2. Datos del Implicado");
        PdfPTable t = tablaDatos(2);
        agregarFila(t, "Nombre completo", inc.getImplicadoNombre());
        agregarFila(t, "DNI", inc.getImplicadoDni());
        agregarFila(t, "Puesto / cargo", inc.getImplicadoPuesto());
        agregarFila(t, "Área / departamento", inc.getImplicadoArea());
        agregarFila(t, "Antigüedad (meses)", inc.getImplicadoAntiguedadMeses() != null ? inc.getImplicadoAntiguedadMeses().toString() : null);
        agregarFila(t, "Vinculación", inc.getImplicadoVinculacion());
        agregarFila(t, "Turno", inc.getImplicadoTurno());
        doc.add(t);
    }

    private void agregarSeccionDescripcion(Document doc, IncidenteDetalleDto inc) throws DocumentException {
        agregarEncabezadoSeccion(doc, "3. Descripción del Evento");
        agregarParrafoLargo(doc, "Descripción", inc.getDescripcion());
        agregarParrafoLargo(doc, "Tarea que realizaba", inc.getTareaRealizada());

        PdfPTable t = tablaDatos(2);
        agregarFila(t, "¿Tarea rutinaria?", inc.getTareaRutinaria() == null ? "—" : (inc.getTareaRutinaria() ? "Sí" : "No"));
        agregarFila(t, "Agente causante", inc.getAgenteCausante());
        agregarFila(t, "Parte del cuerpo afectada", inc.getParteCuerpoAfectada());
        agregarFila(t, "Naturaleza de la lesión", inc.getNaturalezaLesion());
        doc.add(t);
    }

    private void agregarSeccionCausas(Document doc, IncidenteDetalleDto inc) throws DocumentException {
        boolean hayContenido = noVacio(inc.getActosSubestandares()) || noVacio(inc.getCondicionesSubestandares())
            || noVacio(inc.getFactoresPersonales()) || noVacio(inc.getFactoresTrabajo());
        if (!hayContenido) return;

        agregarEncabezadoSeccion(doc, "4. Análisis de Causas");
        agregarParrafoLargo(doc, "Actos subestándares", inc.getActosSubestandares());
        agregarParrafoLargo(doc, "Condiciones subestándares", inc.getCondicionesSubestandares());
        agregarParrafoLargo(doc, "Factores personales", inc.getFactoresPersonales());
        agregarParrafoLargo(doc, "Factores de trabajo", inc.getFactoresTrabajo());
    }

    private void agregarSeccionAcciones(Document doc, IncidenteDetalleDto inc) throws DocumentException {
        List<AccionCorrectivaDto> acciones = inc.getAcciones();
        if (acciones == null || acciones.isEmpty()) return;

        agregarEncabezadoSeccion(doc, "5. Acciones Correctivas");
        PdfPTable t = new PdfPTable(new float[]{3.2f, 1.6f, 1.2f, 1f});
        t.setWidthPercentage(100);
        t.setSpacingAfter(12);
        agregarCeldaCabecera(t, "Descripción");
        agregarCeldaCabecera(t, "Responsable");
        agregarCeldaCabecera(t, "Fecha límite");
        agregarCeldaCabecera(t, "Estado");
        for (AccionCorrectivaDto a : acciones) {
            agregarCeldaDato(t, a.getDescripcion());
            agregarCeldaDato(t, a.getResponsable());
            agregarCeldaDato(t, fmt(a.getFechaLimite()));
            agregarCeldaDato(t, a.getEstado());
        }
        doc.add(t);
    }

    private void agregarSeccionTestigos(Document doc, IncidenteDetalleDto inc) throws DocumentException {
        List<TestigoDto> testigos = inc.getTestigos();
        if (testigos == null || testigos.isEmpty()) return;

        agregarEncabezadoSeccion(doc, "6. Testigos");
        for (TestigoDto tg : testigos) {
            Paragraph p = new Paragraph();
            p.add(new Chunk((tg.getNombre() != null ? tg.getNombre() : "—") +
                (noVacio(tg.getDni()) ? "  (DNI: " + tg.getDni() + ")" : ""), F_LABEL));
            doc.add(p);
            if (noVacio(tg.getDeclaracion())) {
                Paragraph decl = new Paragraph(tg.getDeclaracion(), F_TEXTO);
                decl.setSpacingAfter(8);
                decl.setIndentationLeft(10);
                doc.add(decl);
            }
        }
    }

    private void agregarSeccionEvidencia(Document doc, IncidenteDetalleDto inc) throws DocumentException {
        List<FotoIncidenteDto> fotos = inc.getFotos();
        if (fotos == null || fotos.isEmpty()) return;

        agregarEncabezadoSeccion(doc, "7. Evidencia Fotográfica");

        PdfPTable grilla = new PdfPTable(2);
        grilla.setWidthPercentage(100);
        grilla.setSpacingAfter(12);
        grilla.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        for (FotoIncidenteDto foto : fotos) {
            PdfPCell celda = new PdfPCell();
            celda.setBorderColor(GRIS_BD);
            celda.setPadding(6);

            Image img = decodificarImagen(foto.getImagen());
            if (img != null) {
                img.scaleToFit(230, 230);
                celda.addElement(img);
            } else {
                celda.addElement(new Paragraph("[Imagen no disponible]", F_LABEL));
            }
            if (noVacio(foto.getDescripcion())) {
                Paragraph desc = new Paragraph(foto.getDescripcion(), F_LABEL);
                desc.setSpacingBefore(4);
                celda.addElement(desc);
            }
            grilla.addCell(celda);
        }
        // Si es impar, cierra la fila con una celda vacía sin borde
        if (fotos.size() % 2 != 0) {
            PdfPCell vacia = new PdfPCell();
            vacia.setBorder(Rectangle.NO_BORDER);
            grilla.addCell(vacia);
        }

        doc.add(grilla);
    }

    private Image decodificarImagen(String dataUri) {
        if (!noVacio(dataUri)) return null;
        try {
            String base64 = dataUri.contains(",") ? dataUri.split(",", 2)[1] : dataUri;
            byte[] bytes = Base64.getDecoder().decode(base64);
            return Image.getInstance(bytes);
        } catch (Exception e) {
            return null;
        }
    }

    private void agregarSeccionAnalisisIA(Document doc, String analisisIA, String fechaAnalisis) throws DocumentException {
        doc.add(new Paragraph(" ", F_TEXTO));

        PdfPTable banner = new PdfPTable(1);
        banner.setWidthPercentage(100);
        banner.setSpacingBefore(6);
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(0xf5, 0xf3, 0xff));
        cell.setBorderColor(new Color(0xdd, 0xd6, 0xfe));
        cell.setBorderWidth(0.75f);
        cell.setPadding(10);

        Paragraph tituloIA = new Paragraph("Análisis Generado por Inteligencia Artificial", F_SECCION_IA);
        cell.addElement(tituloIA);
        if (noVacio(fechaAnalisis)) {
            Paragraph fecha = new Paragraph("Generado el " + fechaAnalisis, F_SUBMARCA);
            fecha.setSpacingAfter(0);
            cell.addElement(fecha);
        }
        banner.addCell(cell);
        doc.add(banner);
        doc.add(new Paragraph(" ", F_LABEL));

        if (analisisIA == null || analisisIA.isBlank()) {
            doc.add(new Paragraph("No hay análisis disponible.", F_TEXTO));
            return;
        }

        for (String bloque : analisisIA.split("\\n(?=##\\s)")) {
            String limpio = bloque.trim();
            if (limpio.isEmpty()) continue;

            String[] lineas = limpio.split("\\n", 2);
            String primera = lineas[0].trim();

            if (primera.startsWith("##")) {
                String encabezado = limpiarMarkdown(primera.replaceFirst("^##\\s*", ""));
                Paragraph h = new Paragraph(encabezado, F_SECCION_IA);
                h.setSpacingBefore(10);
                h.setSpacingAfter(4);
                doc.add(h);
                if (lineas.length > 1) agregarCuerpoIA(doc, lineas[1]);
            } else {
                agregarCuerpoIA(doc, limpio);
            }
        }
    }

    private void agregarCuerpoIA(Document doc, String cuerpo) throws DocumentException {
        for (String linea : cuerpo.split("\\n")) {
            String limpia = limpiarMarkdown(linea);
            if (limpia.isBlank()) continue;
            Paragraph p = new Paragraph(limpia, F_TEXTO);
            p.setSpacingAfter(3);
            if (limpia.matches("^[-•]\\s+.*") || limpia.matches("^\\d+\\.\\s+.*")) {
                p.setIndentationLeft(12);
            }
            doc.add(p);
        }
    }

    /* ───────── Helpers de layout ───────── */

    private void agregarEncabezadoSeccion(Document doc, String texto) throws DocumentException {
        Paragraph p = new Paragraph(texto, F_SECCION);
        p.setSpacingBefore(10);
        p.setSpacingAfter(6);
        doc.add(p);
    }

    private PdfPTable tablaDatos(int columnas) {
        PdfPTable t = new PdfPTable(columnas * 2);
        t.setWidthPercentage(100);
        t.setSpacingAfter(10);
        return t;
    }

    private void agregarFila(PdfPTable t, String label, String valor) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, F_LABEL));
        cLabel.setBackgroundColor(GRIS_BG);
        cLabel.setBorderColor(GRIS_BD);
        cLabel.setPadding(6);
        t.addCell(cLabel);

        PdfPCell cValor = new PdfPCell(new Phrase(noVacio(valor) ? valor : "—", F_VALOR));
        cValor.setBorderColor(GRIS_BD);
        cValor.setPadding(6);
        t.addCell(cValor);
    }

    private void agregarParrafoLargo(Document doc, String label, String texto) throws DocumentException {
        if (!noVacio(texto)) return;
        Paragraph lbl = new Paragraph(label, F_LABEL);
        lbl.setSpacingAfter(2);
        doc.add(lbl);
        Paragraph val = new Paragraph(texto, F_VALOR);
        val.setSpacingAfter(8);
        doc.add(val);
    }

    private void agregarCeldaCabecera(PdfPTable t, String texto) {
        PdfPCell c = new PdfPCell(new Phrase(texto, F_LABEL));
        c.setBackgroundColor(GRIS_BG);
        c.setBorderColor(GRIS_BD);
        c.setPadding(6);
        t.addCell(c);
    }

    private void agregarCeldaDato(PdfPTable t, String texto) {
        PdfPCell c = new PdfPCell(new Phrase(noVacio(texto) ? texto : "—", F_VALOR));
        c.setBorderColor(GRIS_BD);
        c.setPadding(6);
        t.addCell(c);
    }

    private String legibleTipo(String tipo) {
        if (tipo == null) return "—";
        return switch (tipo) {
            case "INCIDENTE" -> "Incidente (sin lesión)";
            case "ACCIDENTE_LEVE" -> "Accidente leve";
            case "ACCIDENTE_INCAPACITANTE" -> "Accidente incapacitante";
            case "ACCIDENTE_MORTAL" -> "Accidente mortal";
            default -> tipo;
        };
    }

    private String limpiarMarkdown(String t) {
        return t.replaceAll("\\*\\*(.*?)\\*\\*", "$1")
                .replaceAll("\\*(.*?)\\*", "$1")
                .replaceAll("^-{3,}$", "")
                .trim();
    }

    private String fmt(java.time.LocalDate d) {
        return d != null ? d.format(FMT_FECHA) : null;
    }

    private boolean noVacio(String s) {
        return s != null && !s.isBlank();
    }
}
