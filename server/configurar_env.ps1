# CONFIGURAR VARIABLES DE ENTORNO - COMANDOS POWERSHELL

# 1. Abrir el archivo .env para editar (sustituir TU_EDITOR por tu editor preferido)
# notepad .env
# code .env        # Si tienes VS Code
# nano .env        # Si tienes Git Bash/WSL

# 2. O usar PowerShell para configurar valores específicos:

# CONFIGURAR BASE DE DATOS (cambiar por tus datos reales)
(Get-Content .env) -replace 'DB_NAME=tu_base_datos_jira', 'DB_NAME=nombre_real_de_tu_bd' | Set-Content .env
(Get-Content .env) -replace 'DB_USER=tu_usuario_mysql', 'DB_USER=root' | Set-Content .env
(Get-Content .env) -replace 'DB_PASSWORD=tu_contraseña_mysql', 'DB_PASSWORD=tu_password_real' | Set-Content .env

# CONFIGURAR JWT SECRET (generar una clave segura)
(Get-Content .env) -replace 'JWT_SECRET=tu_clave_secreta_muy_segura_para_jwt_2024', 'JWT_SECRET=mi_clave_super_secreta_jira_2024_xyz' | Set-Content .env

# 3. Verificar configuración
Get-Content .env | Select-String "DB_"
Get-Content .env | Select-String "JWT_SECRET"
