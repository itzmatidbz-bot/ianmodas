-- =====================================================
-- 🏪 IAN MODAS - SISTEMA 3FN SIN RLS (REPARADO)
-- Database schema sin Row Level Security para desarrollo
-- =====================================================

-- Eliminar tablas existentes si existen (orden correcto por dependencias)
DROP VIEW IF EXISTS vista_productos_completa CASCADE;
DROP TABLE IF EXISTS producto_colores CASCADE;
DROP TABLE IF EXISTS producto_imagenes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS estilos CASCADE;
DROP TABLE IF EXISTS tipos_prenda CASCADE;
DROP TABLE IF EXISTS telas CASCADE;
DROP TABLE IF EXISTS colores CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS mayoristas CASCADE;

-- =====================================================
-- 📋 TABLA CATEGORIAS
-- =====================================================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 👗 TABLA TIPOS DE PRENDA (dependiente de categoría)
-- =====================================================
CREATE TABLE tipos_prenda (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria_id, nombre)
);

-- =====================================================
-- ✨ TABLA ESTILOS (dependiente de tipo de prenda)
-- =====================================================
CREATE TABLE estilos (
    id SERIAL PRIMARY KEY,
    tipo_prenda_id INTEGER NOT NULL REFERENCES tipos_prenda(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tipo_prenda_id, nombre)
);

-- =====================================================
-- 🧵 TABLA TELAS
-- =====================================================
CREATE TABLE telas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🎨 TABLA COLORES
-- =====================================================
CREATE TABLE colores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo_hex VARCHAR(7),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🛍️ TABLA PRODUCTOS (tabla principal)
-- =====================================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    imagen_url TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    tipo_prenda_id INTEGER REFERENCES tipos_prenda(id),
    estilo_id INTEGER REFERENCES estilos(id),
    tela_id INTEGER REFERENCES telas(id),
    genero VARCHAR(20) DEFAULT 'mujer' CHECK (genero IN ('mujer', 'hombre', 'unisex')),
    temporada VARCHAR(30) DEFAULT 'todo_año' CHECK (temporada IN ('todo_año', 'primavera_verano', 'otoño_invierno')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📸 TABLA IMÁGENES DE PRODUCTOS
-- =====================================================
CREATE TABLE producto_imagenes (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    imagen_url TEXT NOT NULL,
    orden INTEGER DEFAULT 1,
    es_principal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🎨 TABLA RELACIÓN PRODUCTOS-COLORES
-- =====================================================
CREATE TABLE producto_colores (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    color_id INTEGER NOT NULL REFERENCES colores(id) ON DELETE CASCADE,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, color_id)
);

-- =====================================================
-- 👥 TABLA MAYORISTAS (usuarios)
-- =====================================================
CREATE TABLE mayoristas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    rut VARCHAR(20),
    celular VARCHAR(20),
    nombre_empresa VARCHAR(255),
    direccion TEXT,
    departamento VARCHAR(100),
    agencia_envio VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 📊 INSERTAR DATOS DE EJEMPLO
-- =====================================================

-- Insertar Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Tops', 'Prendas superiores como blusas, camisetas, tops'),
('Pantalones', 'Todo tipo de pantalones y leggings'),
('Vestidos', 'Vestidos casuales y elegantes'),
('Faldas', 'Faldas de diferentes estilos y largos'),
('Conjuntos', 'Sets coordinados de dos o más piezas'),
('Abrigos', 'Chaquetas, abrigos y prendas de abrigo'),
('Blazers', 'Blazers y sacos elegantes'),
('Buzos', 'Buzos y sudaderas'),
('Camperas', 'Camperas casuales y deportivas'),
('Calzado', 'Zapatos, sandalias y calzado'),
('Accesorios', 'Complementos y accesorios'),
('Ropa Interior', 'Lencería y ropa interior'),
('Pijamas', 'Ropa de dormir y descanso'),
('Trajes de Baño', 'Bikinis, mallas y ropa de playa'),
('Deportivo', 'Ropa deportiva y activewear');

-- Insertar Tipos de Prenda para cada categoría
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) VALUES
-- Tops (1)
(1, 'Blusa', 'Blusas elegantes y casuales'),
(1, 'Camiseta', 'Camisetas básicas y estampadas'),
(1, 'Top', 'Tops cortos y largos'),
(1, 'Remera', 'Remeras de manga corta y larga'),
-- Pantalones (2)
(2, 'Jean', 'Pantalones de mezclilla'),
(2, 'Pantalón de Vestir', 'Pantalones elegantes'),
(2, 'Legging', 'Calzas ajustadas'),
(2, 'Palazzo', 'Pantalones anchos'),
-- Vestidos (3)
(3, 'Vestido Casual', 'Vestidos para uso diario'),
(3, 'Vestido de Fiesta', 'Vestidos elegantes'),
(3, 'Maxi Dress', 'Vestidos largos'),
-- Faldas (4)
(4, 'Falda Mini', 'Faldas cortas'),
(4, 'Falda Midi', 'Faldas de largo medio'),
(4, 'Falda Larga', 'Faldas hasta el tobillo'),
-- Conjuntos (5)
(5, 'Conjunto Deportivo', 'Sets deportivos'),
(5, 'Conjunto Elegante', 'Sets formales'),
-- Abrigos (6)
(6, 'Chaqueta', 'Chaquetas livianas'),
(6, 'Abrigo', 'Abrigos de invierno'),
-- Blazers (7)
(7, 'Blazer Clásico', 'Blazers tradicionales'),
(7, 'Blazer Casual', 'Blazers informales'),
-- Buzos (8)
(8, 'Buzo con Capucha', 'Buzos con capucha'),
(8, 'Buzo Cerrado', 'Buzos sin capucha'),
-- Camperas (9)
(9, 'Campera de Cuero', 'Camperas de cuero'),
(9, 'Campera Casual', 'Camperas informales'),
-- Calzado (10)
(10, 'Zapatos', 'Calzado formal'),
(10, 'Sandalias', 'Calzado de verano'),
-- Accesorios (11)
(11, 'Cartera', 'Bolsos y carteras'),
(11, 'Cinturón', 'Cinturones'),
-- Ropa Interior (12)
(12, 'Corpiño', 'Sujetadores'),
(12, 'Bombacha', 'Ropa interior femenina'),
-- Pijamas (13)
(13, 'Pijama Completo', 'Conjuntos de pijama'),
(13, 'Camisón', 'Camisones'),
-- Trajes de Baño (14)
(14, 'Bikini', 'Trajes de baño de dos piezas'),
(14, 'Malla Entera', 'Trajes de baño de una pieza'),
-- Deportivo (15)
(15, 'Top Deportivo', 'Tops para ejercicio'),
(15, 'Calza Deportiva', 'Leggings deportivos');

