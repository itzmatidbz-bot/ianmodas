-- SOLUCIÓN DEFINITIVA - ELIMINAR FOREIGN KEYS
-- Ejecuta esto PRIMERO en Supabase SQL Editor

-- Eliminar foreign keys existentes que están causando problemas
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_categoria_id_fkey;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_tipo_prenda_id_fkey;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_estilo_id_fkey;
ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_color_id_fkey;

-- Eliminar las columnas problemáticas
ALTER TABLE productos DROP COLUMN IF EXISTS categoria_id;
ALTER TABLE productos DROP COLUMN IF EXISTS tipo_prenda_id;
ALTER TABLE productos DROP COLUMN IF EXISTS estilo_id;
ALTER TABLE productos DROP COLUMN IF EXISTS color_id;
ALTER TABLE productos DROP COLUMN IF EXISTS genero;
ALTER TABLE productos DROP COLUMN IF EXISTS temporada;

-- Agregar las columnas nuevamente SIN foreign keys
ALTER TABLE productos 
ADD COLUMN categoria_id INTEGER,
ADD COLUMN tipo_prenda_id INTEGER,
ADD COLUMN estilo_id INTEGER,
ADD COLUMN color_id INTEGER,
ADD COLUMN genero VARCHAR(20) DEFAULT 'mujer',
ADD COLUMN temporada VARCHAR(20) DEFAULT 'todo_año';

-- Crear tablas básicas
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipos_prenda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    categoria_id INTEGER,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estilos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7),
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar datos básicos
INSERT INTO categorias (nombre, descripcion) VALUES
('Tops', 'Prendas superiores'),
('Pantalones', 'Pantalones y jeans'),
('Vestidos', 'Vestidos varios'),
('Faldas', 'Faldas de todo tipo'),
('Conjuntos', 'Sets coordinados'),
('Abrigos', 'Chaquetas y abrigos')
ON CONFLICT (nombre) DO NOTHING;

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
('Falda Midi', 4, 'Falda mediana')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO estilos (nombre, descripcion) VALUES
('Oversize', 'Corte holgado'),
('Slim', 'Corte ajustado'),
('Skinny', 'Muy ajustado'),
('Cargo', 'Con bolsillos'),
('Straight', 'Corte recto'),
('High Waist', 'Talle alto'),
('Crop', 'Cortado'),
('Wrap', 'Cruzado')
ON CONFLICT (nombre) DO NOTHING;

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
('Fucsia', '#FF1493', 'Rosa intenso')
ON CONFLICT (nombre) DO NOTHING;

-- Crear funciones RPC básicas
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

-- Vista para productos completos
CREATE OR REPLACE VIEW vista_productos_completa AS
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