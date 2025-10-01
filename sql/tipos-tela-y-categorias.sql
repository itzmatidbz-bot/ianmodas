-- AGREGAR TIPOS DE TELA Y NUEVAS CATEGORÍAS PRINCIPALES
-- Ejecutar en Supabase

-- PASO 1: Crear tabla de tipos de tela
CREATE TABLE IF NOT EXISTS tipos_tela (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PASO 2: Insertar tipos de tela con descripciones
INSERT INTO tipos_tela (nombre, descripcion) VALUES 
('Lino', 'Fibra natural resistente y transpirable, ideal para climas cálidos'),
('Tencel', 'Fibra de origen vegetal, suave y antibacteriana con caída elegante'),
('Viscosa', 'Fibra semisintética con tacto sedoso y buena caída'),
('Bengalina', 'Tejido elástico con cuerpo firme, perfecto para prendas que marcan la silueta'),
('Satén', 'Tejido brillante y suave con superficie lisa y elegante'),
('Jean', 'Tejido de algodón resistente, clásico para prendas casuales'),
('Ecocuero', 'Material sintético ecológico que imita el cuero natural'),
('Paño de Lana', 'Tejido de lana compacto y abrigado para prendas de invierno'),
('Mohair', 'Fibra de cabra angora, suave y cálida con brillo natural'),
('Lana', 'Fibra natural térmica, perfecta para abrigo y comodidad')
ON CONFLICT (nombre) DO NOTHING;

-- PASO 3: Agregar columna tipo_tela_id a productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tipo_tela_id INTEGER;

-- PASO 4: Agregar nuevas categorías principales
INSERT INTO categorias (nombre) VALUES 
('Buzos'),
('Camperas'),
('Tapados'),
('Accesorios'),
('Calzado'),
('Ropa Interior'),
('Pijamas'),
('Trajes de Baño')
ON CONFLICT (nombre) DO NOTHING;

-- PASO 5: Agregar tipos de prenda para las nuevas categorías
INSERT INTO tipos_prenda (nombre, categoria_id) VALUES 
-- Buzos (categoria_id será el ID de 'Buzos')
('Buzo con Capucha', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Canguro', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Oversize', (SELECT id FROM categorias WHERE nombre = 'Buzos')),
('Buzo Crop', (SELECT id FROM categorias WHERE nombre = 'Buzos')),

-- Camperas (categoria_id será el ID de 'Camperas')
('Campera de Jean', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Campera Bomber', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Campera de Cuero', (SELECT id FROM categorias WHERE nombre = 'Camperas')),
('Campera Deportiva', (SELECT id FROM categorias WHERE nombre = 'Camperas')),

-- Tapados (categoria_id será el ID de 'Tapados')
('Tapado Largo', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Tapado Corto', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Tapado de Lana', (SELECT id FROM categorias WHERE nombre = 'Tapados')),
('Tapado Elegante', (SELECT id FROM categorias WHERE nombre = 'Tapados')),

-- Accesorios
('Cartera', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Cinturón', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Collar', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Pulsera', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Gorro', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),
('Bufanda', (SELECT id FROM categorias WHERE nombre = 'Accesorios')),

-- Calzado
('Zapatilla', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Bota', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Sandalia', (SELECT id FROM categorias WHERE nombre = 'Calzado')),
('Zapato', (SELECT id FROM categorias WHERE nombre = 'Calzado')),

-- Ropa Interior
('Corpiño', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Bombacha', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Boxer', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),
('Camiseta', (SELECT id FROM categorias WHERE nombre = 'Ropa Interior')),

-- Pijamas
('Pijama Completo', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),
('Camisón', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),
('Short de Dormir', (SELECT id FROM categorias WHERE nombre = 'Pijamas')),

-- Trajes de Baño
('Bikini', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),
('Malla Entera', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño')),
('Short de Baño', (SELECT id FROM categorias WHERE nombre = 'Trajes de Baño'))
ON CONFLICT (nombre) DO NOTHING;

-- PASO 6: Crear función RPC para obtener tipos de tela activos
CREATE OR REPLACE FUNCTION get_tipos_tela_activos()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT tt.id, tt.nombre, COALESCE(tt.descripcion, '') as descripcion
    FROM tipos_tela tt 
    WHERE tt.activa = true 
    ORDER BY tt.nombre;
END;
$$;

-- PASO 7: Actualizar la vista de productos completa para incluir tipo de tela
DROP VIEW IF EXISTS vista_productos_completa;
CREATE VIEW vista_productos_completa AS
SELECT 
    p.*,
    c.nombre as categoria_nombre,
    tp.nombre as tipo_prenda_nombre,
    e.nombre as estilo_nombre,
    col.nombre as color_nombre,
    col.codigo_hex as color_hex,
    tt.nombre as tipo_tela_nombre,
    tt.descripcion as tipo_tela_descripcion
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN colores col ON p.color_id = col.id
LEFT JOIN tipos_tela tt ON p.tipo_tela_id = tt.id;

-- PASO 8: Verificar datos insertados
SELECT 'Categorías creadas:' as tipo, COUNT(*) as cantidad FROM categorias WHERE activa = true
UNION ALL
SELECT 'Tipos de prenda creados:', COUNT(*) FROM tipos_prenda WHERE activa = true
UNION ALL
SELECT 'Tipos de tela creados:', COUNT(*) FROM tipos_tela WHERE activa = true;

-- PASO 9: Mostrar resumen de categorías
SELECT 
    c.nombre as categoria,
    COUNT(tp.id) as tipos_prenda
FROM categorias c
LEFT JOIN tipos_prenda tp ON c.id = tp.categoria_id
WHERE c.activa = true
GROUP BY c.nombre
ORDER BY c.nombre;