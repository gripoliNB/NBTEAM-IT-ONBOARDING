#!/bin/bash
# 🔒 Script de Configuración SSL - NBTeam IT Onboarding
# Configuración automática de SSL en Ubuntu

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

# Función para mostrar ayuda
show_help() {
    echo "🔒 Script de Configuración SSL - NBTeam IT Onboarding"
    echo ""
    echo "Uso: $0 [OPCIÓN] [DOMINIO]"
    echo ""
    echo "Opciones:"
    echo "  letsencrypt <dominio>  - Configurar SSL con Let's Encrypt (gratuito)"
    echo "  commercial <dominio>   - Configurar SSL con certificado comercial"
    echo "  selfsigned <dominio>   - Generar certificado auto-firmado (pruebas)"
    echo "  check                  - Verificar estado de SSL"
    echo "  renew                  - Renovar certificados Let's Encrypt"
    echo "  help                   - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 letsencrypt mi-dominio.com"
    echo "  $0 commercial mi-dominio.com"
    echo "  $0 selfsigned localhost"
    echo "  $0 check"
}

# Función para configurar Let's Encrypt
configure_letsencrypt() {
    local domain=$1
    
    if [ -z "$domain" ]; then
        print_error "Debe especificar un dominio"
        exit 1
    fi
    
    print_status "Configurando SSL con Let's Encrypt para: $domain"
    
    # Instalar Certbot si no está instalado
    if ! command -v certbot &> /dev/null; then
        print_status "Instalando Certbot..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Verificar que Nginx esté instalado
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx no está instalado. Instálalo primero."
        exit 1
    fi
    
    # Verificar que la aplicación esté corriendo
    if ! curl -s -o /dev/null -w "%{http_code}" "http://$domain" | grep -q "200\|302"; then
        print_warning "El dominio no responde correctamente. Verifica la configuración DNS."
        print_warning "Asegúrate de que $domain apunte a esta IP: $(curl -s ifconfig.me)"
        read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Obtener certificado
    print_status "Obteniendo certificado SSL..."
    sudo certbot --nginx -d $domain -d www.$domain --email admin@$domain --agree-tos --non-interactive --redirect
    
    if [ $? -eq 0 ]; then
        print_success "Certificado SSL obtenido correctamente"
    else
        print_error "Error al obtener certificado SSL"
        exit 1
    fi
    
    # Configurar renovación automática
    if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
        print_status "Programando renovación automática..."
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        print_success "Renovación automática programada"
    fi
    
    # Verificar configuración
    print_status "Verificando configuración SSL..."
    sudo nginx -t
    sudo systemctl reload nginx
    
    print_success "🎉 SSL configurado exitosamente con Let's Encrypt"
    print_status "🌐 Acceso HTTPS: https://$domain"
}

