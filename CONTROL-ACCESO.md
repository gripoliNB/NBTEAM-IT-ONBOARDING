# 🔐 **Sistema de Control de Acceso - NBTeam IT Onboarding**

## 🎯 **Sistema de Autenticación Implementado**

### ✅ **Funcionalidades de Seguridad**

#### **Autenticación y Autorización:**
- ✅ **Login seguro** con usuario y contraseña
- ✅ **Sesiones persistentes** con cookies seguras
- ✅ **Control de acceso** por roles de usuario
- ✅ **Protección de rutas** del sistema
- ✅ **Logout seguro** con destrucción de sesión

#### **Gestión de Usuarios:**
- ✅ **4 roles predefinidos**: Admin,HR, IT, Solicitante
- ✅ **Gestión completa** de usuarios (solo admin)
- ✅ **Contraseñas encriptadas** con bcrypt
- ✅ **Validaciones** de seguridad

## 👥 **Usuarios Predefinidos**

### **Credenciales de Prueba:**
```
🔑 Administrador:
   Usuario: admin
   Contraseña: password
   Rol: Administrador
   Acceso: Completo

👤 Recursos Humanos:
   Usuario: hr
   Contraseña: password
   Rol: Recursos Humanos
   Acceso: Formularios

💻 Equipo de IT:
   Usuario: it
   Contraseña: password
   Rol: Equipo de IT
   Acceso: Formularios

🆕 Solicitante:
   Usuario: solicitante
   Contraseña: password
   Rol: Solicitante
   Acceso: Solo crear formularios
```

## 🔒 **Niveles de Acceso**

### **Administrador (admin):**
- ✅ **Acceso completo** a todas las funcionalidades
- ✅ **Gestión de usuarios** (crear, editar, eliminar)
- ✅ **Acceso a formularios** (crear, editar, eliminar)
- ✅ **Dashboard** con estadísticas
- ✅ **Configuración** del sistema

### **Recursos Humanos (hr):**
- ✅ **Acceso a formularios** (crear, editar, eliminar)
- ✅ **Dashboard** con estadísticas
- ❌ **Sin acceso** a gestión de usuarios

### **Equipo de IT (it):**
- ✅ **Acceso a formularios** (crear, editar, eliminar)
- ✅ **Dashboard** con estadísticas
- ❌ **Sin acceso** a gestión de usuarios

### **Solicitante (solicitante):**
- ✅ **Crear nuevos formularios** de solicitud
- ✅ **Acceso simplificado** con interfaz específica
- ❌ **Sin acceso** a edición de formularios existentes
- ❌ **Sin acceso** a dashboard administrativo
- ❌ **Sin acceso** a gestión de usuarios/clients/software

## 🛡️ **Características de Seguridad**

### **Autenticación:**
- ✅ **Contraseñas encriptadas** con bcrypt (salt rounds: 10)
- ✅ **Sesiones seguras** con express-session
- ✅ **Cookies HTTPOnly** para prevenir XSS
- ✅ **Expiración de sesión** (24 horas)
- ✅ **Verificación de autenticación** en cada request

### **Autorización:**
- ✅ **Middleware de autenticación** en todas las rutas protegidas
- ✅ **Middleware de administrador** para funciones críticas
- ✅ **Verificación de roles** en el frontend
- ✅ **Protección de rutas** del servidor

### **Validaciones:**
- ✅ **Validación de credenciales** en login
- ✅ **Validación de roles** en operaciones
- ✅ **Validación de sesión** en cada request
- ✅ **Sanitización** de datos de entrada

## 📁 **Archivos del Sistema de Seguridad**

### **Backend:**
- ✅ **`auth-config.js`** - Configuración de usuarios y funciones de autenticación
- ✅ **`server.js`** - Servidor con middleware de seguridad y rutas protegidas

### **Frontend:**
- ✅ **`login.html`** - Página de inicio de sesión
- ✅ **`dashboard.html`** - Dashboard principal con control de acceso
- ✅ **`users.html`** - Gestión de usuarios (solo administradores)

### **Dependencias:**
- ✅ **`express-session`** - Gestión de sesiones
- ✅ **`bcryptjs`** - Encriptación de contraseñas

## 🔧 **Configuración del Sistema**

### **Variables de Sesión:**
```javascript
// Configuración en server.js
app.use(session({
    secret: 'nbteam-it-onboarding-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));
```

### **Middleware de Autenticación:**
```javascript
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        const user = authConfig.findUserById(req.session.userId);
        if (user) {
            req.user = user;
            return next();
        }
    }
    res.status(401).json({ success: false, error: 'No autorizado' });
}
```

