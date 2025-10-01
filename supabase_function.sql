-- Esta función debe ejecutarse en el SQL Editor de Supabase
-- Crear función para registrar mayorista

CREATE OR REPLACE FUNCTION register_mayorista(
  user_email TEXT,
  user_password TEXT,
  empresa_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Crear usuario en auth.users (esto requiere permisos especiales)
  -- Como no podemos crear usuarios desde una función RPC fácilmente,
  -- vamos a crear una función que solo inserte en mayoristas después de que el usuario sea creado
  
  -- Esta función será llamada después de que el usuario se haya registrado exitosamente
  INSERT INTO mayoristas (id, nombre_empresa)
  VALUES (auth.uid(), empresa_name);
  
  result := json_build_object(
    'success', true,
    'message', 'Mayorista registrado exitosamente'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$;

-- Dar permisos para ejecutar la función
REVOKE ALL ON FUNCTION register_mayorista FROM PUBLIC;
GRANT EXECUTE ON FUNCTION register_mayorista TO authenticated;