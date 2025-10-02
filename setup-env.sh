#!/bin/bash

# Setup de seguridad para NBTeam IT Onboarding
echo "🔐 Configurando variables de entorno de AWS SES..."

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# AWS SES Configuration
AWS_ACCESS_KEY_ID=tu-access-key-aqui
AWS_SECRET_ACCESS_KEY=tu-secret-key-aqui
AWS_REGION=us-east-1
FROM_EMAIL=noreply@nbteamconsulting.com

# Database Configuration
DB_PATH=./formularios.db

# Server Configuration
PORT=3001
SESSION_SECRET=tu-session-secret-aqui

# Email Configuration
DEV_MODE=false
EOF
    echo "✅ Archivo .env creado"
else
    echo "⚠️ Archivo .env ya existe"
fi

echo ""
echo "🔧 PASOS PARA CONFIGURAR CREDENCIALES:"
echo "1. Edita el archivo .env con tus credenciales AWS reales"
echo "2. Crea un usuario IAM en AWS con permisos SES"
echo "3. Verifica tu dominio en AWS SES"
echo "4. Solicita salida del Sandbox (opcional)"
echo ""
echo "📖 Para más información, consulta SECURITY-GUIDE.md"