-- Insertar Estilos para algunos tipos de prenda
INSERT INTO estilos (tipo_prenda_id, nombre, descripcion) VALUES
-- Estilos para Blusas
(1, 'Formal', 'Estilo elegante para oficina'),
(1, 'Casual', 'Estilo relajado para el día'),
(1, 'Romántico', 'Con encajes y detalles femeninos'),
-- Estilos para Jeans
(5, 'Skinny', 'Ajustados al cuerpo'),
(5, 'Straight', 'Corte recto clásico'),
(5, 'Wide Leg', 'Pierna ancha'),
-- Estilos para Vestidos Casuales
(9, 'Boho', 'Estilo bohemio'),
(9, 'Minimalista', 'Líneas simples y limpias'),
(9, 'Vintage', 'Inspirado en décadas pasadas'),
-- Estilos para Vestidos de Fiesta
(10, 'Cocktail', 'Para eventos semi-formales'),
(10, 'Gala', 'Para eventos formales'),
-- Estilos para Blazers
(19, 'Ejecutivo', 'Corte formal para oficina'),
(19, 'Boyfriend', 'Corte relajado y oversize'),
-- Estilos para Conjuntos
(15, 'Coordinado', 'Piezas que combinan perfectamente'),
(16, 'Mix & Match', 'Piezas intercambiables');

