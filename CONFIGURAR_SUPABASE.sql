-- 🎯 CONFIGURACIÓN SIMPLE PARA VER USUARIOS REALES
-- Copia y pega TODO este código en el SQL Editor de Supabase

-- 1. Habilitar RLS en la tabla mayoristas
ALTER TABLE mayoristas ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas anteriores (si existen)
DROP POLICY IF EXISTS "Allow authenticated users to insert mayoristas" ON mayoristas;
DROP POLICY IF EXISTS "Allow insert mayoristas for signup" ON mayoristas;
DROP POLICY IF EXISTS "Users can insert own mayorista record" ON mayoristas;
DROP POLICY IF EXISTS "Users can read own mayorista record" ON mayoristas;
DROP POLICY IF EXISTS "Admins have full access to mayoristas" ON mayoristas;
DROP POLICY IF EXISTS "Admin can read all mayoristas" ON mayoristas;

-- 3. ⭐ POLÍTICA PRINCIPAL: Los admins pueden ver y hacer TODO
CREATE POLICY "Admins full access" 
ON mayoristas 
FOR ALL 
TO authenticated 
USING (
  -- Cambia 'admin@ianmodas.com' por TU email real
  auth.jwt() ->> 'email' = 'admin@ianmodas.com' OR
  auth.jwt() ->> 'email' LIKE '%@admin.%'
);

-- 4. Los usuarios normales solo pueden insertar/leer su propio registro
CREATE POLICY "Users own record" 
ON mayoristas 
FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Función para verificar si eres admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'admin@ianmodas.com' OR
    auth.jwt() ->> 'email' LIKE '%@admin.%'
  );
END;
$$;

-- 6. Dar permisos a la función
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;

-- 7. Asegurar que la tabla tenga created_at
ALTER TABLE mayoristas 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 8. ✅ MENSAJE DE ÉXITO
SELECT 'Configuración completada! Ahora deberías ver usuarios reales en el dashboard.' as status;