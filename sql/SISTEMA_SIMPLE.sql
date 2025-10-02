-- SISTEMA SIMPLE Y EFECTIVO - IAN MODAS
-- Sin complicaciones, directo al grano

-- =====================================================
-- LIMPIEZA TOTAL
-- =====================================================

DROP VIEW IF EXISTS vista_productos_completa CASCADE;
DROP FUNCTION IF EXISTS get_categorias() CASCADE;
DROP FUNCTION IF EXISTS get_tipos_prenda(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_estilos(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_telas() CASCADE;
DROP FUNCTION IF EXISTS get_colores() CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;

DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS estilos CASCADE;
DROP TABLE IF EXISTS tipos_prenda CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS telas CASCADE;
DROP TABLE IF EXISTS colores CASCADE;

-- =====================================================
-- TABLAS SIMPLES
-- =====================================================

-- Categorías principales
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Tipos de prenda CON SU CATEGORÍA (sin foreign keys complicadas)
CREATE TABLE tipos_prenda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL -- Nombre directo, no FK
);

-- Estilos CON SU TIPO (sin foreign keys complicadas)
CREATE TABLE estilos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_prenda VARCHAR(100) NOT NULL, -- Nombre directo, no FK
    categoria VARCHAR(100) NOT NULL    -- Para filtrar fácil
);

-- Telas
CREATE TABLE telas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Colores
CREATE TABLE colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7)
);

-- Productos (SIMPLE - SIN STOCK)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    categoria VARCHAR(100) NOT NULL,
    tipo_prenda VARCHAR(100),
    estilo VARCHAR(100),
    tela VARCHAR(100),
    color VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- DATOS REALES Y SIMPLES
-- =====================================================

-- Categorías
INSERT INTO categorias (nombre) VALUES 
('Ropa Interior'), ('Calzado'), ('Tops'), ('Pantalones'), ('Vestidos'),
('Faldas'), ('Conjuntos'), ('Abrigos'), ('Buzos'), ('Camperas'),
('Tapados'), ('Accesorios'), ('Pijamas'), ('Trajes de Baño'), ('Deportiva');

-- Tipos de prenda POR CATEGORÍA (súper claro)
INSERT INTO tipos_prenda (nombre, categoria) VALUES 
-- Ropa Interior
('Calzones', 'Ropa Interior'), ('Tanga', 'Ropa Interior'), ('Bombacha', 'Ropa Interior'),
('Corpiño', 'Ropa Interior'), ('Conjunto Lencería', 'Ropa Interior'), ('Body', 'Ropa Interior'),

-- Calzado  
('Zapatillas', 'Calzado'), ('Botas', 'Calzado'), ('Botinetas', 'Calzado'),
('Sandalias', 'Calzado'), ('Zapatos', 'Calzado'), ('Stilettos', 'Calzado'),

-- Tops
('Blusa', 'Tops'), ('Camiseta', 'Tops'), ('Top', 'Tops'),
('Camisa', 'Tops'), ('Body', 'Tops'), ('Crop Top', 'Tops'),

-- Pantalones
('Jean', 'Pantalones'), ('Pantalón de Vestir', 'Pantalones'), ('Legging', 'Pantalones'),
('Jogging', 'Pantalones'), ('Short', 'Pantalones'), ('Palazzo', 'Pantalones'),

-- Vestidos
('Vestido Casual', 'Vestidos'), ('Vestido de Fiesta', 'Vestidos'), 
('Vestido Largo', 'Vestidos'), ('Vestido Corto', 'Vestidos'),

-- Faldas
('Falda Mini', 'Faldas'), ('Falda Midi', 'Faldas'), ('Falda Larga', 'Faldas'),

-- Conjuntos
('Conjunto Deportivo', 'Conjuntos'), ('Conjunto Casual', 'Conjuntos'),

-- Buzos
('Buzo con Capucha', 'Buzos'), ('Sudadera', 'Buzos'), ('Buzo Canguro', 'Buzos'),

-- Camperas
('Campera Jean', 'Camperas'), ('Bomber', 'Camperas'), ('Blazer', 'Camperas'),

-- Accesorios
('Cartera', 'Accesorios'), ('Mochila', 'Accesorios'), ('Cinturón', 'Accesorios'),

-- Pijamas
('Pijama Completo', 'Pijamas'), ('Camisón', 'Pijamas'),

-- Trajes de Baño
('Bikini', 'Trajes de Baño'), ('Malla Entera', 'Trajes de Baño'),

-- Deportiva
('Calza Deportiva', 'Deportiva'), ('Top Deportivo', 'Deportiva'), ('Short Deportivo', 'Deportiva');

-- Estilos POR TIPO Y CATEGORÍA (súper claro)
INSERT INTO estilos (nombre, tipo_prenda, categoria) VALUES 
-- Jeans
('Skinny', 'Jean', 'Pantalones'), ('Straight', 'Jean', 'Pantalones'), ('High Waist', 'Jean', 'Pantalones'),
('Mom Jeans', 'Jean', 'Pantalones'), ('Boyfriend', 'Jean', 'Pantalones'),

-- Vestidos
('A-Line', 'Vestido Casual', 'Vestidos'), ('Bodycon', 'Vestido de Fiesta', 'Vestidos'),
('Wrap', 'Vestido Casual', 'Vestidos'), ('Maxi', 'Vestido Largo', 'Vestidos'),