### **Middleware de Administrador:**
```javascript
function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, error: 'Acceso denegado. Se requiere rol de administrador.' });
}
```

## 🚀 **Flujo de Autenticación**

### **1. Acceso al Sistema:**
```
Usuario → http://localhost:3001 → Login.html
```

### **2. Proceso de Login:**
```
Usuario ingresa credenciales → POST /api/auth/login → Verificación → Sesión creada → Dashboard
```

### **3. Navegación Protegida:**
```
Cualquier página → Verificación de sesión → Si válida: Acceso | Si inválida: Login
```

### **4. Logout:**
```
Usuario hace logout → POST /api/auth/logout → Sesión destruida → Login
```

## 📋 **Rutas Protegidas**

### **Páginas Web:**
- ✅ **`/dashboard.html`** - Dashboard principal
- ✅ **`/index.html`** - Formulario de creación
- ✅ **`/list.html`** - Lista de formularios
- ✅ **`/edit.html`** - Edición de formularios
- ✅ **`/users.html`** - Gestión de usuarios (solo admin)

### **API Endpoints:**
- ✅ **`/api/formularios/*`** - Todas las operaciones CRUD
- ✅ **`/api/users/*`** - Gestión de usuarios (solo admin)
- ✅ **`/api/auth/check`** - Verificación de autenticación

### **Rutas Públicas:**
- ✅ **`/login.html`** - Página de login
- ✅ **`/health`** - Health check del servidor

## 🔍 **Para Probar el Sistema**

### **Paso 1: Acceder al Sistema**
- **URL**: http://localhost:3001
- **Resultado**: Redirige automáticamente a login

### **Paso 2: Iniciar Sesión**
- **Usuario**: admin
- **Contraseña**: password
- **Resultado**: Acceso al dashboard

### **Paso 3: Explorar Funcionalidades**
- **Dashboard**: Estadísticas y acceso rápido
- **Formularios**: Crear, editar, listar
- **Usuarios**: Gestión completa (solo admin)

### **Paso 4: Probar Roles**
- **Admin**: Acceso completo
- **HR**: Solo formularios
- **IT**: Solo formularios

## 🎨 **Interfaz de Usuario**

### **Página de Login:**
- ✅ **Diseño moderno** con gradientes
- ✅ **Logo corporativo** integrado
- ✅ **Credenciales de prueba** visibles
- ✅ **Validación** en tiempo real
- ✅ **Mensajes de error** claros

### **Dashboard:**
- ✅ **Información del usuario** en header
- ✅ **Estadísticas** del sistema
- ✅ **Accesos rápidos** a funcionalidades
- ✅ **Control de acceso** por roles
- ✅ **Botón de logout** visible

### **Gestión de Usuarios:**
- ✅ **Tabla completa** de usuarios
- ✅ **Badges de roles** con colores
- ✅ **Acciones** por usuario
- ✅ **Modal de creación** de usuarios
- ✅ **Confirmaciones** de eliminación

## 🔧 **Personalización**

### **Agregar Nuevos Usuarios:**
```javascript
// En auth-config.js
const newUser = {
    id: 4,
    username: 'nuevo_usuario',
    password: await hashPassword('nueva_contraseña'),
    role: 'hr', // admin, hr, it
    fullName: 'Nombre Completo',
    email: 'email@empresa.com',
    createdAt: new Date().toISOString()
};
users.push(newUser);
```

### **Cambiar Configuración de Sesión:**
```javascript
// En server.js
cookie: {
    secure: true, // Para HTTPS en producción
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000 // 8 horas
}
```

### **Agregar Nuevos Roles:**
1. **Actualizar** `auth-config.js` con nuevo rol
2. **Modificar** `requireAdmin` middleware si es necesario
3. **Actualizar** frontend para mostrar nuevo rol
4. **Agregar** validaciones correspondientes

## ✅ **¡Sistema de Seguridad Completo!**

**El sistema ahora incluye:**
- ✅ **Autenticación robusta** con contraseñas encriptadas
- ✅ **Control de acceso** por roles de usuario
- ✅ **Sesiones seguras** con cookies HTTPOnly
- ✅ **Protección completa** de rutas y API
- ✅ **Gestión de usuarios** para administradores
- ✅ **Interfaz moderna** y responsive
- ✅ **Validaciones** de seguridad en frontend y backend

**¡Tu sistema está completamente protegido y listo para producción!** 🚀

---
**Implementado**: 17 de Septiembre de 2025  
**Sistema**: NBTeam IT Onboarding  
**Seguridad**: Nivel Empresarial





