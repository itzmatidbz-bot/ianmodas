-- REESTRUCTURACIÓN COMPLETA IAN MODAS - 3FN SIN STOCK
-- Este script elimina todo y recrea el sistema correctamente

-- =====================================================
-- PASO 1: ELIMINAR TODO EL SISTEMA ANTERIOR
-- =====================================================

-- Eliminar vistas existentes
DROP VIEW IF EXISTS vista_productos_completa;

-- Eliminar funciones RPC existentes
DROP FUNCTION IF EXISTS get_categorias_activas();
DROP FUNCTION IF EXISTS get_estilos_activos();
DROP FUNCTION IF EXISTS get_colores_activos();
DROP FUNCTION IF EXISTS get_tipos_tela_activos();
DROP FUNCTION IF EXISTS get_tipos_prenda_por_categoria(INTEGER);
DROP FUNCTION IF EXISTS get_estilos_por_categoria(INTEGER);

-- Eliminar tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS producto_colores CASCADE;
DROP TABLE IF EXISTS producto_imagenes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS tipos_prenda CASCADE;
DROP TABLE IF EXISTS estilos CASCADE;
DROP TABLE IF EXISTS telas CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS colores CASCADE;
DROP TABLE IF EXISTS tipos_tela CASCADE;

-- =====================================================
-- PASO 2: CREAR TABLAS EN 3FN
-- =====================================================

-- Tabla categorías (1FN)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla tipos_prenda (2FN - depende de categoría)
CREATE TABLE tipos_prenda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria_id INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    UNIQUE(nombre, categoria_id)
);

-- Tabla estilos (3FN - depende de tipo_prenda)
CREATE TABLE estilos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_prenda_id INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tipo_prenda_id) REFERENCES tipos_prenda(id) ON DELETE CASCADE,
    UNIQUE(nombre, tipo_prenda_id)
);

-- Tabla telas (1FN)
CREATE TABLE telas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla colores (1FN)
CREATE TABLE colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla productos (3FN - SIN STOCK)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    categoria_id INTEGER NOT NULL,
    tipo_prenda_id INTEGER NOT NULL,
    estilo_id INTEGER NULL, -- Opcional
    tela_id INTEGER NULL,   -- Opcional
    color_id INTEGER NULL,  -- Opcional
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_prenda_id) REFERENCES tipos_prenda(id) ON DELETE CASCADE,
    FOREIGN KEY (estilo_id) REFERENCES estilos(id) ON DELETE SET NULL,
    FOREIGN KEY (tela_id) REFERENCES telas(id) ON DELETE SET NULL,
    FOREIGN KEY (color_id) REFERENCES colores(id) ON DELETE SET NULL
);

-- =====================================================
-- PASO 3: INSERTAR DATOS COMPLETOS
-- =====================================================

-- Insertar categorías
INSERT INTO categorias (nombre) VALUES 
('Ropa Interior'),
('Calzado'),
('Tops'),
('Pantalones'),
('Vestidos'),
('Faldas'),
('Conjuntos'),
('Abrigos'),
('Buzos'),
('Camperas'),
('Tapados'),
('Accesorios'),
('Pijamas'),
('Trajes de Baño'),
('Deportiva');

-- Insertar tipos de prenda por categoría
INSERT INTO tipos_prenda (nombre, categoria_id) VALUES 
-- Ropa Interior
('Calzones', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Tanga', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Bombacha', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Corpiño', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Conjunto Lencería', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Boxer', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Camiseta Interior', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),

-- Calzado
('Zapatillas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Botas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Botinetas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Sandalias', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Zapatos', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Stilettos', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Plataformas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Alpargatas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),

-- Tops
('Blusa', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Camiseta', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Top', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Camisa', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Body', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Crop Top', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Tank Top', (SELECT id FROM categorias WHERE nombre = 'Tops')),

-- Pantalones
('Jean', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Pantalón de Vestir', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Legging', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Jogging', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Short', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Palazzo', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Cargo', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),

