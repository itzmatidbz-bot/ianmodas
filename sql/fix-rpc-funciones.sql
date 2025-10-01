-- VERIFICACIÓN Y CORRECCIÓN DE FUNCIONES RPC FALTANTES
-- Ejecutar este script después del script principal

-- 1. Función para obtener categorías activas
CREATE OR REPLACE FUNCTION get_categorias_activas()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, COALESCE(c.descripcion, '') as descripcion
    FROM categorias c 
    WHERE c.activa = true 
    ORDER BY c.nombre;
END;
$$;

-- 2. Función para obtener estilos activos
CREATE OR REPLACE FUNCTION get_estilos_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.nombre, COALESCE(e.descripcion, '') as descripcion
    FROM estilos e 
    WHERE e.activa = true 
    ORDER BY e.nombre;
END;
$$;

-- 3. Función para obtener colores activos
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

-- 4. Función para obtener tipos de prenda por categoría
CREATE OR REPLACE FUNCTION get_tipos_prenda_por_categoria(categoria_id INTEGER)
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT tp.id, tp.nombre, COALESCE(tp.descripcion, '') as descripcion
    FROM tipos_prenda tp 
    WHERE tp.categoria_id = get_tipos_prenda_por_categoria.categoria_id
    AND tp.activa = true 
    ORDER BY tp.nombre;
END;
$$;

-- 5. Verificar que tenemos datos base - Insertar categorías básicas si no existen
INSERT INTO categorias (nombre, descripcion) VALUES 
('Tops', 'Prendas superiores como blusas, camisetas, tops'),
('Pantalones', 'Todo tipo de pantalones y leggins'),
('Vestidos', 'Vestidos casuales, elegantes y de fiesta'),
('Faldas', 'Faldas de diferentes largos y estilos'),
('Conjuntos', 'Sets coordinados de dos o más piezas'),
('Abrigos', 'Chaquetas, blazers y abrigos')
ON CONFLICT (nombre) DO NOTHING;

-- 6. Verificar que tenemos estilos base
INSERT INTO estilos (nombre, descripcion) VALUES 
('Oversize', 'Corte holgado y relajado'),
('Slim', 'Corte ajustado al cuerpo'),
('Skinny', 'Muy ajustado y ceñido'),
('Cargo', 'Con bolsillos laterales grandes'),
('High Waist', 'Talle alto que estiliza la figura'),
('Crop', 'Cortado, que no llega a la cintura'),
('Straight', 'Corte recto clásico'),
('Flare', 'Acampanado desde la rodilla'),
('Wrap', 'Estilo cruzado que se ata'),
('Off Shoulder', 'Con hombros descubiertos')
ON CONFLICT (nombre) DO NOTHING;

-- 7. Verificar que tenemos colores base
INSERT INTO colores (nombre, codigo_hex) VALUES 
('Negro', '#000000'),
('Blanco', '#FFFFFF'),
('Azul', '#0066CC'),
('Azul Marino', '#000080'),
('Rojo', '#FF0000'),
('Rosa', '#FFC0CB'),
('Verde', '#008000'),
('Gris', '#808080'),
('Marrón', '#A52A2A')
ON CONFLICT (nombre) DO NOTHING;

-- 8. Verificar resultados
SELECT 'VERIFICACIÓN DE DATOS:' as tipo, '' as detalle
UNION ALL
SELECT 'Categorías activas:', COUNT(*)::text FROM categorias WHERE activa = true
UNION ALL
SELECT 'Estilos activos:', COUNT(*)::text FROM estilos WHERE activa = true
UNION ALL
SELECT 'Colores activos:', COUNT(*)::text FROM colores WHERE activa = true
UNION ALL
SELECT 'Tipos de tela activos:', COUNT(*)::text FROM tipos_tela WHERE activa = true
UNION ALL
SELECT 'Tipos de prenda activos:', COUNT(*)::text FROM tipos_prenda WHERE activa = true;

-- 9. Probar las funciones RPC
SELECT 'TEST RPC get_categorias_activas()' as test;
SELECT * FROM get_categorias_activas() LIMIT 5;

SELECT 'TEST RPC get_estilos_activos()' as test;  
SELECT * FROM get_estilos_activos() LIMIT 5;

SELECT 'TEST RPC get_colores_activos()' as test;
SELECT * FROM get_colores_activos() LIMIT 5;

SELECT 'TEST RPC get_tipos_tela_activos()' as test;
SELECT * FROM get_tipos_tela_activos() LIMIT 5;