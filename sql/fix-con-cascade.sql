-- SOLUCIÓN DEFINITIVA CON CASCADE - EJECUTAR EN SUPABASE
-- Este script elimina todo lo que depende de las columnas problemáticas

-- PASO 1: Eliminar vistas que dependen de las columnas
DROP VIEW IF EXISTS vista_productos_completa CASCADE;

-- PASO 2: Eliminar foreign keys existentes
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_categoria_id_fkey CASCADE;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_tipo_prenda_id_fkey CASCADE;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_estilo_id_fkey CASCADE;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_color_id_fkey CASCADE;

-- PASO 3: Eliminar las columnas problemáticas con CASCADE
ALTER TABLE productos DROP COLUMN IF EXISTS categoria_id CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS tipo_prenda_id CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS estilo_id CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS color_id CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS genero CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS temporada CASCADE;

-- PASO 4: Eliminar tablas existentes que puedan causar conflictos
DROP TABLE IF EXISTS tipos_prenda CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS estilos CASCADE;
DROP TABLE IF EXISTS colores CASCADE;

-- PASO 5: Recrear todo desde cero
-- Agregar las columnas nuevamente SIN foreign keys
ALTER TABLE productos 
ADD COLUMN categoria_id INTEGER,
ADD COLUMN tipo_prenda_id INTEGER,
ADD COLUMN estilo_id INTEGER,
ADD COLUMN color_id INTEGER,
ADD COLUMN genero VARCHAR(20) DEFAULT 'mujer',
ADD COLUMN temporada VARCHAR(20) DEFAULT 'todo_año';

-- Crear tablas básicas
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tipos_prenda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    categoria_id INTEGER,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE estilos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7),
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PASO 6: Insertar datos básicos
INSERT INTO categorias (nombre, descripcion) VALUES
('Tops', 'Prendas superiores'),
('Pantalones', 'Pantalones y jeans'),
('Vestidos', 'Vestidos varios'),
('Faldas', 'Faldas de todo tipo'),
('Conjuntos', 'Sets coordinados'),
('Abrigos', 'Chaquetas y abrigos');

INSERT INTO tipos_prenda (nombre, categoria_id, descripcion) VALUES
('Blusa', 1, 'Blusa elegante'),
('Top', 1, 'Top moderno'),
('Camiseta', 1, 'Camiseta básica'),
('Jean', 2, 'Pantalón de mezclilla'),
('Pantalón de Vestir', 2, 'Pantalón elegante'),
('Legging', 2, 'Malla ajustada'),
('Vestido Casual', 3, 'Vestido diario'),
('Vestido de Fiesta', 3, 'Vestido especial'),
('Falda Mini', 4, 'Falda corta'),
('Falda Midi', 4, 'Falda mediana');

INSERT INTO estilos (nombre, descripcion) VALUES
('Oversize', 'Corte holgado'),
('Slim', 'Corte ajustado'),
('Skinny', 'Muy ajustado'),
('Cargo', 'Con bolsillos'),
('Straight', 'Corte recto'),
('High Waist', 'Talle alto'),
('Crop', 'Cortado'),
('Wrap', 'Cruzado');

INSERT INTO colores (nombre, codigo_hex, descripcion) VALUES
('Negro', '#000000', 'Negro clásico'),
('Blanco', '#FFFFFF', 'Blanco puro'),
('Azul', '#0066CC', 'Azul clásico'),
('Rojo', '#FF0000', 'Rojo vibrante'),
('Rosa', '#FFC0CB', 'Rosa suave'),
('Verde', '#008000', 'Verde natural'),
('Gris', '#808080', 'Gris neutro'),
('Marrón', '#A52A2A', 'Marrón café'),
('Denim', '#1560BD', 'Azul mezclilla'),
('Fucsia', '#FF1493', 'Rosa intenso');

-- PASO 7: Crear funciones RPC
CREATE OR REPLACE FUNCTION get_categorias_activas()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, COALESCE(c.descripcion, '') as descripcion
    FROM categorias c
    WHERE c.activa = true
    ORDER BY c.nombre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tipos_prenda_por_categoria(categoria_id INTEGER DEFAULT NULL)
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT, categoria_id INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT tp.id, tp.nombre, COALESCE(tp.descripcion, '') as descripcion, tp.categoria_id
    FROM tipos_prenda tp
    WHERE tp.activa = true
    AND (get_tipos_prenda_por_categoria.categoria_id IS NULL OR tp.categoria_id = get_tipos_prenda_por_categoria.categoria_id)
    ORDER BY tp.nombre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_estilos_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.nombre, COALESCE(e.descripcion, '') as descripcion
    FROM estilos e
    WHERE e.activa = true
    ORDER BY e.nombre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_colores_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, codigo_hex TEXT, descripcion TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, COALESCE(c.codigo_hex, '') as codigo_hex, COALESCE(c.descripcion, '') as descripcion
    FROM colores c
    WHERE c.activa = true
    ORDER BY c.nombre;
END;
$$ LANGUAGE plpgsql;

-- PASO 8: Recrear la vista
CREATE VIEW vista_productos_completa AS
SELECT 
    p.*,
    c.nombre as categoria_nombre,
    tp.nombre as tipo_prenda_nombre,
    e.nombre as estilo_nombre,
    col.nombre as color_nombre,
    col.codigo_hex as color_hex
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN colores col ON p.color_id = col.id;

-- PASO 9: Función mejorada para dashboard
CREATE OR REPLACE FUNCTION obtener_estadisticas_dashboard()
RETURNS TABLE (
    total_users INTEGER,
    total_products INTEGER,
    total_categories INTEGER,
    recent_registrations INTEGER,
    active_sessions INTEGER,
    pending_orders INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM auth.users),
        (SELECT COUNT(*)::INTEGER FROM productos WHERE activo = true),
        (SELECT COUNT(*)::INTEGER FROM categorias WHERE activa = true),
        (SELECT COUNT(*)::INTEGER FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days'),
        (SELECT COUNT(*)::INTEGER FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '24 hours'),
        0::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;