-- =====================================================
-- 🏗️ MEJORAS BASE DE DATOS - CATEGORÍAS Y PAÍS
-- =====================================================

-- Actualizar categorías principales con las nuevas
UPDATE categorias SET nombre = 'Camisas', descripcion = 'Camisas formales y casuales' WHERE id = 1;
UPDATE categorias SET nombre = 'Camisetas', descripcion = 'Camisetas básicas y estampadas' WHERE id = 2;
UPDATE categorias SET nombre = 'Remeras', descripcion = 'Remeras casuales y deportivas' WHERE id = 3;
UPDATE categorias SET nombre = 'Pantalones', descripcion = 'Todo tipo de pantalones' WHERE id = 4;
UPDATE categorias SET nombre = 'Vestidos', descripcion = 'Vestidos casuales y elegantes' WHERE id = 5;

-- Si no existen, insertarlas
INSERT INTO categorias (id, nombre, descripcion) VALUES 
(1, 'Camisas', 'Camisas formales y casuales'),
(2, 'Camisetas', 'Camisetas básicas y estampadas'), 
(3, 'Remeras', 'Remeras casuales y deportivas')
ON CONFLICT (id) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion;

-- =====================================================
-- 🏷️ SUBCATEGORÍAS NUEVAS
-- =====================================================

-- Crear tabla de subcategorías si no existe
CREATE TABLE IF NOT EXISTS subcategorias (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER REFERENCES categorias(id),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategorías para Camisas (categoria_id = 1)
INSERT INTO subcategorias (categoria_id, nombre, descripcion) VALUES
(1, 'Camisas Formales', 'Camisas elegantes para ocasiones formales'),
(1, 'Camisas Casuales', 'Camisas relajadas para uso diario'),
(1, 'Maxicamisas', 'Camisas largas estilo túnica');

-- Subcategorías para Camisetas (categoria_id = 2)  
INSERT INTO subcategorias (categoria_id, nombre, descripcion) VALUES
(2, 'Camisetas Básicas', 'Camisetas lisas y simples'),
(2, 'Camisetas Estampadas', 'Camisetas con diseños y prints'),
(2, 'Blusas', 'Blusas elegantes y femeninas');

-- Subcategorías para Remeras (categoria_id = 3)
INSERT INTO subcategorias (categoria_id, nombre, descripcion) VALUES
(3, 'Remeras Deportivas', 'Remeras para actividad física'),
(3, 'Remeras Casuales', 'Remeras para uso diario'),
(3, 'Remeras Premium', 'Remeras de alta calidad y diseño');

-- =====================================================
-- 🌍 AGREGAR CAMPO PAÍS A PRODUCTOS
-- =====================================================

-- Agregar columna país a productos si no existe
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS pais_origen VARCHAR(50) DEFAULT 'Argentina';

-- Agregar columna descripción del país
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS pais_descripcion TEXT DEFAULT 'Producto nacional de alta calidad';

-- Crear tabla de países para mejor organización
CREATE TABLE IF NOT EXISTS paises (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar países disponibles
INSERT INTO paises (codigo, nombre, descripcion) VALUES
('AR', 'Argentina', 'Productos nacionales de excelente calidad y diseño'),
('TR', 'Turquía', 'Productos turcos reconocidos por su calidad textil'),
('IT', 'Italia', 'Productos italianos de alta costura y elegancia'),
('OUT', 'Outlet', 'Productos de temporadas anteriores con descuentos especiales')
ON CONFLICT (codigo) DO NOTHING;

-- Agregar referencia a países en productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS pais_id INTEGER REFERENCES paises(id) DEFAULT 1;

-- =====================================================
-- 🔗 RELACIÓN PRODUCTOS-SUBCATEGORÍAS
-- =====================================================

-- Agregar subcategoría a productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS subcategoria_id INTEGER REFERENCES subcategorias(id);

-- =====================================================
-- 📊 VISTA ACTUALIZADA CON NUEVA ESTRUCTURA
-- =====================================================

-- Recrear vista con nuevos campos
DROP VIEW IF EXISTS vista_productos_completa;

CREATE OR REPLACE VIEW vista_productos_completa AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.imagen_url,
    p.activo,
    p.genero,
    p.temporada,
    p.created_at,
    p.updated_at,
    
    -- Categoría principal
    c.nombre AS categoria_nombre,
    c.descripcion AS categoria_descripcion,
    
    -- Subcategoría
    sc.nombre AS subcategoria_nombre,
    sc.descripcion AS subcategoria_descripcion,
    
    -- Tipo de prenda (si existe)
    tp.nombre AS tipo_prenda_nombre,
    
    -- Estilo (si existe)
    e.nombre AS estilo_nombre,
    
    -- Tela
    t.nombre AS tela_nombre,
    t.descripcion AS tela_descripcion,
    
    -- País de origen
    pais.nombre AS pais_nombre,
    pais.descripcion AS pais_descripcion,
    p.pais_origen,
    p.pais_descripcion
    
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN subcategorias sc ON p.subcategoria_id = sc.id
LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN telas t ON p.tela_id = t.id
LEFT JOIN paises pais ON p.pais_id = pais.id
WHERE p.activo = true;

-- =====================================================
-- 🔧 FUNCIONES PARA EL ADMIN
-- =====================================================

-- Función para obtener subcategorías por categoría
CREATE OR REPLACE FUNCTION get_subcategorias_por_categoria(categoria_id_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    nombre VARCHAR(100),
    descripcion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT sc.id, sc.nombre, sc.descripcion
    FROM subcategorias sc
    WHERE sc.categoria_id = categoria_id_param
    ORDER BY sc.nombre;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener países activos
CREATE OR REPLACE FUNCTION get_paises_activos()
RETURNS TABLE (
    id INTEGER,
    codigo VARCHAR(10),
    nombre VARCHAR(100),
    descripcion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.codigo, p.nombre, p.descripcion
    FROM paises p
    WHERE p.activo = true
    ORDER BY p.nombre;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 📝 ACTUALIZAR DATOS EXISTENTES
-- =====================================================

-- Asignar país por defecto a productos existentes
UPDATE productos 
SET pais_id = 1, 
    pais_origen = 'Argentina',
    pais_descripcion = 'Producto nacional de alta calidad'
WHERE pais_id IS NULL;

-- Asignar subcategorías por defecto según categoría
UPDATE productos 
SET subcategoria_id = (
    SELECT id FROM subcategorias 
    WHERE categoria_id = productos.categoria_id 
    LIMIT 1
)
WHERE subcategoria_id IS NULL AND categoria_id IN (1, 2, 3);

COMMIT;

-- =====================================================
-- ✅ VERIFICACIÓN
-- =====================================================
SELECT 'Estructura actualizada correctamente' AS status;
SELECT COUNT(*) as total_categorias FROM categorias;
SELECT COUNT(*) as total_subcategorias FROM subcategorias;  
SELECT COUNT(*) as total_paises FROM paises;
SELECT COUNT(*) as productos_con_pais FROM productos WHERE pais_id IS NOT NULL;