#!/bin/bash
# 🔧 Script de Mantenimiento - NBTeam IT Onboarding
# Herramientas de administración y mantenimiento del sistema

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
    echo "🔧 Script de Mantenimiento - NBTeam IT Onboarding"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  status      - Mostrar estado del sistema"
    echo "  logs        - Mostrar logs de la aplicación"
    echo "  restart     - Reiniciar la aplicación"
    echo "  backup      - Crear backup manual"
    echo "  update      - Actualizar aplicación"
    echo "  monitor     - Monitoreo en tiempo real"
    echo "  cleanup     - Limpiar logs y archivos temporales"
    echo "  ssl-check   - Verificar estado de SSL"
    echo "  health      - Verificación completa de salud"
    echo "  help        - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 status"
    echo "  $0 logs"
    echo "  $0 backup"
}

# Función para mostrar estado del sistema
show_status() {
    echo "📊 ESTADO DEL SISTEMA - NBTeam IT Onboarding"
    echo "📅 Fecha: $(date)"
    echo ""
    
    print_status "=== ESTADO DE LA APLICACIÓN ==="
    pm2 status
    
    echo ""
    print_status "=== ESTADO DE NGINX ==="
    sudo systemctl status nginx --no-pager -l
    
    echo ""
    print_status "=== ESTADO DE SSL ==="
    if command -v certbot &> /dev/null; then
        sudo certbot certificates 2>/dev/null || print_warning "No hay certificados SSL configurados"
    else
        print_warning "Certbot no está instalado"
    fi
    
    echo ""
    print_status "=== USO DE RECURSOS ==="
    echo "Memoria:"
    free -h
    echo ""
    echo "Disco:"
    df -h /opt/nbteam
    
    echo ""
    print_status "=== CONECTIVIDAD ==="
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|302"; then
        print_success "✅ Aplicación responde en puerto 3001"
    else
        print_error "❌ Aplicación no responde en puerto 3001"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
        print_success "✅ Nginx responde en puerto 80"
    else
        print_error "❌ Nginx no responde en puerto 80"
    fi
}

# Función para mostrar logs
show_logs() {
    echo "📋 LOGS DE LA APLICACIÓN - NBTeam IT Onboarding"
    echo ""
    
    print_status "=== LOGS DE PM2 (últimas 50 líneas) ==="
    pm2 logs nbteam-it-onboarding --lines 50
    
    echo ""
    print_status "=== LOGS DE NGINX (últimas 20 líneas) ==="
    sudo tail -20 /var/log/nginx/nbteam-error.log 2>/dev/null || print_warning "No hay logs de error de Nginx"
    
    echo ""
    print_status "=== LOGS DEL SISTEMA (últimas 10 líneas) ==="
    sudo journalctl -u nginx --no-pager -l --lines 10
}

# Función para reiniciar la aplicación
restart_app() {
    print_status "Reiniciando aplicación..."
    
    # Crear backup antes del reinicio
    print_status "Creando backup de seguridad..."
    sudo /opt/nbteam/backup.sh
    
    # Reiniciar aplicación
    pm2 restart nbteam-it-onboarding
    
    # Esperar un momento
    sleep 5
    
    # Verificar estado
    if pm2 list | grep -q "nbteam-it-onboarding.*online"; then
        print_success "✅ Aplicación reiniciada correctamente"
    else
        print_error "❌ Error al reiniciar la aplicación"
        pm2 logs nbteam-it-onboarding --lines 10
    fi
}

# Función para crear backup manual
create_backup() {
    print_status "Creando backup manual..."
    
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="/opt/nbteam/backups"
    
    # Crear directorio de backups
    sudo mkdir -p $BACKUP_DIR
    
    # Backup de base de datos
    if [ -f "/opt/nbteam/app/formularios.db" ]; then
        sudo cp /opt/nbteam/app/formularios.db $BACKUP_DIR/formularios_$DATE.db
        print_success "✅ Backup de base de datos: formularios_$DATE.db"
    else
        print_warning "⚠️  Base de datos no encontrada"
    fi
    
    # Backup de configuración
    sudo tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/nbteam/app/.env /opt/nbteam/app/ecosystem.config.js 2>/dev/null || true
    print_success "✅ Backup de configuración: config_$DATE.tar.gz"
    
    # Backup completo de la aplicación
    sudo tar -czf $BACKUP_DIR/app_full_$DATE.tar.gz -C /opt/nbteam app/ 2>/dev/null || true
    print_success "✅ Backup completo: app_full_$DATE.tar.gz"
    
    print_success "🎉 Backup completado: $DATE"
}

# Función para actualizar aplicación
update_app() {
    print_status "Actualizando aplicación..."
    
    # Crear backup antes de la actualización
    print_status "Creando backup de seguridad..."
    sudo /opt/nbteam/backup.sh
    
    # Detener aplicación
    pm2 stop nbteam-it-onboarding
    
    # Actualizar dependencias
    cd /opt/nbteam/app
    npm update
    
    # Reiniciar aplicación
    pm2 start nbteam-it-onboarding
    
    # Verificar estado
    sleep 5
    if pm2 list | grep -q "nbteam-it-onboarding.*online"; then
        print_success "✅ Aplicación actualizada correctamente"
    else
        print_error "❌ Error al actualizar la aplicación"
        pm2 logs nbteam-it-onboarding --lines 10
    fi
}

