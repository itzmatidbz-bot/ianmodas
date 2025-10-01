-- SCRIPT DEFINITIVO PARA IAN MODAS - EJECUTAR TODO EN SUPABASE
-- Este script soluciona todos los problemas de una vez

-- =====================================================
-- PASO 1: CREAR TABLAS FALTANTES
-- =====================================================

-- Crear tabla de tipos de tela
CREATE TABLE IF NOT EXISTS tipos_tela (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tablas para múltiples imágenes y colores
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

-- Agregar columna tipo_tela_id a productos si no existe
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tipo_tela_id INTEGER;

-- =====================================================
-- PASO 2: INSERTAR TODOS LOS DATOS
-- =====================================================

-- Insertar tipos de tela
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
('Hilo', 'Tejido fino y delicado, perfecto para prendas elegantes')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar categorías principales (incluyendo las nuevas)
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
('Trajes de Baño')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar estilos
INSERT INTO estilos (nombre) VALUES 
('Oversize'),
('Slim'),
('Skinny'),
('Cargo'),
('High Waist'),
('Crop'),
('Straight'),
('Flare'),
('Wrap'),
('Off Shoulder')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar colores completos
INSERT INTO colores (nombre, codigo_hex) VALUES 
('Negro', '#000000'),
('Blanco', '#FFFFFF'),
('Azul', '#0066CC'),
('Azul Marino', '#000080'),
('Rojo', '#FF0000'),
('Rosa', '#FFC0CB'),
('Verde', '#008000'),
('Gris', '#808080'),
('Marrón', '#A52A2A'),
('Amarillo', '#FFD700'),
('Naranja', '#FF8C00'),
('Violeta', '#8A2BE2'),
('Turquesa', '#40E0D0'),
('Coral', '#FF7F50'),
('Beige', '#F5F5DC'),
('Mostaza', '#FFDB58'),
('Vino', '#722F37'),
('Celeste', '#87CEEB'),
('Lavanda', '#E6E6FA'),
('Khaki', '#F0E68C'),
('Salmón', '#FA8072'),
('Oliva', '#808000'),
('Camel', '#C19A6B'),
('Plata', '#C0C0C0')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar tipos de prenda para todas las categorías
INSERT INTO tipos_prenda (nombre, categoria_id) VALUES 
-- Buzos
('Buzo con Capucha', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Canguro', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Oversize', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Crop', (SELECT id FROM categorias WHERE nombre = 'Buzos')),

-- Camperas
('Campera de Jean', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Campera Bomber', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Campera de Cuero', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Campera Deportiva', (SELECT id FROM categorias WHERE nombre = 'Camperas')),

-- Tapados
('Tapado Largo', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Tapado Corto', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Tapado de Lana', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Tapado Elegante', (SELECT id FROM categorias WHERE nombre = 'Tapados')),

-- Accesorios
('Cartera', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Cinturón', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Collar', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Pulsera', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Gorro', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Bufanda', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),

-- Calzado
('Zapatilla', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Bota', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Sandalia', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Zapato', (SELECT id FROM categorias WHERE nombre = 'Calzado')),

-- Ropa Interior
('Corpiño', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Bombacha', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Boxer', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Camiseta', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),

-- Pijamas
('Pijama Completo', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),
('Camisón', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),
('Short de Dormir', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),

-- Trajes de Baño
('Bikini', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),
('Malla Entera', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),
('Short de Baño', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño'))
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- PASO 3: CREAR TODAS LAS FUNCIONES RPC NECESARIAS
-- =====================================================

CREATE OR REPLACE FUNCTION get_categorias_activas()
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

CREATE OR REPLACE FUNCTION get_estilos_activos()
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

CREATE OR REPLACE FUNCTION get_colores_activos()
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

CREATE OR REPLACE FUNCTION get_tipos_tela_activos()
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

CREATE OR REPLACE FUNCTION get_tipos_prenda_por_categoria(categoria_id INTEGER)
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
-- PASO 4: OTORGAR PERMISOS A LAS FUNCIONES RPC
-- =====================================================

GRANT EXECUTE ON FUNCTION get_categorias_activas() TO authenticated;
GRANT EXECUTE ON FUNCTION get_estilos_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_colores_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tipos_tela_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tipos_prenda_por_categoria(INTEGER) TO authenticated;

-- =====================================================
-- PASO 5: ACTUALIZAR VISTA DE PRODUCTOS COMPLETA
-- =====================================================

DROP VIEW IF EXISTS vista_productos_completa;
CREATE VIEW vista_productos_completa AS
SELECT 
    p.*,
    c.nombre as categoria_nombre,
    tp.nombre as tipo_prenda_nombre,
    e.nombre as estilo_nombre,
    col.nombre as color_nombre,
    col.codigo_hex as color_hex,
    tt.nombre as tipo_tela_nombre,
    tt.descripcion as tipo_tela_descripcion,
    -- Imagen principal
    pi.imagen_url as imagen_principal,
    -- JSON con todas las imágenes
    (
        SELECT json_agg(
            json_build_object(
                'id', pi2.id,
                'url', pi2.imagen_url,
                'orden', pi2.orden,
                'es_principal', pi2.es_principal
            ) ORDER BY pi2.orden
        )
        FROM producto_imagenes pi2 
        WHERE pi2.producto_id = p.id
    ) as imagenes,
    -- JSON con todos los colores disponibles
    (
        SELECT json_agg(
            json_build_object(
                'id', col2.id,
                'nombre', col2.nombre,
                'codigo_hex', col2.codigo_hex,
                'disponible', pc.disponible
            )
        )
        FROM producto_colores pc
        JOIN colores col2 ON pc.color_id = col2.id
        WHERE pc.producto_id = p.id AND pc.disponible = true
    ) as colores_disponibles
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN colores col ON p.color_id = col.id
LEFT JOIN tipos_tela tt ON p.tipo_tela_id = tt.id
LEFT JOIN producto_imagenes pi ON p.id = pi.producto_id AND pi.es_principal = true;

-- =====================================================
-- PASO 6: VERIFICACIÓN FINAL
-- =====================================================

SELECT '🎉 SISTEMA IAN MODAS CONFIGURADO EXITOSAMENTE' as resultado;

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

SELECT 'FUNCIONES RPC CREADAS:' as seccion;
SELECT routine_name as funcion
FROM information_schema.routines 
WHERE routine_name LIKE 'get_%activos' OR routine_name LIKE 'get_tipos_prenda%'
AND routine_schema = 'public';

SELECT '✅ TODO LISTO PARA IAN MODAS - RECARGAR ADMIN PANEL' as resultado;