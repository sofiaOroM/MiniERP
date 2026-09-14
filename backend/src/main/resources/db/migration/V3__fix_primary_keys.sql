-- ============================================================
-- MiniERP - Migración V3: Corrección de tipos de claves (PK y FK)
-- ============================================================

-- ---------- Claves primarias ----------
-- Roles y Categorías se mantienen en INTEGER
-- No se alteran sus columnas ni secuencias

ALTER TABLE usuarios ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE usuarios_id_seq AS BIGINT;

ALTER TABLE productos ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE productos_id_seq AS BIGINT;

ALTER TABLE proveedores ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE proveedores_id_seq AS BIGINT;

ALTER TABLE compras ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE compras_id_seq AS BIGINT;

ALTER TABLE compra_detalle ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE compra_detalle_id_seq AS BIGINT;

ALTER TABLE clientes ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE clientes_id_seq AS BIGINT;

ALTER TABLE ventas ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE ventas_id_seq AS BIGINT;

ALTER TABLE venta_detalle ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE venta_detalle_id_seq AS BIGINT;

ALTER TABLE inventario ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE inventario_id_seq AS BIGINT;

ALTER TABLE lotes_inventario ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE lotes_inventario_id_seq AS BIGINT;

ALTER TABLE movimientos_inventario ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE movimientos_inventario_id_seq AS BIGINT;

ALTER TABLE movimiento_lote ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE movimiento_lote_id_seq AS BIGINT;

ALTER TABLE logs ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE logs_id_seq AS BIGINT;

-- ---------- Claves foráneas ----------
ALTER TABLE usuarios ALTER COLUMN rol_id TYPE INTEGER;

ALTER TABLE productos ALTER COLUMN categoria_id TYPE INTEGER;

ALTER TABLE compras ALTER COLUMN proveedor_id TYPE BIGINT;
ALTER TABLE compras ALTER COLUMN usuario_id TYPE BIGINT;

ALTER TABLE compra_detalle ALTER COLUMN compra_id TYPE BIGINT;
ALTER TABLE compra_detalle ALTER COLUMN producto_id TYPE BIGINT;

ALTER TABLE ventas ALTER COLUMN cliente_id TYPE BIGINT;
ALTER TABLE ventas ALTER COLUMN usuario_id TYPE BIGINT;

ALTER TABLE venta_detalle ALTER COLUMN venta_id TYPE BIGINT;
ALTER TABLE venta_detalle ALTER COLUMN producto_id TYPE BIGINT;

ALTER TABLE inventario ALTER COLUMN producto_id TYPE BIGINT;

ALTER TABLE lotes_inventario ALTER COLUMN producto_id TYPE BIGINT;
ALTER TABLE lotes_inventario ALTER COLUMN compra_detalle_id TYPE BIGINT;

ALTER TABLE movimientos_inventario ALTER COLUMN producto_id TYPE BIGINT;
ALTER TABLE movimientos_inventario ALTER COLUMN compra_id TYPE BIGINT;
ALTER TABLE movimientos_inventario ALTER COLUMN venta_id TYPE BIGINT;
ALTER TABLE movimientos_inventario ALTER COLUMN usuario_id TYPE BIGINT;

ALTER TABLE movimiento_lote ALTER COLUMN movimiento_id TYPE BIGINT;
ALTER TABLE movimiento_lote ALTER COLUMN lote_id TYPE BIGINT;

ALTER TABLE logs ALTER COLUMN usuario_id TYPE BIGINT;
