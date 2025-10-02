# 🚀 **DESPLIEGUE EN AWS UBUNTU - NBTeam IT Onboarding**

## 📋 **Resumen de Archivos Creados**

### **📖 Documentación:**
- `GUIA-DESPLIEGUE-AWS.md` - Guía completa paso a paso
- `README-DESPLIEGUE.md` - Este archivo con resumen

### **🔧 Scripts de Automatización:**
- `install-nbteam.sh` - Instalación base del sistema
- `deploy-nbteam.sh` - Despliegue de la aplicación
- `configure-ssl.sh` - Configuración de SSL con Let's Encrypt
- `maintenance-nbteam.sh` - Herramientas de mantenimiento

---

## 🎯 **PROCESO DE DESPLIEGUE RÁPIDO**

### **Paso 1: Preparar Servidor AWS**
```bash
# 1. Crear instancia EC2 Ubuntu 22.04 LTS
# 2. Configurar Security Groups (SSH, HTTP, HTTPS)
# 3. Conectar via SSH:
ssh -i "tu-key.pem" ubuntu@TU-IP-PUBLICA
```

### **Paso 2: Instalación Base**
```bash
# Subir script de instalación
scp -i "tu-key.pem" install-nbteam.sh ubuntu@TU-IP:/home/ubuntu/

# En el servidor:
chmod +x install-nbteam.sh
./install-nbteam.sh
```

### **Paso 3: Subir Aplicación**
```bash
# Desde tu máquina local:
rsync -avz -e "ssh -i tu-key.pem" \
  --exclude 'node_modules' \
  --exclude '.git' \
  C:\Users\GiovanniRipoli\Cursor-Project\ \
  ubuntu@TU-IP:/opt/nbteam/app/
```

### **Paso 4: Desplegar Aplicación**
```bash
# Subir script de despliegue
scp -i "tu-key.pem" deploy-nbteam.sh ubuntu@TU-IP:/home/ubuntu/

# En el servidor:
chmod +x deploy-nbteam.sh
./deploy-nbteam.sh
```

### **Paso 5: Configurar SSL (Opcional)**
```bash
# Subir script de SSL
scp -i "tu-key.pem" configure-ssl.sh ubuntu@TU-IP:/home/ubuntu/

# En el servidor:
chmod +x configure-ssl.sh
./configure-ssl.sh tu-dominio.com
```

---

## 🔧 **COMANDOS DE ADMINISTRACIÓN**

### **Script de Mantenimiento:**
```bash
# Subir script de mantenimiento
scp -i "tu-key.pem" maintenance-nbteam.sh ubuntu@TU-IP:/home/ubuntu/

# En el servidor:
chmod +x maintenance-nbteam.sh

# Comandos disponibles:
./maintenance-nbteam.sh status      # Estado del sistema
./maintenance-nbteam.sh logs         # Ver logs
./maintenance-nbteam.sh restart      # Reiniciar app
./maintenance-nbteam.sh backup       # Backup manual
./maintenance-nbteam.sh health       # Verificación completa
./maintenance-nbteam.sh ssl-check    # Estado SSL
./maintenance-nbteam.sh cleanup      # Limpiar sistema
```

### **Comandos PM2 Directos:**
```bash
pm2 status                           # Estado de aplicaciones
pm2 logs nbteam-it-onboarding        # Ver logs
pm2 restart nbteam-it-onboarding    # Reiniciar aplicación
pm2 stop nbteam-it-onboarding       # Detener aplicación
pm2 monit                           # Monitoreo en tiempo real
```

### **Comandos del Sistema:**
```bash
sudo systemctl status nginx         # Estado de Nginx
sudo systemctl restart nginx        # Reiniciar Nginx
sudo nginx -t                       # Verificar configuración
sudo ufw status                      # Estado del firewall
```

---

## 📊 **ESTRUCTURA DEL SISTEMA DESPLEGADO**

```
/opt/nbteam/
├── app/                           # Aplicación principal
│   ├── server.js                  # Servidor Node.js
│   ├── database.js                # Configuración BD
│   ├── package.json               # Dependencias
│   ├── formularios.db             # Base de datos SQLite
│   ├── *.html                     # Archivos de interfaz
│   ├── .env                       # Variables de entorno
│   └── ecosystem.config.js        # Configuración PM2
├── logs/                          # Logs de la aplicación
│   ├── err.log                    # Errores
│   ├── out.log                    # Salida
│   └── combined.log               # Combinado
└── backups/                       # Backups automáticos
    ├── formularios_YYYYMMDD.db    # Backup BD
    └── config_YYYYMMDD.tar.gz    # Backup configuración
```

