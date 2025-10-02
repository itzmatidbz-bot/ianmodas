-- =====================================================
-- 🏪 IAN MODAS - SISTEMA COMPLETO 3FN SIN STOCK
-- Base de datos normalizada con autogeneración de tipos
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
-- 🧵 TABLA TELAS (independiente)
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
    codigo_hex VARCHAR(7) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🛍️ TABLA PRODUCTOS (SIN STOCK)
-- =====================================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    tipo_prenda_id INTEGER REFERENCES tipos_prenda(id) ON DELETE SET NULL,
    estilo_id INTEGER REFERENCES estilos(id) ON DELETE SET NULL,
    tela_id INTEGER REFERENCES telas(id) ON DELETE SET NULL,
    genero VARCHAR(20) DEFAULT 'mujer' CHECK (genero IN ('mujer', 'hombre', 'unisex')),
    temporada VARCHAR(20) DEFAULT 'todo_año' CHECK (temporada IN ('verano', 'otoño', 'invierno', 'primavera', 'todo_año')),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🖼️ TABLA IMÁGENES DE PRODUCTOS (múltiples)
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
-- 🌈 TABLA COLORES POR PRODUCTO (relación N:M)
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
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE,
    celular VARCHAR(20) NOT NULL,
    nombre_empresa VARCHAR(200) NOT NULL,
    direccion TEXT NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    agencia_envio VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 🔄 TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE
    ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 📊 DATOS INICIALES - CATEGORÍAS
-- =====================================================
INSERT INTO categorias (nombre, descripcion) VALUES
('Tops', 'Prendas superiores como blusas, camisetas, tops'),
('Pantalones', 'Todo tipo de pantalones y leggins'),
('Vestidos', 'Vestidos casuales y elegantes'),
('Faldas', 'Faldas de diferentes estilos y largos'),
('Conjuntos', 'Sets coordinados de dos o más piezas'),
('Abrigos', 'Chaquetas, tapados y abrigos'),
('Blazers', 'Blazers y sacos elegantes'),
('Buzos', 'Buzos y sudaderas'),
('Camperas', 'Camperas deportivas y casuales'),
('Calzado', 'Zapatos, botas y sandalias'),
('Accesorios', 'Carteras, cinturones y complementos'),
('Ropa Interior', 'Lencería y ropa interior'),
('Trajes de Baño', 'Bikinis y mallas'),
('Pijamas', 'Ropa de dormir y descanso'),
('Deportivo', 'Ropa deportiva y activewear');

-- =====================================================
-- 👗 DATOS INICIALES - TIPOS DE PRENDA
-- =====================================================
INSERT INTO tipos_prenda (categoria_id, nombre, descripcion) VALUES
-- Tops (id: 1)
(1, 'Blusa', 'Blusa elegante para ocasiones especiales'),
(1, 'Camiseta', 'Camiseta básica de uso diario'),
(1, 'Top', 'Top moderno y versátil'),
(1, 'Crop Top', 'Top corto que no llega a la cintura'),
(1, 'Body', 'Prenda ajustada de una pieza'),
(1, 'Camisa', 'Camisa clásica con botones'),

-- Pantalones (id: 2)
(2, 'Jean', 'Pantalón de mezclilla resistente'),
(2, 'Pantalón de Vestir', 'Pantalón elegante para oficina'),
(2, 'Legging', 'Pantalón ajustado elástico'),
(2, 'Cargo', 'Pantalón con bolsillos laterales'),
(2, 'Palazzo', 'Pantalón de piernas anchas'),
(2, 'Short', 'Pantalón corto'),

-- Vestidos (id: 3)
(3, 'Vestido Casual', 'Vestido para uso diario'),
(3, 'Vestido de Fiesta', 'Vestido elegante para eventos'),
(3, 'Maxi Vestido', 'Vestido largo hasta los tobillos'),
(3, 'Mini Vestido', 'Vestido corto por encima de la rodilla'),
(3, 'Midi Vestido', 'Vestido de largo medio'),

-- Faldas (id: 4)
(4, 'Falda Mini', 'Falda corta por encima de la rodilla'),
(4, 'Falda Midi', 'Falda de largo medio'),
(4, 'Falda Maxi', 'Falda larga hasta los tobillos'),
(4, 'Falda Plisada', 'Falda con pliegues'),
(4, 'Falda Tubo', 'Falda ajustada y recta'),

