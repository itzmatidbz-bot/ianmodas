-- SCRIPT DEFINITIVO PARA SOLUCIONAR TODOS LOS PROBLEMAS DE IAN MODAS
-- Este script arregla: tipos de tela, más colores, tipos de prenda, dependencias de estilo

-- =====================================================
-- PASO 1: ELIMINAR FUNCIONES EXISTENTES Y RECREAR
-- =====================================================

DROP FUNCTION IF EXISTS get_categorias_activas();
DROP FUNCTION IF EXISTS get_estilos_activos();
DROP FUNCTION IF EXISTS get_colores_activos();
DROP FUNCTION IF EXISTS get_tipos_tela_activos();
DROP FUNCTION IF EXISTS get_tipos_prenda_por_categoria(INTEGER);

-- =====================================================
-- PASO 2: ASEGURAR TABLAS NECESARIAS
-- =====================================================

-- Tabla de tipos de tela
CREATE TABLE IF NOT EXISTS tipos_tela (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tablas para múltiples imágenes y colores
CREATE TABLE IF NOT EXISTS producto_imagenes (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL,
    imagen_url TEXT NOT NULL,
    orden INTEGER DEFAULT 1,
    es_principal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS producto_colores (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL,
    color_id INTEGER NOT NULL,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(producto_id, color_id)
);

-- Agregar columnas necesarias a productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tipo_tela_id INTEGER;

-- Agregar relaciones para estilos dependientes
ALTER TABLE estilos ADD COLUMN IF NOT EXISTS categoria_id INTEGER;
ALTER TABLE estilos ADD COLUMN IF NOT EXISTS tipo_prenda_id INTEGER;

-- =====================================================
-- PASO 3: INSERTAR TIPOS DE TELA COMPLETOS
-- =====================================================

INSERT INTO tipos_tela (nombre, descripcion) VALUES 
('Lino', 'Fibra natural resistente y transpirable, ideal para climas cálidos'),
('Tencel', 'Fibra de origen vegetal, suave y antibacteriana con caída elegante'),
('Viscosa', 'Fibra semisintética con tacto sedoso y buena caída'),
('Bengalina', 'Tejido elástico con cuerpo firme, perfecto para prendas que marcan la silueta'),
('Satén', 'Tejido brillante y suave con superficie lisa y elegante'),
('Jean', 'Tejido de algodón resistente, clásico para prendas casuales'),
('Ecocuero', 'Material sintético ecológico que imita el cuero natural'),
('Paño de Lana', 'Tejido de lana compacto y abrigado para prendas de invierno'),
('Mohair', 'Fibra de cabra angora, suave y cálida con brillo natural'),
('Lana', 'Fibra natural térmica, perfecta para abrigo y comodidad'),
('Algodón', 'Fibra natural suave y cómoda, ideal para uso diario'),
('Hilo', 'Tejido fino y delicado, perfecto para prendas elegantes'),
('Lycra', 'Tejido elástico ideal para ropa deportiva y ajustada'),
('Crepe', 'Tejido con textura rugosa, elegante y fluido'),
('Gabardina', 'Tejido resistente y duradero, ideal para abrigos'),
('Polar', 'Tejido sintético cálido y suave para invierno'),
('Terciopelo', 'Tejido lujoso con superficie aterciopelada'),
('Encaje', 'Tejido delicado con patrones calados elegantes')
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- PASO 4: INSERTAR CATEGORÍAS COMPLETAS
-- =====================================================

INSERT INTO categorias (nombre) VALUES 
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
('Calzado'),
('Ropa Interior'),
('Pijamas'),
('Trajes de Baño'),
('Deportiva'),
('Elegante'),
('Casual')
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- PASO 5: INSERTAR MUCHOS MÁS COLORES
-- =====================================================

INSERT INTO colores (nombre, codigo_hex) VALUES 
-- Colores básicos
('Negro', '#000000'),
('Blanco', '#FFFFFF'),
('Gris', '#808080'),
('Gris Claro', '#D3D3D3'),
('Gris Oscuro', '#696969'),

-- Azules
('Azul', '#0066CC'),
('Azul Marino', '#000080'),
('Azul Cielo', '#87CEEB'),
('Azul Eléctrico', '#0080FF'),
('Turquesa', '#40E0D0'),
('Celeste', '#87CEEB'),
('Índigo', '#4B0082'),

-- Rojos y rosas
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

-- Amarillos y naranjas
('Amarillo', '#FFD700'),
('Amarillo Claro', '#FFFFE0'),
('Mostaza', '#FFDB58'),
('Naranja', '#FF8C00'),
('Naranja Quemado', '#CC5500'),
('Durazno', '#FFCBA4'),

-- Violetas y morados
('Violeta', '#8A2BE2'),
('Morado', '#800080'),
('Lila', '#C8A2C8'),
('Lavanda', '#E6E6FA'),
('Magenta', '#FF00FF'),

-- Marrones y beiges
('Marrón', '#A52A2A'),
('Beige', '#F5F5DC'),
('Camel', '#C19A6B'),
('Chocolate', '#D2691E'),
('Café', '#8B4513'),
('Arena', '#F4A460'),

-- Colores especiales
('Dorado', '#FFD700'),
('Plata', '#C0C0C0'),
('Cobre', '#B87333'),
('Nude', '#F5DEB3'),
('Crema', '#FFFDD0'),
('Marfil', '#FFFFF0'),
('Khaki', '#F0E68C')
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- PASO 6: INSERTAR MUCHOS MÁS TIPOS DE PRENDA
-- =====================================================

-- Limpiar tipos de prenda existentes para las nuevas categorías
DELETE FROM tipos_prenda WHERE categoria_id IN (
    SELECT id FROM categorias WHERE nombre IN ('Buzos', 'Camperas', 'Tapados', 'Accesorios', 'Calzado', 'Ropa Interior', 'Pijamas', 'Trajes de Baño', 'Deportiva', 'Elegante', 'Casual')
);

INSERT INTO tipos_prenda (nombre, categoria_id) VALUES 
-- Tops expandidos
('Blusa', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Camiseta', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Top', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Camisa', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Polera', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Body', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Crop Top', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Tank Top', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),

-- Pantalones expandidos
('Jean', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Pantalón de Vestir', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Legging', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Jogging', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Short', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Calza', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Palazzo', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Cargo', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),

-- Vestidos expandidos
('Vestido Casual', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Vestido de Fiesta', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Vestido Largo', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Vestido Corto', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Vestido Midi', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Vestido Wrap', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Vestido Camisero', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),

-- Buzos expandidos
('Buzo con Capucha', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Buzo Canguro', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Buzo Oversize', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Buzo Crop', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Sudadera', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Buzo Deportivo', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Buzo Básico', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),

-- Camperas expandidas
('Campera de Jean', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Campera Bomber', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Campera de Cuero', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Campera Deportiva', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Chaqueta', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Blazer', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Cardigan', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),

-- Tapados expandidos
('Tapado Largo', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),
('Tapado Corto', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),
('Tapado de Lana', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),
('Tapado Elegante', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),
('Abrigo', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),
('Sobretodo', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),

-- Accesorios expandidos
('Cartera', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Mochila', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Cinturón', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Collar', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Pulsera', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Aros', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Gorro', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Bufanda', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Guantes', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Lentes de Sol', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),

-- Calzado expandido
('Zapatilla', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Bota', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Botineta', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Sandalia', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Zapato', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Stiletto', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Plataforma', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Alpargata', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),

-- Ropa Interior expandida
('Corpiño', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Bombacha', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Tanga', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Boxer', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Camiseta Interior', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Conjunto Lencería', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Faja', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),

-- Pijamas expandidos
('Pijama Completo', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),
('Camisón', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),
('Short de Dormir', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),
('Bata', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),
('Pijama de Verano', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),
('Pijama de Invierno', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),

-- Trajes de Baño expandidos
('Bikini', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño' LIMIT 1)),
('Malla Entera', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño' LIMIT 1)),
('Short de Baño', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño' LIMIT 1)),
('Pareo', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño' LIMIT 1)),
('Salida de Baño', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño' LIMIT 1))
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- PASO 7: CREAR ESTILOS DEPENDIENTES DE CATEGORÍAS
-- =====================================================

-- Limpiar estilos existentes
DELETE FROM estilos;

-- Estilos para Tops
INSERT INTO estilos (nombre, categoria_id) VALUES 
('Oversize', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Crop', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Ajustado', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Holgado', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),
('Off Shoulder', (SELECT id FROM categorias WHERE nombre = 'Tops' LIMIT 1)),

-- Estilos para Pantalones
('Skinny', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Straight', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('High Waist', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Low Waist', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Flare', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),
('Mom Jeans', (SELECT id FROM categorias WHERE nombre = 'Pantalones' LIMIT 1)),

-- Estilos para Vestidos
('A-Line', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Bodycon', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Wrap', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Slip Dress', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),
('Maxi', (SELECT id FROM categorias WHERE nombre = 'Vestidos' LIMIT 1)),

-- Estilos para Buzos
('Oversize', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Crop', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Con Capucha', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Deportivo', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1))
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- PASO 8: RECREAR FUNCIONES RPC MEJORADAS
-- =====================================================

CREATE FUNCTION get_categorias_activas()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, '' as descripcion
    FROM categorias c 
    WHERE c.activa = true 
    ORDER BY c.nombre;
END;
$$;

CREATE FUNCTION get_estilos_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.nombre, '' as descripcion
    FROM estilos e 
    WHERE e.activa = true 
    ORDER BY e.nombre;
END;
$$;

CREATE FUNCTION get_estilos_por_categoria(cat_id INTEGER)
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.nombre, '' as descripcion
    FROM estilos e 
    WHERE e.activa = true 
    AND (e.categoria_id = cat_id OR e.categoria_id IS NULL)
    ORDER BY e.nombre;
END;
$$;

CREATE FUNCTION get_colores_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, codigo_hex TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, COALESCE(c.codigo_hex, '#000000') as codigo_hex
    FROM colores c 
    WHERE c.activa = true 
    ORDER BY c.nombre;
END;
$$;

CREATE FUNCTION get_tipos_tela_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT tt.id, tt.nombre, COALESCE(tt.descripcion, '') as descripcion
    FROM tipos_tela tt 
    WHERE tt.activa = true 
    ORDER BY tt.nombre;
END;
$$;

CREATE FUNCTION get_tipos_prenda_por_categoria(categoria_id INTEGER)
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT tp.id, tp.nombre, '' as descripcion
    FROM tipos_prenda tp 
    WHERE tp.categoria_id = get_tipos_prenda_por_categoria.categoria_id
    AND tp.activa = true 
    ORDER BY tp.nombre;
END;
$$;

-- =====================================================
-- PASO 9: OTORGAR PERMISOS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_categorias_activas() TO authenticated;
GRANT EXECUTE ON FUNCTION get_estilos_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_estilos_por_categoria(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_colores_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tipos_tela_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tipos_prenda_por_categoria(INTEGER) TO authenticated;

-- =====================================================
-- PASO 10: ELIMINAR COLUMNAS DE STOCK
-- =====================================================

ALTER TABLE productos DROP COLUMN IF EXISTS stock;
ALTER TABLE productos DROP COLUMN IF EXISTS stock_minimo;
ALTER TABLE productos DROP COLUMN IF EXISTS stock_disponible;

-- =====================================================
-- PASO 11: VERIFICACIÓN FINAL
-- =====================================================

SELECT '🎉 SISTEMA IAN MODAS TOTALMENTE CORREGIDO' as resultado;

SELECT 'DATOS INSERTADOS:' as seccion;
SELECT 'Categorías' as tabla, COUNT(*) as cantidad FROM categorias WHERE activa = true
UNION ALL
SELECT 'Estilos', COUNT(*) FROM estilos WHERE activa = true
UNION ALL
SELECT 'Colores', COUNT(*) FROM colores WHERE activa = true
UNION ALL
SELECT 'Tipos de Tela', COUNT(*) FROM tipos_tela WHERE activa = true
UNION ALL
SELECT 'Tipos de Prenda', COUNT(*) FROM tipos_prenda WHERE activa = true;

SELECT '✅ TODO CORREGIDO - RECARGAR PÁGINAS' as resultado;