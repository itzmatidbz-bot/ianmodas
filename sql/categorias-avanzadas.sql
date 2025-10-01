-- ============================================
-- SISTEMA DE CATEGORIZACIÓN AVANZADA PARA IAN MODAS
-- Mejora la organización y especificidad de la IA
-- ============================================

-- Tabla de categorías principales
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de tipos de prenda
CREATE TABLE IF NOT EXISTS tipos_prenda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    categoria_id INTEGER REFERENCES categorias(id),
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de estilos
CREATE TABLE IF NOT EXISTS estilos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de colores
CREATE TABLE IF NOT EXISTS colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7),
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Actualizar tabla de productos con las nuevas relaciones
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id),
ADD COLUMN IF NOT EXISTS tipo_prenda_id INTEGER REFERENCES tipos_prenda(id),
ADD COLUMN IF NOT EXISTS estilo_id INTEGER REFERENCES estilos(id),
ADD COLUMN IF NOT EXISTS color_id INTEGER REFERENCES colores(id),
ADD COLUMN IF NOT EXISTS genero VARCHAR(20) DEFAULT 'mujer',
ADD COLUMN IF NOT EXISTS temporada VARCHAR(20) DEFAULT 'todo_año';

-- ============================================
-- DATOS INICIALES - CATEGORÍAS
-- ============================================

INSERT INTO categorias (nombre, descripcion) VALUES
('Tops', 'Prendas superiores: blusas, camisetas, tops'),
('Pantalones', 'Todo tipo de pantalones y jeans'),
('Vestidos', 'Vestidos casuales y elegantes'),
('Faldas', 'Faldas de diferentes estilos y largos'),
('Conjuntos', 'Sets y conjuntos coordinados'),
('Abrigos', 'Chaquetas, blazers y abrigos'),
('Ropa Interior', 'Lencería y ropa interior'),
('Accesorios', 'Complementos y accesorios')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- DATOS INICIALES - TIPOS DE PRENDA
-- ============================================

-- Tops
INSERT INTO tipos_prenda (nombre, categoria_id, descripcion) 
SELECT 'Blusa', id, 'Blusa elegante o casual' FROM categorias WHERE nombre = 'Tops'
UNION ALL
SELECT 'Top', id, 'Top ajustado o crop top' FROM categorias WHERE nombre = 'Tops'
UNION ALL
SELECT 'Camiseta', id, 'Camiseta básica o estampada' FROM categorias WHERE nombre = 'Tops'
UNION ALL
SELECT 'Body', id, 'Body ajustado' FROM categorias WHERE nombre = 'Tops'
UNION ALL
SELECT 'Camisa', id, 'Camisa formal o casual' FROM categorias WHERE nombre = 'Tops'
UNION ALL
-- Pantalones
SELECT 'Jean', id, 'Pantalón de mezclilla' FROM categorias WHERE nombre = 'Pantalones'
UNION ALL
SELECT 'Pantalón de Vestir', id, 'Pantalón elegante' FROM categorias WHERE nombre = 'Pantalones'
UNION ALL
SELECT 'Legging', id, 'Malla ajustada' FROM categorias WHERE nombre = 'Pantalones'
UNION ALL
SELECT 'Short', id, 'Pantalón corto' FROM categorias WHERE nombre = 'Pantalones'
UNION ALL
SELECT 'Jogger', id, 'Pantalón deportivo' FROM categorias WHERE nombre = 'Pantalones'
UNION ALL
SELECT 'Palazzo', id, 'Pantalón palazzo ancho' FROM categorias WHERE nombre = 'Pantalones'
UNION ALL
-- Vestidos
SELECT 'Vestido Casual', id, 'Vestido de uso diario' FROM categorias WHERE nombre = 'Vestidos'
UNION ALL
SELECT 'Vestido de Fiesta', id, 'Vestido para ocasiones especiales' FROM categorias WHERE nombre = 'Vestidos'
UNION ALL
SELECT 'Maxi Vestido', id, 'Vestido largo' FROM categorias WHERE nombre = 'Vestidos'
UNION ALL
SELECT 'Mini Vestido', id, 'Vestido corto' FROM categorias WHERE nombre = 'Vestidos'
UNION ALL
-- Faldas
SELECT 'Falda Mini', id, 'Falda corta' FROM categorias WHERE nombre = 'Faldas'
UNION ALL
SELECT 'Falda Midi', id, 'Falda hasta la rodilla' FROM categorias WHERE nombre = 'Faldas'
UNION ALL
SELECT 'Falda Maxi', id, 'Falda larga' FROM categorias WHERE nombre = 'Faldas'
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- DATOS INICIALES - ESTILOS
-- ============================================

INSERT INTO estilos (nombre, descripcion) VALUES
('Oversize', 'Corte holgado y relajado'),
('Slim', 'Corte ajustado al cuerpo'),
('Skinny', 'Muy ajustado, segunda piel'),
('Cargo', 'Con bolsillos laterales grandes'),
('Straight', 'Corte recto clásico'),
('Bootcut', 'Ligeramente acampanado abajo'),
('High Waist', 'Talle alto'),
('Low Waist', 'Talle bajo'),
('Crop', 'Cortado, más corto de lo normal'),
('Flare', 'Acampanado'),
('A-Line', 'Corte en forma de A'),
('Wrap', 'Cruzado o envolvente'),
('Off Shoulder', 'Hombros descubiertos'),
('Strapless', 'Sin tirantes'),
('Halter', 'Cuello halter'),
('V-Neck', 'Escote en V'),
('Scoop Neck', 'Escote redondo'),
('Turtle Neck', 'Cuello tortuga')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- DATOS INICIALES - COLORES
-- ============================================

