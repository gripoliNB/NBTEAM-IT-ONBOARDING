@echo off
REM 🚀 Script de Despliegue Simple - NBTeam IT Onboarding
REM Script batch para subir aplicación a servidor Ubuntu

echo 🚀 Desplegando NBTeam IT Onboarding a Ubuntu
echo 📅 Fecha: %date% %time%
echo.

REM Configuración (cambiar estos valores)
set SERVER_IP=TU-IP-PUBLICA
set KEY_PATH=C:\ruta\a\tu-key.pem
set USERNAME=ubuntu
set APP_PATH=C:\Users\GiovanniRipoli\Cursor-Project
set REMOTE_PATH=/opt/nbteam/app

echo [INFO] Configuración:
echo   • Servidor: %SERVER_IP%
echo   • Usuario: %USERNAME%
echo   • Clave: %KEY_PATH%
echo   • Origen: %APP_PATH%
echo   • Destino: %REMOTE_PATH%
echo.

REM Verificar que existe la clave
if not exist "%KEY_PATH%" (
    echo [ERROR] Archivo de clave no encontrado: %KEY_PATH%
    echo Por favor, actualiza la variable KEY_PATH en este script
    pause
    exit /b 1
)

REM Verificar que existe el directorio de la aplicación
if not exist "%APP_PATH%" (
    echo [ERROR] Directorio de aplicación no encontrado: %APP_PATH%
    echo Por favor, actualiza la variable APP_PATH en este script
    pause
    exit /b 1
)

echo [INFO] Paso 1: Creando directorios en el servidor...
ssh -i "%KEY_PATH%" %USERNAME%@%SERVER_IP% "sudo mkdir -p %REMOTE_PATH% && sudo chown -R %USERNAME%:%USERNAME% /opt/nbteam"

if %errorlevel% neq 0 (
    echo [ERROR] Error al crear directorios
    pause
    exit /b 1
)

echo [SUCCESS] Directorios creados correctamente

echo.
echo [INFO] Paso 2: Subiendo archivos de la aplicación...
echo Esto puede tomar varios minutos...

REM Subir archivos usando SCP
scp -i "%KEY_PATH%" -r "%APP_PATH%\*" %USERNAME%@%SERVER_IP%:%REMOTE_PATH%/

if %errorlevel% neq 0 (
    echo [ERROR] Error al subir archivos
    pause
    exit /b 1
)

echo [SUCCESS] Archivos subidos correctamente

echo.
echo [INFO] Paso 3: Instalando dependencias...
ssh -i "%KEY_PATH%" %USERNAME%@%SERVER_IP% "cd %REMOTE_PATH% && npm install --production"

if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)

echo [SUCCESS] Dependencias instaladas correctamente

echo.
echo [INFO] Paso 4: Configurando permisos...
ssh -i "%KEY_PATH%" %USERNAME%@%SERVER_IP% "sudo chown -R %USERNAME%:%USERNAME% %REMOTE_PATH%"

echo [SUCCESS] Permisos configurados correctamente

echo.
echo [INFO] Paso 5: Verificando instalación...
ssh -i "%KEY_PATH%" %USERNAME%@%SERVER_IP% "cd %REMOTE_PATH% && ls -la"

echo.
echo [SUCCESS] 🎉 Despliegue completado exitosamente!
echo.
echo [INFO] 📋 Próximos pasos en el servidor:
echo 1. Conectar al servidor: ssh -i "%KEY_PATH%" %USERNAME%@%SERVER_IP%
echo 2. Ir al directorio: cd %REMOTE_PATH%
echo 3. Ejecutar aplicación: node server.js
echo 4. O usar PM2: pm2 start ecosystem.config.js
echo.
echo [INFO] 🌐 URLs de acceso:
echo • Local: http://localhost:3001
echo • Externo: http://%SERVER_IP%:3001
echo • Con dominio: http://tu-dominio.com
echo.
echo [SUCCESS] ¡Aplicación lista para usar!
echo.
pause






