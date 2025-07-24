-- Actualizar rutas del menú para que coincidan con el frontend
-- Ejecutar este script después de importar la base de datos

UPDATE `tbl_ventanas` SET 
    `ven_ruta` = 'dashboard',
    `ven_url` = 'dashboard'
WHERE `ven_id` = 1;

UPDATE `tbl_ventanas` SET 
    `ven_ruta` = 'tablero/board',
    `ven_url` = 'tablero/board'
WHERE `ven_id` = 2;

UPDATE `tbl_ventanas` SET 
    `ven_ruta` = 'tablero/tasks',
    `ven_url` = 'tablero/tasks'
WHERE `ven_id` = 3;

UPDATE `tbl_ventanas` SET 
    `ven_ruta` = 'tablero/assignment',
    `ven_url` = 'tablero/assignment'
WHERE `ven_id` = 4;

UPDATE `tbl_ventanas` SET 
    `ven_ruta` = 'tablero/developers',
    `ven_url` = 'tablero/developers'
WHERE `ven_id` = 5;

UPDATE `tbl_ventanas` SET 
    `ven_ruta` = 'tablero/guide',
    `ven_url` = 'tablero/guide'
WHERE `ven_id` = 6;

UPDATE `tbl_ventanas` SET 
    `ven_ruta` = 'security/users',
    `ven_url` = 'security/users'
WHERE `ven_id` = 7;

UPDATE `tbl_ventanas` SET 
    `ven_ruta` = 'admin/settings',
    `ven_url` = 'admin/settings'
WHERE `ven_id` = 8;

-- Verificar los cambios
SELECT ven_id, ven_nombre, ven_ruta, ven_url FROM tbl_ventanas ORDER BY ven_orden;