INSERT INTO colores (nombre, codigo_hex, descripcion) VALUES
('Negro', '#000000', 'Color negro clásico'),
('Blanco', '#FFFFFF', 'Color blanco puro'),
('Gris', '#808080', 'Color gris neutro'),
('Azul', '#0066CC', 'Color azul clásico'),
('Azul Marino', '#000080', 'Azul oscuro elegante'),
('Azul Claro', '#87CEEB', 'Azul suave y fresco'),
('Rojo', '#FF0000', 'Color rojo vibrante'),
('Rosa', '#FFC0CB', 'Color rosa suave'),
('Fucsia', '#FF1493', 'Rosa intenso'),
('Verde', '#008000', 'Color verde natural'),
('Verde Oliva', '#808000', 'Verde apagado'),
('Amarillo', '#FFFF00', 'Color amarillo brillante'),
('Naranja', '#FFA500', 'Color naranja vibrante'),
('Morado', '#800080', 'Color púrpura'),
('Violeta', '#8A2BE2', 'Violeta intenso'),
('Marrón', '#A52A2A', 'Color café'),
('Beige', '#F5F5DC', 'Color crema neutro'),
('Camel', '#C19A6B', 'Marrón claro elegante'),
('Nude', '#E8B796', 'Color piel'),
('Dorado', '#FFD700', 'Color oro'),
('Plateado', '#C0C0C0', 'Color plata'),
('Denim', '#1560BD', 'Azul mezclilla'),
('Vino', '#722F37', 'Rojo oscuro elegante'),
('Mostaza', '#FFDB58', 'Amarillo mostaza'),
('Coral', '#FF7F50', 'Naranja rosado'),
('Mint', '#98FB98', 'Verde menta'),
('Lavanda', '#E6E6FA', 'Púrpura suave'),
('Multicolor', '#000000', 'Múltiples colores'),
('Estampado', '#000000', 'Con diseños o patrones')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- VISTA PARA CONSULTAS COMPLETAS
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
-- FUNCIÓN PARA BUSCAR PRODUCTOS AVANZADA
-- ============================================

CREATE OR REPLACE FUNCTION buscar_productos_avanzado(
    p_categoria TEXT DEFAULT NULL,
    p_tipo_prenda TEXT DEFAULT NULL,
    p_estilo TEXT DEFAULT NULL,
    p_color TEXT DEFAULT NULL,
    p_genero TEXT DEFAULT NULL,
    p_precio_min DECIMAL DEFAULT NULL,
    p_precio_max DECIMAL DEFAULT NULL,
    p_busqueda TEXT DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    nombre TEXT,
    descripcion TEXT,
    precio DECIMAL,
    imagen_url TEXT,
    categoria_nombre TEXT,
    tipo_prenda_nombre TEXT,
    estilo_nombre TEXT,
    color_nombre TEXT,
    genero TEXT,
    stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vpc.id,
        vpc.nombre,
        vpc.descripcion,
        vpc.precio,
        vpc.imagen_url,
        vpc.categoria_nombre,
        vpc.tipo_prenda_nombre,
        vpc.estilo_nombre,
        vpc.color_nombre,
        vpc.genero,
        vpc.stock
    FROM vista_productos_completa vpc
    WHERE 
        (p_categoria IS NULL OR vpc.categoria_nombre ILIKE '%' || p_categoria || '%')
        AND (p_tipo_prenda IS NULL OR vpc.tipo_prenda_nombre ILIKE '%' || p_tipo_prenda || '%')
        AND (p_estilo IS NULL OR vpc.estilo_nombre ILIKE '%' || p_estilo || '%')
        AND (p_color IS NULL OR vpc.color_nombre ILIKE '%' || p_color || '%')
        AND (p_genero IS NULL OR vpc.genero = p_genero)
        AND (p_precio_min IS NULL OR vpc.precio >= p_precio_min)
        AND (p_precio_max IS NULL OR vpc.precio <= p_precio_max)
        AND (p_busqueda IS NULL OR vpc.nombre ILIKE '%' || p_busqueda || '%' 
             OR vpc.descripcion ILIKE '%' || p_busqueda || '%')
        AND vpc.activo = true
    ORDER BY vpc.id DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIONES RPC PARA EL FRONTEND
-- ============================================

-- Obtener todas las categorías activas
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

-- Obtener tipos de prenda por categoría
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

-- Obtener todos los estilos activos
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

-- Obtener todos los colores activos
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
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_tipo_prenda ON productos(tipo_prenda_id);
CREATE INDEX IF NOT EXISTS idx_productos_estilo ON productos(estilo_id);
CREATE INDEX IF NOT EXISTS idx_productos_color ON productos(color_id);
CREATE INDEX IF NOT EXISTS idx_productos_genero ON productos(genero);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

COMMENT ON TABLE categorias IS 'Categorías principales de productos (Tops, Pantalones, etc.)';
COMMENT ON TABLE tipos_prenda IS 'Tipos específicos de prendas dentro de cada categoría';
COMMENT ON TABLE estilos IS 'Estilos de corte y diseño (Oversize, Slim, etc.)';
COMMENT ON TABLE colores IS 'Colores disponibles con códigos hex opcionales';
COMMENT ON VIEW vista_productos_completa IS 'Vista completa de productos con todas las relaciones';
COMMENT ON FUNCTION buscar_productos_avanzado IS 'Búsqueda avanzada con múltiples filtros';