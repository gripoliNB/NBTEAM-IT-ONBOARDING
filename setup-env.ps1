# Setup de seguridad para NBTeam IT Onboarding
Write-Host "Configurando variables de entorno de AWS SES..." -ForegroundColor Cyan

# Crear archivo .env si no existe
if (!(Test-Path .env)) {
    Write-Host "Creando archivo .env..." -ForegroundColor Green
    
    # Crear contenido del archivo .env
    $lines = @(
        "# AWS SES Configuration",
        "AWS_ACCESS_KEY_ID=tu-access-key-aqui",
        "AWS_SECRET_ACCESS_KEY=tu-secret-key-aqui", 
        "AWS_REGION=us-east-1",
        "FROM_EMAIL=noreply@nbteamconsulting.com",
        "",
        "# Database Configuration",
        "DB_PATH=./formularios.db",
        "",
        "# Server Configuration", 
        "PORT=3001",
        "SESSION_SECRET=tu-session-secret-aqui",
        "",
        "# Email Configuration",
        "DEV_MODE=false"
    )
    
    # Escribir archivo línea por línea
    $lines | Out-File -FilePath ".env" -Encoding ASCII
    Write-Host "Archivo .env creado exitosamente" -ForegroundColor Green
} else {
    Write-Host "Archivo .env ya existe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "PASOS PARA CONFIGURAR CREDENCIALES:" -ForegroundColor Cyan
Write-Host "1. Edita el archivo .env con tus credenciales AWS reales"
Write-Host "2. Crea un usuario IAM en AWS con permisos SES"
Write-Host "3. Verifica tu dominio en AWS SES"
Write-Host "4. Solicita salida del Sandbox (opcional)"
Write-Host ""
Write-Host "Para mas informacion, consulta SECURITY-GUIDE.md" -ForegroundColor Cyan