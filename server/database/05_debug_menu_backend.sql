-- =========================================
-- DEBUG: CONSULTA DIRECTA DEL MENÚ
-- Fecha: 2025-07-24
-- =========================================

-- Esta es la consulta EXACTA que usa el backend para obtener el menú
-- Simula lo que hace getMenuController con per=1 (perfil admin) y idu=1 (usuario admin)

-- 1. Obtener ventanas del usuario (simula el WHERE en getMenuController)
SELECT '=== VENTANAS DEL USUARIO (como lo hace el backend) ===' as info;
SELECT ven_id FROM tbl_usuarios_ventanas WHERE usu_id = 1;

-- 2. Consulta de ventanas padre (como lo hace el backend)
SELECT '=== VENTANAS PADRE (nivel superior del menú) ===' as info;
SELECT 
    v.ven_id as id, 
    v.ven_descripcion, 
    v.ven_url as toa, 
    v.ven_icono as icon, 
    v.ven_orden, 
    v.ven_nombre as label 
FROM tbl_ventanas v 
JOIN tbl_perfil_ventanas p ON v.ven_id = p.ven_id 
WHERE ven_padre = 0 
AND p.prf_id = 1 
AND v.ven_id IN (1,2,3,4,5,6,7,8)
ORDER BY v.ven_orden;

-- 3. Consulta de ventanas hijo (submenús)
SELECT '=== VENTANAS HIJO (submenús) ===' as info;
SELECT 
    v.ven_id, 
    v.ven_descripcion, 
    v.ven_padre as padre, 
    v.ven_url as toa, 
    v.ven_icono as icon, 
    v.ven_orden, 
    v.ven_nombre as label 
FROM tbl_ventanas v 
JOIN tbl_perfil_ventanas p ON v.ven_id = p.ven_id 
WHERE ven_padre != 0 
AND p.prf_id = 1 
AND v.ven_id IN (1,2,3,4,5,6,7,8)
ORDER BY v.ven_orden;