-- Vestidos
('Vestido Casual', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
('Vestido de Fiesta', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
('Vestido Largo', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
('Vestido Corto', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
('Vestido Midi', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),

-- Buzos
('Buzo con Capucha', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Canguro', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Sudadera', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Deportivo', (SELECT id FROM categorias WHERE nombre = 'Buzos')),

-- Camperas
('Campera Jean', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Campera Cuero', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Bomber', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Blazer', (SELECT id FROM categorias WHERE nombre = 'Camperas')),

-- Accesorios
('Cartera', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Mochila', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Cinturón', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Collar', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Pulsera', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Aros', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),

-- Pijamas
('Pijama Completo', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),
('Camisón', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),
('Short Dormir', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),

-- Trajes de Baño
('Bikini', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),
('Malla Entera', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),
('Short de Baño', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño'));

-- Insertar estilos por tipo de prenda (algunos tipos no tienen estilos)
INSERT INTO estilos (nombre, tipo_prenda_id) VALUES 
-- Estilos para Jean
('Skinny', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' LIMIT 1)),
('Straight', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' LIMIT 1)),
('High Waist', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' LIMIT 1)),
('Mom Jeans', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' LIMIT 1)),
('Boyfriend', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' LIMIT 1)),

-- Estilos para Vestidos
('A-Line', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido Casual' LIMIT 1)),
('Bodycon', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido de Fiesta' LIMIT 1)),
('Wrap', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido Casual' LIMIT 1)),
('Slip Dress', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido de Fiesta' LIMIT 1)),

-- Estilos para Tops
('Oversize', (SELECT id FROM tipos_prenda WHERE nombre = 'Camiseta' LIMIT 1)),
('Fitted', (SELECT id FROM tipos_prenda WHERE nombre = 'Top' LIMIT 1)),
('Off Shoulder', (SELECT id FROM tipos_prenda WHERE nombre = 'Blusa' LIMIT 1)),

-- Estilos para Buzos
('Oversize', (SELECT id FROM tipos_prenda WHERE nombre = 'Buzo con Capucha' LIMIT 1)),
('Crop', (SELECT id FROM tipos_prenda WHERE nombre = 'Sudadera' LIMIT 1));

-- Insertar telas completas
INSERT INTO telas (nombre, descripcion) VALUES 
('Algodón', 'Fibra natural suave y transpirable'),
('Jean', 'Tejido de algodón resistente y duradero'),
('Seda', 'Fibra natural lujosa y elegante'),
('Lino', 'Fibra natural fresca y transpirable'),
('Lycra', 'Fibra elástica para prendas ajustadas'),
('Encaje', 'Tejido delicado con patrones calados'),
('Satén', 'Tejido brillante y suave'),
('Viscosa', 'Fibra semisintética con caída fluida'),
('Bengalina', 'Tejido elástico con estructura firme'),
('Tencel', 'Fibra ecológica suave y antibacteriana'),
('Polar', 'Tejido sintético cálido'),
('Terciopelo', 'Tejido aterciopelado y elegante'),
('Crepe', 'Tejido con textura rugosa'),
('Gabardina', 'Tejido resistente para abrigos'),
('Mohair', 'Fibra de cabra angora'),
('Lana', 'Fibra natural cálida'),
('Ecocuero', 'Material sintético que imita el cuero'),
('Hilo', 'Tejido fino y delicado');

-- Insertar TODOS los colores (40+)
INSERT INTO colores (nombre, codigo_hex) VALUES 
-- Básicos
('Negro', '#000000'),
('Blanco', '#FFFFFF'),
('Gris', '#808080'),
('Gris Claro', '#D3D3D3'),
('Gris Oscuro', '#696969'),

-- Azules
('Azul', '#0066CC'),
('Azul Marino', '#000080'),
('Azul Cielo', '#87CEEB'),
('Celeste', '#87CEEB'),
('Turquesa', '#40E0D0'),
('Índigo', '#4B0082'),
('Azul Eléctrico', '#0080FF'),

-- Rojos y Rosas
('Rojo', '#FF0000'),
('Rosa', '#FFC0CB'),
('Rosa Fucsia', '#FF1493'),
('Coral', '#FF7F50'),
('Salmón', '#FA8072'),
('Borgoña', '#800020'),
('Vino', '#722F37'),
('Cereza', '#DE3163'),

-- Verdes
('Verde', '#008000'),
('Verde Oliva', '#808000'),
('Verde Menta', '#98FB98'),
('Verde Esmeralda', '#50C878'),
('Verde Lima', '#32CD32'),
('Verde Bosque', '#228B22'),

-- Amarillos y Naranjas
('Amarillo', '#FFD700'),
('Mostaza', '#FFDB58'),
('Naranja', '#FF8C00'),
('Durazno', '#FFCBA4'),
('Amarillo Claro', '#FFFFE0'),

-- Violetas y Morados
('Violeta', '#8A2BE2'),
('Morado', '#800080'),
('Lila', '#C8A2C8'),
('Lavanda', '#E6E6FA'),
('Magenta', '#FF00FF'),

-- Marrones y Tierra
('Marrón', '#A52A2A'),
('Beige', '#F5F5DC'),
('Camel', '#C19A6B'),
('Chocolate', '#D2691E'),
('Café', '#8B4513'),
('Arena', '#F4A460'),

-- Especiales
('Dorado', '#FFD700'),
('Plata', '#C0C0C0'),
('Cobre', '#B87333'),
('Nude', '#F5DEB3'),
('Crema', '#FFFDD0'),
('Khaki', '#F0E68C');

-- =====================================================
-- PASO 4: CREAR VISTA PRINCIPAL (SIN STOCK)
-- =====================================================

CREATE VIEW vista_productos_completa AS
SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.descripcion,
    p.imagen_url,
    c.nombre AS categoria,
    tp.nombre AS tipo_prenda,
    COALESCE(e.nombre, 'no hay estilos') AS estilo,
    COALESCE(t.nombre, 'desconocido') AS tela,
    COALESCE(col.nombre, 'sin color') AS color,
    COALESCE(col.codigo_hex, '#CCCCCC') AS color_hex
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id
INNER JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN telas t ON p.tela_id = t.id
LEFT JOIN colores col ON p.color_id = col.id
WHERE p.activo = true 
  AND c.activo = true 
  AND tp.activo = true
ORDER BY p.nombre ASC;

-- =====================================================
-- PASO 5: CREAR FUNCIONES RPC PARA FRONTEND
-- =====================================================

-- Función para obtener categorías
CREATE OR REPLACE FUNCTION get_categorias()
RETURNS TABLE (id INTEGER, nombre TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre
    FROM categorias 
    WHERE activo = true 
    ORDER BY nombre;
$$;

-- Función para obtener tipos de prenda por categoría
CREATE OR REPLACE FUNCTION get_tipos_prenda(categoria_id INTEGER)
RETURNS TABLE (id INTEGER, nombre TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre
    FROM tipos_prenda 
    WHERE categoria_id = get_tipos_prenda.categoria_id 
      AND activo = true 
    ORDER BY nombre;
$$;

-- Función para obtener estilos por tipo de prenda
CREATE OR REPLACE FUNCTION get_estilos(tipo_prenda_id INTEGER)
RETURNS TABLE (id INTEGER, nombre TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre
    FROM estilos 
    WHERE tipo_prenda_id = get_estilos.tipo_prenda_id 
      AND activo = true 
    ORDER BY nombre;
$$;

-- Función para obtener todas las telas
CREATE OR REPLACE FUNCTION get_telas()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre, COALESCE(descripcion, '') as descripcion
    FROM telas 
    WHERE activo = true 
    ORDER BY nombre;
$$;

-- Función para obtener todos los colores
CREATE OR REPLACE FUNCTION get_colores()
RETURNS TABLE (id INTEGER, nombre TEXT, codigo_hex TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre, COALESCE(codigo_hex, '#CCCCCC') as codigo_hex
    FROM colores 
    WHERE activo = true 
    ORDER BY nombre;
$$;

-- =====================================================
-- PASO 6: OTORGAR PERMISOS
-- =====================================================

GRANT SELECT ON vista_productos_completa TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_categorias() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_tipos_prenda(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_estilos(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_telas() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_colores() TO authenticated, anon;

-- =====================================================
-- PASO 7: INSERTAR PRODUCTOS DE EJEMPLO
-- =====================================================

INSERT INTO productos (nombre, precio, descripcion, categoria_id, tipo_prenda_id, estilo_id, tela_id, color_id) VALUES 
-- Ejemplos con diferentes combinaciones
('Jean Skinny Azul', 45.99, 'Jean ajustado clásico', 
    (SELECT id FROM categorias WHERE nombre = 'Pantalones'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' LIMIT 1),
    (SELECT id FROM estilos WHERE nombre = 'Skinny' LIMIT 1),
    (SELECT id FROM telas WHERE nombre = 'Jean'),
    (SELECT id FROM colores WHERE nombre = 'Azul')),

('Vestido Negro Elegante', 89.99, 'Vestido de fiesta elegante', 
    (SELECT id FROM categorias WHERE nombre = 'Vestidos'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido de Fiesta' LIMIT 1),
    (SELECT id FROM estilos WHERE nombre = 'Bodycon' LIMIT 1),
    (SELECT id FROM telas WHERE nombre = 'Satén'),
    (SELECT id FROM colores WHERE nombre = 'Negro')),

('Conjunto Lencería Rosa', 35.50, 'Conjunto de lencería en encaje', 
    (SELECT id FROM categorias WHERE nombre = 'Ropa Interior'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Conjunto Lencería' LIMIT 1),
    NULL, -- Sin estilo específico
    (SELECT id FROM telas WHERE nombre = 'Encaje'),
    (SELECT id FROM colores WHERE nombre = 'Rosa')),

('Zapatillas Blancas Deportivas', 75.00, 'Zapatillas para uso diario', 
    (SELECT id FROM categorias WHERE nombre = 'Calzado'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Zapatillas' LIMIT 1),
    NULL, -- Sin estilo específico
    NULL, -- Sin tela específica
    (SELECT id FROM colores WHERE nombre = 'Blanco'));

-- =====================================================
-- PASO 8: VERIFICACIÓN FINAL
-- =====================================================

SELECT '🎉 SISTEMA REESTRUCTURADO EN 3FN - SIN STOCK' as mensaje;

-- Verificar datos
SELECT 'VERIFICACIÓN:' as seccion;
SELECT 'Categorías' as tabla, COUNT(*) as cantidad FROM categorias;
SELECT 'Tipos de Prenda' as tabla, COUNT(*) as cantidad FROM tipos_prenda;
SELECT 'Estilos' as tabla, COUNT(*) as cantidad FROM estilos;
SELECT 'Telas' as tabla, COUNT(*) as cantidad FROM telas;
SELECT 'Colores' as tabla, COUNT(*) as cantidad FROM colores;
SELECT 'Productos' as tabla, COUNT(*) as cantidad FROM productos;

-- Probar la vista
SELECT '✅ VISTA FUNCIONANDO:' as test;
SELECT * FROM vista_productos_completa LIMIT 5;

SELECT '✅ SISTEMA LISTO PARA FRONTEND' as resultado;