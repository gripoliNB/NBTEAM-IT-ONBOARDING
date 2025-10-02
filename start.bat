@echo off
REM Script de inicio rápido para el Sistema de Onboarding IT (Windows)
REM Este script configura y ejecuta la aplicación completa

echo 🚀 Iniciando Sistema de Onboarding IT...

REM Verificar prerrequisitos
echo [INFO] Verificando prerrequisitos...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado. Por favor instala Node.js 18+
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm no está instalado
    pause
    exit /b 1
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Docker no está instalado. Se ejecutará en modo desarrollo local
    set LOCAL_MODE=true
) else (
    set LOCAL_MODE=false
)

echo [SUCCESS] Prerrequisitos verificados

REM Instalar dependencias
echo [INFO] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Error instalando dependencias del backend
    pause
    exit /b 1
)

echo [INFO] Instalando dependencias del frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Error instalando dependencias del frontend
    pause
    exit /b 1
)

cd ..
echo [SUCCESS] Dependencias instaladas correctamente

REM Configurar variables de entorno
echo [INFO] Configurando variables de entorno...

if not exist backend\.env (
    copy backend\env.example backend\.env
    echo [INFO] Archivo .env creado para backend
)

if not exist frontend\.env (
    copy frontend\env.example frontend\.env
    echo [INFO] Archivo .env creado para frontend
)

echo [SUCCESS] Variables de entorno configuradas

REM Configurar base de datos
if "%LOCAL_MODE%"=="true" (
    echo [WARNING] Modo local: Asegúrate de tener PostgreSQL ejecutándose
    echo [INFO] Ejecutando migraciones de Prisma...
    cd backend
    call npx prisma generate
    call npx prisma db push
    if %errorlevel% neq 0 (
        echo [ERROR] Error configurando base de datos
        pause
        exit /b 1
    )
    cd ..
) else (
    echo [INFO] Iniciando servicios con Docker Compose...
    docker-compose up -d postgres
    timeout /t 10 /nobreak >nul
    
    echo [INFO] Ejecutando migraciones...
    docker-compose exec -T backend npx prisma migrate deploy
    docker-compose exec -T backend npx prisma generate
)

echo [SUCCESS] Base de datos configurada

REM Poblar con datos de ejemplo
echo [INFO] Poblando base de datos con datos de ejemplo...

if "%LOCAL_MODE%"=="true" (
    cd backend
    call npm run db:seed
    cd ..
) else (
    docker-compose exec -T backend npm run db:seed
)

echo [SUCCESS] Datos de ejemplo cargados

REM Ejecutar aplicación
echo [INFO] Iniciando aplicación...

if "%LOCAL_MODE%"=="true" (
    echo [INFO] Modo desarrollo local
    echo [INFO] Ejecutando backend en puerto 3001...
    start "Backend" cmd /k "cd backend && npm run dev"
    
    timeout /t 5 /nobreak >nul
    
    echo [INFO] Ejecutando frontend en puerto 5173...
    start "Frontend" cmd /k "cd frontend && npm run dev"
    
    echo [SUCCESS] Aplicación iniciada en modo desarrollo
    echo [INFO] Frontend: http://localhost:5173
    echo [INFO] Backend API: http://localhost:3001/api
    echo [INFO] Health Check: http://localhost:3001/health
    echo.
    echo Presiona cualquier tecla para cerrar...
    pause >nul
) else (
    echo [INFO] Iniciando con Docker Compose...
    docker-compose up
)

echo.
echo ==========================================
echo 🎉 Sistema de Onboarding IT iniciado
echo ==========================================






