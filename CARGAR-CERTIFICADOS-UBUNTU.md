# 🔒 **CÓMO CARGAR CERTIFICADOS SSL EN UBUNTU - GUÍA COMPLETA**

## 📋 **OPCIONES DE CERTIFICADOS SSL**

### **1. 🆓 Let's Encrypt (Recomendado - Gratuito)**
- ✅ **Gratuito** y renovación automática
- ✅ **Reconocido** por todos los navegadores
- ✅ **Fácil instalación** con Certbot
- ❌ **Válido por 90 días** (renovación automática)

### **2. 💰 Certificado Comercial (Comodo, DigiCert, etc.)**
- ✅ **Válido por 1-3 años**
- ✅ **Soporte técnico** incluido
- ✅ **Seguro** y confiable
- ❌ **Costo anual** ($50-500 USD)

### **3. 🔧 Certificado Auto-firmado (Solo pruebas)**
- ✅ **Gratuito** y rápido
- ✅ **Para desarrollo** local
- ❌ **Advertencias** en navegadores
- ❌ **No recomendado** para producción

---

## 🚀 **MÉTODO 1: LET'S ENCRYPT (Recomendado)**

### **Instalación Automática:**
```bash
# 1. Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. Obtener certificado automáticamente
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# 3. Verificar renovación automática
sudo certbot renew --dry-run
```

### **Ubicación de Archivos:**
```bash
/etc/letsencrypt/live/tu-dominio.com/
├── cert.pem          # Certificado público
├── chain.pem         # Cadena de certificados
├── fullchain.pem     # Certificado completo
└── privkey.pem       # Clave privada
```

### **Renovación Automática:**
```bash
# Programar renovación diaria
sudo crontab -e
# Agregar línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 💼 **MÉTODO 2: CERTIFICADO COMERCIAL**

### **Paso 1: Preparar Directorios**
```bash
# Crear directorios para certificados
sudo mkdir -p /etc/ssl/certs/tu-dominio
sudo mkdir -p /etc/ssl/private/tu-dominio
```

### **Paso 2: Subir Archivos desde Windows**
```powershell
# En PowerShell de Windows:
scp -i "tu-key.pem" certificado.crt ubuntu@TU-IP:/home/ubuntu/
scp -i "tu-key.pem" clave-privada.key ubuntu@TU-IP:/home/ubuntu/
scp -i "tu-key.pem" certificado-intermedio.crt ubuntu@TU-IP:/home/ubuntu/
```

### **Paso 3: Instalar Certificados en Ubuntu**
```bash
# En el servidor Ubuntu:

# Mover certificado público
sudo mv certificado.crt /etc/ssl/certs/tu-dominio/cert.pem

# Mover clave privada
sudo mv clave-privada.key /etc/ssl/private/tu-dominio/privkey.pem

# Mover certificado intermedio (si existe)
sudo mv certificado-intermedio.crt /etc/ssl/certs/tu-dominio/chain.pem

