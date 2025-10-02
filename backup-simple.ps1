# Script de Backup Simple - Formulario de Empleados
param(
    [string]$BackupPath = "Backup-FormularioApp"
)

# Obtener timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$backupName = "$BackupPath-$timestamp"

Write-Host "🚀 Iniciando backup completo de la aplicacion..."
Write-Host "📅 Timestamp: $timestamp"
Write-Host "📁 Directorio de backup: $backupName"
Write-Host ""

# Crear directorio principal de backup
New-Item -ItemType Directory -Force -Path $backupName | Out-Null

Write-Host "📂 Copiando archivos principales..."

# Archivos principales
$mainFiles = @(
    "server.js",
    "database.js", 
    "package.json",
    "ecosystem.config.js"
)

foreach ($file in $mainFiles) {
    if (Test-Path $file) {
        Copy-Item $file "$backupName\$file"
        Write-Host "✅ $file"
    } else {
        Write-Host "⚠️  No encontrado: $file"
    }
}

Write-Host ""
Write-Host "🌐 Copiando archivos HTML..."

# Archivos HTML
$htmlFiles = @(
    "index.html",
    "login.html",
    "dashboard.html", 
    "clientes.html",
    "software.html"
)

foreach ($htmlFile in $htmlFiles) {
    if (Test-Path)$htmlFile) {
        Copy-Item $htmlFile "$backupName\$htmlFile"
        Write-Host "✅ $htmlFile"
    } else {
        Write-Host "⚠️  No encontrado: $htmlFile"
    }
}

Write-Host ""
Write-Host "🗃️ Copiando base de datos..."

# Base de datos SQLite
if (Test-Path "database.db") {
    Copy-Item "database.db" "$backupName\database.db"
    Write-Host "✅ database.db"
    
    # Información adicional de la base de datos
    $dbSize = (Get-Item "database.db").Length
    Write-Host "📊 Tamaño de DB: $([Math]::Round($dbSize/1KB, 2)) KB"
} else {
    Write-Host "⚠️  No encontrado: database.db"
}

Write-Host ""
Write-Host "📦 Copiando dependencias..."

# Copiar package files si existen
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "$backupName\package-lock.json"
    Write-Host "✅ package-lock.json"
}

Write-Host ""
Write-Host "📝 Copiando archivos de configuración..."

# Archivos de configuración opcionales
$configFiles = @(
    ".env",
    "ecosystem.config.js",
    "create-backup.ps1"
)

foreach ($configFile in $configFiles) {
    if (Test-Path $configFile) {
        Copy-Item $configFile "$backupName\$configFile" -ErrorAction SilentlyContinue
        Write-Host "✅ $configFile"
    }
}

Write-Host ""
Write-Host "📋 Generando documentación del backup..."

# Crear documentacion del backup
$backupDoc = @"
# BACKUP COMPLETO - FORMULARIO DE EMPLEADOS
## Fecha: $timestamp

## Funcionalidades incluidas:
- Sistema de formularios con base de datos SQLite
- Centro de costos y tipo de contrato
- Carga dinamica de clientes desde base de datos
- Carga dinamica de software desde base de datos
- Administracion de clientes (solo admin)
- Administracion de software (solo admin)
- Roles: Admin, HR, IT
- Sistema de autenticacion con sesiones

## Contenido del backup:
- Archivos principales: server.js, database.js, package.json
- Interfaz: index.html, login.html, dashboard.html, clientes.html, software.html
- Base de datos: database.db con datos completos
- Configuracion: ecosystem.config.js, scripts de backup

## Base de datos incluida:
- Tabla: formularios (con campos centro_costos y tipo_contrato)
- Tabla: usuarios (admin, hr, it)
- Tabla: clientes (gestion dinamica)
- Tabla: software (gestion dinamica)

## Instrucciones de restauracion:
1. Instalar Node.js LTS
2. Copiar todos los archivos a directorio del servidor
3. Ejecutar: npm install
4. Configurar PM2: pm2 start ecosystem.config.js
5. Configurar Nginx para proxy reverso
6. Configurar SSL con Let's Encrypt

## Credenciales por defecto:
* Administrator: admin / password
* HR: hr / password  
* IT: it / password

## Soporte:
Este backup incluye toda la funcionalidad de la aplicacion completa.

---
Generado automaticamente el $timestamp
"@

$backupDoc | Out-File -FilePath "$backupName\README-BACKUP-1.md" -Encoding UTF8

Write-Host "✅ Documentacion creada"

Write-Host ""
Write-Host "📜 Creando script de restauracion para Windows..."

# Script de restauracion para Windows
$restoreScriptWin = @"
@echo off
echo 🚀 RESTAURACION DEL FORMULARIO DE EMPLEADOS
echo.

echo 📋 Verificando Node.js...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no esta instalado
    echo 💡 Descargar desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

echo 📦 Instalando dependencias...
npm install
if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas
echo.

echo 🗃️ Verificando base de datos...
if not inherit database.db (
    echo ⚠️ Base de datos no encontrada
    echo 💡 Asegurate de copiar database.db
)

echo.
echo 🎉 Restauracion completada!
echo.
echo Para iniciar la aplicacion:
echo npm start
echo.
echo Para usar PM2:
echo npm install -g pm2
echo pm2 start ecosystem.config.js
echo.
pause
"@

$restoreScriptWin | Out-File -FilePath "$backupName\restore-windows.bat" -Encoding ASCII

Write-Host "✅ Script de restauracion Windows creado"

Write-Host ""
Write-Host "📊 ESTADISTICAS DEL BACKUP:"

# Calcular tamaño total
$backupSize = (Get-ChildItem -Path $backupName -Recurse | Measure-Object -Property Length -Sum).Sum
$filesCount = (Get-ChildItem -Path $backupName -Recurse -File).Count

Write-Host "📁 Directorio: $backupName"
Write-Host "📊 Archivos: $filesCount"
Write-Host "💾 Tamaño total: $([Math]::Round($backupSize/1MB, 2)) MB"

if (Test-Path "database.db") {
    $dbSize = (Get-Item "database.db").Length
    Write-Host "🗃️ Base de datos: $([Math]::Round($dbSize/1KB, 2)) KB"
}

Write-Host ""
Write-Host "🎉 BACKUP COMPLETADO EXITOSAMENTE!"
Write-Host "📦 Ubicacion: $(Resolve-Path $backupName)"
Write-Host ""
Write-Host "💡 Para restaurar en otro servidor:"
Write-Host "   1. Copiar el directorio completo"
Write-Host "   2. Ejecutar el script de restauracion correspondiente"
Write-Host "   3. Instalar Node.js y dependencias"
Write-Host "   4. Configurar PM2 y Nginx"
Write-Host ""

