-- REESTRUCTURACIÓN COMPLETA IAN MODAS - 3FN SIN STOCK (CORREGIDO)
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
DROP FUNCTION IF EXISTS get_categorias();
DROP FUNCTION IF EXISTS get_tipos_prenda(INTEGER);
DROP FUNCTION IF EXISTS get_estilos(INTEGER);
DROP FUNCTION IF EXISTS get_telas();
DROP FUNCTION IF EXISTS get_colores();
DROP FUNCTION IF EXISTS get_dashboard_stats();

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

-- Tabla productos (3FN - SIN STOCK COMPLETAMENTE)
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

-- Insertar tipos de prenda por categoría (COBERTURA COMPLETA)
INSERT INTO tipos_prenda (nombre, categoria_id) VALUES 
-- Ropa Interior (7 tipos)
('Calzones', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Tanga', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Bombacha', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Corpiño', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Conjunto Lencería', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Boxer', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Body Interior', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),

-- Calzado (8 tipos)
('Zapatillas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Botas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Botinetas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Sandalias', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Zapatos', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Stilettos', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Plataformas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Alpargatas', (SELECT id FROM categorias WHERE nombre = 'Calzado')),

-- Tops (7 tipos)
('Blusa', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Camiseta', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Top', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Camisa', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Body', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Crop Top', (SELECT id FROM categorias WHERE nombre = 'Tops')),
('Tank Top', (SELECT id FROM categorias WHERE nombre = 'Tops')),

-- Pantalones (7 tipos)
('Jean', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Pantalón de Vestir', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Legging', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Jogging', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Short', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Palazzo', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
('Cargo', (SELECT id FROM categorias WHERE nombre = 'Pantalones')),

-- Vestidos (5 tipos)
('Vestido Casual', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
('Vestido de Fiesta', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
('Vestido Largo', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
('Vestido Corto', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
('Vestido Midi', (SELECT id FROM categorias WHERE nombre = 'Vestidos')),

-- Faldas (6 tipos)
('Falda Mini', (SELECT id FROM categorias WHERE nombre = 'Faldas')),
('Falda Midi', (SELECT id FROM categorias WHERE nombre = 'Faldas')),
('Falda Larga', (SELECT id FROM categorias WHERE nombre = 'Faldas')),
('Falda Tubo', (SELECT id FROM categorias WHERE nombre = 'Faldas')),
('Falda Plisada', (SELECT id FROM categorias WHERE nombre = 'Faldas')),
('Falda Circular', (SELECT id FROM categorias WHERE nombre = 'Faldas')),

-- Conjuntos (5 tipos)
('Conjunto Deportivo', (SELECT id FROM categorias WHERE nombre = 'Conjuntos')),
('Conjunto Casual', (SELECT id FROM categorias WHERE nombre = 'Conjuntos')),
('Conjunto Formal', (SELECT id FROM categorias WHERE nombre = 'Conjuntos')),
('Conjunto de Punto', (SELECT id FROM categorias WHERE nombre = 'Conjuntos')),
('Conjunto de Verano', (SELECT id FROM categorias WHERE nombre = 'Conjuntos')),

-- Abrigos (4 tipos)
('Saco', (SELECT id FROM categorias WHERE nombre = 'Abrigos')),
('Chal', (SELECT id FROM categorias WHERE nombre = 'Abrigos')),
('Poncho', (SELECT id FROM categorias WHERE nombre = 'Abrigos')),
('Cardigan', (SELECT id FROM categorias WHERE nombre = 'Abrigos')),

-- Buzos (4 tipos)
('Buzo con Capucha', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Canguro', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Sudadera', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Deportivo', (SELECT id FROM categorias WHERE nombre = 'Buzos')),

-- Camperas (4 tipos)
('Campera Jean', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Campera Cuero', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Bomber', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Blazer', (SELECT id FROM categorias WHERE nombre = 'Camperas')),

-- Tapados (4 tipos)
('Tapado Clásico', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Tapado Largo', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Trench', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Sobretodo', (SELECT id FROM categorias WHERE nombre = 'Tapados')),

-- Accesorios (6 tipos)
('Cartera', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Mochila', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Cinturón', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Collar', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Pulsera', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Aros', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),

-- Pijamas (3 tipos)
('Pijama Completo', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),
('Camisón', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),
('Short Dormir', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),

-- Trajes de Baño (3 tipos)
('Bikini', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),
('Malla Entera', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),
('Short de Baño', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),

-- Deportiva (6 tipos)
('Calza Deportiva', (SELECT id FROM categorias WHERE nombre = 'Deportiva')),
('Top Deportivo', (SELECT id FROM categorias WHERE nombre = 'Deportiva')),
('Short Deportivo', (SELECT id FROM categorias WHERE nombre = 'Deportiva')),
('Remera Deportiva', (SELECT id FROM categorias WHERE nombre = 'Deportiva')),
('Campera Deportiva', (SELECT id FROM categorias WHERE nombre = 'Deportiva')),
('Conjunto Gym', (SELECT id FROM categorias WHERE nombre = 'Deportiva'));

-- Insertar estilos por tipo de prenda (REFERENCIAS CORREGIDAS)
INSERT INTO estilos (nombre, tipo_prenda_id) VALUES 
-- Estilos para Jean
('Skinny', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Pantalones'))),
('Straight', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Pantalones'))),
('High Waist', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Pantalones'))),
('Mom Jeans', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Pantalones'))),
('Boyfriend', (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Pantalones'))),

-- Estilos para Vestidos
('A-Line', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido Casual' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Vestidos'))),
('Bodycon', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido de Fiesta' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Vestidos'))),
('Wrap', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido Casual' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Vestidos'))),
('Slip Dress', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido de Fiesta' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Vestidos'))),
('Maxi', (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido Largo' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Vestidos'))),

-- Estilos para Tops
('Oversize', (SELECT id FROM tipos_prenda WHERE nombre = 'Camiseta' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Tops'))),
('Fitted', (SELECT id FROM tipos_prenda WHERE nombre = 'Top' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Tops'))),
('Off Shoulder', (SELECT id FROM tipos_prenda WHERE nombre = 'Blusa' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Tops'))),
('Crop Style', (SELECT id FROM tipos_prenda WHERE nombre = 'Crop Top' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Tops'))),

-- Estilos para Buzos
('Oversize Buzo', (SELECT id FROM tipos_prenda WHERE nombre = 'Buzo con Capucha' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Buzos'))),
('Crop Buzo', (SELECT id FROM tipos_prenda WHERE nombre = 'Sudadera' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Buzos'))),

-- Estilos para Pantalones
('High Waist Palazzo', (SELECT id FROM tipos_prenda WHERE nombre = 'Palazzo' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Pantalones'))),
('Cargo Style', (SELECT id FROM tipos_prenda WHERE nombre = 'Cargo' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Pantalones')));

-- Insertar TODOS los colores (40+) ordenados inteligentemente
INSERT INTO colores (nombre, codigo_hex) VALUES 
-- Básicos (siempre primero)
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
('Khaki', '#F0E68C'),
('Denim', '#1560BD');

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
    COALESCE(e.nombre, 'Sin estilo específico') AS estilo,
    COALESCE(t.nombre, 'Material no especificado') AS tela,
    COALESCE(col.nombre, 'Color no especificado') AS color,
    COALESCE(col.codigo_hex, '#CCCCCC') AS color_hex,
    p.categoria_id,
    p.tipo_prenda_id,
    p.estilo_id,
    p.tela_id,
    p.color_id,
    true as disponible -- SIEMPRE DISPONIBLE - SIN STOCK
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

-- Función para obtener todos los colores (ORDENADO INTELIGENTE)
CREATE OR REPLACE FUNCTION get_colores()
RETURNS TABLE (id INTEGER, nombre TEXT, codigo_hex TEXT) 
LANGUAGE sql AS $$
    SELECT id, nombre, COALESCE(codigo_hex, '#CCCCCC') as codigo_hex
    FROM colores 
    WHERE activo = true 
    ORDER BY 
        CASE nombre 
            WHEN 'Negro' THEN 1
            WHEN 'Blanco' THEN 2
            WHEN 'Gris' THEN 3
            ELSE 4
        END,
        nombre;
$$;

-- Función para estadísticas (SIN STOCK)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_categorias INTEGER,
    total_tipos_prenda INTEGER,
    total_productos INTEGER,
    total_colores INTEGER,
    total_telas INTEGER
) 
LANGUAGE sql AS $$
    SELECT 
        (SELECT COUNT(*) FROM categorias WHERE activo = true)::INTEGER,
        (SELECT COUNT(*) FROM tipos_prenda WHERE activo = true)::INTEGER,
        (SELECT COUNT(*) FROM productos WHERE activo = true)::INTEGER,
        (SELECT COUNT(*) FROM colores WHERE activo = true)::INTEGER,
        (SELECT COUNT(*) FROM telas WHERE activo = true)::INTEGER;
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
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated, anon;

-- =====================================================
-- PASO 7: INSERTAR PRODUCTOS DE EJEMPLO
-- =====================================================

INSERT INTO productos (nombre, precio, descripcion, categoria_id, tipo_prenda_id, estilo_id, tela_id, color_id) VALUES 
-- Ejemplos con diferentes combinaciones
('Jean Skinny Azul', 45.99, 'Jean ajustado clásico en color azul', 
    (SELECT id FROM categorias WHERE nombre = 'Pantalones'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Jean' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Pantalones')),
    (SELECT id FROM estilos WHERE nombre = 'Skinny'),
    (SELECT id FROM telas WHERE nombre = 'Jean'),
    (SELECT id FROM colores WHERE nombre = 'Azul')),

('Vestido Negro Elegante', 89.99, 'Vestido de fiesta elegante en satén negro', 
    (SELECT id FROM categorias WHERE nombre = 'Vestidos'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Vestido de Fiesta' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Vestidos')),
    (SELECT id FROM estilos WHERE nombre = 'Bodycon'),
    (SELECT id FROM telas WHERE nombre = 'Satén'),
    (SELECT id FROM colores WHERE nombre = 'Negro')),

('Conjunto Lencería Rosa', 35.50, 'Conjunto de lencería en encaje rosa delicado', 
    (SELECT id FROM categorias WHERE nombre = 'Ropa Interior'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Conjunto Lencería' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
    NULL, -- Sin estilo específico
    (SELECT id FROM telas WHERE nombre = 'Encaje'),
    (SELECT id FROM colores WHERE nombre = 'Rosa')),

('Zapatillas Blancas Deportivas', 75.00, 'Zapatillas deportivas para uso diario', 
    (SELECT id FROM categorias WHERE nombre = 'Calzado'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Zapatillas' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Calzado')),
    NULL, -- Sin estilo específico
    NULL, -- Sin tela específica
    (SELECT id FROM colores WHERE nombre = 'Blanco')),

('Blusa Off Shoulder Blanca', 42.00, 'Blusa elegante con hombros descubiertos', 
    (SELECT id FROM categorias WHERE nombre = 'Tops'),
    (SELECT id FROM tipos_prenda WHERE nombre = 'Blusa' AND categoria_id = (SELECT id FROM categorias WHERE nombre = 'Tops')),
    (SELECT id FROM estilos WHERE nombre = 'Off Shoulder'),
    (SELECT id FROM telas WHERE nombre = 'Algodón'),
    (SELECT id FROM colores WHERE nombre = 'Blanco'));

-- =====================================================
-- PASO 8: VERIFICACIÓN FINAL
-- =====================================================

SELECT '🎉 SISTEMA REESTRUCTURADO EN 3FN - SIN STOCK - CORREGIDO' as mensaje;

-- Verificar datos (DETALLADO)
SELECT 'VERIFICACIÓN COMPLETA:' as seccion;
SELECT 'Categorías' as tabla, COUNT(*) as cantidad FROM categorias;
SELECT 'Tipos de Prenda' as tabla, COUNT(*) as cantidad FROM tipos_prenda;
SELECT 'Estilos' as tabla, COUNT(*) as cantidad FROM estilos;
SELECT 'Telas' as tabla, COUNT(*) as cantidad FROM telas;
SELECT 'Colores' as tabla, COUNT(*) as cantidad FROM colores;
SELECT 'Productos' as tabla, COUNT(*) as cantidad FROM productos;

-- Verificar que cada categoría tenga tipos de prenda
SELECT 'COBERTURA POR CATEGORÍA:' as verificacion;
SELECT c.nombre as categoria, COUNT(tp.id) as tipos_prenda
FROM categorias c
LEFT JOIN tipos_prenda tp ON c.id = tp.categoria_id
GROUP BY c.id, c.nombre
ORDER BY c.nombre;

-- Probar la vista
SELECT '✅ VISTA FUNCIONANDO:' as test;
SELECT * FROM vista_productos_completa LIMIT 5;

-- Probar funciones RPC
SELECT '✅ FUNCIONES RPC:' as test_rpc;
SELECT 'Categorías:', COUNT(*) FROM get_categorias();
SELECT 'Colores:', COUNT(*) FROM get_colores();
SELECT 'Telas:', COUNT(*) FROM get_telas();

SELECT '✅ SISTEMA LISTO PARA FRONTEND - SIN STOCK' as resultado;