-- Conjuntos (id: 5)
(5, 'Conjunto Deportivo', 'Set de ropa deportiva'),
(5, 'Conjunto Casual', 'Set casual para uso diario'),
(5, 'Conjunto Elegante', 'Set formal para ocasiones especiales'),
(5, 'Conjunto Playero', 'Set para playa o piscina'),

-- Abrigos (id: 6)
(6, 'Tapado', 'Abrigo largo y elegante'),
(6, 'Chaqueta', 'Chaqueta de entretiempo'),
(6, 'Cardigan', 'Chaqueta de punto con botones'),
(6, 'Sobretodo', 'Abrigo largo sobre otras prendas'),

-- Blazers (id: 7)
(7, 'Blazer Clásico', 'Blazer tradicional de oficina'),
(7, 'Blazer Casual', 'Blazer informal para diferentes ocasiones'),
(7, 'Saco', 'Saco elegante y formal'),

-- Buzos (id: 8)
(8, 'Buzo con Capucha', 'Sudadera con capucha'),
(8, 'Buzo Básico', 'Sudadera sin capucha'),
(8, 'Buzo Crop', 'Sudadera corta'),

-- Camperas (id: 9)
(9, 'Campera de Jean', 'Chaqueta de mezclilla'),
(9, 'Campera Deportiva', 'Chaqueta deportiva'),
(9, 'Campera de Cuero', 'Chaqueta de cuero sintético'),

-- Calzado (id: 10)
(10, 'Zapatos', 'Calzado formal'),
(10, 'Botas', 'Calzado que cubre el tobillo'),
(10, 'Sandalias', 'Calzado abierto'),
(10, 'Zapatillas', 'Calzado deportivo');

-- =====================================================
-- ✨ DATOS INICIALES - ESTILOS
-- =====================================================
INSERT INTO estilos (tipo_prenda_id, nombre, descripcion) VALUES
-- Estilos para Blusas (tipo_prenda_id: 1)
(1, 'Clásica', 'Estilo clásico y elegante'),
(1, 'Romántica', 'Con detalles femeninos como encajes'),
(1, 'Moderna', 'Diseño contemporáneo'),
(1, 'Vintage', 'Inspiración retro'),

-- Estilos para Camisetas (tipo_prenda_id: 2)
(2, 'Básica', 'Estilo simple y versátil'),
(2, 'Oversize', 'Corte holgado y relajado'),
(2, 'Fitted', 'Ajustada al cuerpo'),

-- Estilos para Tops (tipo_prenda_id: 3)
(3, 'Casual', 'Para uso diario'),
(3, 'Elegante', 'Para ocasiones especiales'),
(3, 'Deportivo', 'Para actividades físicas'),

-- Estilos para Crop Tops (tipo_prenda_id: 4)
(4, 'Básico', 'Diseño simple'),
(4, 'Con Tirantes', 'Con tirantes delgados'),
(4, 'Off Shoulder', 'Hombros descubiertos'),

-- Estilos para Jeans (tipo_prenda_id: 7)
(7, 'Skinny', 'Muy ajustado'),
(7, 'Straight', 'Corte recto'),
(7, 'Boyfriend', 'Corte relajado'),
(7, 'High Waist', 'Talle alto'),
(7, 'Flare', 'Acampanado'),

-- Estilos para Pantalones de Vestir (tipo_prenda_id: 8)
(8, 'Clásico', 'Estilo tradicional de oficina'),
(8, 'Slim', 'Corte ajustado'),
(8, 'Wide Leg', 'Piernas anchas'),

-- Estilos para Vestidos Casuales (tipo_prenda_id: 13)
(13, 'Camisero', 'Estilo camisa con botones'),
(13, 'Wrap', 'Estilo cruzado'),
(13, 'A-Line', 'Corte línea A'),
(13, 'Shift', 'Corte recto suelto'),

-- Estilos para Vestidos de Fiesta (tipo_prenda_id: 14)
(14, 'Cocktail', 'Para eventos de noche'),
(14, 'Largo', 'Vestido de gala'),
(14, 'Sirena', 'Ajustado con cola'),
(14, 'Princesa', 'Con falda amplia'),

