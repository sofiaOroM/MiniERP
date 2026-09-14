-- ============================================================
-- Mini ERP - Migración V1: Creación de esquema
-- ============================================================

-- ---------- Seguridad / Roles ----------
CREATE TABLE roles (
                       id          SERIAL PRIMARY KEY,
                       nombre      VARCHAR(50) NOT NULL UNIQUE,     -- ADMINISTRACION, COMPRAS, INVENTARIO, VENTAS
                       descripcion VARCHAR(200)
);

CREATE TABLE usuarios (
                          id             BIGSERIAL PRIMARY KEY,
                          nombre         VARCHAR(120) NOT NULL,
                          username       VARCHAR(50)  NOT NULL UNIQUE,
                          password_hash  VARCHAR(255) NOT NULL,
                          rol_id         INT NOT NULL REFERENCES roles(id),
                          activo         BOOLEAN NOT NULL DEFAULT TRUE,
                          creado_en      TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------- Productos ----------
CREATE TABLE categorias (
                            id          SERIAL PRIMARY KEY,
                            nombre      VARCHAR(80) NOT NULL UNIQUE,
                            descripcion VARCHAR(255)
);

CREATE TABLE productos (
                           id               BIGSERIAL PRIMARY KEY,
                           codigo           VARCHAR(30) NOT NULL UNIQUE,
                           nombre           VARCHAR(150) NOT NULL,
                           descripcion      VARCHAR(500),
                           categoria_id     INT NOT NULL REFERENCES categorias(id),
                           unidad_medida    VARCHAR(20) NOT NULL DEFAULT 'UNIDAD',
                           precio_venta     NUMERIC(12,2) NOT NULL CHECK (precio_venta >= 0),
                           costo_referencia NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (costo_referencia >= 0),
                           stock_minimo     INT NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
                           activo           BOOLEAN NOT NULL DEFAULT TRUE,
                           creado_en        TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------- Proveedores / Compras ----------
CREATE TABLE proveedores (
                             id        BIGSERIAL PRIMARY KEY,
                             nombre    VARCHAR(150) NOT NULL,
                             nit       VARCHAR(20)  NOT NULL UNIQUE,
                             telefono  VARCHAR(30),
                             direccion VARCHAR(255),
                             email     VARCHAR(120),
                             activo    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE compras (
                         id                BIGSERIAL PRIMARY KEY,
                         proveedor_id      INT NOT NULL REFERENCES proveedores(id),
                         usuario_id        INT NOT NULL REFERENCES usuarios(id),
                         numero_documento  VARCHAR(40) NOT NULL,
                         fecha             TIMESTAMP NOT NULL DEFAULT now(),
                         subtotal          NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
                         iva               NUMERIC(12,2) NOT NULL CHECK (iva >= 0),
                         total             NUMERIC(12,2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE compra_detalle (
                                id               BIGSERIAL PRIMARY KEY,
                                compra_id        INT NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
                                producto_id      INT NOT NULL REFERENCES productos(id),
                                cantidad         INT NOT NULL CHECK (cantidad > 0),
                                precio_unitario  NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
                                subtotal         NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- ---------- Clientes / Ventas ----------
CREATE TABLE clientes (
                          id        BIGSERIAL PRIMARY KEY,
                          nombre    VARCHAR(150) NOT NULL,
                          nit       VARCHAR(20)  NOT NULL,
                          telefono  VARCHAR(30),
                          direccion VARCHAR(255),
                          email     VARCHAR(120),
                          activo    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE ventas (
                        id               BIGSERIAL PRIMARY KEY,
                        cliente_id       INT NOT NULL REFERENCES clientes(id),
                        usuario_id       INT NOT NULL REFERENCES usuarios(id),
                        numero_factura   VARCHAR(40) NOT NULL UNIQUE,
                        fecha            TIMESTAMP NOT NULL DEFAULT now(),
                        subtotal         NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
                        iva              NUMERIC(12,2) NOT NULL CHECK (iva >= 0),
                        total            NUMERIC(12,2) NOT NULL CHECK (total >= 0),
                        pdf_path         VARCHAR(255)
);

CREATE TABLE venta_detalle (
                               id               BIGSERIAL PRIMARY KEY,
                               venta_id         INT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
                               producto_id      INT NOT NULL REFERENCES productos(id),
                               cantidad         INT NOT NULL CHECK (cantidad > 0),
                               precio_unitario  NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
                               subtotal         NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- ---------- Inventario ----------
CREATE TABLE inventario (
                            id                BIGSERIAL PRIMARY KEY,
                            producto_id       INT NOT NULL UNIQUE REFERENCES productos(id),
                            existencia_actual INT NOT NULL DEFAULT 0 CHECK (existencia_actual >= 0)
);

-- Lotes: soportan el cálculo de costo por UEPS (LIFO) o PEPS (FIFO)
CREATE TABLE lotes_inventario (
                                  id                  BIGSERIAL PRIMARY KEY,
                                  producto_id         INT NOT NULL REFERENCES productos(id),
                                  compra_detalle_id   INT REFERENCES compra_detalle(id),
                                  cantidad_inicial    INT NOT NULL CHECK (cantidad_inicial > 0),
                                  cantidad_disponible INT NOT NULL CHECK (cantidad_disponible >= 0),
                                  costo_unitario      NUMERIC(12,2) NOT NULL CHECK (costo_unitario >= 0),
                                  fecha_ingreso       TIMESTAMP NOT NULL DEFAULT now()
);
-- Kardex: historial de todos los movimientos de inventario
-- Nota: se usan dos FK nullable (compra_id / venta_id) en lugar de una
-- referencia polimórfica (referencia_tipo + referencia_id) para que Postgres
-- pueda garantizar integridad referencial real sobre el documento de origen.
CREATE TABLE movimientos_inventario (
                                        id                BIGSERIAL PRIMARY KEY,
                                        producto_id       INT NOT NULL REFERENCES productos(id),
                                        tipo_movimiento   VARCHAR(10) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA','SALIDA','AJUSTE')),
                                        cantidad          INT NOT NULL CHECK (cantidad > 0),
                                        costo_unitario    NUMERIC(12,2) NOT NULL CHECK (costo_unitario >= 0),
                                        saldo_cantidad    INT NOT NULL CHECK (saldo_cantidad >= 0),
                                        saldo_valor       NUMERIC(12,2) NOT NULL CHECK (saldo_valor >= 0),
                                        compra_id         INT REFERENCES compras(id),
                                        venta_id          INT REFERENCES ventas(id),
                                        motivo_ajuste     VARCHAR(255),
                                        fecha             TIMESTAMP NOT NULL DEFAULT now(),
                                        usuario_id        INT NOT NULL REFERENCES usuarios(id),
                                        CONSTRAINT chk_movimiento_una_referencia CHECK (
                                            NOT (compra_id IS NOT NULL AND venta_id IS NOT NULL)
                                            )
);

-- Desglose por lote de cada movimiento: resuelve la trazabilidad exacta
-- cuando una sola salida consume cantidades parciales de varios lotes
-- (caso típico de UEPS/PEPS). M:N real entre movimiento y lote.
CREATE TABLE movimiento_lote (
                                 id              BIGSERIAL PRIMARY KEY,
                                 movimiento_id   INT NOT NULL REFERENCES movimientos_inventario(id),
                                 lote_id         INT NOT NULL REFERENCES lotes_inventario(id),
                                 cantidad        INT NOT NULL CHECK (cantidad > 0),
                                 costo_unitario  NUMERIC(12,2) NOT NULL CHECK (costo_unitario >= 0)
);

-- ---------- Logs de auditoría ----------
CREATE TABLE logs (
                      id          BIGSERIAL PRIMARY KEY,
                      usuario_id  INT NOT NULL REFERENCES usuarios(id),
                      modulo      VARCHAR(50) NOT NULL,   -- PRODUCTOS, COMPRAS, VENTAS, INVENTARIO, CLIENTES, PROVEEDORES, USUARIOS
                      accion      VARCHAR(50) NOT NULL,   -- CREAR, ACTUALIZAR, ELIMINAR, CONSULTAR, LOGIN
                      descripcion VARCHAR(500),
                      fecha       TIMESTAMP NOT NULL DEFAULT now()
);


-- ---------- Sincronización de existencia_actual (safety net) ----------
-- Este trigger SOLO agrega (SUM), no decide reglas de negocio: la decisión de
-- qué lote consumir (UEPS/PEPS según paridad del producto_id) vive en el
-- servicio de Spring. El trigger garantiza que inventario.existencia_actual
-- nunca quede desincronizado respecto a los lotes, sin importar el código Java.
CREATE OR REPLACE FUNCTION fn_sync_inventario() RETURNS TRIGGER AS $$
BEGIN
UPDATE inventario
SET existencia_actual = COALESCE(
        (SELECT SUM(cantidad_disponible) FROM lotes_inventario WHERE producto_id = NEW.producto_id),
        0
                        )
WHERE producto_id = NEW.producto_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_inventario
    AFTER INSERT OR UPDATE OF cantidad_disponible ON lotes_inventario
    FOR EACH ROW EXECUTE FUNCTION fn_sync_inventario();

-- ---------- Índices de apoyo a reportes ----------
CREATE INDEX idx_compras_fecha ON compras(fecha);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_compra_detalle_producto ON compra_detalle(producto_id);
CREATE INDEX idx_venta_detalle_producto ON venta_detalle(producto_id);
CREATE INDEX idx_movimientos_producto_fecha ON movimientos_inventario(producto_id, fecha);
CREATE INDEX idx_movimiento_lote_movimiento ON movimiento_lote(movimiento_id);
CREATE INDEX idx_movimiento_lote_lote ON movimiento_lote(lote_id);
CREATE INDEX idx_lotes_producto ON lotes_inventario(producto_id);
CREATE INDEX idx_logs_usuario_fecha ON logs(usuario_id, fecha);
