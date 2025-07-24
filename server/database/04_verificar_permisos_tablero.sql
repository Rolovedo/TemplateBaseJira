-- =========================================
-- VERIFICAR PERMISOS DE USUARIO - TABLERO
-- Fecha: 2025-07-24
-- =========================================

-- Verificar qué usuario está logueado y sus permisos
SELECT '=== INFORMACIÓN DEL USUARIO ADMIN ===' as info;
SELECT usu_id, usu_nombre, usu_apellido, usu_correo, prf_id 
FROM tbl_usuarios 
WHERE usu_usuario = 'admin';

-- Verificar permisos del perfil para la ventana Tablero (ven_id = 2)
SELECT '=== PERMISOS DEL PERFIL PARA TABLERO ===' as info;
SELECT 
    p.prf_nombre,
    v.ven_nombre,
    v.ven_ruta,
    pv.pv_activo
FROM tbl_perfil_ventanas pv
JOIN tbl_perfil p ON pv.prf_id = p.prf_id
JOIN tbl_ventanas v ON pv.ven_id = v.ven_id
WHERE pv.ven_id = 2;  -- ven_id = 2 es el Tablero

-- Verificar permisos específicos del usuario admin para Tablero
SELECT '=== PERMISOS ESPECÍFICOS DEL USUARIO ADMIN ===' as info;
SELECT 
    u.usu_nombre,
    v.ven_nombre,
    v.ven_ruta
FROM tbl_usuarios_ventanas uv
JOIN tbl_usuarios u ON uv.usu_id = u.usu_id
JOIN tbl_ventanas v ON uv.ven_id = v.ven_id
WHERE u.usu_usuario = 'admin' AND uv.ven_id = 2;

-- Mostrar TODAS las ventanas disponibles para el usuario admin
SELECT '=== TODAS LAS VENTANAS DEL USUARIO ADMIN ===' as info;
SELECT 
    v.ven_id,
    v.ven_nombre,
    v.ven_ruta,
    v.ven_url,
    v.ven_orden
FROM tbl_usuarios_ventanas uv
JOIN tbl_usuarios u ON uv.usu_id = u.usu_id
JOIN tbl_ventanas v ON uv.ven_id = v.ven_id
WHERE u.usu_usuario = 'admin'
ORDER BY v.ven_orden;