---

## 🌐 **CONFIGURACIÓN DE ACCESO**

### **URLs de Acceso:**
- **Local:** http://localhost
- **IP Pública:** http://TU-IP-PUBLICA
- **Dominio:** http://tu-dominio.com
- **HTTPS:** https://tu-dominio.com (si configurado SSL)

### **Puertos:**
- **80:** HTTP (Nginx)
- **443:** HTTPS (Nginx + SSL)
- **3001:** Aplicación Node.js (solo local)

---

## 🔒 **CONFIGURACIÓN DE SEGURIDAD**

### **Firewall (UFW):**
```bash
sudo ufw allow ssh                  # SSH
sudo ufw allow 80                  # HTTP
sudo ufw allow 443                 # HTTPS
sudo ufw deny 3001                 # Bloquear acceso directo
sudo ufw enable                    # Activar firewall
```

### **SSL/TLS:**
- Certificados Let's Encrypt
- Renovación automática
- Redirección HTTP → HTTPS
- Headers de seguridad

### **Usuarios:**
- Usuario `nbteam` para la aplicación
- Permisos mínimos necesarios
- Acceso SSH solo con key pairs

---

## 📈 **MONITOREO Y MANTENIMIENTO**

### **Backups Automáticos:**
- **Frecuencia:** Diario a las 2:00 AM
- **Retención:** 7 días
- **Ubicación:** `/opt/nbteam/backups/`
- **Contenido:** BD + configuración

### **Logs:**
- **Aplicación:** `/opt/nbteam/logs/`
- **Nginx:** `/var/log/nginx/`
- **Sistema:** `journalctl`

### **Renovación SSL:**
- **Frecuencia:** Automática
- **Verificación:** `sudo certbot renew --dry-run`

---

## 🚨 **RESOLUCIÓN DE PROBLEMAS**

### **Aplicación no inicia:**
```bash
pm2 logs nbteam-it-onboarding --lines 50
sudo journalctl -u pm2-ubuntu --lines 20
```

### **Nginx no funciona:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
sudo systemctl restart nginx
```

### **SSL no funciona:**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### **Base de datos corrupta:**
```bash
# Restaurar desde backup
sudo cp /opt/nbteam/backups/formularios_YYYYMMDD.db /opt/nbteam/app/formularios.db
sudo chown nbteam:nbteam /opt/nbteam/app/formularios.db
pm2 restart nbteam-it-onboarding
```

---

## 📞 **SOPORTE Y CONTACTO**

### **Información del Sistema:**
- **Ubicación:** `/opt/nbteam/app/`
- **Usuario:** `nbteam`
- **Servicio:** PM2 + Nginx
- **Base de datos:** SQLite

### **Comandos de Diagnóstico:**
```bash
# Estado general
./maintenance-nbteam.sh health

# Verificar conectividad
curl -I http://localhost:3001
curl -I http://tu-dominio.com

# Verificar recursos
htop
df -h
free -h
```

---

## 🎉 **¡DESPLIEGUE COMPLETADO!**

Una vez completados todos los pasos, tu aplicación NBTeam IT Onboarding estará:

✅ **Ejecutándose** en un servidor Ubuntu en AWS  
✅ **Accesible** desde internet via HTTP/HTTPS  
✅ **Protegida** con SSL y firewall  
✅ **Monitoreada** con PM2 y logs  
✅ **Respaldada** con backups automáticos  
✅ **Mantenida** con scripts de administración  

### **URLs Finales:**
- **Producción:** https://tu-dominio.com
- **Admin:** https://tu-dominio.com/users.html
- **Reportes:** https://tu-dominio.com/hardware-report.html

---

**¡Tu sistema de onboarding IT está listo para producción!** 🚀

---
**Actualizado**: 17 de Septiembre de 2025  
**Sistema**: NBTeam IT Onboarding  
**Versión**: 1.0.0  
**Estado**: ✅ GUÍA DE DESPLIEGUE COMPLETA






