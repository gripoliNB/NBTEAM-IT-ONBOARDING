# 🚀 NBTeam IT Onboarding System

Sistema completo de gestión de solicitudes de onboarding para empleados con notificaciones automáticas por email usando AWS SES.

## 📋 Características Principales

✅ **Gestión de Solicitudes**: Crear, editar y aprobar solicitudes de onboarding  
✅ **Sistema de Usuarios**: Roles de Admin, HR, IT y Solicitante  
✅ **Notificaciones Email**: AWS SES integrado para notificaciones automáticas  
✅ **Reportes**: Dashboard y reportes para solicitantes  
✅ **Responsive Design**: Optimizado para móviles y desktop  
✅ **Base de Datos**: SQLite para almacenamiento local  

## 🔧 Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` con las credenciales AWS SES:
```env
AWS_ACCESS_KEY_ID=tu-access-key-real
AWS_SECRET_ACCESS_KEY=tu-secret-key-real
AWS_REGION=us-east-1
FROM_EMAIL=noreply@nbteamconsulting.com
```

### 3. Iniciar el Sistema
```bash
npm start
```

El sistema estará disponible en: `http://localhost:3001`

## 👥 Usuarios del Sistema

| Usuario     | Contraseña | Rol         | Descripción                    |
|-------------|------------|-------------|--------------------------------|
| admin       | password   | admin       | Administrador completo        |
| hr          | password   | hr          | Recursos Humanos              |
| it          | password   | it          | Equipo de IT                  |
| solicitante | password   | solicitante | Gerencia General              |

## 📧 Configuración de Emails

### AWS SES Setup

1. **Crear usuario IAM en AWS Console**:
   - Ir a: AWS Console → IAM → Users → Create New User
   - Attach policy: `AmazonSESFullAccess`
   - Create Access Key y copiar credenciales

2. **Verificar dominio en SES**:
   - Ir a: AWS Console → SES → Domain Identity
   - Verificar el dominio `nbteamconsulting.com`
   - Solicitar salida del Sandbox mode (opcional)

3. **Configurar variables de entorno**:
   ```env
   AWS_ACCESS_KEY_ID=tu-access-key-real
   AWS_SECRET_ACCESS_KEY=tu-secret-key-real
   ```

### Funcionalidades de Email

- ✅ **Nueva Solicitud**: Notifica a Solicitante, HR e IT
- ✅ **Cambio de Estado**: Notifica a Solicitante según progreso
- ✅ **Emails Personalizados**: Usa emails de usuarios del sistema
- ✅ **Templates Profesionales**: Diseño HTML responsive

## 📁 Estructura del Proyecto

```
NBTEAM-IT-ONBOARDING/
├── server.js              # Servidor principal
├── database.js            # Gestión de base de datos SQLite
├── aws-email-service.js   # Servicio de emails AWS SES
├── auth-config.js         # Configuración de usuarios
├── public/               # Archivos HTML frontend
├── components/           # Componentes React (opcionales)
├── routes/               # Endpoints API
├── middleware/           # Middleware de autenticación
└── package.json          # Dependencias del proyecto
```

## 🔒 Seguridad

- 🔐 Archivos sensibles protegidos en `.gitignore`
- 🔑 Credenciales AWS solo en variables de entorno
- 🛡️ Autenticación por sesión con roles
- 📧 Sanitización de emails y validaciones

## 📱 Uso del Sistema

### Para Administradores
1. Iniciar sesión como `admin`
2. Gestionar usuarios desde "Usuarios del Sistema"
3. Configurar emails desde "Configurar Email"
4. Supervisar todas las solicitudes

### Para Solicitantes
1. Iniciar sesión como `solicitante`
2. Crear nuevas solicitudes de onboarding
3. Ver reportes de solicitudes en "Mis Solicitudes"
4. Recibir notificaciones por email

### Para HR/IT
1. Iniciar sesión con rol `hr` o `it`
2. Revisar nuevas solicitudes
3. Cambiar estados según proceso interno
4. Recibir notificaciones automáticas

## 🚀 Despliegue

Para desplegar en producción:

1. **Servidor**: Configurar variables de entorno AWS SES
2. **Base de datos**: El SQLite se crea automáticamente
3. **Puerto**: Cambiar desde 3001 si es necesario
4. **Dominio**: Actualizar `FROM_EMAIL` con dominio real

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo (si configurado)
```

### API Endpoints

- `GET /api/formularios` - Listar todas las solicitudes
- `POST /api/formularios` - Crear nueva solicitud
- `PUT /api/formularios/:id/aprobar` - Aprobar solicitud
- `GET /api/formularios/my-requests` - Solicitudes del usuario actual
- `GET /api/users` - Listar usuarios (admin)
- `POST /api/test-email` - Probar configuración email

## 📄 Licencia

Copyright © 2025 NBTeam Consulting. Todos los derechos reservados.

---

**Contacto**: giovanni.ripoli@nbteamconsulting.com