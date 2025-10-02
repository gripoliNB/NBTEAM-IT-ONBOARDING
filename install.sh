#!/bin/bash
echo "Instalando NBTeam IT Onboarding..."

# Instalar dependencias
npm install

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    cat > .env << EOF
PORT=3001
HOST=0.0.0.0
DB_PATH=./formularios.db
SESSION_SECRET=nbteam-it-onboarding-secret-key-2025
EOF
fi

# Configurar firewall (Linux)
if command -v ufw &> /dev/null; then
    sudo ufw allow 3001
fi

echo "Instalación completada!"
echo "Ejecutar: npm start"






