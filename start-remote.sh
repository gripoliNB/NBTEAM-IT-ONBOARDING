#!/bin/bash
echo "========================================"
echo "   NBTeam IT Onboarding - Inicio Rapido"
echo "========================================"
echo

# Obtener IP del servidor
echo "Obteniendo IP del servidor..."
node get-ip.js
echo

# Iniciar servidor
echo "Iniciando servidor..."
echo
echo "Presiona Ctrl+C para detener el servidor"
echo
node server.js






