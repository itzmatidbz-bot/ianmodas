-- ============================================
-- FUNCIONES AVANZADAS PARA IA Y BÚSQUEDAS
-- Mejora la especificidad de la IA y las búsquedas
-- ============================================

-- Función para obtener información completa de un producto por ID
CREATE OR REPLACE FUNCTION get_producto_completo(producto_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    nombre TEXT,
    descripcion TEXT,
    precio DECIMAL,
    stock INTEGER,
    imagen_url TEXT,
    categoria_nombre TEXT,
    tipo_prenda_nombre TEXT,
    estilo_nombre TEXT,
    color_nombre TEXT,
    color_hex TEXT,
    genero TEXT,
    temporada TEXT,
    linea TEXT,
    activo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen_url,
        c.nombre as categoria_nombre,
        tp.nombre as tipo_prenda_nombre,
        e.nombre as estilo_nombre,
        col.nombre as color_nombre,
        col.codigo_hex as color_hex,
        p.genero,
        p.temporada,
        p.categoria as linea,
        p.activo
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
    LEFT JOIN estilos e ON p.estilo_id = e.id
    LEFT JOIN colores col ON p.color_id = col.id
    WHERE p.id = producto_id;
END;
$$ LANGUAGE plpgsql;

-- Función para generar contexto de IA basado en las categorías
CREATE OR REPLACE FUNCTION generar_contexto_ia(
    p_categoria_id INTEGER DEFAULT NULL,
    p_tipo_prenda_id INTEGER DEFAULT NULL,
    p_estilo_id INTEGER DEFAULT NULL,
    p_color_id INTEGER DEFAULT NULL,
    p_genero TEXT DEFAULT 'mujer'
)
RETURNS TABLE (
    contexto_categoria TEXT,
    contexto_tipo TEXT,
    contexto_estilo TEXT,
    contexto_color TEXT,
    sugerencias TEXT[]
) AS $$
DECLARE
    cat_info TEXT;
    tipo_info TEXT;
    estilo_info TEXT;
    color_info TEXT;
    suggestions TEXT[];
BEGIN
    -- Obtener información de categoría
    SELECT 
        CASE 
            WHEN c.nombre = 'Tops' THEN 'prendas superiores elegantes y versátiles'
            WHEN c.nombre = 'Pantalones' THEN 'pantalones de alta calidad y diseño moderno'
            WHEN c.nombre = 'Vestidos' THEN 'vestidos sofisticados para toda ocasión'
            WHEN c.nombre = 'Faldas' THEN 'faldas de corte perfecto y estilo contemporáneo'
            WHEN c.nombre = 'Conjuntos' THEN 'sets coordinados de diseño exclusivo'
            ELSE 'prendas de alta calidad'
        END
    INTO cat_info
    FROM categorias c WHERE c.id = p_categoria_id;
    
    -- Obtener información de tipo de prenda
    SELECT 
        CASE 
            WHEN tp.nombre ILIKE '%blusa%' THEN 'con caída elegante y tejido premium'
            WHEN tp.nombre ILIKE '%top%' THEN 'de corte moderno y ajuste perfecto'
            WHEN tp.nombre ILIKE '%jean%' THEN 'de mezclilla superior con acabado impecable'
            WHEN tp.nombre ILIKE '%vestido%' THEN 'de diseño exclusivo y confección artesanal'
            WHEN tp.nombre ILIKE '%pantalón%' THEN 'con corte anatómico y materiales premium'
            ELSE 'de construcción superior'
        END
    INTO tipo_info
    FROM tipos_prenda tp WHERE tp.id = p_tipo_prenda_id;
    
    -- Obtener información de estilo
    SELECT 
        CASE 
            WHEN e.nombre = 'Oversize' THEN 'con silueta relajada y tendencia urban'
            WHEN e.nombre = 'Slim' THEN 'de corte ajustado que realza la figura'
            WHEN e.nombre = 'Skinny' THEN 'de ajuste ceñido y líneas estilizadas'
            WHEN e.nombre = 'High Waist' THEN 'de talle alto que estiliza la silueta'
            WHEN e.nombre = 'Crop' THEN 'de largo cortado y diseño juvenil'
            WHEN e.nombre = 'Cargo' THEN 'con detalles funcionales y estilo urbano'
            ELSE 'de diseño contemporáneo'
        END
    INTO estilo_info
    FROM estilos e WHERE e.id = p_estilo_id;
    
    -- Obtener información de color
    SELECT 
        CASE 
            WHEN col.nombre = 'Negro' THEN 'elegante y atemporal que combina con todo'
            WHEN col.nombre = 'Blanco' THEN 'clásico y versátil para cualquier ocasión'
            WHEN col.nombre ILIKE '%azul%' THEN 'sofisticado que aporta frescura y estilo'
            WHEN col.nombre ILIKE '%rojo%' THEN 'vibrante que añade personalidad y fuerza'
            WHEN col.nombre ILIKE '%rosa%' THEN 'femenino que aporta dulzura y modernidad'
            WHEN col.nombre ILIKE '%verde%' THEN 'natural que transmite armonía y frescura'
            ELSE 'distintivo que aporta personalidad'
        END
    INTO color_info
    FROM colores col WHERE col.id = p_color_id;
    
    -- Generar sugerencias específicas
    suggestions := ARRAY[
        'Ideal para mayoristas especializados en moda femenina',
        'Garantiza alta rotación por su versatilidad',
        'Márgenes competitivos y calidad premium',
        'Perfecto para boutiques y tiendas urbanas',
        'Combina tendencia actual con atemporalidad',
        'Satisfacción garantizada del cliente final'
    ];
    
    -- Si es para hombre, ajustar sugerencias
    IF p_genero = 'hombre' THEN
        suggestions := ARRAY[
            'Especializado para el mercado masculino exigente',
            'Calidad premium con diseño contemporary',
            'Ideal para tiendas de moda masculina',
            'Combina comodidad y estilo urbano',
            'Márgenes atractivos y rotación garantizada'
        ];
    END IF;
    
    RETURN QUERY SELECT 
        COALESCE(cat_info, 'prendas de alta calidad'),
        COALESCE(tipo_info, 'de construcción superior'),
        COALESCE(estilo_info, 'de diseño moderno'),
        COALESCE(color_info, 'que aporta estilo'),
        suggestions;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener productos similares (para recomendaciones)
CREATE OR REPLACE FUNCTION get_productos_similares(
    producto_id INTEGER,
    limite INTEGER DEFAULT 5
)
RETURNS TABLE (
    id INTEGER,
    nombre TEXT,
    precio DECIMAL,
    imagen_url TEXT,
    similitud_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH producto_base AS (
        SELECT categoria_id, tipo_prenda_id, estilo_id, color_id, genero
        FROM productos 
        WHERE productos.id = producto_id
    )
    SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.imagen_url,
        (
            CASE WHEN p.categoria_id = pb.categoria_id THEN 3 ELSE 0 END +
            CASE WHEN p.tipo_prenda_id = pb.tipo_prenda_id THEN 2 ELSE 0 END +
            CASE WHEN p.estilo_id = pb.estilo_id THEN 1 ELSE 0 END +
            CASE WHEN p.genero = pb.genero THEN 1 ELSE 0 END
        ) as similitud_score
    FROM productos p, producto_base pb
    WHERE p.id != producto_id 
        AND p.activo = true
        AND (
            p.categoria_id = pb.categoria_id OR
            p.tipo_prenda_id = pb.tipo_prenda_id OR
            p.estilo_id = pb.estilo_id
        )
    ORDER BY similitud_score DESC, p.id DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;

-- Función para estadísticas avanzadas del catálogo
CREATE OR REPLACE FUNCTION get_estadisticas_catalogo()
RETURNS TABLE (
    total_productos INTEGER,
    por_categoria JSON,
    por_genero JSON,
    por_temporada JSON,
    colores_populares JSON,
    estilos_tendencia JSON,
    valor_inventario DECIMAL,
    productos_bajo_stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM productos WHERE activo = true),
        
        (SELECT JSON_OBJECT_AGG(c.nombre, count)
         FROM (
             SELECT c.nombre, COUNT(p.id) as count
             FROM categorias c
             LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = true
             GROUP BY c.nombre
         ) c),
         
        (SELECT JSON_OBJECT_AGG(genero, count)
         FROM (
             SELECT genero, COUNT(*) as count
             FROM productos 
             WHERE activo = true
             GROUP BY genero
         ) g),
         
        (SELECT JSON_OBJECT_AGG(temporada, count)
         FROM (
             SELECT temporada, COUNT(*) as count
             FROM productos 
             WHERE activo = true
             GROUP BY temporada
         ) t),
         
        (SELECT JSON_OBJECT_AGG(col.nombre, count)
         FROM (
             SELECT col.nombre, COUNT(p.id) as count
             FROM colores col
             LEFT JOIN productos p ON col.id = p.color_id AND p.activo = true
             GROUP BY col.nombre
             ORDER BY count DESC
             LIMIT 10
         ) col),
         
        (SELECT JSON_OBJECT_AGG(e.nombre, count)
         FROM (
             SELECT e.nombre, COUNT(p.id) as count
             FROM estilos e
             LEFT JOIN productos p ON e.id = p.estilo_id AND p.activo = true
             GROUP BY e.nombre
             ORDER BY count DESC
             LIMIT 10
         ) e),
         
        (SELECT COALESCE(SUM(precio * stock), 0) FROM productos WHERE activo = true),
        (SELECT COUNT(*)::INTEGER FROM productos WHERE activo = true AND stock < 5);
END;
$$ LANGUAGE plpgsql;

-- Índices adicionales para mejorar el rendimiento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_search_text 
ON productos USING gin(to_tsvector('spanish', nombre || ' ' || COALESCE(descripcion, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_categoria_tipo 
ON productos(categoria_id, tipo_prenda_id) WHERE activo = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_precio_stock 
ON productos(precio, stock) WHERE activo = true;

-- Función para búsqueda full-text avanzada
CREATE OR REPLACE FUNCTION buscar_productos_fulltext(
    query_text TEXT,
    limite INTEGER DEFAULT 20
)
RETURNS TABLE (
    id INTEGER,
    nombre TEXT,
    descripcion TEXT,
    precio DECIMAL,
    imagen_url TEXT,
    categoria_nombre TEXT,
    tipo_prenda_nombre TEXT,
    relevancia REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.imagen_url,
        c.nombre as categoria_nombre,
        tp.nombre as tipo_prenda_nombre,
        ts_rank(
            to_tsvector('spanish', p.nombre || ' ' || COALESCE(p.descripcion, '') || ' ' || COALESCE(c.nombre, '') || ' ' || COALESCE(tp.nombre, '')),
            plainto_tsquery('spanish', query_text)
        ) as relevancia
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
    WHERE 
        p.activo = true
        AND (
            to_tsvector('spanish', p.nombre || ' ' || COALESCE(p.descripcion, '') || ' ' || COALESCE(c.nombre, '') || ' ' || COALESCE(tp.nombre, ''))
            @@ plainto_tsquery('spanish', query_text)
        )
    ORDER BY relevancia DESC, p.id DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;

-- Comentarios finales
COMMENT ON FUNCTION get_producto_completo IS 'Obtiene información completa de un producto con todas sus relaciones';
COMMENT ON FUNCTION generar_contexto_ia IS 'Genera contexto específico para la IA basado en categorización';
COMMENT ON FUNCTION get_productos_similares IS 'Encuentra productos similares para recomendaciones';
COMMENT ON FUNCTION get_estadisticas_catalogo IS 'Estadísticas completas del catálogo con JSON';
COMMENT ON FUNCTION buscar_productos_fulltext IS 'Búsqueda full-text avanzada con ranking de relevancia';