-- =========================================
-- ROLLBACK - RESTAURAR TABLA tbl_ventanas
-- Fecha: 2025-07-24
-- =========================================

-- ⚠️ USAR SOLO EN CASO DE EMERGENCIA ⚠️
-- Este script restaura la tabla tbl_ventanas al estado anterior

-- Verificar que existe el respaldo
SELECT COUNT(*) as 'Registros en respaldo' FROM tbl_ventanas_backup_20250724;

-- Mostrar diferencias entre actual y respaldo
SELECT 'Datos actuales:' as tipo, ven_id, ven_nombre, ven_ruta, ven_url FROM tbl_ventanas
UNION ALL
SELECT 'Datos respaldo:' as tipo, ven_id, ven_nombre, ven_ruta, ven_url FROM tbl_ventanas_backup_20250724
ORDER BY ven_id, tipo;

-- ROLLBACK: Restaurar datos desde el respaldo
-- ⚠️ DESCOMENTA LAS SIGUIENTES LÍNEAS SOLO SI NECESITAS HACER ROLLBACK ⚠️

/*
DELETE FROM tbl_ventanas;
INSERT INTO tbl_ventanas SELECT * FROM tbl_ventanas_backup_20250724;
SELECT 'ROLLBACK COMPLETADO' as resultado;
SELECT ven_id, ven_nombre, ven_ruta, ven_url FROM tbl_ventanas ORDER BY ven_orden;
*/