# Función para configurar certificado comercial
configure_commercial() {
    local domain=$1
    
    if [ -z "$domain" ]; then
        print_error "Debe especificar un dominio"
        exit 1
    fi
    
    print_status "Configurando SSL con certificado comercial para: $domain"
    
    # Crear directorios
    sudo mkdir -p /etc/ssl/certs/$domain
    sudo mkdir -p /etc/ssl/private/$domain
    
    print_warning "Por favor, sube los siguientes archivos:"
    print_status "1. Certificado público (.crt o .pem)"
    print_status "2. Clave privada (.key)"
    print_status "3. Certificado intermedio (.crt o .pem) - opcional"
    
    echo ""
    print_status "Puedes subir los archivos usando SCP:"
    echo "scp -i 'tu-key.pem' certificado.crt ubuntu@$(curl -s ifconfig.me):/home/ubuntu/"
    echo "scp -i 'tu-key.pem' clave-privada.key ubuntu@$(curl -s ifconfig.me):/home/ubuntu/"
    echo "scp -i 'tu-key.pem' certificado-intermedio.crt ubuntu@$(curl -s ifconfig.me):/home/ubuntu/"
    
    read -p "¿Has subido los archivos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Por favor, sube los archivos primero"
        exit 1
    fi
    
    # Buscar archivos en el directorio home
    CERT_FILE=$(find /home/ubuntu -name "*.crt" -o -name "*.pem" | grep -v "privkey" | head -1)
    KEY_FILE=$(find /home/ubuntu -name "*.key" -o -name "*privkey*" | head -1)
    CHAIN_FILE=$(find /home/ubuntu -name "*intermediate*" -o -name "*chain*" | head -1)
    
    if [ -z "$CERT_FILE" ] || [ -z "$KEY_FILE" ]; then
        print_error "No se encontraron los archivos de certificado necesarios"
        exit 1
    fi
    
    # Mover archivos
    sudo mv "$CERT_FILE" /etc/ssl/certs/$domain/cert.pem
    sudo mv "$KEY_FILE" /etc/ssl/private/$domain/privkey.pem
    
    if [ -n "$CHAIN_FILE" ]; then
        sudo mv "$CHAIN_FILE" /etc/ssl/certs/$domain/chain.pem
    fi
    
    # Configurar permisos
    sudo chmod 644 /etc/ssl/certs/$domain/*
    sudo chmod 600 /etc/ssl/private/$domain/*
    sudo chown root:root /etc/ssl/certs/$domain/*
    sudo chown root:root /etc/ssl/private/$domain/*
    
    # Crear configuración de Nginx
    create_nginx_config $domain "commercial"
    
    print_success "🎉 Certificado comercial configurado exitosamente"
}

# Función para generar certificado auto-firmado
configure_selfsigned() {
    local domain=$1
    
    if [ -z "$domain" ]; then
        print_error "Debe especificar un dominio"
        exit 1
    fi
    
    print_status "Generando certificado auto-firmado para: $domain"
    
    # Crear directorios
    sudo mkdir -p /etc/ssl/certs/$domain
    sudo mkdir -p /etc/ssl/private/$domain
    
    # Generar clave privada
    sudo openssl genrsa -out /etc/ssl/private/$domain/privkey.pem 2048
    
    # Generar certificado
    sudo openssl req -new -x509 -key /etc/ssl/private/$domain/privkey.pem \
        -out /etc/ssl/certs/$domain/cert.pem -days 365 \
        -subj "/C=MX/ST=Estado/L=Ciudad/O=NBTeam/CN=$domain"
    
    # Configurar permisos
    sudo chmod 600 /etc/ssl/private/$domain/privkey.pem
    sudo chmod 644 /etc/ssl/certs/$domain/cert.pem
    sudo chown root:root /etc/ssl/certs/$domain/*
    sudo chown root:root /etc/ssl/private/$domain/*
    
    # Crear configuración de Nginx
    create_nginx_config $domain "selfsigned"
    
    print_success "🎉 Certificado auto-firmado generado exitosamente"
    print_warning "⚠️  Los navegadores mostrarán advertencias de seguridad"
}

# Función para crear configuración de Nginx
create_nginx_config() {
    local domain=$1
    local cert_type=$2
    
    print_status "Creando configuración de Nginx..."
    
    if [ "$cert_type" = "letsencrypt" ]; then
        CERT_PATH="/etc/letsencrypt/live/$domain/fullchain.pem"
        KEY_PATH="/etc/letsencrypt/live/$domain/privkey.pem"
    else
        CERT_PATH="/etc/ssl/certs/$domain/cert.pem"
        KEY_PATH="/etc/ssl/private/$domain/privkey.pem"
    fi
    
    sudo tee /etc/nginx/sites-available/$domain-ssl > /dev/null <<EOF
# Redirección HTTP a HTTPS
server {
    listen 80;
    server_name $domain www.$domain;
    return 301 https://\$server_name\$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name $domain www.$domain;

    # Certificados SSL
    ssl_certificate $CERT_PATH;
    ssl_certificate_key $KEY_PATH;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Configuración de logs
    access_log /var/log/nginx/$domain-access.log;
    error_log /var/log/nginx/$domain-error.log;

    # Proxy a la aplicación Node.js
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

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF

    # Habilitar sitio
    sudo ln -sf /etc/nginx/sites-available/$domain-ssl /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Verificar configuración
    sudo nginx -t
    
    # Recargar Nginx
    sudo systemctl reload nginx
    
    print_success "Configuración de Nginx aplicada"
}

# Función para verificar estado de SSL
check_ssl() {
    print_status "Verificando estado de SSL..."
    
    if command -v certbot &> /dev/null; then
        print_status "=== CERTIFICADOS LET'S ENCRYPT ==="
        sudo certbot certificates 2>/dev/null || print_warning "No hay certificados Let's Encrypt"
        
        echo ""
        print_status "=== VERIFICACIÓN DE RENOVACIÓN ==="
        sudo certbot renew --dry-run 2>/dev/null || print_warning "Error en verificación de renovación"
    else
        print_warning "Certbot no está instalado"
    fi
    
    echo ""
    print_status "=== CONFIGURACIONES NGINX ==="
    ls -la /etc/nginx/sites-enabled/ | grep ssl || print_warning "No hay configuraciones SSL en Nginx"
    
    echo ""
    print_status "=== CERTIFICADOS COMERCIALES ==="
    find /etc/ssl/certs -name "*.pem" -o -name "*.crt" 2>/dev/null | head -10 || print_warning "No hay certificados comerciales"
}

# Función para renovar certificados
renew_ssl() {
    print_status "Renovando certificados Let's Encrypt..."
    
    if ! command -v certbot &> /dev/null; then
        print_error "Certbot no está instalado"
        exit 1
    fi
    
    sudo certbot renew
    
    if [ $? -eq 0 ]; then
        print_success "Certificados renovados correctamente"
        sudo systemctl reload nginx
    else
        print_error "Error al renovar certificados"
    fi
}

# Función principal
main() {
    case "${1:-help}" in
        "letsencrypt")
            configure_letsencrypt "$2"
            ;;
        "commercial")
            configure_commercial "$2"
            ;;
        "selfsigned")
            configure_selfsigned "$2"
            ;;
        "check")
            check_ssl
            ;;
        "renew")
            renew_ssl
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal
main "$@"






