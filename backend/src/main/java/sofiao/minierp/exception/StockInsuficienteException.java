package sofiao.minierp.exception;

/**
 * Se lanza cuando una venta intenta despachar más unidades de las que hay
 * disponibles. Ya que se exige que el sistema garantice esto antes de
 * completar la operación, y que nunca se permitan existencias negativas.
 */
public class StockInsuficienteException extends RuntimeException {
    public StockInsuficienteException(String productoNombre, int solicitado, int disponible) {
        super("Stock insuficiente para \"%s\": solicitado %d, disponible %d"
                .formatted(productoNombre, solicitado, disponible));
    }
}
