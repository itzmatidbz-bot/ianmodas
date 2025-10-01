-- ============================================
-- SCRIPT DE PRUEBA RÁPIDA - EJECUTAR EN SUPABASE
-- Para probar que las categorías funcionan
-- ============================================

-- Verificar que las tablas se crearon
SELECT 'Tablas creadas:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categorias', 'tipos_prenda', 'estilos', 'colores');

-- Verificar datos iniciales
SELECT 'Categorías disponibles:' as status;
SELECT * FROM get_categorias_activas();

SELECT 'Estilos disponibles:' as status;
SELECT * FROM get_estilos_activos();

SELECT 'Colores disponibles:' as status;
SELECT * FROM get_colores_activos();

-- Verificar que la vista funciona
SELECT 'Vista productos (primeros 3):' as status;
SELECT id, nombre, categoria_nombre, tipo_prenda_nombre, color_nombre 
FROM vista_productos_completa 
LIMIT 3;

-- Probar estadísticas del dashboard
SELECT 'Estadísticas dashboard:' as status;
SELECT total_users, total_products, total_categories 
FROM obtener_estadisticas_dashboard();