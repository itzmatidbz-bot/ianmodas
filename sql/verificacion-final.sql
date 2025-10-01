-- SCRIPT FINAL DE VERIFICACIÓN Y CORRECCIÓN
-- Ejecutar en Supabase SQL Editor después del script principal

-- 1. Verificar y crear funciones RPC faltantes
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

-- La función get_tipos_tela_activos ya existe en el script principal

-- 2. Asegurar datos base mínimos
INSERT INTO categorias (nombre, descripcion) VALUES 
('Tops', 'Prendas superiores como blusas, camisetas, tops'),
('Pantalones', 'Todo tipo de pantalones y leggins'),
('Vestidos', 'Vestidos casuales, elegantes y de fiesta'),
('Faldas', 'Faldas de diferentes largos y estilos'),
('Conjuntos', 'Sets coordinados de dos o más piezas'),
('Abrigos', 'Chaquetas, blazers y abrigos')
ON CONFLICT (nombre) DO NOTHING;

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

-- 3. VERIFICACIÓN FINAL - MOSTRAR RESULTADOS
SELECT '=== VERIFICACIÓN FINAL ===' as resultado;

SELECT 'FUNCIONES RPC CREADAS:' as tipo;
SELECT routine_name as funcion_rpc 
FROM information_schema.routines 
WHERE routine_name IN ('get_categorias_activas', 'get_estilos_activos', 'get_colores_activos', 'get_tipos_tela_activos')
AND routine_schema = 'public';

SELECT 'DATOS DISPONIBLES:' as tipo;
SELECT 'Categorías activas' as tabla, COUNT(*)::text as cantidad FROM categorias WHERE activa = true
UNION ALL
SELECT 'Estilos activos', COUNT(*)::text FROM estilos WHERE activa = true
UNION ALL
SELECT 'Colores activos', COUNT(*)::text FROM colores WHERE activa = true
UNION ALL
SELECT 'Tipos de tela activos', COUNT(*)::text FROM tipos_tela WHERE activa = true;

SELECT 'TESTING FUNCIONES RPC:' as tipo;

SELECT 'TEST get_categorias_activas():' as test;
SELECT id, nombre FROM get_categorias_activas() LIMIT 5;

SELECT 'TEST get_estilos_activos():' as test;
SELECT id, nombre FROM get_estilos_activos() LIMIT 5;

SELECT 'TEST get_colores_activos():' as test;
SELECT id, nombre, codigo_hex FROM get_colores_activos() LIMIT 5;

SELECT 'TEST get_tipos_tela_activos():' as test;
SELECT id, nombre FROM get_tipos_tela_activos() LIMIT 5;

-- 4. Verificar permisos de las funciones RPC
SELECT 'PERMISOS RPC:' as info;
GRANT EXECUTE ON FUNCTION get_categorias_activas() TO authenticated;
GRANT EXECUTE ON FUNCTION get_estilos_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_colores_activos() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tipos_tela_activos() TO authenticated;

SELECT '✅ SCRIPT DE VERIFICACIÓN COMPLETADO' as resultado;