-- Insertar Telas
INSERT INTO telas (nombre, descripcion) VALUES
('Algodón', 'Fibra natural suave y transpirable'),
('Jean', 'Tejido de algodón resistente'),
('Seda', 'Fibra natural elegante y brillante'),
('Lycra', 'Fibra sintética elástica'),
('Encaje', 'Tejido delicado con patrones calados'),
('Lino', 'Fibra natural fresca para verano'),
('Tencel', 'Fibra ecológica suave al tacto'),
('Viscosa', 'Fibra semisintética sedosa'),
('Bengalina', 'Tejido elástico con cuerpo'),
('Satén', 'Tejido brillante y suave'),
('Crepe', 'Tejido con textura arrugada'),
('Gasa', 'Tejido transparente y liviano'),
('Modal', 'Fibra suave derivada de la celulosa'),
('Poliéster', 'Fibra sintética versátil'),
('Spandex', 'Fibra altamente elástica'),
('Terciopelo', 'Tejido suave con pelo corto'),
('Gabardina', 'Tejido resistente y elegante'),
('Punto', 'Tejido de punto elástico'),
('Rayon', 'Fibra artificial sedosa'),
('Mesh', 'Tejido de malla transpirable');

-- Insertar Colores con códigos hexadecimales
INSERT INTO colores (nombre, codigo_hex) VALUES
('Negro', '#000000'),
('Blanco', '#FFFFFF'),
('Gris', '#808080'),
('Gris Claro', '#D3D3D3'),
('Azul', '#0066CC'),
('Azul Marino', '#000080'),
('Celeste', '#87CEEB'),
('Turquesa', '#40E0D0'),
('Rojo', '#FF0000'),
('Rosa', '#FFC0CB'),
('Coral', '#FF7F50'),
('Fucsia', '#FF1493'),
('Verde', '#008000'),
('Verde Oliva', '#808000'),
('Verde Lima', '#32CD32'),
('Amarillo', '#FFD700'),
('Mostaza', '#FFDB58'),
('Naranja', '#FF8C00'),
('Violeta', '#8A2BE2'),
('Morado', '#800080'),
('Lila', '#C8A2C8'),
('Marrón', '#A52A2A'),
('Beige', '#F5F5DC'),
('Café', '#8B4513'),
('Dorado', '#FFD700'),
('Plata', '#C0C0C0'),
('Nude', '#F5DEB3'),
('Crema', '#FFFDD0'),
('Khaki', '#F0E68C'),
('Denim', '#1560BD'),
('Bordo', '#722F37'),
('Camel', '#C19A6B'),
('Salmón', '#FA8072'),
('Menta', '#98FB98'),
('Lavanda', '#E6E6FA');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria_id, tipo_prenda_id, estilo_id, tela_id, genero, temporada, imagen_url) VALUES
('Blusa Elegante Lisa', 'Blusa clásica de manga larga perfecta para la oficina. Confeccionada en seda de alta calidad con corte favorecedor.', 2500.00, 1, 1, 1, 3, 'mujer', 'todo_año', 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=400'),
('Jean Skinny Básico', 'Jean ajustado de tiro medio en algodón con elastano. Perfecto para looks casuales y versátiles.', 3200.00, 2, 5, 4, 2, 'mujer', 'todo_año', 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400'),
('Vestido Floral Midi', 'Vestido midi con estampado floral en gasa. Ideal para eventos casuales y citas románticas.', 4800.00, 3, 9, 8, 12, 'mujer', 'primavera_verano', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'),
('Top Crop Básico', 'Top corto de algodón en colores sólidos. Perfecto para combinar con pantalones de tiro alto.', 1800.00, 1, 3, 2, 1, 'mujer', 'primavera_verano', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
('Falda Plisada Midi', 'Falda midi plisada en poliéster. Elegante y versátil para múltiples ocasiones.', 2900.00, 4, 13, NULL, 14, 'mujer', 'todo_año', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'),
('Blazer Oversize', 'Blazer de corte oversize en gabardina. Perfecto para looks ejecutivos modernos.', 5500.00, 7, 19, 21, 17, 'mujer', 'todo_año', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'),
('Conjunto Deportivo', 'Set deportivo de top y legging en lycra. Ideal para entrenamientos y actividades físicas.', 3800.00, 5, 15, 25, 4, 'mujer', 'todo_año', 'https://images.unsplash.com/photo-1506629905496-f0c8b29be8b7?w=400'),
('Vestido de Gala', 'Vestido largo de fiesta en satén con detalles de encaje. Perfecto para eventos formales.', 8900.00, 3, 10, 12, 10, 'mujer', 'todo_año', 'https://images.unsplash.com/photo-1566479179817-c7b8c8a3e96f?w=400');

-- Asignar colores a productos
INSERT INTO producto_colores (producto_id, color_id, disponible) VALUES
-- Blusa Elegante Lisa (Negro, Blanco, Azul Marino)
(1, 1, true), (1, 2, true), (1, 6, true),
-- Jean Skinny Básico (Azul, Negro)
(2, 5, true), (2, 1, true),
-- Vestido Floral Midi (Rosa, Celeste, Blanco)
(3, 10, true), (3, 7, true), (3, 2, true),
-- Top Crop Básico (Negro, Blanco, Rosa, Celeste)
(4, 1, true), (4, 2, true), (4, 10, true), (4, 7, true),
-- Falda Plisada Midi (Negro, Beige, Azul Marino)
(5, 1, true), (5, 23, true), (5, 6, true),
-- Blazer Oversize (Negro, Gris, Beige)
(6, 1, true), (6, 3, true), (6, 23, true),
-- Conjunto Deportivo (Negro, Gris, Rosa, Celeste)
(7, 1, true), (7, 3, true), (7, 10, true), (7, 7, true),
-- Vestido de Gala (Negro, Azul Marino, Bordo)
(8, 1, true), (8, 6, true), (8, 31, true);

-- Insertar mayoristas de ejemplo
INSERT INTO mayoristas (nombre, apellido, email, rut, celular, nombre_empresa, direccion, departamento, agencia_envio) VALUES
('María', 'González', 'contacto@boutiqueelegancia.com', '12345678-9', '099123456', 'Boutique Elegancia', 'Rivera 1234', 'Montevideo', 'DAC'),
('Carlos', 'Rodríguez', 'ventas@modatotal.com.uy', '23456789-0', '098987654', 'Moda Total Distribuidora', '18 de Julio 2000', 'Montevideo', 'UES'),
('Ana', 'Martínez', 'info@comercialvestimenta.com', '34567890-1', '097765432', 'Comercial Vestimenta', 'Av. Italia 3000', 'Canelones', 'Mirtrans'),
('Luis', 'Fernández', 'pedidos@almacenmodas.com.uy', '45678901-2', '096543210', 'Almacén de Modas', 'Sarandi 500', 'Maldonado', 'Nordeste'),
('Patricia', 'Silva', 'mayorista@fashioncenter.com', '56789012-3', '095432109', 'Fashion Center', 'Bulevar Artigas 1500', 'Montevideo', 'DAC');

-- =====================================================
-- 📊 CREAR VISTA COMPLETA DE PRODUCTOS
-- =====================================================
CREATE VIEW vista_productos_completa AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.imagen_url,
    p.genero,
    p.temporada,
    p.activo,
    p.created_at,
    -- Información de categorización
    c.nombre as categoria_nombre,
    tp.nombre as tipo_prenda_nombre,  
    e.nombre as estilo_nombre,
    t.nombre as tela_nombre,
    -- IDs para filtros
    p.categoria_id,
    p.tipo_prenda_id,
    p.estilo_id,
    p.tela_id,
    -- Colores disponibles (concatenados)
    STRING_AGG(DISTINCT col.nombre, ', ') as colores_disponibles,
    -- Conteo de imágenes
    COUNT(DISTINCT pi.id) as total_imagenes
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id  
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN telas t ON p.tela_id = t.id
LEFT JOIN producto_colores pc ON p.id = pc.producto_id AND pc.disponible = true
LEFT JOIN colores col ON pc.color_id = col.id
LEFT JOIN producto_imagenes pi ON p.id = pi.producto_id
WHERE p.activo = true
GROUP BY p.id, p.nombre, p.descripcion, p.precio, p.imagen_url, p.genero, p.temporada, 
         p.activo, p.created_at, p.categoria_id, p.tipo_prenda_id, p.estilo_id, p.tela_id,
         c.nombre, tp.nombre, e.nombre, t.nombre
ORDER BY p.created_at DESC;

-- =====================================================
-- 🔧 FUNCIONES RPC PARA EL SISTEMA
-- =====================================================

-- Función para obtener categorías activas
CREATE OR REPLACE FUNCTION get_categorias()
RETURNS TABLE(id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE sql
AS $$
  SELECT c.id, c.nombre, c.descripcion 
  FROM categorias c 
  WHERE c.activo = true 
  ORDER BY c.nombre;
$$;

-- Función para obtener tipos de prenda por categoría
CREATE OR REPLACE FUNCTION get_tipos_prenda(cat_nombre TEXT)
RETURNS TABLE(id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE sql
AS $$
  SELECT tp.id, tp.nombre, tp.descripcion
  FROM tipos_prenda tp
  JOIN categorias c ON tp.categoria_id = c.id
  WHERE c.nombre = cat_nombre AND tp.activo = true
  ORDER BY tp.nombre;
$$;

-- Función para obtener estilos por tipo de prenda
CREATE OR REPLACE FUNCTION get_estilos(tipo_nombre TEXT)
RETURNS TABLE(id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE sql
AS $$
  SELECT e.id, e.nombre, e.descripcion
  FROM estilos e
  JOIN tipos_prenda tp ON e.tipo_prenda_id = tp.id
  WHERE tp.nombre = tipo_nombre AND e.activo = true
  ORDER BY e.nombre;
$$;

-- Función para obtener todas las telas
CREATE OR REPLACE FUNCTION get_telas()
RETURNS TABLE(id INTEGER, nombre TEXT, descripcion TEXT) 
LANGUAGE sql
AS $$
  SELECT id, nombre, descripcion 
  FROM telas 
  WHERE activo = true 
  ORDER BY nombre;
$$;

-- Función para obtener todos los colores
CREATE OR REPLACE FUNCTION get_colores()
RETURNS TABLE(id INTEGER, nombre TEXT, codigo_hex TEXT) 
LANGUAGE sql
AS $$
  SELECT id, nombre, codigo_hex 
  FROM colores 
  WHERE activo = true 
  ORDER BY nombre;
$$;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION obtener_estadisticas_dashboard()
RETURNS TABLE(
  total_products BIGINT,
  total_users BIGINT, 
  total_categories BIGINT,
  total_colors BIGINT
) 
LANGUAGE sql
AS $$
  SELECT 
    (SELECT COUNT(*) FROM productos WHERE activo = true) as total_products,
    (SELECT COUNT(*) FROM mayoristas WHERE activo = true) as total_users,
    (SELECT COUNT(*) FROM categorias WHERE activo = true) as total_categories,
    (SELECT COUNT(*) FROM colores WHERE activo = true) as total_colors;
$$;

-- =====================================================
-- ✅ CONFIGURACIONES FINALES
-- =====================================================

-- Desactivar RLS en todas las tablas para desarrollo
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_prenda DISABLE ROW LEVEL SECURITY;
ALTER TABLE estilos DISABLE ROW LEVEL SECURITY;
ALTER TABLE telas DISABLE ROW LEVEL SECURITY;
ALTER TABLE colores DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE producto_imagenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE producto_colores DISABLE ROW LEVEL SECURITY;
ALTER TABLE mayoristas DISABLE ROW LEVEL SECURITY;

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_genero ON productos(genero);
CREATE INDEX IF NOT EXISTS idx_producto_colores_producto ON producto_colores(producto_id);
CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto ON producto_imagenes(producto_id);

-- =====================================================
-- 🎉 SISTEMA LISTO PARA USAR
-- =====================================================
-- Este script crea:
-- ✅ Base de datos 3FN normalizada
-- ✅ 8 productos de ejemplo con imágenes
-- ✅ 15 categorías completas
-- ✅ 35+ colores con códigos hex
-- ✅ 20+ tipos de tela
-- ✅ Vista completa de productos
-- ✅ Funciones RPC para frontend
-- ✅ Sin RLS para facilitar desarrollo
-- ✅ Datos realistas para testing

SELECT 'IAN MODAS - Sistema 3FN creado exitosamente! 🎉' as mensaje;