# Función para monitoreo en tiempo real
monitor_app() {
    print_status "Iniciando monitoreo en tiempo real..."
    print_warning "Presiona Ctrl+C para salir"
    echo ""
    
    pm2 monit
}

# Función para limpiar logs y archivos temporales
cleanup_system() {
    print_status "Limpiando sistema..."
    
    # Limpiar logs antiguos de PM2
    pm2 flush
    
    # Limpiar logs del sistema
    sudo journalctl --vacuum-time=7d
    
    # Limpiar backups antiguos (más de 30 días)
    find /opt/nbteam/backups -name "*.db" -mtime +30 -delete 2>/dev/null || true
    find /opt/nbteam/backups -name "*.tar.gz" -mtime +30 -delete 2>/dev/null || true
    
    # Limpiar cache de npm
    npm cache clean --force 2>/dev/null || true
    
    print_success "✅ Limpieza completada"
}

# Función para verificar SSL
check_ssl() {
    print_status "Verificando estado de SSL..."
    
    if command -v certbot &> /dev/null; then
        print_status "=== CERTIFICADOS SSL ==="
        sudo certbot certificates
        
        echo ""
        print_status "=== VERIFICACIÓN DE RENOVACIÓN ==="
        sudo certbot renew --dry-run
        
        echo ""
        print_status "=== PRÓXIMAS RENOVACIONES ==="
        sudo certbot certificates | grep -A 2 "Expiry Date"
    else
        print_warning "Certbot no está instalado"
    fi
}

# Función para verificación completa de salud
health_check() {
    echo "🏥 VERIFICACIÓN COMPLETA DE SALUD - NBTeam IT Onboarding"
    echo "📅 Fecha: $(date)"
    echo ""
    
    # Verificar aplicación
    print_status "=== APLICACIÓN ==="
    if pm2 list | grep -q "nbteam-it-onboarding.*online"; then
        print_success "✅ Aplicación corriendo"
    else
        print_error "❌ Aplicación no está corriendo"
    fi
    
    # Verificar Nginx
    print_status "=== NGINX ==="
    if sudo systemctl is-active --quiet nginx; then
        print_success "✅ Nginx corriendo"
    else
        print_error "❌ Nginx no está corriendo"
    fi
    
    # Verificar conectividad
    print_status "=== CONECTIVIDAD ==="
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|302"; then
        print_success "✅ Puerto 3001 accesible"
    else
        print_error "❌ Puerto 3001 no accesible"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
        print_success "✅ Puerto 80 accesible"
    else
        print_error "❌ Puerto 80 no accesible"
    fi
    
    # Verificar base de datos
    print_status "=== BASE DE DATOS ==="
    if [ -f "/opt/nbteam/app/formularios.db" ]; then
        print_success "✅ Base de datos existe"
        DB_SIZE=$(du -h /opt/nbteam/app/formularios.db | cut -f1)
        print_status "Tamaño: $DB_SIZE"
    else
        print_error "❌ Base de datos no encontrada"
    fi
    
    # Verificar espacio en disco
    print_status "=== ESPACIO EN DISCO ==="
    DISK_USAGE=$(df -h /opt/nbteam | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $DISK_USAGE -lt 80 ]; then
        print_success "✅ Espacio en disco: ${DISK_USAGE}% usado"
    else
        print_warning "⚠️  Espacio en disco: ${DISK_USAGE}% usado"
    fi
    
    # Verificar memoria
    print_status "=== MEMORIA ==="
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ $MEMORY_USAGE -lt 80 ]; then
        print_success "✅ Memoria: ${MEMORY_USAGE}% usada"
    else
        print_warning "⚠️  Memoria: ${MEMORY_USAGE}% usada"
    fi
    
    echo ""
    print_status "=== RESUMEN ==="
    echo "• Aplicación: $(pm2 list | grep nbteam-it-onboarding | awk '{print $10}' || echo 'Desconocido')"
    echo "• Nginx: $(sudo systemctl is-active nginx)"
    echo "• SSL: $(sudo certbot certificates 2>/dev/null | grep -c "Certificate Name" || echo '0') certificados"
    echo "• Último backup: $(ls -t /opt/nbteam/backups/*.db 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo 'Ninguno')"
}

# Función principal
main() {
    case "${1:-help}" in
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "restart")
            restart_app
            ;;
        "backup")
            create_backup
            ;;
        "update")
            update_app
            ;;
        "monitor")
            monitor_app
            ;;
        "cleanup")
            cleanup_system
            ;;
        "ssl-check")
            check_ssl
            ;;
        "health")
            health_check
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal
main "$@"






