#!/bin/bash

# Script de inicio rápido para el Sistema de Onboarding IT
# Este script configura y ejecuta la aplicación completa

echo "🚀 Iniciando Sistema de Onboarding IT..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
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

# Verificar prerrequisitos
check_prerequisites() {
    print_status "Verificando prerrequisitos..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker no está instalado. Se ejecutará en modo desarrollo local"
        LOCAL_MODE=true
    else
        LOCAL_MODE=false
    fi
    
    print_success "Prerrequisitos verificados"
}

# Instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias del backend..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        print_error "Error instalando dependencias del backend"
        exit 1
    fi
    
    print_status "Instalando dependencias del frontend..."
    cd ../frontend
    npm install
    if [ $? -ne 0 ]; then
        print_error "Error instalando dependencias del frontend"
        exit 1
    fi
    
    cd ..
    print_success "Dependencias instaladas correctamente"
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    # Backend
    if [ ! -f backend/.env ]; then
        cp backend/env.example backend/.env
        print_status "Archivo .env creado para backend"
    fi
    
    # Frontend
    if [ ! -f frontend/.env ]; then
        cp frontend/env.example frontend/.env
        print_status "Archivo .env creado para frontend"
    fi
    
    print_success "Variables de entorno configuradas"
}

# Configurar base de datos
setup_database() {
    if [ "$LOCAL_MODE" = true ]; then
        print_warning "Modo local: Asegúrate de tener PostgreSQL ejecutándose"
        print_status "Ejecutando migraciones de Prisma..."
        cd backend
        npx prisma generate
        npx prisma db push
        if [ $? -ne 0 ]; then
            print_error "Error configurando base de datos"
            exit 1
        fi
        cd ..
    else
        print_status "Iniciando servicios con Docker Compose..."
        docker-compose up -d postgres
        sleep 10
        
        print_status "Ejecutando migraciones..."
        docker-compose exec -T backend npx prisma migrate deploy
        docker-compose exec -T backend npx prisma generate
    fi
    
    print_success "Base de datos configurada"
}

# Poblar con datos de ejemplo
seed_database() {
    print_status "Poblando base de datos con datos de ejemplo..."
    
    if [ "$LOCAL_MODE" = true ]; then
        cd backend
        npm run db:seed
        cd ..
    else
        docker-compose exec -T backend npm run db:seed
    fi
    
    print_success "Datos de ejemplo cargados"
}

# Ejecutar aplicación
run_application() {
    print_status "Iniciando aplicación..."
    
    if [ "$LOCAL_MODE" = true ]; then
        print_status "Modo desarrollo local"
        print_status "Ejecutando backend en puerto 3001..."
        cd backend && npm run dev &
        BACKEND_PID=$!
        
        sleep 5
        
        print_status "Ejecutando frontend en puerto 5173..."
        cd ../frontend && npm run dev &
        FRONTEND_PID=$!
        
        print_success "Aplicación iniciada en modo desarrollo"
        print_status "Frontend: http://localhost:5173"
        print_status "Backend API: http://localhost:3001/api"
        print_status "Health Check: http://localhost:3001/health"
        
        # Esperar a que el usuario presione Ctrl+C
        trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
        wait
    else
        print_status "Iniciando con Docker Compose..."
        docker-compose up
    fi
}

# Función principal
main() {
    echo "=========================================="
    echo "🚀 Sistema de Onboarding IT"
    echo "=========================================="
    
    check_prerequisites
    install_dependencies
    setup_environment
    setup_database
    seed_database
    run_application
}

# Ejecutar script
main "$@"






