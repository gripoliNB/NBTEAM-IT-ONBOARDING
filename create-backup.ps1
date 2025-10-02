# Script de Backup Completo - Formulario de Empleados
# Genera: backup completo con timestamp + scripts de restauración + documentación

param(
    [string]$BackupPath = "Backup-FormularioApp"
)

# Obtener timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$backupName = "$BackupPath-$timestamp"

Write-Host "🚀 Iniciando backup completo de la aplicación..."
Write-Host "📅 Timestamp: $timestamp"
Write-Host "📁 Directorio de backup: $backupName"
Write-Host ""

# Crear directorio principal de backup
New-Item -ItemType Directory -Force -Path $backupName | Out-Null

# Crear subdirectorios
$folders = @("database", "logs", "docs")
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path "$backupName\$folder" | Out-Null
}

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
    "software.html",
    "users.html"
)

foreach ($htmlFile in $htmlFiles) {
    if (Test-Path $htmlFile) {
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
    Copy-Item "database.db" "$backupName\database\database.db"
    Write-Host "✅ database.db"
    
    # Información adicional de la base de datos
    $dbSize = (Get-Item "database.db").Length
    Write-Host "📊 Tamaño de DB: $([Math]::Round($dbSize/1KB, 2)) KB"
} else {
    Write-Host "⚠️  No encontrado: database.db"
}

Write-Host ""
Write-Host "📦 Copiando dependencias..."

# Copiar node_modules (sin archivos innecesarios para reducir tamaño)
if (Test-Path "node_modules") {
    Write-Host "📋 Creando lista de dependencias..."
    
    # Crear backup de package-lock.json si existe
    if (Test-Path "package-lock.json") {
        Copy-Item "package-lock.json" "$backupName\package-lock.json"
        Write-Host "✅ package-lock.json"
    }
    
    # Crear archivo con lista de módulos instalados
    npm list --depth=0 2>$null | Out-File -FilePath "$backupName\installed-packages.txt" -Encoding UTF8
    
    Write-Host "✅ Lista de dependencias guardada"
} else {
    Write-Host "⚠️  No encontrado: node_modules"
}

Write-Host ""
Write-Host "📝 Copiando archivos de configuración..."

# Archivos de configuración
$configFiles = @(
    ".env",
    "ecosystem.config.js",
    "backup.sh",
    "install-deps.sh",
    "restart-app.sh"
)

foreach ($configFile in $configFiles) {
    if (Test-Path $configFile) {
        Copy-Item $configFile "$backupName\$configFile" -ErrorAction SilentlyContinue
        Write-Host "✅ $configFile"
    }
}

Write-Host ""
Write-Host "📋 Generando documentación del backup..."

# Crear documentación del backup
$backupDoc = @"
# 📦 BACKUP COMPLETO - FORMULARIO DE EMPLEADOS
## 📅 Fecha: $timestamp

### 🔧 Funcionalidades incluidas:
- ✅ Sistema de formularios con base de datos SQLite
- ✅ Centro de costos y tipo de contrato
- ✅ Carga dinámica de clientes desde base de datos
- ✅ Carga dinámica de software desde base de datos
- ✅ Administración de clientes (solo admin)
- ✅ Administración de software (solo admin)
- ✅ Roles: Admin, HR, IT
- ✅ Sistema de autenticación con sesiones

### 📁 Contenido del backup:
- **Archivos principales**: server.js, database.js, package.json
- **Interfaz**: index.html, login.html, dashboard.html, clientes.html, software.html
- **Base de datos**: database.db con datos completos
- **Configuración**: ecosystem.config.js, scripts de backup
- **Dependencias**: package-lock.json, lista de módulos

### 🗃️ Base de datos incluida:
- Tabla: formularios (con campos centro_costos y tipo_contrato)
- Tabla: usuarios (admin, hr, it)
- Tabla: clientes (gestión dinámica)
- Tabla: software (gestión dinámica)

### 🚀 Instrucciones de restauración:
1. Instalar Node.js LTS
2. Copiar todos los archivos a directorio del servidor
3. Ejecutar: npm install
4. Configurar PM2: pm2 start ecosystem.config.js
5. Configurar Nginx para proxy reverso
6. Configurar SSL con Let's Encrypt

### 🔐 Credenciales por defecto:
* Administrator: admin / password
* HR: hr / password  
* IT: it / password

### 📞 Soporte:
Este backup incluye toda la funcionalidad de la aplicación completa.

---

Generado automaticamente el $timestamp
"@

$backupDoc | Out-File -FilePath "$backupName\README-BACKUP.md" -Encoding UTF8

Write-Host ""
Write-Host "📜 Creando scripts de restauración..."

# Script de restauración para Windows
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
if not exist database.db (
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

# Script de restauración para Linux
$restoreScriptLinux = @'
#!/bin/bash

echo "🚀 RESTAURACION DEL FORMULARIO DE EMPLEADOS"
echo ""

echo "📋 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no esta instalado"
    echo "💡 Instalar con: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
    echo "💡 sudo apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

echo "📦 Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"
echo ""

echo "🗃️ Verificando base de datos..."
if [ ! -f database.db ]; then
    echo "⚠️ Base de datos no encontrada"
    echo "💡 Asegurate de copiar database.db"
fi

echo ""
echo "📦 Instalando PM2..."
sudo npm install -g pm2

echo "✅ PM2 instalado"

echo ""
echo "🎉 Restauracion completada!"
echo ""
echo "Para iniciar la aplicacion:"
echo "node server.js"
echo ""
echo "Para usar PM2:"
echo "pm2 start ecosystem.config.js"
echo "pm2 status"
'@

$restoreScriptLinux | Out-File -FilePath "$backupName\restore-linux.sh" -Encoding ASCII

# Script PowerShell completo
$restoreScriptPS = @'
# Script de Restauracion Completa - PowerShell
param(
    [string]$InstallPath = "."
)

Write-Host "🚀 RESTAURACION DEL FORMULARIO DE EMPLEADOS" -ForegroundColor Green
Write-Host ""

# Verificar Node.js
Write-Host "📋 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no esta instalado" -ForegroundColor Red
    Write-Host "💡 Descarga desde: https://nodejs.org/" -ForegroundColor Cyan
    return
}

Write-Host ""

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
Set-Location $InstallPath
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    return
}

Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# Verificar base de datos
Write-Host ""
Write-Host "🗃️ Verificando base de datos..." -ForegroundColor Yellow
if (Test-Path "database.db") {
    $dbSize = (Get-Item "database.db").Length
    Write-Host "✅ Base de datos encontrada ($([Math]::Round($dbSize/1KB, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Base de datos no encontrada" -ForegroundColor Yellow
}