# Configurar permisos
sudo chmod 644 /etc/ssl/certs/tu-dominio/*
sudo chmod 600 /etc/ssl/private/tu-dominio/*
sudo chown root:root /etc/ssl/certs/tu-dominio/*
sudo chown root:root /etc/ssl/private/tu-dominio/*
```

### **Paso 4: Configurar Nginx**
```bash
# Crear configuración SSL
sudo nano /etc/nginx/sites-available/tu-dominio-ssl
```

**Contenido de la configuración:**
```nginx
# Redirección HTTP a HTTPS
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # Certificados SSL comerciales
    ssl_certificate /etc/ssl/certs/tu-dominio/cert.pem;
    ssl_certificate_key /etc/ssl/private/tu-dominio/privkey.pem;
    
    # Si tienes certificado intermedio, descomenta la siguiente línea:
    # ssl_trusted_certificate /etc/ssl/certs/tu-dominio/chain.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Configuración de logs
    access_log /var/log/nginx/tu-dominio-access.log;
    error_log /var/log/nginx/tu-dominio-error.log;

    # Proxy a la aplicación Node.js
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
```

### **Paso 5: Habilitar Configuración**
```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/tu-dominio-ssl /etc/nginx/sites-enabled/

# Eliminar sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## 🔧 **MÉTODO 3: CERTIFICADO AUTO-FIRMADO (Solo pruebas)**

### **Generar Certificado Auto-firmado:**
```bash
# Crear directorios
sudo mkdir -p /etc/ssl/certs/localhost
sudo mkdir -p /etc/ssl/private/localhost

# Generar clave privada
sudo openssl genrsa -out /etc/ssl/private/localhost/privkey.pem 2048

# Generar certificado
sudo openssl req -new -x509 -key /etc/ssl/private/localhost/privkey.pem \
  -out /etc/ssl/certs/localhost/cert.pem -days 365 \
  -subj "/C=MX/ST=Estado/L=Ciudad/O=NBTeam/CN=localhost"

# Configurar permisos
sudo chmod 600 /etc/ssl/private/localhost/privkey.pem
sudo chmod 644 /etc/ssl/certs/localhost/cert.pem
sudo chown root:root /etc/ssl/certs/localhost/*
sudo chown root:root /etc/ssl/private/localhost/*
```

---

## 🛠️ **USANDO EL SCRIPT AUTOMATIZADO**

### **Script Creado: `configure-ssl-ubuntu.sh`**

#### **Para Let's Encrypt:**
```bash
# Hacer ejecutable
chmod +x configure-ssl-ubuntu.sh

# Configurar SSL automáticamente
./configure-ssl-ubuntu.sh letsencrypt tu-dominio.com
```

#### **Para Certificado Comercial:**
```bash
# El script te guiará paso a paso
./configure-ssl-ubuntu.sh commercial tu-dominio.com
```

#### **Para Certificado Auto-firmado:**
```bash
# Generar certificado para pruebas
./configure-ssl-ubuntu.sh selfsigned localhost
```

#### **Verificar Estado:**
```bash
# Verificar certificados existentes
./configure-ssl-ubuntu.sh check

# Renovar certificados Let's Encrypt
./configure-ssl-ubuntu.sh renew
```

---

## 🔍 **VERIFICACIÓN Y PRUEBAS**

### **Comandos de Verificación:**
```bash
# Verificar certificados Let's Encrypt
sudo certbot certificates

# Verificar configuración de Nginx
sudo nginx -t

# Verificar estado de Nginx
sudo systemctl status nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### **Pruebas de Conectividad:**
```bash
# Probar HTTP (debe redirigir a HTTPS)
curl -I http://tu-dominio.com

# Probar HTTPS
curl -I https://tu-dominio.com

# Verificar certificado SSL
openssl s_client -connect tu-dominio.com:443 -servername tu-dominio.com
```

### **URLs de Acceso:**
- **HTTP:** http://tu-dominio.com (redirige a HTTPS)
- **HTTPS:** https://tu-dominio.com
- **HTTPS (www):** https://www.tu-dominio.com

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Error: "SSL certificate problem"**
```bash
# Verificar que los archivos existen
ls -la /etc/ssl/certs/tu-dominio/
ls -la /etc/ssl/private/tu-dominio/

# Verificar permisos
sudo chmod 644 /etc/ssl/certs/tu-dominio/*
sudo chmod 600 /etc/ssl/private/tu-dominio/*
```

### **Error: "Permission denied"**
```bash
# Configurar permisos correctos
sudo chown root:root /etc/ssl/certs/tu-dominio/*
sudo chown root:root /etc/ssl/private/tu-dominio/*
```

### **Error: "Certificate not trusted"**
```bash
# Para certificados comerciales, verificar cadena completa
# Asegúrate de incluir el certificado intermedio
```

### **Error: "Nginx configuration test failed"**
```bash
# Verificar sintaxis
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 **INFORMACIÓN DE CERTIFICADOS**

### **Ubicaciones Comunes:**
```bash
# Let's Encrypt
/etc/letsencrypt/live/tu-dominio.com/

# Certificados comerciales
/etc/ssl/certs/tu-dominio/
/etc/ssl/private/tu-dominio/

# Certificados del sistema
/etc/ssl/certs/
/etc/ssl/private/
```

### **Comandos Útiles:**
```bash
# Ver información del certificado
openssl x509 -in /etc/ssl/certs/tu-dominio/cert.pem -text -noout

# Verificar fecha de expiración
openssl x509 -in /etc/ssl/certs/tu-dominio/cert.pem -dates -noout

# Verificar clave privada
openssl rsa -in /etc/ssl/private/tu-dominio/privkey.pem -check
```

---

## 🎯 **RESUMEN DE COMANDOS RÁPIDOS**

### **Let's Encrypt (Recomendado):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### **Certificado Comercial:**
```bash
sudo mkdir -p /etc/ssl/certs/tu-dominio /etc/ssl/private/tu-dominio
# Subir archivos con SCP
sudo mv certificado.crt /etc/ssl/certs/tu-dominio/cert.pem
sudo mv clave.key /etc/ssl/private/tu-dominio/privkey.pem
sudo chmod 644 /etc/ssl/certs/tu-dominio/*
sudo chmod 600 /etc/ssl/private/tu-dominio/*
```

### **Verificar SSL:**
```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://tu-dominio.com
```

---

**¡Con estos métodos tendrás SSL funcionando en tu servidor Ubuntu en minutos!** 🔒🚀






