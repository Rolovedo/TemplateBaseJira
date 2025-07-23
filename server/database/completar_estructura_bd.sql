-- Script para completar la estructura de la base de datos
-- Ejecutar este script para corregir todos los errores del sistema

-- ==================================================
-- 1. ACTUALIZAR TABLA tbl_ventanas (agregar columnas faltantes)
-- ==================================================

-- Agregar columnas faltantes a tbl_ventanas
ALTER TABLE tbl_ventanas 
ADD COLUMN IF NOT EXISTS ven_descripcion VARCHAR(255) NULL AFTER ven_nombre,
ADD COLUMN IF NOT EXISTS ven_url VARCHAR(255) NULL AFTER ven_ruta,
ADD COLUMN IF NOT EXISTS ven_orden INT DEFAULT 0 AFTER ven_icono,
ADD COLUMN IF NOT EXISTS ven_padre INT DEFAULT 0 AFTER ven_orden;

-- Actualizar ven_url con los valores de ven_ruta
UPDATE tbl_ventanas SET ven_url = ven_ruta WHERE ven_url IS NULL;

-- Actualizar descripciones y orden
UPDATE tbl_ventanas SET 
    ven_descripcion = CASE 
        WHEN ven_id = 1 THEN 'Panel principal del sistema'
        WHEN ven_id = 2 THEN 'Tablero visual de tareas estilo Kanban'
        WHEN ven_id = 3 THEN 'Administración y gestión de tareas'
        WHEN ven_id = 4 THEN 'Asignación de tareas a desarrolladores'
        WHEN ven_id = 5 THEN 'Gestión de desarrolladores'
        WHEN ven_id = 6 THEN 'Reportes y estadísticas'
        WHEN ven_id = 7 THEN 'Configuración del sistema'
        WHEN ven_id = 8 THEN 'Administración de usuarios'
        ELSE ven_nombre
    END,
    ven_orden = CASE 
        WHEN ven_id = 1 THEN 1
        WHEN ven_id = 2 THEN 2
        WHEN ven_id = 3 THEN 3
        WHEN ven_id = 4 THEN 4
        WHEN ven_id = 5 THEN 5
        WHEN ven_id = 6 THEN 6
        WHEN ven_id = 7 THEN 7
        WHEN ven_id = 8 THEN 8
        ELSE ven_id
    END,
    ven_padre = 0
WHERE ven_id IN (1,2,3,4,5,6,7,8);

-- ==================================================
-- 2. CREAR TABLA tbl_perfil_ventanas (para el menú)
-- ==================================================

CREATE TABLE IF NOT EXISTS tbl_perfil_ventanas (
    pv_id INT AUTO_INCREMENT PRIMARY KEY,
    prf_id INT NOT NULL,
    ven_id INT NOT NULL,
    pv_activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prf_id) REFERENCES tbl_perfil(prf_id) ON DELETE CASCADE,
    FOREIGN KEY (ven_id) REFERENCES tbl_ventanas(ven_id) ON DELETE CASCADE,
    UNIQUE KEY unique_perfil_ventana (prf_id, ven_id)
);

-- Asignar todas las ventanas al perfil de administrador (prf_id = 1)
INSERT IGNORE INTO tbl_perfil_ventanas (prf_id, ven_id)
SELECT 1 as prf_id, ven_id FROM tbl_ventanas WHERE est_id = 1;

-- Asignar ventanas básicas a otros perfiles
INSERT IGNORE INTO tbl_perfil_ventanas (prf_id, ven_id)
SELECT prf_id, ven_id 
FROM (
    SELECT 3 as prf_id, 1 as ven_id UNION  -- Analista - Dashboard
    SELECT 3, 2 UNION                       -- Analista - Tablero Jira
    SELECT 3, 3 UNION                       -- Analista - Gestión de Tareas
    SELECT 4, 1 UNION                       -- Desarrollador - Dashboard
    SELECT 4, 2 UNION                       -- Desarrollador - Tablero Jira
    SELECT 5, 1 UNION                       -- Tester - Dashboard
    SELECT 5, 2                             -- Tester - Tablero Jira
) as permisos
WHERE EXISTS (SELECT 1 FROM tbl_perfil WHERE prf_id = permisos.prf_id)
  AND EXISTS (SELECT 1 FROM tbl_ventanas WHERE ven_id = permisos.ven_id);

