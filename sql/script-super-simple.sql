-- SCRIPT SUPER SIMPLE QUE FUNCIONA - EJECUTAR EN SUPABASE
-- Sin parámetros complicados, sin DEFAULT, solo lo básico

-- PASO 1: Eliminar todo lo problemático
DROP FUNCTION IF EXISTS get_categorias_activas CASCADE;
DROP FUNCTION IF EXISTS get_tipos_prenda_por_categoria CASCADE;  
DROP FUNCTION IF EXISTS get_estilos_activos CASCADE;
DROP FUNCTION IF EXISTS get_colores_activos CASCADE;
DROP FUNCTION IF EXISTS obtener_estadisticas_dashboard CASCADE;
DROP VIEW IF EXISTS vista_productos_completa CASCADE;

-- PASO 2: Limpiar tabla productos
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_categoria_id_fkey CASCADE;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_tipo_prenda_id_fkey CASCADE;  
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_estilo_id_fkey CASCADE;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_color_id_fkey CASCADE;

ALTER TABLE productos DROP COLUMN IF EXISTS categoria_id CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS tipo_prenda_id CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS estilo_id CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS color_id CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS genero CASCADE;
ALTER TABLE productos DROP COLUMN IF EXISTS temporada CASCADE;

-- PASO 3: Eliminar tablas
DROP TABLE IF EXISTS tipos_prenda CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS estilos CASCADE;
DROP TABLE IF EXISTS colores CASCADE;

-- PASO 4: Agregar columnas limpias
ALTER TABLE productos 
ADD COLUMN categoria_id INTEGER,
ADD COLUMN tipo_prenda_id INTEGER,
ADD COLUMN estilo_id INTEGER,
ADD COLUMN color_id INTEGER,
ADD COLUMN genero VARCHAR(20) DEFAULT 'mujer',
ADD COLUMN temporada VARCHAR(20) DEFAULT 'todo_año';

-- PASO 5: Crear tablas básicas
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    activa BOOLEAN DEFAULT true
);

CREATE TABLE tipos_prenda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    categoria_id INTEGER,
    activa BOOLEAN DEFAULT true
);

CREATE TABLE estilos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    activa BOOLEAN DEFAULT true
);

CREATE TABLE colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7),
    activa BOOLEAN DEFAULT true
);

-- PASO 6: Insertar datos
INSERT INTO categorias (nombre) VALUES 
('Tops'), ('Pantalones'), ('Vestidos'), ('Faldas'), ('Conjuntos'), ('Abrigos');

INSERT INTO tipos_prenda (nombre, categoria_id) VALUES 
('Blusa', 1), ('Top', 1), ('Camiseta', 1),
('Jean', 2), ('Pantalón de Vestir', 2), ('Legging', 2),
('Vestido Casual', 3), ('Vestido de Fiesta', 3),
('Falda Mini', 4), ('Falda Midi', 4);

INSERT INTO estilos (nombre) VALUES 
('Oversize'), ('Slim'), ('Skinny'), ('Cargo'), ('Straight'), ('High Waist'), ('Crop'), ('Wrap');

INSERT INTO colores (nombre, codigo_hex) VALUES 
('Negro', '#000000'), ('Blanco', '#FFFFFF'), ('Azul', '#0066CC'), ('Rojo', '#FF0000'),
('Rosa', '#FFC0CB'), ('Verde', '#008000'), ('Gris', '#808080'), ('Marrón', '#A52A2A'),
('Denim', '#1560BD'), ('Fucsia', '#FF1493');

-- PASO 7: Funciones súper simples
CREATE FUNCTION get_categorias_activas()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, ''::TEXT as descripcion
    FROM categorias c WHERE c.activa = true ORDER BY c.nombre;
END;
$$;

CREATE FUNCTION get_tipos_prenda_por_categoria(cat_id INTEGER)
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT, categoria_id INTEGER) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT tp.id, tp.nombre, ''::TEXT as descripcion, tp.categoria_id
    FROM tipos_prenda tp 
    WHERE tp.activa = true AND (cat_id IS NULL OR tp.categoria_id = cat_id)
    ORDER BY tp.nombre;
END;
$$;

CREATE FUNCTION get_estilos_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.nombre, ''::TEXT as descripcion
    FROM estilos e WHERE e.activa = true ORDER BY e.nombre;
END;
$$;

CREATE FUNCTION get_colores_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, codigo_hex TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, COALESCE(c.codigo_hex, '') as codigo_hex, ''::TEXT as descripcion
    FROM colores c WHERE c.activa = true ORDER BY c.nombre;
END;
$$;

-- PASO 8: Vista simple
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

-- PASO 9: Función de estadísticas básica
CREATE FUNCTION obtener_estadisticas_dashboard()
RETURNS TABLE (
    total_users INTEGER,
    total_products INTEGER,
    total_categories INTEGER,
    recent_registrations INTEGER,
    active_sessions INTEGER,
    pending_orders INTEGER
) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM auth.users),
        (SELECT COUNT(*)::INTEGER FROM productos WHERE activo = true),
        (SELECT COUNT(*)::INTEGER FROM categorias WHERE activa = true),
        0::INTEGER, 0::INTEGER, 0::INTEGER;
END;
$$;