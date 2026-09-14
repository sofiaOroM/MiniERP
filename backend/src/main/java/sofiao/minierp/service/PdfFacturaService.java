package sofiao.minierp.service;

import sofiao.minierp.entity.Venta;
import sofiao.minierp.entity.VentaDetalle;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;

@Service
public class PdfFacturaService {

    @Value("${app.invoice.output-dir}")
    private String outputDir;

    /**
     * Genera el PDF de la factura y lo guarda en disco.
     * @return la ruta relativa guardada (para persistir en ventas.pdf_path)
     */
    public String generar(Venta venta) {
        try {
            Files.createDirectories(Path.of(outputDir));

            String html = construirHtml(venta);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(html, null);
            builder.toStream(baos);
            builder.run();

            String nombreArchivo = venta.getNumeroFactura() + ".pdf";
            File archivo = new File(outputDir, nombreArchivo);
            try (FileOutputStream fos = new FileOutputStream(archivo)) {
                fos.write(baos.toByteArray());
            }

            return "/facturas/" + nombreArchivo;
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF de la factura: " + e.getMessage(), e);
        }
    }

    private String construirHtml(Venta venta) {
        StringBuilder filas = new StringBuilder();
        for (VentaDetalle d : venta.getDetalles()) {
            filas.append("""
                <tr>
                    <td>%s</td>
                    <td style="text-align:right">%d</td>
                    <td style="text-align:right">Q %.2f</td>
                    <td style="text-align:right">Q %.2f</td>
                </tr>
                """.formatted(d.getProducto().getNombre(), d.getCantidad(), d.getPrecioUnitario(), d.getSubtotal()));
        }

        String fechaFmt = venta.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        return """
            <html>
            <head>
              <style>
                body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #222; }
                h1 { font-size: 18px; margin-bottom: 0; }
                table { width: 100%%; border-collapse: collapse; margin-top: 16px; }
                th, td { border-bottom: 1px solid #ccc; padding: 6px 4px; }
                th { text-align: left; background: #f2f2f2; }
                .totales td { border: none; }
                .totales tr:last-child td { font-weight: bold; font-size: 14px; }
              </style>
            </head>
            <body>
              <h1>Factura %s</h1>
              <p>Fecha: %s</p>
              <p><b>Cliente:</b> %s (NIT: %s)</p>
              <table>
                <thead>
                  <tr><th>Producto</th><th style="text-align:right">Cantidad</th>
                      <th style="text-align:right">Precio Unit.</th><th style="text-align:right">Subtotal</th></tr>
                </thead>
                <tbody>%s</tbody>
              </table>
              <table class="totales" style="width:250px; margin-left:auto;">
                <tr><td>Subtotal</td><td style="text-align:right">Q %.2f</td></tr>
                <tr><td>IVA (12%%)</td><td style="text-align:right">Q %.2f</td></tr>
                <tr><td>Total</td><td style="text-align:right">Q %.2f</td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                venta.getNumeroFactura(), fechaFmt,
                venta.getCliente().getNombre(), venta.getCliente().getNit(),
                filas, venta.getSubtotal(), venta.getIva(), venta.getTotal()
        );
    }
}
