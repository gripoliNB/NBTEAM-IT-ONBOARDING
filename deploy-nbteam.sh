#!/bin/bash
# 🚀 Script de Despliegue de Aplicación - NBTeam IT Onboarding
# Para servidor Ubuntu con instalación base completada

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 Iniciando despliegue de NBTeam IT Onboarding..."
echo "📅 Fecha: $(date)"
echo ""

# Verificar si el directorio de la aplicación existe
if [ ! -d "/opt/nbteam/app" ]; then
    print_error "El directorio /opt/nbteam/app no existe. Ejecuta primero install-nbteam.sh"
    exit 1
fi

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 no está instalado. Ejecuta primero install-nbteam.sh"
    exit 1
fi

echo ""
print_status "=== PASO 1: PREPARACIÓN DEL DESPLIEGUE ==="

# Detener aplicación si está corriendo
if pm2 list | grep -q "nbteam-it-onboarding"; then
    print_status "Deteniendo aplicación existente..."
    pm2 stop nbteam-it-onboarding
    pm2 delete nbteam-it-onboarding
fi

# Crear backup antes del despliegue
print_status "Creando backup de seguridad..."
sudo /opt/nbteam/backup.sh

echo ""
print_status "=== PASO 2: VERIFICACIÓN DE ARCHIVOS ==="

# Verificar archivos esenciales
REQUIRED_FILES=(
    "server.js"
    "package.json"
    "database.js"
    "index.html"
    "edit.html"
    "list.html"
    "login.html"
    "dashboard.html"
    "users.html"
    "hardware-report.html"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "/opt/nbteam/app/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_error "Archivos faltantes:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    print_warning "Por favor, sube todos los archivos de la aplicación a /opt/nbteam/app/"
    exit 1
fi

print_success "Todos los archivos esenciales están presentes"

echo ""
print_status "=== PASO 3: INSTALACIÓN DE DEPENDENCIAS ==="

cd /opt/nbteam/app

# Instalar dependencias
print_status "Instalando dependencias de Node.js..."
npm install --production

# Verificar instalación
if [ ! -d "node_modules" ]; then
    print_error "Error al instalar dependencias"
    exit 1
fi

print_success "Dependencias instaladas correctamente"

echo ""
print_status "=== PASO 4: CONFIGURACIÓN DE BASE DE DATOS ==="

# Verificar permisos de base de datos
sudo chown -R nbteam:nbteam /opt/nbteam/app/

# Crear base de datos si no existe
if [ ! -f "formularios.db" ]; then
    print_status "Inicializando base de datos..."
    node -e "
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('formularios.db');
    db.serialize(() => {
        db.run(\`
            CREATE TABLE IF NOT EXISTS formularios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_number TEXT,
                full_name TEXT NOT NULL,
                department TEXT NOT NULL,
                start_date TEXT NOT NULL,
                hardware TEXT NOT NULL,
                hardware_brand TEXT,
                hardware_model TEXT,
                hardware_serial TEXT,
                hardware_accessories TEXT,
                trainings TEXT NOT NULL,
                software_requirements TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT,
                updated_by TEXT
            )
        \`);
        console.log('Base de datos inicializada');
    });
    db.close();
    "
    print_success "Base de datos inicializada"
else
    print_success "Base de datos existente encontrada"
fi

echo ""
print_status "=== PASO 5: INICIO DE LA APLICACIÓN ==="

# Iniciar aplicación con PM2
print_status "Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js

# Esperar un momento para que la aplicación inicie
sleep 5

# Verificar que la aplicación esté corriendo
if pm2 list | grep -q "nbteam-it-onboarding.*online"; then
    print_success "Aplicación iniciada correctamente"
else
    print_error "Error al iniciar la aplicación"
    pm2 logs nbteam-it-onboarding --lines 20
    exit 1
fi

# Guardar configuración PM2
pm2 save

echo ""
print_status "=== PASO 6: VERIFICACIÓN DE CONECTIVIDAD ==="

# Verificar que la aplicación responda
print_status "Verificando conectividad..."
sleep 3

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|302"; then
    print_success "Aplicación responde correctamente en puerto 3001"
else
    print_warning "La aplicación no responde en puerto 3001"
    print_status "Verificando logs..."
    pm2 logs nbteam-it-onboarding --lines 10
fi

# Verificar Nginx
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx está corriendo"
    
    # Verificar configuración de Nginx
    if sudo nginx -t; then
        print_success "Configuración de Nginx es válida"
    else
        print_error "Error en configuración de Nginx"
        exit 1
    fi
else
    print_warning "Nginx no está corriendo"
    sudo systemctl start nginx
fi

echo ""
print_status "=== PASO 7: CONFIGURACIÓN DE MONITOREO ==="

# Programar backup diario si no existe
if ! crontab -l 2>/dev/null | grep -q "backup.sh"; then
    print_status "Programando backup diario..."
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/nbteam/backup.sh") | crontab -
    print_success "Backup diario programado para las 2:00 AM"
fi

echo ""
print_status "=== DESPLIEGUE COMPLETADO ==="

print_success "✅ Aplicación desplegada correctamente"
print_success "✅ Base de datos inicializada"
print_success "✅ PM2 configurado y ejecutándose"
print_success "✅ Nginx funcionando como proxy"
print_success "✅ Backup automático configurado"

echo ""
print_status "📊 INFORMACIÓN DE LA APLICACIÓN:"
echo "• Estado PM2: $(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo 'Verificar con: pm2 status')"
echo "• Puerto interno: 3001"
echo "• Puerto externo: 80 (HTTP)"
echo "• Logs: /opt/nbteam/logs/"
echo "• Base de datos: /opt/nbteam/app/formularios.db"

echo ""
print_status "🌐 ACCESO A LA APLICACIÓN:"
echo "• Local: http://localhost"
echo "• Externo: http://$(curl -s ifconfig.me 2>/dev/null || echo 'TU-IP-PUBLICA')"
echo "• Con dominio: http://tu-dominio.com (si configurado)"

echo ""
print_status "🔧 COMANDOS DE ADMINISTRACIÓN:"
echo "• Ver estado: pm2 status"
echo "• Ver logs: pm2 logs nbteam-it-onboarding"
echo "• Reiniciar: pm2 restart nbteam-it-onboarding"
echo "• Detener: pm2 stop nbteam-it-onboarding"
echo "• Monitoreo: pm2 monit"
echo "• Backup manual: /opt/nbteam/backup.sh"

echo ""
print_status "📝 PRÓXIMOS PASOS OPCIONALES:"
echo "1. Configurar dominio en /etc/nginx/sites-available/nbteam-it-onboarding"
echo "2. Instalar SSL con Let's Encrypt: sudo certbot --nginx -d tu-dominio.com"
echo "3. Configurar usuarios en la aplicación"
echo "4. Personalizar logo y configuración"

echo ""
print_success "🎉 ¡Despliegue completado exitosamente!"
echo "📅 Desplegado el: $(date)"

# Mostrar estado final
echo ""
print_status "📈 ESTADO FINAL DEL SISTEMA:"
pm2 status
echo ""
sudo systemctl status nginx --no-pager -l