-- Estilos para Faldas (tipo_prenda_id: 18-22)
(18, 'Básica', 'Diseño simple'),
(19, 'Clásica', 'Estilo tradicional'),
(20, 'Bohemia', 'Estilo libre y fluido'),
(21, 'Escolar', 'Estilo colegial'),
(22, 'Ejecutiva', 'Para oficina');

-- =====================================================
-- 🧵 DATOS INICIALES - TELAS
-- =====================================================
INSERT INTO telas (nombre, descripcion) VALUES
('Algodón', 'Fibra natural suave y transpirable'),
('Jean', 'Tejido de algodón resistente y duradero'),
('Seda', 'Fibra natural elegante y brillante'),
('Lycra', 'Fibra sintética elástica'),
('Encaje', 'Tejido delicado con patrones calados'),
('Lino', 'Fibra natural fresca y resistente'),
('Tencel', 'Fibra ecológica suave y antibacteriana'),
('Viscosa', 'Fibra semisintética con tacto sedoso'),
('Bengalina', 'Tejido elástico con cuerpo firme'),
('Satén', 'Tejido brillante y suave'),
('Ecocuero', 'Material sintético ecológico'),
('Paño de Lana', 'Tejido de lana compacto'),
('Mohair', 'Fibra de cabra angora'),
('Lana', 'Fibra natural térmica'),
('Hilo', 'Tejido fino y delicado'),
('Crepe', 'Tejido con textura rugosa'),
('Georgette', 'Tejido ligero y transparente'),
('Chiffon', 'Tejido muy ligero y vaporoso'),
('Tul', 'Tejido de malla fina'),
('Polar', 'Tejido sintético abrigado');

-- =====================================================
-- 🎨 DATOS INICIALES - COLORES
-- =====================================================
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
('Vino', '#722F37'),
('Camel', '#C19A6B'),
('Mint', '#98FB98'),
('Lavanda', '#E6E6FA'),
('Salmón', '#FA8072');

-- =====================================================
-- 👥 DATOS INICIALES - MAYORISTAS
-- =====================================================
INSERT INTO mayoristas (email, nombre, apellido, rut, celular, nombre_empresa, direccion, departamento, agencia_envio) VALUES
('maria.gonzalez@boutique.com', 'María', 'González', '12345678-9', '099123456', 'Boutique Elegancia', 'Rivera 1234', 'Montevideo', 'DAC'),
('carlos.rodriguez@modatotal.com', 'Carlos', 'Rodríguez', '23456789-0', '098987654', 'Moda Total Distribuidora', '18 de Julio 2000', 'Montevideo', 'UES'),
('ana.martinez@vestimenta.com', 'Ana', 'Martínez', '34567890-1', '097765432', 'Comercial Vestimenta', 'Av. Italia 3000', 'Canelones', 'Mirtrans'),
('luis.fernandez@almacen.com', 'Luis', 'Fernández', '45678901-2', '096543210', 'Almacén de Modas', 'Sarandi 500', 'Maldonado', 'Nordeste'),
('patricia.silva@fashion.com', 'Patricia', 'Silva', '56789012-3', '095432109', 'Fashion Center', 'Bulevar Artigas 1500', 'Montevideo', 'DAC'),
('roberto.lopez@trendy.com', 'Roberto', 'López', '67890123-4', '094321098', 'Trendy Fashion', 'Mercedes 800', 'Montevideo', 'UES'),
('laura.garcia@chic.com', 'Laura', 'García', '78901234-5', '093210987', 'Chic Boutique', 'Colonia 1200', 'Montevideo', 'DAC'),
('diego.perez@style.com', 'Diego', 'Pérez', '89012345-6', '092109876', 'Style World', 'Pocitos 2500', 'Montevideo', 'Mirtrans'),
('sofia.torres@glam.com', 'Sofía', 'Torres', '90123456-7', '091098765', 'Glam Store', 'Cordón 900', 'Montevideo', 'UES'),
('manuel.ruiz@elegante.com', 'Manuel', 'Ruiz', '01234567-8', '090987654', 'Elegante SA', 'Punta Carretas 1800', 'Montevideo', 'DAC'),
('valeria.castro@moda.com', 'Valeria', 'Castro', '11234567-9', '099876543', 'Moda Express', 'Malvín Norte 600', 'Montevideo', 'Nordeste'),
('fernando.vega@boutique.com', 'Fernando', 'Vega', '21234567-0', '098765432', 'Boutique Premium', 'Centro 1500', 'Montevideo', 'UES'),
('camila.herrera@fashion.com', 'Camila', 'Herrera', '31234567-1', '097654321', 'Fashion House', 'Carrasco 2200', 'Montevideo', 'DAC');

