# 🚀 Script de Despliegue desde Windows - NBTeam IT Onboarding
# PowerShell Script para subir aplicación a servidor Ubuntu

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "ubuntu",
    
    [Parameter(Mandatory=$false)]
    [string]$AppPath = "C:\Users\GiovanniRipoli\Cursor-Project",
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/opt/nbteam/app"
)

# Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

Write-Host "🚀 Desplegando NBTeam IT Onboarding a Ubuntu" -ForegroundColor $Green
Write-Host "📅 Fecha: $(Get-Date)" -ForegroundColor $Blue
Write-Host ""

# Verificar parámetros
if (-not (Test-Path $KeyPath)) {
    Write-Error "Archivo de clave no encontrado: $KeyPath"
    exit 1
}

if (-not (Test-Path $AppPath)) {
    Write-Error "Directorio de aplicación no encontrado: $AppPath"
    exit 1
}

Write-Status "Parámetros de conexión:"
Write-Host "  • Servidor: $ServerIP" -ForegroundColor $Blue
Write-Host "  • Usuario: $Username" -ForegroundColor $Blue
Write-Host "  • Clave: $KeyPath" -ForegroundColor $Blue
Write-Host "  • Origen: $AppPath" -ForegroundColor $Blue
Write-Host "  • Destino: $RemotePath" -ForegroundColor $Blue
Write-Host ""

# Paso 1: Verificar conectividad
Write-Status "Verificando conectividad con el servidor..."
try {
    $ping = Test-NetConnection -ComputerName $ServerIP -Port 22 -WarningAction SilentlyContinue
    if ($ping.TcpTestSucceeded) {
        Write-Success "Servidor accesible via SSH"
    } else {
        Write-Error "No se puede conectar al servidor via SSH"
        exit 1
    }
} catch {
    Write-Error "Error al verificar conectividad: $($_.Exception.Message)"
    exit 1
}

# Paso 2: Crear directorios en el servidor
Write-Status "Creando directorios en el servidor..."
$createDirsCommand = "sudo mkdir -p $RemotePath && sudo chown -R $Username`:$Username /opt/nbteam"
try {
    ssh -i $KeyPath $Username@$ServerIP $createDirsCommand
    Write-Success "Directorios creados correctamente"
} catch {
    Write-Error "Error al crear directorios: $($_.Exception.Message)"
    exit 1
}

# Paso 3: Subir archivos
Write-Status "Subiendo archivos de la aplicación..."

# Crear lista de archivos a excluir
$excludePatterns = @(
    "node_modules",
    ".git",
    "*.log",
    "*.tmp",
    ".DS_Store",
    "Thumbs.db"
)

# Función para crear comando SCP con exclusiones
function Get-SCPCommand {
    param([string]$Source, [string]$Destination, [string]$Key, [string]$User, [string]$Server)
    
    $excludeArgs = ""
    foreach ($pattern in $excludePatterns) {
        $excludeArgs += " --exclude='$pattern'"
    }
    
    return "scp -i `"$Key`" -r $excludeArgs `"$Source`" $User@$Server`:$Destination"
}

try {
    # Usar rsync si está disponible, sino usar scp
    if (Get-Command rsync -ErrorAction SilentlyContinue) {
        Write-Status "Usando rsync para transferencia optimizada..."
        $rsyncCommand = "rsync -avz -e `"ssh -i $KeyPath`" --exclude='node_modules' --exclude='.git' `"$AppPath\`" $Username@$ServerIP`:$RemotePath/"
        Invoke-Expression $rsyncCommand
    } else {
        Write-Status "Usando SCP para transferencia..."
        $scpCommand = "scp -i `"$KeyPath`" -r `"$AppPath\*`" $Username@$ServerIP`:$RemotePath/"
        Invoke-Expression $scpCommand
    }
    Write-Success "Archivos subidos correctamente"
} catch {
    Write-Error "Error al subir archivos: $($_.Exception.Message)"
    exit 1
}

# Paso 4: Instalar dependencias
Write-Status "Instalando dependencias en el servidor..."
$installCommand = "cd $RemotePath && npm install --production"
try {
    ssh -i $KeyPath $Username@$ServerIP $installCommand
    Write-Success "Dependencias instaladas correctamente"
} catch {
    Write-Error "Error al instalar dependencias: $($_.Exception.Message)"
    exit 1
}

# Paso 5: Configurar permisos
Write-Status "Configurando permisos..."
$permissionsCommand = "sudo chown -R $Username`:$Username $RemotePath && chmod +x $RemotePath/*.sh 2>/dev/null || true"
try {
    ssh -i $KeyPath $Username@$ServerIP $permissionsCommand
    Write-Success "Permisos configurados correctamente"
} catch {
    Write-Warning "Advertencia al configurar permisos: $($_.Exception.Message)"
}

# Paso 6: Verificar instalación
Write-Status "Verificando instalación..."
$verifyCommand = "cd $RemotePath && ls -la && echo '--- Package.json ---' && cat package.json | head -10"
try {
    ssh -i $KeyPath $Username@$ServerIP $verifyCommand
    Write-Success "Verificación completada"
} catch {
    Write-Warning "Advertencia en verificación: $($_.Exception.Message)"
}

Write-Host ""
Write-Success "🎉 Despliegue completado exitosamente!"
Write-Host ""
Write-Status "📋 Próximos pasos en el servidor:"
Write-Host "1. Conectar al servidor: ssh -i `"$KeyPath`" $Username@$ServerIP" -ForegroundColor $Blue
Write-Host "2. Ir al directorio: cd $RemotePath" -ForegroundColor $Blue
Write-Host "3. Ejecutar aplicación: node server.js" -ForegroundColor $Blue
Write-Host "4. O usar PM2: pm2 start ecosystem.config.js" -ForegroundColor $Blue
Write-Host ""
Write-Status "🌐 URLs de acceso:"
Write-Host "• Local: http://localhost:3001" -ForegroundColor $Blue
Write-Host "• Externo: http://$ServerIP:3001" -ForegroundColor $Blue
Write-Host "• Con dominio: http://tu-dominio.com" -ForegroundColor $Blue
Write-Host ""
Write-Success "¡Aplicación lista para usar!" -ForegroundColor $Green






