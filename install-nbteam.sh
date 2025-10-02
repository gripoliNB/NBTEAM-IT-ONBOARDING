#!/bin/bash
# 🚀 Script de Instalación Automática - NBTeam IT Onboarding
# Para servidor Ubuntu en AWS

set -e

echo "🚀 Iniciando instalación de NBTeam IT Onboarding..."
echo "📅 Fecha: $(date)"
echo "🖥️  Sistema: $(uname -a)"
echo ""

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

# Verificar si es root
if [ "$EUID" -eq 0 ]; then
    print_error "No ejecutes este script como root. Usa un usuario con sudo."
    exit 1
fi

# Verificar distribución
if ! command -v apt &> /dev/null; then
    print_error "Este script está diseñado para sistemas basados en Debian/Ubuntu"
    exit 1
fi

print_status "Verificando sistema operativo..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_success "Sistema detectado: $PRETTY_NAME"
else
    print_warning "No se pudo detectar la versión del sistema"
fi

echo ""
print_status "=== PASO 1: ACTUALIZACIÓN DEL SISTEMA ==="
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git unzip htop nano

print_success "Sistema actualizado correctamente"

echo ""
print_status "=== PASO 2: INSTALACIÓN DE NODE.JS ==="
# Instalar Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js instalado: $NODE_VERSION"
print_success "npm instalado: $NPM_VERSION"

echo ""
print_status "=== PASO 3: INSTALACIÓN DE PM2 ==="
sudo npm install -g pm2

# Configurar PM2 para iniciar con el sistema
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

print_success "PM2 instalado y configurado"

echo ""
print_status "=== PASO 4: INSTALACIÓN DE NGINX ==="
sudo apt install -y nginx

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

print_success "Nginx instalado y configurado"

echo ""
print_status "=== PASO 5: CONFIGURACIÓN DE USUARIO Y PERMISOS ==="
# Crear usuario para la aplicación
sudo adduser --system --group --home /opt/nbteam nbteam 2>/dev/null || print_warning "Usuario nbteam ya existe"

# Crear directorios
sudo mkdir -p /opt/nbteam/app
sudo mkdir -p /opt/nbteam/logs
sudo mkdir -p /opt/nbteam/backups

# Configurar permisos
sudo chown -R nbteam:nbteam /opt/nbteam

print_success "Usuario y directorios configurados"

echo ""
print_status "=== PASO 6: CONFIGURACIÓN DE FIREWALL ==="
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001  # Temporal para pruebas
sudo ufw --force enable

print_success "Firewall configurado"

echo ""
print_status "=== PASO 7: CREACIÓN DE ARCHIVOS DE CONFIGURACIÓN ==="

# Crear archivo .env
sudo tee /opt/nbteam/app/.env > /dev/null <<EOF
# Configuración del servidor
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# Configuración de base de datos
DB_PATH=/opt/nbteam/app/formularios.db

# Configuración de sesiones
SESSION_SECRET=nbteam-it-onboarding-secret-key-$(date +%s)

# Configuración de dominio (cambiar por tu dominio)
DOMAIN=localhost
EOF

# Crear archivo ecosystem.config.js
sudo tee /opt/nbteam/app/ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: 'nbteam-it-onboarding',
    script: 'server.js',
    cwd: '/opt/nbteam/app',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0'
    },
    error_file: '/opt/nbteam/logs/err.log',
    out_file: '/opt/nbteam/logs/out.log',
    log_file: '/opt/nbteam/logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Crear script de backup
sudo tee /opt/nbteam/backup.sh > /dev/null <<EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/nbteam/backups"
APP_DIR="/opt/nbteam/app"

# Crear directorio de backups
mkdir -p \$BACKUP_DIR

# Backup de base de datos
if [ -f "\$APP_DIR/formularios.db" ]; then
    cp \$APP_DIR/formularios.db \$BACKUP_DIR/formularios_\$DATE.db
    echo "Backup de base de datos: formularios_\$DATE.db"
fi

# Backup de archivos de configuración
tar -czf \$BACKUP_DIR/config_\$DATE.tar.gz \$APP_DIR/.env \$APP_DIR/ecosystem.config.js 2>/dev/null || true

# Limpiar backups antiguos (mantener últimos 7 días)
find \$BACKUP_DIR -name "*.db" -mtime +7 -delete 2>/dev/null || true
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true

echo "Backup completado: \$DATE"
EOF

sudo chmod +x /opt/nbteam/backup.sh

print_success "Archivos de configuración creados"

echo ""
print_status "=== PASO 8: CONFIGURACIÓN DE NGINX ==="

# Crear configuración de Nginx
sudo tee /etc/nginx/sites-available/nbteam-it-onboarding > /dev/null <<EOF
server {
    listen 80;
    server_name _;  # Cambiar por tu dominio

    # Configuración de logs
    access_log /var/log/nginx/nbteam-access.log;
    error_log /var/log/nginx/nbteam-error.log;

    # Configuración de proxy
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Configuración de archivos estáticos
    location /static/ {
        alias /opt/nbteam/app/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/nbteam-it-onboarding /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx

print_success "Nginx configurado como proxy reverso"

echo ""
print_status "=== INSTALACIÓN BASE COMPLETADA ==="

print_success "✅ Sistema actualizado"
print_success "✅ Node.js instalado"
print_success "✅ PM2 instalado y configurado"
print_success "✅ Nginx instalado y configurado"
print_success "✅ Usuario y permisos configurados"
print_success "✅ Firewall configurado"
print_success "✅ Archivos de configuración creados"

echo ""
print_warning "📝 PRÓXIMOS PASOS:"
echo "1. Subir archivos de la aplicación a /opt/nbteam/app/"
echo "2. Ejecutar: cd /opt/nbteam/app && npm install"
echo "3. Ejecutar: pm2 start ecosystem.config.js"
echo "4. Configurar dominio en /etc/nginx/sites-available/nbteam-it-onboarding"
echo "5. Configurar SSL con Let's Encrypt (opcional)"

echo ""
print_status "📊 INFORMACIÓN DEL SISTEMA:"
echo "• Usuario de la aplicación: nbteam"
echo "• Directorio de la aplicación: /opt/nbteam/app/"
echo "• Logs de la aplicación: /opt/nbteam/logs/"
echo "• Configuración Nginx: /etc/nginx/sites-available/nbteam-it-onboarding"
echo "• Script de backup: /opt/nbteam/backup.sh"

echo ""
print_status "🔧 COMANDOS ÚTILES:"
echo "• Ver estado PM2: pm2 status"
echo "• Ver logs: pm2 logs nbteam-it-onboarding"
echo "• Reiniciar app: pm2 restart nbteam-it-onboarding"
echo "• Ver estado Nginx: sudo systemctl status nginx"
echo "• Ver logs Nginx: sudo tail -f /var/log/nginx/nbteam-error.log"

echo ""
print_success "🎉 Instalación base completada exitosamente!"
echo "📅 Completado el: $(date)"