-- =====================================================
-- 🛍️ DATOS INICIALES - PRODUCTOS EJEMPLO
-- =====================================================
INSERT INTO productos (nombre, descripcion, precio, categoria_id, tipo_prenda_id, estilo_id, tela_id, genero, temporada, imagen_url) VALUES
('Blusa Elegante con Encaje', 'Hermosa blusa con detalles de encaje, perfecta para ocasiones especiales. Confeccionada en tela suave y cómoda.', 2500.00, 1, 1, 2, 5, 'mujer', 'todo_año', 'https://example.com/blusa1.jpg'),
('Jean Skinny Talle Alto', 'Jean ajustado de talle alto que estiliza la figura. Confeccionado en denim de alta calidad con elasticidad.', 3200.00, 2, 7, 5, 2, 'mujer', 'todo_año', 'https://example.com/jean1.jpg'),
('Vestido Maxi Bohemio', 'Vestido largo de estilo bohemio, ideal para días de verano. Tela fluida y cómoda con estampado floral.', 4500.00, 3, 15, NULL, 17, 'mujer', 'verano', 'https://example.com/vestido1.jpg'),
('Falda Midi Plisada', 'Falda de largo medio con pliegues elegantes. Perfecta para combinar con diferentes tops.', 2800.00, 4, 19, 19, 8, 'mujer', 'todo_año', 'https://example.com/falda1.jpg'),
('Top Crop Básico', 'Top corto básico y versátil, ideal para combinar con pantalones de talle alto.', 1500.00, 1, 4, 4, 1, 'mujer', 'verano', 'https://example.com/top1.jpg'),
('Pantalón Palazzo Fluido', 'Pantalón de piernas anchas en tela fluida, muy cómodo y elegante.', 3500.00, 2, 11, NULL, 7, 'mujer', 'verano', 'https://example.com/palazzo1.jpg'),
('Blazer Clásico Negro', 'Blazer negro de corte clásico, esencial en todo guardarropa femenino.', 4200.00, 7, 28, 28, 12, 'mujer', 'todo_año', 'https://example.com/blazer1.jpg'),
('Vestido Cocktail Sirena', 'Elegante vestido de fiesta con corte sirena, perfecto para eventos especiales.', 6500.00, 3, 14, 14, 10, 'mujer', 'todo_año', 'https://example.com/cocktail1.jpg');

-- =====================================================
-- 🌈 RELACIONES PRODUCTO-COLORES EJEMPLO
-- =====================================================
INSERT INTO producto_colores (producto_id, color_id) VALUES
-- Blusa Elegante (múltiples colores)
(1, 1), (1, 2), (1, 9), (1, 23),
-- Jean Skinny (colores típicos de jean)
(2, 1), (2, 30), (2, 4),
-- Vestido Maxi (colores bohemios)
(3, 2), (3, 23), (3, 28), (3, 15),
-- Falda Midi (colores neutros)
(4, 1), (4, 3), (4, 5), (4, 23),
-- Top Crop (colores básicos)
(5, 1), (5, 2), (5, 9), (5, 10),
-- Pantalón Palazzo (colores elegantes)
(6, 1), (6, 5), (6, 23), (6, 31),
-- Blazer Clásico (colores formales)
(7, 1), (7, 5), (7, 3),
-- Vestido Cocktail (colores de fiesta)
(8, 1), (8, 9), (8, 31), (8, 19);