-- ==================================================
-- 3. CREAR TABLA tbl_notificaciones (para notificaciones)
-- ==================================================

CREATE TABLE IF NOT EXISTS tbl_notificaciones (
    not_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_id INT NOT NULL,
    not_titulo VARCHAR(255) NOT NULL,
    not_mensaje TEXT NOT NULL,
    not_tipo ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    not_visto TINYINT(1) DEFAULT 0,
    not_fec_env TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    not_fec_visto TIMESTAMP NULL,
    not_datos_extra JSON NULL,
    FOREIGN KEY (usu_id) REFERENCES tbl_usuarios(usu_id) ON DELETE CASCADE,
    INDEX idx_usuario_visto (usu_id, not_visto),
    INDEX idx_fecha (not_fec_env)
);

-- Insertar notificaciones de bienvenida para usuarios activos
INSERT IGNORE INTO tbl_notificaciones (usu_id, not_titulo, not_mensaje, not_tipo)
SELECT 
    usu_id,
    'Bienvenido al sistema Jira',
    CONCAT('Hola ', COALESCE(usu_nombre, 'Usuario'), 
           CASE WHEN usu_apellido IS NOT NULL THEN CONCAT(' ', usu_apellido) ELSE '' END,
           ', bienvenido al sistema de gestión de tareas.'),
    'success'
FROM tbl_usuarios 
WHERE est_id = 1;

-- ==================================================
-- 4. AGREGAR VENTANAS ADICIONALES SI NO EXISTEN
-- ==================================================

-- Insertar ventanas adicionales si no existen
INSERT IGNORE INTO tbl_ventanas (ven_id, ven_nombre, ven_ruta, ven_url, ven_descripcion, ven_icono, ven_orden, ven_padre, est_id)
VALUES 
(6, 'Reportes', '/reports', '/reports', 'Reportes y estadísticas del sistema', 'pi pi-chart-bar', 6, 0, 1),
(7, 'Configuración', '/settings', '/settings', 'Configuración del sistema', 'pi pi-cog', 7, 0, 1),
(8, 'Usuarios', '/admin/users', '/admin/users', 'Administración de usuarios', 'pi pi-users', 8, 0, 1);

-- ==================================================
-- 5. VERIFICACIONES FINALES
-- ==================================================

-- Verificar estructura de tbl_ventanas
SELECT 'Verificación tbl_ventanas' as tabla, COUNT(*) as registros
FROM tbl_ventanas;

-- Verificar tbl_perfil_ventanas
SELECT 'Verificación tbl_perfil_ventanas' as tabla, COUNT(*) as registros
FROM tbl_perfil_ventanas;

-- Verificar tbl_notificaciones
SELECT 'Verificación tbl_notificaciones' as tabla, COUNT(*) as registros
FROM tbl_notificaciones;

-- Mostrar estructura final de ventanas
SELECT 
    ven_id,
    ven_nombre,
    ven_url,
    ven_icono,
    ven_orden,
    ven_padre
FROM tbl_ventanas 
ORDER BY ven_orden;

-- Mostrar permisos de ventanas por perfil
SELECT 
    p.prf_descripcion,
    v.ven_nombre,
    v.ven_url
FROM tbl_perfil_ventanas pv
JOIN tbl_perfil p ON pv.prf_id = p.prf_id
JOIN tbl_ventanas v ON pv.ven_id = v.ven_id
ORDER BY p.prf_id, v.ven_orden;

SELECT '✅ Script ejecutado exitosamente - Base de datos completada' as resultado;
