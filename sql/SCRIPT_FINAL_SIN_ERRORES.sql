-- SCRIPT FINAL CORREGIDO PARA IAN MODAS
-- Este script elimina funciones existentes y las recrea correctamente

-- =====================================================
-- PASO 1: ELIMINAR FUNCIONES EXISTENTES SI EXISTEN
-- =====================================================

DROP FUNCTION IF EXISTS get_categorias_activas();
DROP FUNCTION IF EXISTS get_estilos_activos();
DROP FUNCTION IF EXISTS get_colores_activos();
DROP FUNCTION IF EXISTS get_tipos_tela_activos();
DROP FUNCTION IF EXISTS get_tipos_prenda_por_categoria(INTEGER);

-- =====================================================
-- PASO 2: CREAR TABLAS FALTANTES
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
-- PASO 3: INSERTAR TODOS LOS DATOS
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

-- Insertar categorías principales (sin descripcion)
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

-- Insertar estilos (sin descripcion)
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

-- Insertar tipos de prenda para las nuevas categorías
INSERT INTO tipos_prenda (nombre, categoria_id) VALUES 
-- Buzos
('Buzo con Capucha', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Buzo Canguro', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Buzo Oversize', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),
('Buzo Crop', (SELECT id FROM categorias WHERE nombre = 'Buzos' LIMIT 1)),

-- Camperas  
('Campera de Jean', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Campera Bomber', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Campera de Cuero', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),
('Campera Deportiva', (SELECT id FROM categorias WHERE nombre = 'Camperas' LIMIT 1)),

-- Tapados
('Tapado Largo', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),
('Tapado Corto', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),
('Tapado de Lana', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),
('Tapado Elegante', (SELECT id FROM categorias WHERE nombre = 'Tapados' LIMIT 1)),

-- Accesorios
('Cartera', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Cinturón', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Collar', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Pulsera', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Gorro', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),
('Bufanda', (SELECT id FROM categorias WHERE nombre = 'Accesorios' LIMIT 1)),

-- Calzado
('Zapatilla', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Bota', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Sandalia', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),
('Zapato', (SELECT id FROM categorias WHERE nombre = 'Calzado' LIMIT 1)),

-- Ropa Interior
('Corpiño', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Bombacha', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Boxer', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),
('Camiseta', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior' LIMIT 1)),

-- Pijamas
('Pijama Completo', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),
('Camisón', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),
('Short de Dormir', (SELECT id FROM categorias WHERE nombre = 'Pijamas' LIMIT 1)),

-- Trajes de Baño
('Bikini', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño' LIMIT 1)),
('Malla Entera', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño' LIMIT 1)),
('Short de Baño', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño' LIMIT 1))
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- PASO 4: CREAR FUNCIONES RPC LIMPIAS
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
-- PASO 5: OTORGAR PERMISOS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_categorias_activas() TO authenticated;
GRANT EXECUTE ON FUNCTION get_estilos_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_colores_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tipos_tela_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tipos_prenda_por_categoria(INTEGER) TO authenticated;

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