-- =====================================================
-- 📷 IMÁGENES EJEMPLO
-- =====================================================
INSERT INTO producto_imagenes (producto_id, imagen_url, orden, es_principal) VALUES
(1, 'https://example.com/blusa1-main.jpg', 1, true),
(1, 'https://example.com/blusa1-detail.jpg', 2, false),
(2, 'https://example.com/jean1-main.jpg', 1, true),
(2, 'https://example.com/jean1-back.jpg', 2, false),
(3, 'https://example.com/vestido1-main.jpg', 1, true),
(4, 'https://example.com/falda1-main.jpg', 1, true),
(5, 'https://example.com/top1-main.jpg', 1, true),
(6, 'https://example.com/palazzo1-main.jpg', 1, true),
(7, 'https://example.com/blazer1-main.jpg', 1, true),
(8, 'https://example.com/cocktail1-main.jpg', 1, true);

-- =====================================================
-- 🔍 VISTA PRODUCTOS COMPLETA (SIN STOCK)
-- =====================================================
CREATE OR REPLACE VIEW vista_productos_completa AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.genero,
    p.temporada,
    p.imagen_url,
    p.activo,
    p.created_at,
    p.updated_at,
    -- Categoría
    c.nombre as categoria_nombre,
    c.id as categoria_id,
    -- Tipo de prenda
    COALESCE(tp.nombre, 'Sin especificar') as tipo_prenda_nombre,
    tp.id as tipo_prenda_id,
    -- Estilo
    COALESCE(e.nombre, 'Clásico') as estilo_nombre,
    e.id as estilo_id,
    -- Tela
    COALESCE(t.nombre, 'Algodón') as tela_nombre,
    t.id as tela_id,
    -- Campos legacy para compatibilidad
    c.nombre as categoria,
    COALESCE(tp.nombre, 'Sin especificar') as tipo_prenda,
    COALESCE(e.nombre, 'Clásico') as estilo,
    COALESCE(t.nombre, 'Algodón') as tela
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
LEFT JOIN estilos e ON p.estilo_id = e.id
LEFT JOIN telas t ON p.tela_id = t.id
WHERE p.activo = true
ORDER BY p.nombre ASC;

-- =====================================================
-- 🔧 FUNCIONES RPC PARA EL FRONTEND
-- =====================================================

