-- INSTRUCCIONES PARA CONFIGURAR SUPABASE
-- Ejecuta estos comandos en el SQL Editor de tu proyecto Supabase

-- 1. OPCIÓN A: Desactivar confirmación de email para todos los usuarios nuevos
-- (Recomendado para desarrollo/testing)
-- Ve a: Authentication > Settings > Email Auth
-- Desactiva "Enable email confirmations"

-- 2. OPCIÓN B: Confirmar manualmente el usuario existente
-- Si ya tienes un usuario sin confirmar, puedes confirmarlo manualmente:

UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email = 'tu-email@ejemplo.com';  -- Reemplaza con el email real

-- 3. OPCIÓN C: Crear una política más permisiva para mayoristas (temporal)
-- Esta política permite insertar mayoristas incluso sin autenticación (solo para testing)

DROP POLICY IF EXISTS "Allow authenticated users to insert mayoristas" ON mayoristas;

CREATE POLICY "Allow insert mayoristas for signup" 
ON mayoristas 
FOR INSERT 
TO public
WITH CHECK (true);

-- IMPORTANTE: La OPCIÓN C es menos segura, úsala solo para testing
-- Una vez que funcione, vuelve a la política original:

-- DROP POLICY IF EXISTS "Allow insert mayoristas for signup" ON mayoristas;
-- CREATE POLICY "Allow authenticated users to insert mayoristas" 
-- ON mayoristas 
-- FOR INSERT 
-- TO authenticated 
-- WITH CHECK (auth.uid() = id);

-- 4. Verificar que RLS esté habilitado en mayoristas
ALTER TABLE mayoristas ENABLE ROW LEVEL SECURITY;