# Script de Backup - Formulario de Empleados NBTeam
# Crea un backup completo de la aplicacion con todos los archivos

param(
    [string]$BackupPath = "Backup-NBTeam-App"
)

# Obtener timestamp actual
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$backupName = "$BackupPath-$timestamp"

Write-Host "BACKUP COMPLETO DE LA APLICACION" -ForegroundColor Green
Write-Host "Timestamp: $timestamp"
Write-Host "Directorio: $backupName"
Write-Host ""

# Crear directorio de backup
New-Item -ItemType Directory -Force -Path $backupName | Out-Null

Write-Host "Copiando archivos principales..."

# Archivos principales del servidor
$files = @(
    "server.js",
    "database.js", 
    "package.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file "$backupName\$file"
        Write-Host "OK: $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Copiando archivos HTML..."

# Archivos de interfaz
$htmlFiles = @(
    "index.html",
    "login.html",
    "dashboard.html", 
    "clientes.html",
    "software.html"
)

foreach ($htmlFile in $htmlFiles) {
    if (Test-Path $htmlFile) {
        Copy-Item $htmlFile "$backupName\$htmlFile"
        Write-Host "OK: $htmlFile" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Copiando base de datos..."

# Backup de la base de datos
if (Test-Path "database.db") {
    Copy-Item "database.db" "$backupName\database.db"
    Write-Host "OK: database.db" -ForegroundColor Green
    
    $dbSize = (Get-Item "database.db").Length
    Write-Host "Tamaño DB: $([Math]::Round($dbSize/1KB, 2)) KB"
} else {
    Write-Host "WARN: database.db no encontrada" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Copiando dependencias..."

# Backups de dependencias
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "$backupName\package-lock.json"
    Write-Host "OK: package-lock.json" -ForegroundColor Green
}

Write-Host ""
Write-Host "Generando documentacion..."

# Documentacion del backup
$doc = @"
BACKUP FORMULARIO DE EMPLEADOS - NBTeam
Fecha: $timestamp

FUNCIONALIDADES:
- Sistema de formularios con base de datos SQLite
- Centro de costos y tipo de contrato
- Administracion de clientes y software
- Roles de usuario: Admin, HR, IT

ARCHIVOS INCLUIDOS:
- server.js (servidor Node.js)
- database.js (base de datos SQLite)
- package.json (dependencias)
- Archivos HTML de interfaz
- database.db (base de datos completa)

RESTAURACION:
1. Instalar Node.js LTS
2. Copiar todos los archivos
3. Ejecutar: npm install
4. Iniciar: npm start
5. Configurar PM2 para produccion

CREDENCIALES:
- admin / password
- hri / password
- it / password

Generado el: $timestamp
"@

$doc | Out-File -FilePath "$backupName\BACKUP-INFO.txt" -Encoding UTF8

Write-Host "OK: Documentacion creada" -ForegroundColor Green

Write-Host ""
Write-Host "Creando script de restauracion..."

# Script de restauracion
$restoreScript = @"
@echo off
echo RESTAURACION FORMULARIO NBTEAM
echo.

echo Verificando Node.js...
node --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no instalado
    echo Instalar desde: https://nodejs.org/
    pause
    exit /b 1
)

echo OK: Node.js encontrado

echo.
echo Instalando dependencias...
npm install
if errorlevel 1 (
    echo ERROR: Fallo instalacion dependencias
    pause
    exit /b 1
)

echo OK: Dependencias instaladas

echo.
echo Verificando base de datos...
if not exist database.db echo WARN: Base de datos no encontrada

echo.
echo RESTAURACION COMPLETADA!
echo.
echo Para iniciar:
echo npm start
echo.
echo Para PM2:
echo npm install -g pm2
echo pm2 start server.js
echo.
pause
"@

$restoreScript | Out-File -FilePath "$backupName\restore.bat"

Write-Host "OK: Script de restauracion creado" -ForegroundColor Green

# Calcular estadisticas
$backupSize = (Get-ChildItem -Path $backupName -Recurse | Measure-Object -Property Length -Sum).Sum
$filesCount = (Get-ChildItem -Path $backupName -Recurse -File).Count

Write-Host ""
Write-Host "ESTADISTICAS:" -ForegroundColor Cyan
Write-Host "Directorio: $backupName"
Write-Host "Archivos: $filesCount"
Write-Host "Tamaño: $([Math]::Round($backupSize/1MB, 2)) MB"

Write-Host ""
Write-Host "BACKUP COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "Ubicacion: $(Resolve-Path $backupName)"
Write-Host ""
Write-Host "Para restaurar:"
Write-Host "1. Copiar directorio completo"
Write-Host "2. Ejecutar restore.bat"
Write-Host "3. Instalar Node.js si es necesario"
Write-Host ""
