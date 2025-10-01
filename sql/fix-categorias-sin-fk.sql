-- ============================================
-- SOLUCIÓN INMEDIATA - SIN FOREIGN KEYS
-- Arregla errores de constraints y mejora dashboard
-- ============================================

-- Primero, hacer los campos nullable en productos para evitar constraint errors
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS categoria_id INTEGER,
ADD COLUMN IF NOT EXISTS tipo_prenda_id INTEGER,
ADD COLUMN IF NOT EXISTS estilo_id INTEGER,
ADD COLUMN IF NOT EXISTS color_id INTEGER,
ADD COLUMN IF NOT EXISTS genero VARCHAR(20) DEFAULT 'mujer',
ADD COLUMN IF NOT EXISTS temporada VARCHAR(20) DEFAULT 'todo_año';

-- Crear tablas SIN foreign keys primero
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipos_prenda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    categoria_id INTEGER,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estilos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7),
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DATOS INICIALES
-- ============================================

INSERT INTO categorias (nombre, descripcion) VALUES
('Tops', 'Prendas superiores: blusas, camisetas, tops'),
('Pantalones', 'Todo tipo de pantalones y jeans'),
('Vestidos', 'Vestidos casuales y elegantes'),
('Faldas', 'Faldas de diferentes estilos y largos'),
('Conjuntos', 'Sets y conjuntos coordinados'),
('Abrigos', 'Chaquetas, blazers y abrigos')
ON CONFLICT (nombre) DO NOTHING;

-- Tipos de prenda
INSERT INTO tipos_prenda (nombre, categoria_id, descripcion) VALUES
('Blusa', 1, 'Blusa elegante o casual'),
('Top', 1, 'Top ajustado o crop top'),
('Camiseta', 1, 'Camiseta básica o estampada'),
('Body', 1, 'Body ajustado'),
('Camisa', 1, 'Camisa formal o casual'),
('Jean', 2, 'Pantalón de mezclilla'),
('Pantalón de Vestir', 2, 'Pantalón elegante'),
('Legging', 2, 'Malla ajustada'),
('Short', 2, 'Pantalón corto'),
('Jogger', 2, 'Pantalón deportivo'),
('Vestido Casual', 3, 'Vestido de uso diario'),
('Vestido de Fiesta', 3, 'Vestido para ocasiones especiales'),
('Maxi Vestido', 3, 'Vestido largo'),
('Mini Vestido', 3, 'Vestido corto'),
('Falda Mini', 4, 'Falda corta'),
('Falda Midi', 4, 'Falda hasta la rodilla'),
('Falda Maxi', 4, 'Falda larga')
ON CONFLICT (nombre) DO NOTHING;

-- Estilos
INSERT INTO estilos (nombre, descripcion) VALUES
('Oversize', 'Corte holgado y relajado'),
('Slim', 'Corte ajustado al cuerpo'),
('Skinny', 'Muy ajustado, segunda piel'),
('Cargo', 'Con bolsillos laterales grandes'),
('Straight', 'Corte recto clásico'),
('High Waist', 'Talle alto'),
('Crop', 'Cortado, más corto de lo normal'),
('Flare', 'Acampanado'),
('Wrap', 'Cruzado o envolvente'),
('Off Shoulder', 'Hombros descubiertos')
ON CONFLICT (nombre) DO NOTHING;

-- Colores
INSERT INTO colores (nombre, codigo_hex, descripcion) VALUES
('Negro', '#000000', 'Color negro clásico'),
('Blanco', '#FFFFFF', 'Color blanco puro'),
('Gris', '#808080', 'Color gris neutro'),
('Azul', '#0066CC', 'Color azul clásico'),
('Azul Marino', '#000080', 'Azul oscuro elegante'),
('Rojo', '#FF0000', 'Color rojo vibrante'),
('Rosa', '#FFC0CB', 'Color rosa suave'),
('Verde', '#008000', 'Color verde natural'),
('Amarillo', '#FFFF00', 'Color amarillo brillante'),
('Morado', '#800080', 'Color púrpura'),
('Marrón', '#A52A2A', 'Color café'),
('Beige', '#F5F5DC', 'Color crema neutro'),
('Denim', '#1560BD', 'Azul mezclilla'),
('Fucsia', '#FF1493', 'Rosa intenso'),
('Coral', '#FF7F50', 'Naranja rosado')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- FUNCIONES RPC BÁSICAS
-- ============================================

CREATE OR REPLACE FUNCTION get_categorias_activas()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, c.descripcion
    FROM categorias c
    WHERE c.activa = true
    ORDER BY c.nombre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tipos_prenda_por_categoria(categoria_id INTEGER DEFAULT NULL)
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT, categoria_id INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT tp.id, tp.nombre, tp.descripcion, tp.categoria_id
    FROM tipos_prenda tp
    WHERE tp.activa = true
    AND (categoria_id IS NULL OR tp.categoria_id = $1)
    ORDER BY tp.nombre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_estilos_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.nombre, e.descripcion
    FROM estilos e
    WHERE e.activa = true
    ORDER BY e.nombre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_colores_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, codigo_hex TEXT, descripcion TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, c.codigo_hex, c.descripcion
    FROM colores c
    WHERE c.activa = true
    ORDER BY c.nombre;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTA PARA PRODUCTOS COMPLETOS
-- ============================================

CREATE OR REPLACE VIEW vista_productos_completa AS
SELECT 
    p.*,
    c.nombre as categoria_nombre,
    tp.nombre as tipo_prenda_nombre,
    e.nombre as estilo_nombre,
    col.nombre as color_nombre,
    col.codigo_hex as color_hex
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN colores col ON p.color_id = col.id;

-- ============================================
-- FUNCIÓN MEJORADA PARA ESTADÍSTICAS DASHBOARD
-- ============================================

CREATE OR REPLACE FUNCTION obtener_estadisticas_dashboard()
RETURNS TABLE (
    total_users INTEGER,
    total_products INTEGER,
    total_categories INTEGER,
    recent_registrations INTEGER,
    active_sessions INTEGER,
    pending_orders INTEGER,
    productos_recientes JSON,
    usuarios_recientes JSON,
    bajo_stock JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Estadísticas básicas
        (SELECT COUNT(*)::INTEGER FROM auth.users),
        (SELECT COUNT(*)::INTEGER FROM productos WHERE activo = true),
        (SELECT COUNT(*)::INTEGER FROM categorias WHERE activa = true),
        (SELECT COUNT(*)::INTEGER FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days'),
        (SELECT COUNT(*)::INTEGER FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '24 hours'),
        0::INTEGER, -- pending_orders placeholder
        
        -- Productos recientes (últimos 5)
        (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', p.id,
                'nombre', p.nombre,
                'precio', p.precio,
                'categoria', COALESCE(c.nombre, p.categoria),
                'created_at', p.created_at
            )
        ) FROM (
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.activo = true
            ORDER BY p.created_at DESC
            LIMIT 5
        ) p),
        
        -- Usuarios recientes (últimos 5)
        (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'email', u.email,
                'created_at', u.created_at
            )
        ) FROM (
            SELECT email, created_at
            FROM auth.users
            ORDER BY created_at DESC
            LIMIT 5
        ) u),
        
        -- Productos bajo stock (menos de 5)
        (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', p.id,
                'nombre', p.nombre,
                'stock', p.stock,
                'categoria', COALESCE(c.nombre, p.categoria)
            )
        ) FROM (
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.activo = true AND p.stock < 5
            ORDER BY p.stock ASC
            LIMIT 10
        ) p);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_created_at ON productos(created_at);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock) WHERE activo = true;