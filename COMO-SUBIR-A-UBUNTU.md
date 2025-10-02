# 🚀 **CÓMO SUBIR LA APLICACIÓN A UBUNTU - GUÍA RÁPIDA**

## 📋 **MÉTODO MÁS SIMPLE (Recomendado)**

### **Paso 1: Preparar el Servidor Ubuntu**
```bash
# Conectar al servidor:
ssh -i "tu-key.pem" ubuntu@TU-IP-PUBLICA

# Crear directorios:
sudo mkdir -p /opt/nbteam/app
sudo chown -R ubuntu:ubuntu /opt/nbteam
```

### **Paso 2: Subir Archivos desde Windows**
```powershell
# En PowerShell de Windows:
scp -i "C:\ruta\a\tu-key.pem" -r C:\Users\GiovanniRipoli\Cursor-Project\* ubuntu@TU-IP-PUBLICA:/opt/nbteam/app/
```

### **Paso 3: Instalar Dependencias**
```bash
# En el servidor Ubuntu:
cd /opt/nbteam/app
npm install
```

### **Paso 4: Ejecutar Aplicación**
```bash
# En el servidor Ubuntu:
node server.js
```

---

## 🔧 **USANDO LOS SCRIPTS AUTOMATIZADOS**

### **Opción A: Script PowerShell (Avanzado)**
```powershell
# Editar el archivo deploy-to-ubuntu.ps1 con tus datos:
# - SERVER_IP: Tu IP pública del servidor
# - KEY_PATH: Ruta a tu archivo .pem
# - APP_PATH: Ruta a tu proyecto (ya está configurada)

# Ejecutar:
.\deploy-to-ubuntu.ps1 -ServerIP "54.123.45.67" -KeyPath "C:\ruta\a\tu-key.pem"
```

### **Opción B: Script Batch (Simple)**
```batch
# Editar el archivo deploy-simple.bat:
# - Cambiar SERVER_IP por tu IP
# - Cambiar KEY_PATH por la ruta a tu .pem

# Ejecutar:
deploy-simple.bat
```

---

## 📁 **ARCHIVOS QUE NECESITAS SUBIR**

### **Archivos Esenciales:**
- ✅ `server.js` - Servidor principal
- ✅ `database.js` - Configuración de base de datos
- ✅ `package.json` - Dependencias
- ✅ `index.html` - Formulario principal
- ✅ `edit.html` - Formulario de edición
- ✅ `list.html` - Lista de formularios
- ✅ `login.html` - Página de login
- ✅ `dashboard.html` - Dashboard
- ✅ `users.html` - Gestión de usuarios
- ✅ `hardware-report.html` - Reporte de hardware
- ✅ `.env` - Variables de entorno (opcional)

### **Archivos Opcionales:**
- 📄 `logo.jpg` - Logo de la empresa
- 📄 `ecosystem.config.js` - Configuración PM2
- 📄 Scripts de instalación y mantenimiento

---

## 🌐 **CONFIGURACIÓN RÁPIDA EN EL SERVIDOR**

### **Después de subir los archivos:**

```bash
# 1. Instalar dependencias
cd /opt/nbteam/app
npm install

# 2. Configurar variables de entorno
nano .env
```

**Contenido del archivo .env:**
```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
SESSION_SECRET=tu-clave-secreta-muy-segura
```

```bash
# 3. Ejecutar aplicación
node server.js

# 4. O usar PM2 (recomendado para producción)
npm install -g pm2
pm2 start server.js --name "nbteam-onboarding"
pm2 startup
pm2 save
```

---

## 🔒 **CONFIGURAR NGINX (Proxy Reverso)**

```bash
# Instalar Nginx
sudo apt update
sudo apt install nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/nbteam
```

**Contenido de la configuración:**
```nginx
server {
    listen 80;
    server_name TU-DOMINIO.com www.TU-DOMINIO.com;

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
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/nbteam /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS COMUNES**

### **Error: "Permission denied"**
```bash
# Solución:
sudo chown -R ubuntu:ubuntu /opt/nbteam/app
chmod +x /opt/nbteam/app/*.sh
```

### **Error: "Cannot find module"**
```bash
# Solución:
cd /opt/nbteam/app
rm -rf node_modules
npm install
```

### **Error: "Port 3001 already in use"**
```bash
# Solución:
sudo lsof -i :3001
sudo kill -9 PID_DEL_PROCESO
```

### **Error: "Database locked"**
```bash
# Solución:
sudo chown ubuntu:ubuntu /opt/nbteam/app/formularios.db
chmod 664 /opt/nbteam/app/formularios.db
```

---

## 📊 **VERIFICACIÓN FINAL**

### **Comandos para verificar que todo funciona:**

```bash
# 1. Verificar que la aplicación está corriendo
ps aux | grep node

# 2. Verificar puerto
sudo netstat -tlnp | grep 3001

# 3. Verificar logs
pm2 logs nbteam-onboarding

# 4. Probar conectividad
curl -I http://localhost:3001
curl -I http://TU-IP-PUBLICA:3001
```

### **URLs de acceso:**
- **Local:** http://localhost:3001
- **Externo:** http://TU-IP-PUBLICA:3001
- **Con dominio:** http://TU-DOMINIO.com

---

## 🎯 **RESUMEN DE COMANDOS RÁPIDOS**

### **Desde Windows (PowerShell):**
```powershell
# Subir archivos
scp -i "tu-key.pem" -r C:\Users\GiovanniRipoli\Cursor-Project\* ubuntu@TU-IP:/opt/nbteam/app/

# Conectar al servidor
ssh -i "tu-key.pem" ubuntu@TU-IP
```

### **En el Servidor Ubuntu:**
```bash
# Instalar dependencias
cd /opt/nbteam/app && npm install

# Ejecutar aplicación
node server.js

# O con PM2
pm2 start server.js --name "nbteam-onboarding"
```

---

**¡Con estos pasos tendrás tu aplicación funcionando en Ubuntu en menos de 10 minutos!** 🚀






