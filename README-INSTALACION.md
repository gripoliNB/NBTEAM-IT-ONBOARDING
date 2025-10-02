# 🚀 **NBTeam IT Onboarding - Instalación Rápida**

## ⚡ **Instalación en 3 Pasos**

### **Paso 1: Instalar**
```bash
# Windows
install.bat

# Linux/macOS
chmod +x install.sh
./install.sh
```

### **Paso 2: Iniciar**
```bash
# Windows
start-remote.bat

# Linux/macOS
chmod +x start-remote.sh
./start-remote.sh
```

### **Paso 3: Acceder**
- **Local:** http://localhost:3001
- **Red:** http://192.168.1.150:3001 (tu IP será diferente)

---

## 🌐 **Acceso desde Otros Dispositivos**

### **En la misma red WiFi:**
1. **Ejecutar** `start-remote.bat` o `start-remote.sh`
2. **Copiar la IP** que aparece en pantalla
3. **Acceder desde cualquier dispositivo:** `http://[IP]:3001`

### **Ejemplo:**
```
🌐 IP del servidor: 192.168.1.150
🔗 URL de acceso: http://192.168.1.150:3001
📱 Acceso desde móviles: http://192.168.1.150:3001
💻 Acceso desde otros PCs: http://192.168.1.150:3001
```

---

## 🔧 **Configuración Avanzada**

### **Cambiar Puerto:**
```bash
# Crear archivo .env
echo PORT=8080 > .env
echo HOST=0.0.0.0 >> .env
```

### **Configurar Firewall:**
```bash
# Windows
netsh advfirewall firewall add rule name="NBTeam IT Onboarding" dir=in action=allow protocol=TCP localport=3001

# Linux
sudo ufw allow 3001
```

---

## 🐳 **Instalación con Docker**

### **Instalación Rápida:**
```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

---

## ☁️ **Despliegue en la Nube**

### **Heroku (Gratis):**
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login y crear app
heroku login
heroku create nbteam-it-onboarding

# Desplegar
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### **Railway (Gratis):**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y desplegar
railway login
railway init
railway up
```

---

## 📱 **Acceso Móvil**

### **El sistema es completamente responsive:**
- ✅ **Funciona en móviles** - iPhone, Android
- ✅ **Funciona en tablets** - iPad, Android tablets
- ✅ **Funciona en PCs** - Windows, Mac, Linux
- ✅ **Funciona en navegadores** - Chrome, Firefox, Safari, Edge

---

## 🔒 **Usuarios por Defecto**

### **Credenciales de Acceso:**
```
Usuario: admin
Contraseña: admin123
Rol: Administrador

Usuario: hr
Contraseña: hr123
Rol: Recursos Humanos

Usuario: it
Contraseña: it123
Rol: IT
```

---

## 🆘 **Solución de Problemas**

### **Puerto ocupado:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# Linux/macOS
lsof -ti:3001 | xargs kill -9
```

### **No se puede acceder desde otros dispositivos:**
1. **Verificar firewall** - Permitir puerto 3001
2. **Verificar IP** - Ejecutar `node get-ip.js`
3. **Verificar red** - Mismo WiFi/LAN

### **Base de datos corrupta:**
```bash
# Eliminar y recrear
rm formularios.db
node server.js
```

---

## 📞 **Soporte**

### **Archivos de Configuración:**
- `INSTALACION-REMOTA.md` - Guía completa
- `env.example` - Variables de entorno
- `docker-compose.yml` - Configuración Docker
- `Dockerfile` - Imagen Docker

### **Scripts de Instalación:**
- `install.bat` / `install.sh` - Instalación automática
- `start-remote.bat` / `start-remote.sh` - Inicio con IP
- `get-ip.js` - Obtener IP del servidor

---

**¡Sistema listo para acceso remoto!** 🚀






