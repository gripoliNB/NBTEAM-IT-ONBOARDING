#!/bin/bash
# 🔒 Script de Configuración SSL - NBTeam IT Onboarding
# Configuración automática de SSL con Let's Encrypt

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

echo "🔒 Configurando SSL para NBTeam IT Onboarding..."
echo "📅 Fecha: $(date)"
echo ""

# Verificar si se proporcionó el dominio
if [ -z "$1" ]; then
    print_error "Uso: $0 <dominio>"
    print_error "Ejemplo: $0 mi-dominio.com"
    exit 1
fi

DOMAIN=$1
EMAIL="admin@$DOMAIN"

print_status "Configurando SSL para dominio: $DOMAIN"
print_status "Email para certificado: $EMAIL"

echo ""
print_status "=== PASO 1: VERIFICACIÓN DE REQUISITOS ==="

# Verificar que Nginx esté instalado
if ! command -v nginx &> /dev/null; then
    print_error "Nginx no está instalado"
    exit 1
fi

# Verificar que la aplicación esté corriendo
if ! pm2 list | grep -q "nbteam-it-onboarding.*online"; then
    print_error "La aplicación no está corriendo. Ejecuta primero deploy-nbteam.sh"
    exit 1
fi

# Verificar conectividad del dominio
print_status "Verificando conectividad del dominio..."
if ! curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" | grep -q "200\|302"; then
    print_warning "El dominio no responde correctamente. Verifica la configuración DNS."
    print_warning "Asegúrate de que $DOMAIN apunte a esta IP: $(curl -s ifconfig.me)"
    read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_success "Requisitos verificados"

echo ""
print_status "=== PASO 2: INSTALACIÓN DE CERTBOT ==="

# Instalar Certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    print_status "Instalando Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot instalado"
else
    print_success "Certbot ya está instalado"
fi

echo ""
print_status "=== PASO 3: CONFIGURACIÓN TEMPORAL DE NGINX ==="

# Crear configuración temporal para el dominio
sudo tee /etc/nginx/sites-available/nbteam-it-onboarding > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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
}
EOF

# Recargar Nginx
sudo nginx -t
sudo systemctl reload nginx

print_success "Configuración temporal de Nginx aplicada"

echo ""
print_status "=== PASO 4: OBTENCIÓN DE CERTIFICADO SSL ==="

# Obtener certificado SSL
print_status "Obteniendo certificado SSL para $DOMAIN..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

if [ $? -eq 0 ]; then
    print_success "Certificado SSL obtenido correctamente"
else
    print_error "Error al obtener certificado SSL"
    exit 1
fi

echo ""
print_status "=== PASO 5: CONFIGURACIÓN FINAL DE NGINX ==="

# Crear configuración final con SSL
sudo tee /etc/nginx/sites-available/nbteam-it-onboarding > /dev/null <<EOF
# Redirección HTTP a HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # Configuración SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

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
    add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx

print_success "Configuración final de Nginx aplicada"

echo ""
print_status "=== PASO 6: CONFIGURACIÓN DE RENOVACIÓN AUTOMÁTICA ==="

# Verificar renovación automática
print_status "Verificando renovación automática..."
sudo certbot renew --dry-run

if [ $? -eq 0 ]; then
    print_success "Renovación automática configurada correctamente"
else
    print_warning "Problema con renovación automática"
fi

# Programar renovación automática si no existe
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    print_status "Programando renovación automática..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    print_success "Renovación automática programada para las 12:00 PM"
fi

echo ""
print_status "=== PASO 7: ACTUALIZACIÓN DE FIREWALL ==="

# Remover acceso directo al puerto 3001
sudo ufw delete allow 3001 2>/dev/null || true

print_success "Firewall actualizado (puerto 3001 bloqueado)"

echo ""
print_status "=== CONFIGURACIÓN SSL COMPLETADA ==="

print_success "✅ Certificado SSL instalado"
print_success "✅ Redirección HTTP a HTTPS configurada"
print_success "✅ Configuración SSL moderna aplicada"
print_success "✅ Renovación automática configurada"
print_success "✅ Seguridad mejorada"

echo ""
print_status "🌐 ACCESO A LA APLICACIÓN:"
echo "• HTTPS: https://$DOMAIN"
echo "• HTTPS (www): https://www.$DOMAIN"
echo "• HTTP redirige automáticamente a HTTPS"

echo ""
print_status "🔧 COMANDOS DE ADMINISTRACIÓN SSL:"
echo "• Ver certificados: sudo certbot certificates"
echo "• Renovar manualmente: sudo certbot renew"
echo "• Verificar renovación: sudo certbot renew --dry-run"
echo "• Revocar certificado: sudo certbot revoke --cert-path /etc/letsencrypt/live/$DOMAIN/cert.pem"

echo ""
print_status "📊 INFORMACIÓN DEL CERTIFICADO:"
echo "• Dominio: $DOMAIN"
echo "• Válido hasta: $(sudo certbot certificates | grep -A 2 "$DOMAIN" | grep "Expiry Date" | cut -d: -f2-)"
echo "• Ubicación: /etc/letsencrypt/live/$DOMAIN/"

echo ""
print_success "🎉 ¡SSL configurado exitosamente!"
echo "📅 Configurado el: $(date)"

# Verificar conectividad HTTPS
echo ""
print_status "🔍 VERIFICACIÓN FINAL:"
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|302"; then
    print_success "✅ HTTPS funcionando correctamente"
else
    print_warning "⚠️  HTTPS no responde. Verifica la configuración."
fi






