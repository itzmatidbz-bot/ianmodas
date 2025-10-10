-- =====================================================
-- 📦 CATEGORÍAS AMPLIADAS PARA IAN MODAS
-- Agregando todas las categorías faltantes del sistema
-- =====================================================

-- Primero, insertar las nuevas categorías
INSERT INTO categorias (nombre, descripcion) VALUES
-- ===== PARTE SUPERIOR AMPLIADA =====
('Camisas', 'Camisas formales y casuales para toda ocasión'),
('Camisetas', 'Camisetas básicas y estampadas de uso diario'),
('Remeras', 'Remeras de manga corta y larga'),
('Blusas', 'Blusas elegantes y casuales para mujer'),
('Sweaters', 'Sweaters, pulóvers y tejidos'),
('Chaquetas', 'Chaquetas y blazers de diferentes estilos'),
('Cardigans', 'Cardigans y chalecos abiertos'),
('Chalecos', 'Chalecos y prendas sin mangas'),
('Crop Tops', 'Tops cortos y ombligueras modernas'),

-- ===== PARTE INFERIOR AMPLIADA =====
('Jeans', 'Pantalones de mezclilla y denim'),
('Bermudas', 'Pantalones cortos y bermudas'),
('Shorts', 'Shorts deportivos y casuales'),
('Polleras', 'Polleras y faldas plisadas'),
('Leggings', 'Leggings, calzas y mallas ajustadas'),
('Joggers', 'Pantalones deportivos y de entrenamiento'),
('Capris', 'Pantalones a la pantorrilla'),

-- ===== VESTIDOS ESPECÍFICOS =====
('Vestidos Largos', 'Vestidos maxi y de gala para eventos'),
('Vestidos Cortos', 'Vestidos mini y midi casuales'),
('Monos', 'Monos, jumpsuits y enteritos de una pieza'),
('Enteritos', 'Enteritos y mamelucos'),

-- ===== ROPA INTERIOR Y ÍNTIMA =====
('Corpiños', 'Sostenes, corpiños y ropa interior superior'),
('Bombachas', 'Bombachas, tangas y ropa interior inferior'),
('Medias', 'Medias, pantys y calcetines'),

-- ===== ROPA DEPORTIVA ESPECÍFICA =====
('Ropa Deportiva', 'Indumentaria deportiva y de entrenamiento'),
('Mallas', 'Mallas deportivas y de ejercicio'),
('Bikinis', 'Trajes de baño de dos piezas'),
('Mallas de Baño', 'Trajes de baño enteros'),

-- ===== ACCESORIOS ESPECÍFICOS =====
('Cinturones', 'Cintos, fajas y accesorios de cintura'),
('Carteras', 'Bolsos, carteras y monederos'),
('Mochilas', 'Mochilas y bolsos de espalda'),
('Gorros', 'Sombreros, gorras y accesorios de cabeza'),
('Bufandas', 'Bufandas, pañuelos y accesorios de cuello'),
('Guantes', 'Guantes, mitones y accesorios de manos'),

-- ===== CALZADO ESPECÍFICO =====
('Zapatos', 'Calzado formal y casual'),
('Zapatillas', 'Calzado deportivo y sneakers'),
('Botas', 'Botas, botinetas y calzado alto'),
('Sandalias', 'Sandalias, ojotas y calzado abierto'),
('Mocasines', 'Mocasines y zapatos sin cordones'),

-- ===== OCASIONES Y ESTILOS =====
('Ropa de Fiesta', 'Indumentaria para eventos y celebraciones'),
('Ropa Formal', 'Trajes y vestimenta elegante'),
('Ropa Casual', 'Indumentaria de uso diario y relajado');

-- =====================================================
-- 👕 TIPOS DE PRENDA POR NUEVA CATEGORÍA
-- =====================================================

-- Obtener los IDs de las nuevas categorías para insertar tipos de prenda
-- (Nota: Los IDs pueden variar según la base de datos)

-- Agregar tipos de prenda para Camisas
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) 
SELECT c.id, 'Camisa Formal', 'Camisas para ocasiones elegantes'
FROM categorias c WHERE c.nombre = 'Camisas'
UNION ALL
SELECT c.id, 'Camisa Casual', 'Camisas para uso diario'
FROM categorias c WHERE c.nombre = 'Camisas'
UNION ALL
SELECT c.id, 'Camisa de Jean', 'Camisas de mezclilla'
FROM categorias c WHERE c.nombre = 'Camisas';

-- Agregar tipos de prenda para Camisetas
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) 
SELECT c.id, 'Camiseta Básica', 'Camisetas lisas de colores sólidos'
FROM categorias c WHERE c.nombre = 'Camisetas'
UNION ALL
SELECT c.id, 'Camiseta Estampada', 'Camisetas con diseños y estampados'
FROM categorias c WHERE c.nombre = 'Camisetas'
UNION ALL
SELECT c.id, 'Camiseta Oversized', 'Camisetas de corte holgado'
FROM categorias c WHERE c.nombre = 'Camisetas';

