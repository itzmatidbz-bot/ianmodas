-- =====================================================
-- 🏗️ MEJORAS BASE DE DATOS - CATEGORÍAS SIMPLIFICADAS
-- =====================================================

-- CATEGORÍAS PRINCIPALES SIMPLIFICADAS (solo lo esencial)
UPDATE categorias SET nombre = 'Camisas', descripcion = 'Todo tipo de camisas' WHERE id = 1;
UPDATE categorias SET nombre = 'Camisetas', descripcion = 'Camisetas y tops básicos' WHERE id = 2;
UPDATE categorias SET nombre = 'Remeras', descripcion = 'Remeras casuales y deportivas' WHERE id = 3;
UPDATE categorias SET nombre = 'Pantalones', descripcion = 'Pantalones largos y jeans' WHERE id = 4;
UPDATE categorias SET nombre = 'Bermudas', descripcion = 'Pantalones cortos y shorts' WHERE id = 5;
UPDATE categorias SET nombre = 'Faldas', descripcion = 'Todo tipo de faldas' WHERE id = 6;
UPDATE categorias SET nombre = 'Vestidos', descripcion = 'Vestidos casuales y elegantes' WHERE id = 7;

-- Si no existen, insertarlas
INSERT INTO categorias (id, nombre, descripcion) VALUES 
(1, 'Camisas', 'Todo tipo de camisas'),
(2, 'Camisetas', 'Camisetas y tops básicos'),
(3, 'Remeras', 'Remeras casuales y deportivas'),
(4, 'Pantalones', 'Pantalones largos y jeans'),
(5, 'Bermudas', 'Pantalones cortos y shorts'),
(6, 'Faldas', 'Todo tipo de faldas'),
(7, 'Vestidos', 'Vestidos casuales y elegantes')
ON CONFLICT (id) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion;

-- =====================================================
-- � ESTILOS SIMPLIFICADOS (reemplaza subcategorías)
-- =====================================================

-- Los "estilos" serán más intuitivos que subcategorías
-- Ejemplos: Formal, Casual, Deportivo, Elegante, Básico, Estampado

-- Actualizar tabla estilos existente o crearla
CREATE TABLE IF NOT EXISTS estilos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estilos universales que funcionan para todas las categorías
INSERT INTO estilos (nombre, descripcion) VALUES
('Básico', 'Diseño simple y versátil'),
('Casual', 'Estilo relajado para el día a día'),
('Formal', 'Elegante para ocasiones especiales'),
('Deportivo', 'Para actividades físicas y comodidad'),
('Estampado', 'Con diseños, prints o patrones'),
('Elegante', 'Sofisticado y refinado'),
('Vintage', 'Estilo retro y clásico'),
('Oversize', 'Corte amplio y holgado')
ON CONFLICT (nombre) DO NOTHING;

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

-- Agregar referencia a países en productos (OPCIONAL)
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS pais_id INTEGER REFERENCES paises(id);

-- =====================================================
-- 🔗 SIMPLIFICAR ESTRUCTURA DE PRODUCTOS
-- =====================================================

-- Solo mantener lo esencial:
-- ✅ categoria_id (obligatorio) - ej: Camisas, Pantalones, etc.
-- ✅ estilo_id (opcional) - ej: Casual, Formal, Deportivo
-- ✅ tela_id (opcional) - ej: Algodón, Jean, Lycra  
-- ✅ pais_id (opcional) - ej: Argentina, Turquía
-- ❌ NO subcategorias (redundante con estilos)
-- ❌ NO tipos_prenda (redundante con categorías)

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
    
    -- Categoría principal (OBLIGATORIO)
    c.nombre AS categoria_nombre,
    c.descripcion AS categoria_descripcion,
    
    -- Estilo (OPCIONAL - reemplaza subcategorías y tipos)
    e.nombre AS estilo_nombre,
    e.descripcion AS estilo_descripcion,
    
    -- Tela (OPCIONAL)
    t.nombre AS tela_nombre,
    t.descripcion AS tela_descripcion,
    
    -- País de origen (OPCIONAL)
    pais.nombre AS pais_nombre,
    pais.descripcion AS pais_descripcion,
    p.pais_origen,
    p.pais_descripcion
    
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN telas t ON p.tela_id = t.id
LEFT JOIN paises pais ON p.pais_id = pais.id
WHERE p.activo = true;

-- =====================================================
-- 🔧 FUNCIONES SIMPLIFICADAS PARA EL ADMIN
-- =====================================================

-- Función para obtener estilos (reemplaza subcategorías)
CREATE OR REPLACE FUNCTION get_estilos_disponibles()
RETURNS TABLE (
    id INTEGER,
    nombre VARCHAR(100),
    descripcion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.nombre, e.descripcion
    FROM estilos e
    ORDER BY e.nombre;
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
-- 📝 ACTUALIZAR DATOS EXISTENTES (OPCIONAL)
-- =====================================================

-- Los productos existentes mantendrán sus datos
-- País es opcional, no asignamos por defecto
-- Estilos son opcionales, se pueden agregar manualmente

-- Solo actualizar productos que no tengan categoría asignada
UPDATE productos 
SET categoria_id = 1 
WHERE categoria_id IS NULL;

COMMIT;

-- =====================================================
-- ✅ VERIFICACIÓN SIMPLIFICADA
-- =====================================================
SELECT 'Estructura simplificada correctamente' AS status;
SELECT COUNT(*) as total_categorias FROM categorias;
SELECT COUNT(*) as total_estilos FROM estilos;  
SELECT COUNT(*) as total_paises FROM paises;
SELECT COUNT(*) as productos_activos FROM productos WHERE activo = true;

-- ESTRUCTURA FINAL SIMPLIFICADA:
-- 📦 CATEGORÍAS: Camisas, Camisetas, Remeras, Pantalones, Bermudas, Faldas, Vestidos
-- 🎨 ESTILOS: Básico, Casual, Formal, Deportivo, Estampado, Elegante, Vintage, Oversize  
-- 🌍 PAÍSES: Argentina, Turquía, Italia, Outlet (todos opcionales)
-- 🧵 TELAS: Algodón, Jean, Seda, Lycra, etc. (opcional)