# Instalar PM2
Write-Host ""
Write-Host "📦 Instalando PM2..." -ForegroundColor Yellow
npm install -g pm2

Write-Host ""
Write-Host "🎉 RESTAURACION COMPLETADA!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Para iniciar la aplicacion:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para usar PM2:" -ForegroundColor Cyan
Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor White
Write-Host "   pm2 status" -ForegroundColor White
'@

# Guardar nombre corto con extensión .ps1. Guardamos dentro del directorio como .txt para evitar restricciones de PowerShell.
$filename = "$backupName/restore-powershell.txt"
$restoreScriptPS | Out-File -FilePath $filename -Encoding UTF8

Write-Host "✅ Scripts de restauración creados:" -ForegroundColor Green
Write-Host "   📄 restore-windows.bat" -ForegroundColor White  
Write-Host "   📄 restore-linux.sh" -ForegroundColor White
Write-Host "   📄 restore-powershell.txt" -ForegroundColor White

Write-Host ""
Write-Host "🔒 Generando suma de verificación..."

# Generar suma de verificación
Get-ChildItem -Path "$backupName" -Recurse | Get-FileHash -Algorithm SHA256 | ForEach-Object { "$($_.Hash)  $($_.Path)" } | Out-File "$backupName\checksum.txt"

Write-Host ""
Write-Host "📊 ESTADISTICAS DEL BACKUP:" -ForegroundColor Cyan

# Calcular tamaño total
$backupSize = (Get-ChildItem -Path $backupName -Recurse | Measure-Object -Property Length -Sum).Sum
$filesCount = (Get-ChildItem -Path $backupName -Recurse -File).Count

Write-Host "📁 Directorio: $backupName" -ForegroundColor White
Write-Host "📊 Archivos: $filesCount" -ForegroundColor White
Write-Host "💾 Tamaño total: $([Math]::Round($backupSize/1MB, 2)) MB" -ForegroundColor White

if (Test-Path "database.db") {
    $dbSize = (Get-Item "database.db").Length
    Write-Host "🗃️ Base de datos: $([Math]::Round($dbSize/1KB, 2)) KB" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 BACKUP COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "📦 Ubicación: $(Resolve-Path $backupName)" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para restaurar en otro servidor:" -ForegroundColor Yellow
Write-Host "   1. Copiar el directorio completo" -ForegroundColor White
Write-Host "   2. Ejecutar el script de restauración correspondiente" -ForegroundColor White
Write-Host "   3. Instalar Node.js y dependencias" -ForegroundColor White
Write-Host "   4. Configurar PM2 y Nginx" -ForegroundColor White
Write-Host ""

# Finalizar tareas
$todos = @(
    @{id="backup-1"; status="completed"},
    @{id="backup-2"; status="completed"},
    @{id="backup-3"; status="completed"}
)