-- Agregar tipos de prenda para Jeans
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) 
SELECT c.id, 'Jean Skinny', 'Jeans ajustados al cuerpo'
FROM categorias c WHERE c.nombre = 'Jeans'
UNION ALL
SELECT c.id, 'Jean Recto', 'Jeans de corte clásico'
FROM categorias c WHERE c.nombre = 'Jeans'
UNION ALL
SELECT c.id, 'Jean Wide Leg', 'Jeans de pierna ancha'
FROM categorias c WHERE c.nombre = 'Jeans'
UNION ALL
SELECT c.id, 'Jean Mom', 'Jeans de corte vintage'
FROM categorias c WHERE c.nombre = 'Jeans';

-- Agregar tipos de prenda para Vestidos Largos
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) 
SELECT c.id, 'Vestido Maxi', 'Vestidos largos hasta los tobillos'
FROM categorias c WHERE c.nombre = 'Vestidos Largos'
UNION ALL
SELECT c.id, 'Vestido de Gala', 'Vestidos elegantes para eventos'
FROM categorias c WHERE c.nombre = 'Vestidos Largos'
UNION ALL
SELECT c.id, 'Vestido Bohemio', 'Vestidos largos de estilo boho'
FROM categorias c WHERE c.nombre = 'Vestidos Largos';

-- Agregar tipos de prenda para Vestidos Cortos
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) 
SELECT c.id, 'Vestido Mini', 'Vestidos muy cortos'
FROM categorias c WHERE c.nombre = 'Vestidos Cortos'
UNION ALL
SELECT c.id, 'Vestido Midi', 'Vestidos de largo medio'
FROM categorias c WHERE c.nombre = 'Vestidos Cortos'
UNION ALL
SELECT c.id, 'Vestido Casual', 'Vestidos para uso diario'
FROM categorias c WHERE c.nombre = 'Vestidos Cortos';

-- Agregar tipos de prenda para Zapatillas
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) 
SELECT c.id, 'Sneakers', 'Zapatillas urbanas y casuales'
FROM categorias c WHERE c.nombre = 'Zapatillas'
UNION ALL
SELECT c.id, 'Zapatillas Running', 'Calzado para correr'
FROM categorias c WHERE c.nombre = 'Zapatillas'
UNION ALL
SELECT c.id, 'Zapatillas Training', 'Calzado para entrenamiento'
FROM categorias c WHERE c.nombre = 'Zapatillas';

-- Agregar tipos de prenda para Bikinis
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) 
SELECT c.id, 'Bikini Triangular', 'Bikinis de copa triangular'
FROM categorias c WHERE c.nombre = 'Bikinis'
UNION ALL
SELECT c.id, 'Bikini Bandeau', 'Bikinis sin tirantes'
FROM categorias c WHERE c.nombre = 'Bikinis'
UNION ALL
SELECT c.id, 'Bikini Push-Up', 'Bikinis con realce'
FROM categorias c WHERE c.nombre = 'Bikinis';

-- =====================================================
-- 🏷️ ACTUALIZAR PRODUCTOS EXISTENTES (OPCIONAL)
-- =====================================================

-- Comentario: Si tienes productos existentes que quieres reasignar a las nuevas categorías,
-- puedes usar comandos UPDATE como estos:

-- Ejemplo: Mover productos de "Tops" a categorías más específicas
-- UPDATE productos SET categoria_id = (SELECT id FROM categorias WHERE nombre = 'Camisetas') 
-- WHERE nombre LIKE '%camiseta%' OR descripcion LIKE '%camiseta%';

-- UPDATE productos SET categoria_id = (SELECT id FROM categorias WHERE nombre = 'Blusas') 
-- WHERE nombre LIKE '%blusa%' OR descripcion LIKE '%blusa%';

-- =====================================================
-- ✅ VERIFICACIÓN DE INSERCIÓN
-- =====================================================

-- Consulta para verificar las nuevas categorías
SELECT 
    c.id,
    c.nombre,
    c.descripcion,
    COUNT(tp.id) as tipos_prenda_count
FROM categorias c
LEFT JOIN tipos_prenda tp ON c.id = tp.categoria_id
WHERE c.nombre IN (
    'Camisas', 'Camisetas', 'Remeras', 'Jeans', 'Bermudas', 'Shorts',
    'Vestidos Largos', 'Vestidos Cortos', 'Monos', 'Bikinis', 'Zapatillas',
    'Crop Tops', 'Leggings', 'Ropa Deportiva', 'Carteras', 'Gorros'
)
GROUP BY c.id, c.nombre, c.descripcion
ORDER BY c.nombre;

-- =====================================================
-- 📊 RESUMEN FINAL
-- =====================================================
-- Este script agrega:
-- ✅ 43 nuevas categorías específicas
-- ✅ Tipos de prenda para las categorías principales
-- ✅ Estructura organizada por secciones
-- ✅ Compatibilidad con el sistema existente
-- ✅ Verificación de datos insertados
-- =====================================================