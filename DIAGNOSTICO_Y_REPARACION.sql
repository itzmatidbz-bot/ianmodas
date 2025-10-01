-- 🔍 DIAGNÓSTICO Y REPARACIÓN DE USUARIOS
-- Ejecuta este script para diagnosticar y arreglar problemas

-- 1. DIAGNÓSTICO: Ver qué usuarios hay en auth
SELECT 
    'DIAGNÓSTICO - Usuarios en Authentication:' as seccion,
    COUNT(*) as total_usuarios,
    STRING_AGG(email, ', ') as emails
FROM auth.users;

-- 2. DIAGNÓSTICO: Ver qué hay en mayoristas
SELECT 
    'DIAGNÓSTICO - Registros en mayoristas:' as seccion,
    COUNT(*) as total_mayoristas
FROM mayoristas;

-- 3. DIAGNÓSTICO: Ver usuarios sin registro de mayorista
SELECT 
    'USUARIOS SIN REGISTRO DE MAYORISTA:' as problema,
    au.email,
    au.created_at as registrado_en,
    au.raw_user_meta_data->>'nombre_empresa' as empresa_metadata
FROM auth.users au
LEFT JOIN mayoristas m ON au.id = m.id
WHERE m.id IS NULL
AND au.email NOT LIKE '%@admin%'
ORDER BY au.created_at DESC;

-- 4. REPARACIÓN: Crear registros faltantes
DO $$
DECLARE
    user_record RECORD;
    empresa_nombre TEXT;
BEGIN
    -- Deshabilitar RLS temporalmente
    ALTER TABLE mayoristas DISABLE ROW LEVEL SECURITY;
    
    -- Para cada usuario sin registro de mayorista
    FOR user_record IN 
        SELECT au.id, au.email, au.created_at, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN mayoristas m ON au.id = m.id
        WHERE m.id IS NULL 
        AND au.email NOT LIKE '%@admin%'
    LOOP
        -- Determinar nombre de empresa
        empresa_nombre := COALESCE(
            user_record.raw_user_meta_data->>'nombre_empresa',
            SPLIT_PART(user_record.email, '@', 1) || ' Empresa'
        );
        
        -- Insertar registro
        INSERT INTO mayoristas (id, nombre_empresa, created_at)
        VALUES (user_record.id, empresa_nombre, user_record.created_at)
        ON CONFLICT (id) DO UPDATE SET
            nombre_empresa = EXCLUDED.nombre_empresa,
            created_at = EXCLUDED.created_at;
            
        RAISE NOTICE 'Creado/actualizado mayorista: % - %', user_record.email, empresa_nombre;
    END LOOP;
    
    -- Crear política permisiva
    DROP POLICY IF EXISTS "Allow all for authenticated" ON mayoristas;
    CREATE POLICY "Allow all for authenticated" 
    ON mayoristas 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
    
    -- Habilitar RLS de nuevo
    ALTER TABLE mayoristas ENABLE ROW LEVEL SECURITY;
END $$;

-- 5. VERIFICACIÓN FINAL
SELECT 
    'VERIFICACIÓN FINAL:' as resultado,
    (SELECT COUNT(*) FROM auth.users WHERE email NOT LIKE '%@admin%') as usuarios_auth,
    (SELECT COUNT(*) FROM mayoristas) as usuarios_mayoristas,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email NOT LIKE '%@admin%') = (SELECT COUNT(*) FROM mayoristas)
        THEN '✅ TODOS LOS USUARIOS SINCRONIZADOS'
        ELSE '❌ FALTAN USUARIOS POR SINCRONIZAR'
    END as estado;

-- 6. Mostrar algunos registros para verificar
SELECT 
    '📋 PRIMEROS MAYORISTAS REGISTRADOS:' as info,
    m.nombre_empresa,
    m.created_at::date as fecha_registro
FROM mayoristas m
ORDER BY m.created_at DESC
LIMIT 5;