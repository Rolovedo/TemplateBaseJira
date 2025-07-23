-- Script de verificación rápida para después de la instalación
-- Ejecutar este script para validar que todo se instaló correctamente

-- 1. Verificar que todas las tablas existen
SELECT 
    'jira_developers' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_developers'

UNION ALL

SELECT 
    'jira_tasks' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_tasks'

UNION ALL

SELECT 
    'jira_task_collaborators' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_task_collaborators'

UNION ALL

SELECT 
    'jira_task_change_requests' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_task_change_requests'

UNION ALL

SELECT 
    'jira_task_history' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_task_history'

UNION ALL

SELECT 
    'jira_task_comments' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_task_comments'

UNION ALL

SELECT 
    'jira_task_attachments' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_task_attachments'

UNION ALL

SELECT 
    'jira_settings' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_settings'

UNION ALL

SELECT 
    'jira_whatsapp_notifications' as tabla,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'jira_whatsapp_notifications';

-- 2. Verificar que las vistas existen
SELECT 
    'jira_developer_stats' as vista,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.views 
WHERE table_schema = DATABASE() AND table_name = 'jira_developer_stats'

UNION ALL

SELECT 
    'jira_board_view' as vista,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ No existe' END as estado
FROM information_schema.views 
WHERE table_schema = DATABASE() AND table_name = 'jira_board_view';

-- 3. Verificar configuraciones iniciales
SELECT 
    '📋 Configuraciones Jira' as seccion,
    '' as detalle
UNION ALL
SELECT 
    setting_key as seccion,
    setting_value as detalle
FROM jira_settings
ORDER BY seccion;

-- 4. Verificar triggers
SELECT 
    '🔧 Triggers Instalados' as seccion,
    '' as detalle
UNION ALL
SELECT 
    TRIGGER_NAME as seccion,
    CONCAT('Tabla: ', EVENT_OBJECT_TABLE, ' | Evento: ', EVENT_MANIPULATION) as detalle
FROM information_schema.triggers 
WHERE TRIGGER_SCHEMA = DATABASE() 
  AND TRIGGER_NAME LIKE 'jira%';

-- 5. Verificar índices importantes
SELECT 
    '📊 Índices Jira' as seccion,
    '' as detalle
UNION ALL
SELECT 
    CONCAT(TABLE_NAME, '.', INDEX_NAME) as seccion,
    CONCAT('Columnas: ', GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX)) as detalle
FROM information_schema.statistics 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME LIKE 'jira%'
  AND INDEX_NAME != 'PRIMARY'
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY seccion;

-- 6. Resumen final
SELECT 
    '📈 RESUMEN DE INSTALACIÓN' as titulo,
    CONCAT(
        'Tablas: ', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE 'jira%'),
        ' | Vistas: ',
        (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = DATABASE() AND table_name LIKE 'jira%'),
        ' | Triggers: ',
        (SELECT COUNT(*) FROM information_schema.triggers WHERE TRIGGER_SCHEMA = DATABASE() AND TRIGGER_NAME LIKE 'jira%'),
        ' | Configuraciones: ',
        (SELECT COUNT(*) FROM jira_settings)
    ) as detalle;
