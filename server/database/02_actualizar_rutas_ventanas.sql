-- =========================================
-- ACTUALIZACIÓN DE RUTAS - TABLA tbl_ventanas
-- Fecha: 2025-07-24
-- =========================================

-- IMPORTANTE: Ejecutar primero el respaldo (01_respaldo_ventanas.sql)

-- Mostrar estado actual
SELECT '=== ESTADO ANTES DE LA ACTUALIZACIÓN ===' as info;
SELECT ven_id, ven_nombre, ven_ruta, ven_url FROM tbl_ventanas ORDER BY ven_orden;

-- Actualizar las rutas para que coincidan con el frontend
UPDATE tbl_ventanas SET 
    ven_ruta = 'dashboard',
    ven_url = 'dashboard'
WHERE ven_id = 1;

UPDATE tbl_ventanas SET 
    ven_ruta = 'tablero/board',
    ven_url = 'tablero/board'
WHERE ven_id = 2;

UPDATE tbl_ventanas SET 
    ven_ruta = 'tablero/tasks',
    ven_url = 'tablero/tasks'
WHERE ven_id = 3;

UPDATE tbl_ventanas SET 
    ven_ruta = 'tablero/assignment',
    ven_url = 'tablero/assignment'
WHERE ven_id = 4;

UPDATE tbl_ventanas SET 
    ven_ruta = 'tablero/developers',
    ven_url = 'tablero/developers'
WHERE ven_id = 5;

UPDATE tbl_ventanas SET 
    ven_ruta = 'tablero/guide',
    ven_url = 'tablero/guide'
WHERE ven_id = 6;

UPDATE tbl_ventanas SET 
    ven_ruta = 'security/users',
    ven_url = 'security/users'
WHERE ven_id = 7;

UPDATE tbl_ventanas SET 
    ven_ruta = 'admin/settings',
    ven_url = 'admin/settings'
WHERE ven_id = 8;

-- Mostrar estado después de la actualización
SELECT '=== ESTADO DESPUÉS DE LA ACTUALIZACIÓN ===' as info;
SELECT ven_id, ven_nombre, ven_ruta, ven_url FROM tbl_ventanas ORDER BY ven_orden;

-- Verificar que los cambios son correctos
SELECT '=== VERIFICACIÓN DE CAMBIOS ===' as info;
SELECT 
    ven_id,
    ven_nombre,
    CASE 
        WHEN ven_ruta NOT LIKE '/%' THEN '✓ Correcto'
        ELSE '✗ Contiene barra inicial'
    END as estado_ruta,
    ven_ruta,
    ven_url
FROM tbl_ventanas 
ORDER BY ven_orden;
