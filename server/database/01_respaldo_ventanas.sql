-- =========================================
-- RESPALDO DE SEGURIDAD - TABLA tbl_ventanas
-- Fecha: 2025-07-24
-- =========================================

-- Crear tabla de respaldo con los datos actuales
CREATE TABLE tbl_ventanas_backup_20250724 AS SELECT * FROM tbl_ventanas;

-- Verificar que el respaldo se creó correctamente
SELECT COUNT(*) as 'Registros en respaldo' FROM tbl_ventanas_backup_20250724;

-- Mostrar datos actuales antes del cambio
SELECT ven_id, ven_nombre, ven_ruta, ven_url FROM tbl_ventanas ORDER BY ven_orden;