-- Tops
('Oversize', 'Camiseta', 'Tops'), ('Fitted', 'Top', 'Tops'), ('Off Shoulder', 'Blusa', 'Tops'),
('Crop Style', 'Crop Top', 'Tops'),

-- Buzos
('Oversize', 'Buzo con Capucha', 'Buzos'), ('Crop', 'Sudadera', 'Buzos');

-- Telas
INSERT INTO telas (nombre, descripcion) VALUES 
('Algodón', 'Fibra natural suave'), ('Jean', 'Tejido resistente'), ('Seda', 'Fibra elegante'),
('Lycra', 'Fibra elástica'), ('Encaje', 'Tejido delicado'), ('Satén', 'Tejido brillante'),
('Viscosa', 'Fibra fluida'), ('Lino', 'Fibra fresca'), ('Polar', 'Tejido cálido'),
('Terciopelo', 'Tejido aterciopelado'), ('Crepe', 'Textura rugosa'), ('Lana', 'Fibra cálida');

-- Colores (40+)
INSERT INTO colores (nombre, codigo_hex) VALUES 
('Negro', '#000000'), ('Blanco', '#FFFFFF'), ('Gris', '#808080'),
('Azul', '#0066CC'), ('Azul Marino', '#000080'), ('Celeste', '#87CEEB'), ('Turquesa', '#40E0D0'),
('Rojo', '#FF0000'), ('Rosa', '#FFC0CB'), ('Fucsia', '#FF1493'), ('Coral', '#FF7F50'),
('Verde', '#008000'), ('Verde Oliva', '#808000'), ('Verde Lima', '#32CD32'),
('Amarillo', '#FFD700'), ('Mostaza', '#FFDB58'), ('Naranja', '#FF8C00'),
('Violeta', '#8A2BE2'), ('Morado', '#800080'), ('Lila', '#C8A2C8'),
('Marrón', '#A52A2A'), ('Beige', '#F5F5DC'), ('Café', '#8B4513'),
('Dorado', '#FFD700'), ('Plata', '#C0C0C0'), ('Nude', '#F5DEB3'), ('Crema', '#FFFDD0'),
('Denim', '#1560BD'), ('Khaki', '#F0E68C'), ('Arena', '#F4A460');

-- =====================================================
-- FUNCIONES SIMPLES
-- =====================================================

-- Obtener categorías
CREATE OR REPLACE FUNCTION get_categorias()
RETURNS TABLE (id INTEGER, nombre TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre FROM categorias ORDER BY nombre;
$$;

-- Obtener tipos de prenda por categoría (SIMPLE)
CREATE OR REPLACE FUNCTION get_tipos_prenda(cat_nombre TEXT)
RETURNS TABLE (id INTEGER, nombre TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre 
    FROM tipos_prenda 
    WHERE categoria = cat_nombre 
    ORDER BY nombre;
$$;

-- Obtener estilos por tipo de prenda (SIMPLE)
CREATE OR REPLACE FUNCTION get_estilos(tipo_nombre TEXT)
RETURNS TABLE (id INTEGER, nombre TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre 
    FROM estilos 
    WHERE tipo_prenda = tipo_nombre 
    ORDER BY nombre;
$$;

-- Obtener telas
CREATE OR REPLACE FUNCTION get_telas()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre, COALESCE(descripcion, '') FROM telas ORDER BY nombre;
$$;

-- Obtener colores
CREATE OR REPLACE FUNCTION get_colores()
RETURNS TABLE (id INTEGER, nombre TEXT, codigo_hex TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre, COALESCE(codigo_hex, '#CCCCCC') 
    FROM colores 
    ORDER BY 
        CASE nombre 
            WHEN 'Negro' THEN 1 WHEN 'Blanco' THEN 2 WHEN 'Gris' THEN 3 
            ELSE 4 
        END, nombre;
$$;

-- Vista simple
CREATE VIEW vista_productos_completa AS
SELECT 
    p.*,
    true as disponible -- SIEMPRE DISPONIBLE
FROM productos p
ORDER BY p.nombre;

-- Permisos
GRANT SELECT ON vista_productos_completa TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_categorias() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_tipos_prenda(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_estilos(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_telas() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_colores() TO authenticated, anon;

-- Productos de ejemplo
INSERT INTO productos (nombre, precio, descripcion, categoria, tipo_prenda, estilo, tela, color) VALUES 
('Jean Skinny Azul', 45.99, 'Jean ajustado clásico', 'Pantalones', 'Jean', 'Skinny', 'Jean', 'Azul'),
('Vestido Negro Elegante', 89.99, 'Vestido de fiesta elegante', 'Vestidos', 'Vestido de Fiesta', 'Bodycon', 'Satén', 'Negro'),
('Blusa Off Shoulder Blanca', 42.00, 'Blusa elegante', 'Tops', 'Blusa', 'Off Shoulder', 'Algodón', 'Blanco');

-- Verificación
SELECT 'SISTEMA SIMPLE LISTO' as mensaje;
SELECT 'Categorías:', COUNT(*) FROM categorias;
SELECT 'Tipos de prenda:', COUNT(*) FROM tipos_prenda;
SELECT 'Estilos:', COUNT(*) FROM estilos;
SELECT 'Colores:', COUNT(*) FROM colores;
SELECT 'Telas:', COUNT(*) FROM telas;