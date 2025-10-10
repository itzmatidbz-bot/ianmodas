-- =====================================================
-- 🔄 MIGRACIÓN SIMPLE - NUEVAS CATEGORÍAS
-- Script para agregar solo las categorías faltantes
-- =====================================================

-- Verificar e insertar solo categorías que no existen
INSERT INTO categorias (nombre, descripcion) 
SELECT * FROM (
  SELECT 'Camisas' as nombre, 'Camisas formales y casuales' as descripcion
  UNION ALL SELECT 'Camisetas', 'Camisetas básicas y estampadas'
  UNION ALL SELECT 'Remeras', 'Remeras de manga corta y larga'  
  UNION ALL SELECT 'Blusas', 'Blusas elegantes y casuales'
  UNION ALL SELECT 'Sweaters', 'Sweaters y pulóvers'
  UNION ALL SELECT 'Chaquetas', 'Chaquetas y blazers'
  UNION ALL SELECT 'Cardigans', 'Cardigans y chalecos abiertos'
  UNION ALL SELECT 'Chalecos', 'Chalecos y prendas sin mangas'
  UNION ALL SELECT 'Crop Tops', 'Tops cortos y ombligueras'
  UNION ALL SELECT 'Jeans', 'Pantalones de mezclilla'
  UNION ALL SELECT 'Bermudas', 'Pantalones cortos'
  UNION ALL SELECT 'Shorts', 'Shorts deportivos y casuales'
  UNION ALL SELECT 'Polleras', 'Polleras y faldas plisadas'
  UNION ALL SELECT 'Leggings', 'Leggings y calzas'
  UNION ALL SELECT 'Joggers', 'Pantalones deportivos'
  UNION ALL SELECT 'Capris', 'Pantalones a la pantorrilla'
  UNION ALL SELECT 'Vestidos Largos', 'Vestidos maxi y de gala'
  UNION ALL SELECT 'Vestidos Cortos', 'Vestidos mini y midi'
  UNION ALL SELECT 'Monos', 'Monos y jumpsuits'
  UNION ALL SELECT 'Enteritos', 'Enteritos y mamelucos'
  UNION ALL SELECT 'Corpiños', 'Sostenes y corpiños'
  UNION ALL SELECT 'Bombachas', 'Bombachas y tangas'
  UNION ALL SELECT 'Medias', 'Medias y pantys'
  UNION ALL SELECT 'Ropa Deportiva', 'Indumentaria deportiva'
  UNION ALL SELECT 'Mallas', 'Mallas y ropa de ejercicio'
  UNION ALL SELECT 'Bikinis', 'Trajes de baño de dos piezas'
  UNION ALL SELECT 'Mallas de Baño', 'Trajes de baño enteros'
  UNION ALL SELECT 'Cinturones', 'Cintos y fajas'
  UNION ALL SELECT 'Carteras', 'Bolsos y carteras'
  UNION ALL SELECT 'Mochilas', 'Mochilas y bolsos de espalda'
  UNION ALL SELECT 'Gorros', 'Sombreros y gorras'
  UNION ALL SELECT 'Bufandas', 'Bufandas y pañuelos'
  UNION ALL SELECT 'Guantes', 'Guantes y mitones'
  UNION ALL SELECT 'Zapatos', 'Calzado formal y casual'
  UNION ALL SELECT 'Zapatillas', 'Calzado deportivo'
  UNION ALL SELECT 'Botas', 'Botas y botinetas'
  UNION ALL SELECT 'Sandalias', 'Sandalias y ojotas'
  UNION ALL SELECT 'Mocasines', 'Mocasines sin cordones'
  UNION ALL SELECT 'Ropa de Fiesta', 'Indumentaria para eventos'
  UNION ALL SELECT 'Ropa Formal', 'Trajes y vestimenta elegante'
  UNION ALL SELECT 'Ropa Casual', 'Indumentaria de uso diario'
) AS nuevas_categorias
WHERE NOT EXISTS (
  SELECT 1 FROM categorias WHERE categorias.nombre = nuevas_categorias.nombre
);

-- Verificación: mostrar todas las categorías
SELECT COUNT(*) as total_categorias FROM categorias;
SELECT nombre FROM categorias ORDER BY nombre;

-- =====================================================
-- ✅ RESULTADO ESPERADO: 
-- - Aproximadamente 50+ categorías en total
-- - Todas las categorías del JavaScript estarán disponibles
-- =====================================================