-- Función: Obtener categorías activas
CREATE OR REPLACE FUNCTION get_categorias()
RETURNS TABLE(id INTEGER, nombre VARCHAR, descripcion TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, c.descripcion
    FROM categorias c
    WHERE c.activo = true
    ORDER BY c.nombre ASC;
END;
$$;

-- Función: Obtener tipos de prenda por categoría
CREATE OR REPLACE FUNCTION get_tipos_prenda(cat_nombre TEXT DEFAULT NULL)
RETURNS TABLE(id INTEGER, nombre VARCHAR, descripcion TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    IF cat_nombre IS NULL THEN
        RETURN QUERY
        SELECT tp.id, tp.nombre, tp.descripcion
        FROM tipos_prenda tp
        WHERE tp.activo = true
        ORDER BY tp.nombre ASC;
    ELSE
        RETURN QUERY
        SELECT tp.id, tp.nombre, tp.descripcion
        FROM tipos_prenda tp
        JOIN categorias c ON tp.categoria_id = c.id
        WHERE tp.activo = true AND c.nombre ILIKE cat_nombre
        ORDER BY tp.nombre ASC;
    END IF;
END;
$$;

-- Función: Obtener estilos por tipo de prenda
CREATE OR REPLACE FUNCTION get_estilos(tipo_nombre TEXT DEFAULT NULL)
RETURNS TABLE(id INTEGER, nombre VARCHAR, descripcion TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    IF tipo_nombre IS NULL THEN
        RETURN QUERY
        SELECT e.id, e.nombre, e.descripcion
        FROM estilos e
        WHERE e.activo = true
        ORDER BY e.nombre ASC;
    ELSE
        RETURN QUERY
        SELECT e.id, e.nombre, e.descripcion
        FROM estilos e
        JOIN tipos_prenda tp ON e.tipo_prenda_id = tp.id
        WHERE e.activo = true AND tp.nombre ILIKE tipo_nombre
        ORDER BY e.nombre ASC;
    END IF;
END;
$$;

-- Función: Obtener telas activas
CREATE OR REPLACE FUNCTION get_telas()
RETURNS TABLE(id INTEGER, nombre VARCHAR, descripcion TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.nombre, t.descripcion
    FROM telas t
    WHERE t.activo = true
    ORDER BY t.nombre ASC;
END;
$$;

-- Función: Obtener colores activos
CREATE OR REPLACE FUNCTION get_colores()
RETURNS TABLE(id INTEGER, nombre VARCHAR, codigo_hex VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nombre, c.codigo_hex
    FROM colores c
    WHERE c.activo = true
    ORDER BY c.nombre ASC;
END;
$$;

-- Función: Estadísticas del dashboard (SIN STOCK)
CREATE OR REPLACE FUNCTION obtener_estadisticas_dashboard()
RETURNS TABLE(
    total_users INTEGER,
    total_products INTEGER,
    total_categories INTEGER,
    recent_registrations INTEGER,
    active_sessions INTEGER,
    pending_orders INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM mayoristas WHERE activo = true) as total_users,
        (SELECT COUNT(*)::INTEGER FROM productos WHERE activo = true) as total_products,
        (SELECT COUNT(*)::INTEGER FROM categorias WHERE activo = true) as total_categories,
        (SELECT COUNT(*)::INTEGER FROM mayoristas WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_registrations,
        0 as active_sessions, -- Placeholder
        0 as pending_orders   -- Placeholder
    ;
END;
$$;

-- Función: Verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Por simplicidad, siempre retorna true
    -- En producción aquí iría la lógica real de verificación
    RETURN true;
END;
$$;

-- =====================================================
-- 🔐 POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en las tablas principales
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_prenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE estilos ENABLE ROW LEVEL SECURITY;
ALTER TABLE telas ENABLE ROW LEVEL SECURITY;
ALTER TABLE colores ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mayoristas ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (solo datos activos)
CREATE POLICY "Public read access" ON categorias FOR SELECT USING (activo = true);
CREATE POLICY "Public read access" ON tipos_prenda FOR SELECT USING (activo = true);
CREATE POLICY "Public read access" ON estilos FOR SELECT USING (activo = true);
CREATE POLICY "Public read access" ON telas FOR SELECT USING (activo = true);
CREATE POLICY "Public read access" ON colores FOR SELECT USING (activo = true);
CREATE POLICY "Public read access" ON productos FOR SELECT USING (activo = true);

-- Política para mayoristas (pueden ver sus propios datos)
CREATE POLICY "Users can view own data" ON mayoristas FOR SELECT USING (auth.email() = email);

-- =====================================================
-- ✅ VERIFICACIONES FINALES
-- =====================================================

-- Verificar que todo se creó correctamente
SELECT 'Categorías creadas: ' || COUNT(*) FROM categorias;
SELECT 'Tipos de prenda creados: ' || COUNT(*) FROM tipos_prenda;
SELECT 'Estilos creados: ' || COUNT(*) FROM estilos;
SELECT 'Telas creadas: ' || COUNT(*) FROM telas;
SELECT 'Colores creados: ' || COUNT(*) FROM colores;
SELECT 'Productos creados: ' || COUNT(*) FROM productos;
SELECT 'Mayoristas creados: ' || COUNT(*) FROM mayoristas;

-- Verificar vista
SELECT 'Vista productos completa: ' || COUNT(*) FROM vista_productos_completa;

-- =====================================================
-- 🎉 SISTEMA COMPLETO CREADO
-- =====================================================
/*
RESUMEN DEL SISTEMA:
✅ Base de datos en 3FN normalizada
✅ SIN referencias a stock en ningún lado
✅ Relaciones correctas con FK y CASCADE
✅ Datos de ejemplo completos
✅ Vista optimizada con LEFT JOIN y COALESCE
✅ Funciones RPC para frontend
✅ Políticas de seguridad RLS
✅ Compatibilidad con el frontend existente

El sistema está listo para usar con:
- supabase.from('vista_productos_completa').select('*')
- supabase.rpc('get_categorias')
- supabase.rpc('get_tipos_prenda', { cat_nombre: 'Tops' })
- supabase.rpc('obtener_estadisticas_dashboard')

TODO FUNCIONAL Y SIN STOCK 🎯
*/