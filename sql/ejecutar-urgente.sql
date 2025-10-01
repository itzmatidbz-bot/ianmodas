-- EJECUTAR ESTO EN SUPABASE - VERSION SIMPLE
-- Copia y pega todo este contenido en SQL Editor

-- Agregar campos a productos (sin FK)
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS categoria_id INTEGER,
ADD COLUMN IF NOT EXISTS tipo_prenda_id INTEGER,
ADD COLUMN IF NOT EXISTS estilo_id INTEGER,
ADD COLUMN IF NOT EXISTS color_id INTEGER,
ADD COLUMN IF NOT EXISTS genero VARCHAR(20) DEFAULT 'mujer',
ADD COLUMN IF NOT EXISTS temporada VARCHAR(20) DEFAULT 'todo_año';

-- Crear categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    activa BOOLEAN DEFAULT true
);

-- Insertar categorias básicas
INSERT INTO categorias (nombre) VALUES
('Tops'),('Pantalones'),('Vestidos'),('Faldas')
ON CONFLICT (nombre) DO NOTHING;

-- Crear función básica
CREATE OR REPLACE FUNCTION get_categorias_activas()
RETURNS TABLE (id INTEGER, nombre TEXT, descripcion TEXT) 
AS $$ BEGIN
    RETURN QUERY SELECT c.id, c.nombre, ''::TEXT FROM categorias c WHERE c.activa = true;
END; $$ LANGUAGE plpgsql;