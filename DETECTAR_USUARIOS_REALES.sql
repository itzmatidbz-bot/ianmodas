-- ===================================================================
-- CONFIGURAR ACCESO REAL A auth.users PARA DETECCIÓN AUTOMÁTICA
-- ===================================================================

-- OPCIÓN 1: Crear vista que exponga datos de auth.users de manera segura
CREATE OR REPLACE VIEW public.usuarios_registrados AS
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    updated_at,
    raw_user_meta_data->>'nombre_empresa' as nombre_empresa
FROM auth.users;

-- Dar permisos a la vista
GRANT SELECT ON public.usuarios_registrados TO anon, authenticated;

-- OPCIÓN 2: Crear función que sincroniza automáticamente desde auth.users
CREATE OR REPLACE FUNCTION sincronizar_usuarios_desde_auth()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    usuarios_insertados INTEGER := 0;
    usuario RECORD;
BEGIN
    -- Recorrer usuarios de auth.users que no están en usuarios_negocio
    FOR usuario IN 
        SELECT 
            au.id,
            au.email,
            au.created_at,
            COALESCE(au.raw_user_meta_data->>'nombre_empresa', au.email || ' Empresa') as nombre_empresa,
            au.phone as telefono
        FROM auth.users au
        LEFT JOIN public.usuarios_negocio un ON au.email = un.email
        WHERE un.email IS NULL 
        AND au.email_confirmed_at IS NOT NULL
    LOOP
        -- Insertar usuario nuevo
        INSERT INTO public.usuarios_negocio (email, nombre_empresa, telefono, created_at)
        VALUES (usuario.email, usuario.nombre_empresa, usuario.telefono, usuario.created_at)
        ON CONFLICT (email) DO NOTHING;
        
        usuarios_insertados := usuarios_insertados + 1;
    END LOOP;
    
    RETURN usuarios_insertados;
END;
$$;

-- Dar permisos a la función de sincronización
GRANT EXECUTE ON FUNCTION sincronizar_usuarios_desde_auth() TO anon, authenticated;

-- OPCIÓN 3: Función que obtiene usuarios REALES desde auth.users
CREATE OR REPLACE FUNCTION obtener_usuarios_reales()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    resultado JSON;
BEGIN
    -- Intentar sincronizar primero
    PERFORM sincronizar_usuarios_desde_auth();
    
    -- Luego obtener todos los usuarios
    SELECT json_agg(
        json_build_object(
            'id', id,
            'email', email,
            'nombre_empresa', nombre_empresa,
            'telefono', telefono,
            'created_at', created_at,
            'status', CASE WHEN activo THEN 'confirmed' ELSE 'pending' END
        ) ORDER BY created_at DESC
    ) INTO resultado
    FROM public.usuarios_negocio;
    
    IF resultado IS NULL THEN
        resultado := '[]'::JSON;
    END IF;
    
    RETURN resultado;
END;
$$;

-- Dar permisos
GRANT EXECUTE ON FUNCTION obtener_usuarios_reales() TO anon, authenticated;

-- ===================================================================
-- INSTRUCCIONES:
-- ===================================================================
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Cambiar admin.js para usar obtener_usuarios_reales() 
-- 3. Ahora detectará automáticamente nuevos usuarios registrados
-- ===================================================================