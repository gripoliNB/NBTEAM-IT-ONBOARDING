@echo off
echo Instalando NBTeam IT Onboarding...

REM Instalar dependencias
npm install

REM Crear archivo .env si no existe
if not exist .env (
    echo PORT=3001 > .env
    echo HOST=0.0.0.0 >> .env
    echo DB_PATH=./formularios.db >> .env
    echo SESSION_SECRET=nbteam-it-onboarding-secret-key-2025 >> .env
)

REM Configurar firewall
netsh advfirewall firewall add rule name="NBTeam IT Onboarding" dir=in action=allow protocol=TCP localport=3001

echo Instalacion completada!
echo Ejecutar: npm start
pause






