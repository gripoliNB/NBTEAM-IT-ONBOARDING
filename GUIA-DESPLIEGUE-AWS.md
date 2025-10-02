# 🚀 **GUÍA COMPLETA DE DESPLIEGUE EN AWS UBUNTU**

## 📋 **Tabla de Contenidos**
1. [Preparación del Servidor AWS](#1-preparación-del-servidor-aws)
2. [Configuración Inicial del Servidor](#2-configuración-inicial-del-servidor)
3. [Instalación de Dependencias](#3-instalación-de-dependencias)
4. [Despliegue de la Aplicación](#4-despliegue-de-la-aplicación)
5. [Configuración de Seguridad](#5-configuración-de-seguridad)
6. [Configuración de Dominio (Opcional)](#6-configuración-de-dominio-opcional)
7. [Monitoreo y Mantenimiento](#7-monitoreo-y-mantenimiento)
8. [Resolución de Problemas](#8-resolución-de-problemas)

---

## 1. **PREPARACIÓN DEL SERVIDOR AWS**

### **1.1 Crear Instancia EC2**
```bash
# En la consola de AWS:
1. Ir a EC2 → Instances → Launch Instance
2. Seleccionar: Ubuntu Server 22.04 LTS (Free tier eligible)
3. Tipo de instancia: t2.micro (gratis) o t3.small (recomendado)
4. Configurar Security Group:
   - SSH (22): Tu IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Custom (3001): 0.0.0.0/0 (temporal)
5. Crear o seleccionar Key Pair (.pem)
6. Launch Instance
```

### **1.2 Conectar al Servidor**
```bash
# Desde tu máquina local:
ssh -i "tu-key.pem" ubuntu@TU-IP-PUBLICA

# Ejemplo:
ssh -i "nbteam-key.pem" ubuntu@54.123.45.67
```

---

## 2. **CONFIGURACIÓN INICIAL DEL SERVIDOR**

### **2.1 Actualizar Sistema**
```bash
# Conectado al servidor Ubuntu:
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

### **2.2 Configurar Usuario y Permisos**
```bash
# Crear usuario para la aplicación
sudo adduser --system --group --home /opt/nbteam nbteam
sudo usermod -aG sudo nbteam

# Cambiar al usuario de la aplicación
sudo su - nbteam
```

### **2.3 Configurar Firewall**
```bash
# Configurar UFW (Uncomplicated Firewall)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001  # Temporal para pruebas
sudo ufw --force enable

# Verificar estado
sudo ufw status
```

---

## 3. **INSTALACIÓN DE DEPENDENCIAS**

### **3.1 Instalar Node.js**
```bash
# Instalar Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v18.x.x
npm --version   # Debe mostrar 9.x.x
```

### **3.2 Instalar PM2 (Process Manager)**
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar con el sistema
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### **3.3 Instalar Nginx (Proxy Reverso)**
```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar estado
sudo systemctl status nginx
```

---

## 4. **DESPLIEGUE DE LA APLICACIÓN**

### **4.1 Preparar Archivos de la Aplicación**
```bash
# Crear directorio de la aplicación
sudo mkdir -p /opt/nbteam/app
sudo chown -R nbteam:nbteam /opt/nbteam

# Cambiar al directorio
cd /opt/nbteam/app
```

### **4.2 Subir Archivos (Opción 1: SCP)**
```bash
# Desde tu máquina local, subir archivos:
scp -i "tu-key.pem" -r C:\Users\GiovanniRipoli\Cursor-Project\* ubuntu@TU-IP:/opt/nbteam/app/

# O usar rsync para sincronización:
rsync -avz -e "ssh -i tu-key.pem" C:\Users\GiovanniRipoli\Cursor-Project\ ubuntu@TU-IP:/opt/nbteam/app/
```

### **4.3 Subir Archivos (Opción 2: Git)**
```bash
# En el servidor, clonar desde repositorio:
cd /opt/nbteam/app
git clone https://github.com/tu-usuario/nbteam-it-onboarding.git .
# O crear repositorio y subir archivos manualmente
```

### **4.4 Instalar Dependencias**
```bash
# En el servidor:
cd /opt/nbteam/app
npm install

# Verificar que se instalaron correctamente
ls node_modules
```

### **4.5 Configurar Variables de Entorno**
```bash
# Crear archivo .env
nano .env
```

**Contenido del archivo .env:**
```env
# Configuración del servidor
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# Configuración de base de datos
DB_PATH=/opt/nbteam/app/formularios.db

# Configuración de sesiones
SESSION_SECRET=tu-clave-secreta-muy-segura-aqui-2025

# Configuración de dominio (opcional)
DOMAIN=tu-dominio.com
```

### **4.6 Configurar PM2**
```bash
# Crear archivo de configuración PM2
nano ecosystem.config.js
```

**Contenido de ecosystem.config.js:**
```javascript
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
    time: true
  }]
};
```

### **4.7 Crear Directorio de Logs**
```bash
sudo mkdir -p /opt/nbteam/logs
sudo chown -R nbteam:nbteam /opt/nbteam/logs
```

### **4.8 Iniciar Aplicación con PM2**
```bash
# Iniciar aplicación
pm2 start ecosystem.config.js

# Verificar estado
pm2 status
pm2 logs nbteam-it-onboarding

# Guardar configuración PM2
pm2 save
```

---

## 5. **CONFIGURACIÓN DE SEGURIDAD**

### **5.1 Configurar Nginx como Proxy Reverso**
```bash
# Crear configuración de sitio
sudo nano /etc/nginx/sites-available/nbteam-it-onboarding
```

**Contenido del archivo:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;  # Cambiar por tu dominio

    # Redirección a HTTPS (después de configurar SSL)
    # return 301 https://$server_name$request_uri;

    # Configuración temporal para HTTP
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuración de archivos estáticos
    location /static/ {
        alias /opt/nbteam/app/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **5.2 Habilitar Sitio en Nginx**
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/nbteam-it-onboarding /etc/nginx/sites-enabled/

# Eliminar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### **5.3 Configurar SSL con Let's Encrypt (Opcional)**
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### **5.4 Configurar Firewall Final**
```bash
# Remover acceso directo al puerto 3001
sudo ufw delete allow 3001

# Verificar configuración final
sudo ufw status
```

---

## 6. **CONFIGURACIÓN DE DOMINIO (OPCIONAL)**

### **6.1 Configurar DNS**
```bash
# En tu proveedor de DNS (Cloudflare, Route53, etc.):
# Crear registros A:
# tu-dominio.com → IP-PUBLICA-DEL-SERVIDOR
# www.tu-dominio.com → IP-PUBLICA-DEL-SERVIDOR
```

### **6.2 Verificar Configuración**
```bash
# Verificar resolución DNS
nslookup tu-dominio.com
dig tu-dominio.com
```

---

## 7. **MONITOREO Y MANTENIMIENTO**

### **7.1 Comandos PM2 Útiles**
```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs nbteam-it-onboarding

# Reiniciar aplicación
pm2 restart nbteam-it-onboarding

# Detener aplicación
pm2 stop nbteam-it-onboarding

# Eliminar aplicación de PM2
pm2 delete nbteam-it-onboarding

# Monitoreo en tiempo real
pm2 monit
```

### **7.2 Comandos del Sistema**
```bash
# Ver uso de recursos
htop
df -h
free -h

# Ver logs del sistema
sudo journalctl -u nginx
sudo journalctl -u pm2-ubuntu

# Verificar puertos en uso
sudo netstat -tlnp
sudo ss -tlnp
```

### **7.3 Backup de Base de Datos**
```bash
# Crear script de backup
nano /opt/nbteam/backup.sh
```

**Contenido del script de backup:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/nbteam/backups"
APP_DIR="/opt/nbteam/app"

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Backup de base de datos
cp $APP_DIR/formularios.db $BACKUP_DIR/formularios_$DATE.db

# Backup de archivos de configuración
tar -czf $BACKUP_DIR/config_$DATE.tar.gz $APP_DIR/.env $APP_DIR/ecosystem.config.js

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Hacer ejecutable
chmod +x /opt/nbteam/backup.sh

# Programar backup diario
crontab -e
# Agregar línea:
# 0 2 * * * /opt/nbteam/backup.sh
```

---

## 8. **RESOLUCIÓN DE PROBLEMAS**

### **8.1 Problemas Comunes**

#### **Aplicación no inicia:**
```bash
# Verificar logs
pm2 logs nbteam-it-onboarding
sudo journalctl -u pm2-ubuntu

# Verificar puerto
sudo netstat -tlnp | grep 3001

# Verificar permisos
ls -la /opt/nbteam/app/
```

#### **Nginx no funciona:**
```bash
# Verificar configuración
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### **Base de datos no se crea:**
```bash
# Verificar permisos
sudo chown -R nbteam:nbteam /opt/nbteam/app/

# Verificar espacio en disco
df -h

# Verificar logs de la aplicación
pm2 logs nbteam-it-onboarding
```

### **8.2 Comandos de Diagnóstico**
```bash
# Estado general del sistema
sudo systemctl status nginx pm2-ubuntu

# Verificar conectividad
curl -I http://localhost:3001
curl -I http://tu-dominio.com

# Verificar procesos
ps aux | grep node
ps aux | grep nginx

# Verificar memoria
free -h
top
```

---

## 🎯 **CHECKLIST DE DESPLIEGUE**

### **✅ Preparación:**
- [ ] Instancia EC2 creada y configurada
- [ ] Security Groups configurados
- [ ] Key Pair descargado
- [ ] Conexión SSH establecida

### **✅ Configuración del Servidor:**
- [ ] Sistema actualizado
- [ ] Usuario de aplicación creado
- [ ] Firewall configurado
- [ ] Node.js instalado
- [ ] PM2 instalado y configurado
- [ ] Nginx instalado

### **✅ Despliegue de Aplicación:**
- [ ] Archivos subidos al servidor
- [ ] Dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] PM2 configurado
- [ ] Aplicación iniciada con PM2

### **✅ Configuración de Seguridad:**
- [ ] Nginx configurado como proxy
- [ ] SSL configurado (opcional)
- [ ] Firewall final configurado
- [ ] Acceso directo al puerto 3001 bloqueado

### **✅ Verificación Final:**
- [ ] Aplicación accesible vía HTTP/HTTPS
- [ ] Formularios funcionando
- [ ] Base de datos funcionando
- [ ] Reportes funcionando
- [ ] Backup configurado

---

## 🚀 **COMANDOS RÁPIDOS DE DESPLIEGUE**

### **Script de Instalación Automática:**
```bash
# Crear script de instalación
nano install-nbteam.sh
```

**Contenido del script:**
```bash
#!/bin/bash
set -e

echo "🚀 Instalando NBTeam IT Onboarding..."

# Actualizar sistema
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip nginx

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Crear usuario
sudo adduser --system --group --home /opt/nbteam nbteam || true
sudo mkdir -p /opt/nbteam/app
sudo chown -R nbteam:nbteam /opt/nbteam

# Configurar firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Configurar PM2
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "✅ Instalación base completada"
echo "📝 Siguiente paso: Subir archivos de la aplicación"
```

```bash
# Hacer ejecutable y ejecutar
chmod +x install-nbteam.sh
./install-nbteam.sh
```

---

## 📞 **SOPORTE Y CONTACTO**

### **En caso de problemas:**
1. **Verificar logs:** `pm2 logs nbteam-it-onboarding`
2. **Verificar estado:** `pm2 status`
3. **Verificar Nginx:** `sudo systemctl status nginx`
4. **Verificar conectividad:** `curl -I http://localhost:3001`

### **Información del Sistema:**
- **Ubicación de la aplicación:** `/opt/nbteam/app/`
- **Logs de la aplicación:** `/opt/nbteam/logs/`
- **Configuración Nginx:** `/etc/nginx/sites-available/nbteam-it-onboarding`
- **Configuración PM2:** `/opt/nbteam/app/ecosystem.config.js`

---

**¡Despliegue completado exitosamente!** 🎉

Tu aplicación NBTeam IT Onboarding estará disponible en:
- **HTTP:** http://tu-dominio.com
- **HTTPS:** https://tu-dominio.com (si configuraste SSL)

---
**Actualizado**: 17 de Septiembre de 2025  
**Sistema**: NBTeam IT Onboarding  
**Versión**: 1.0.0  
**Estado**: ✅ GUÍA DE DESPLIEGUE COMPLETA






