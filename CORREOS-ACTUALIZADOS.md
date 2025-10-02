# 📧 Actualización de Correos Electrónicos - Sistema de Prueba

## ✅ **CAMBIOS APLICADOS:**

Los correos electrónicos de los usuarios han sido actualizados a direcciones de prueba para evitar conflictos con las direcciones de producción:

### **Usuario Admin:**
- **Antes**: `admin@nbteamconsulting.com`
- **Ahora**: `admintest@nbteamconsulting.com`

### **Usuario HR:**
- **Antes**: `hr@nbteamconsulting.com`
- **Ahora**: `hrtest@nbteamconsulting.com`

### **Usuario IT:**
- **Antes**: `it@nbteamconsulting.com`
- **Ahora**: `ittest@nbteamconsulting.com`

### **Usuario Solicitante (Gerencia):**
- **Antes**: `gerencia@nbteamconsulting.com`
- **Ahora**: `gerenciatest@nbteamconsulting.com`

## 🔧 **Configuración AWS SES:**

Para que los emails funcionen, necesitarás verificar estos dominios en AWS SES:

### **Correos a verificar en AWS SES:**
- `admintest@nbteamconsulting.com`
- `hrtest@nbteamconsulting.com`
- `ittest@nbteamconsulting.com`
- `gerenciatest@nbteamconsulting.com`

### **Dominio a verificar:**
- `nbteamconsulting.com` (para poder enviar desde @nbteamconsulting.com)

## 📋 **Flujo de Notificaciones:**

### **Al crear nueva solicitud:**
- ✅ **Solicitante**: `gerenciatest@nbteamconsulting.com`
- ✅ **HR**: `hrtest@nbteamconsulting.com`
- ✅ **IT**: `ittest@nbteamconsulting.com`

### **Al cambiar estado de solicitud:**
- ✅ **Solicitante original**: Recibe notificación según progreso
- ✅ **HR**: Recibe notificaciones de cambios importantes

### **Acceso al sistema:**
- ✅ **Admin**: `admintest@nbteamconsulting.com`
- ✅ **HR**: `hrtest@nbteamconsulting.com`
- ✅ **IT**: `ittest@nbteamconsulting.com`
- ✅ **Solicitante**: `gerenciatest@nbteamconsulting.com`

## 🚀 **Próximos Pasos:**

1. **Verificar dominios** en AWS Console → SES → Verified Identities
2. **Probar notifications** creando una nueva solicitud
3. **Confirmar entrega** de emails en las direcciones de prueba

## 🔄 **Rollback:**

Si necesitas revertir a las direcciones originales:
```bash
git checkout HEAD~1 -- auth-config.js
```

---

**📅 Fecha de actualización**: $(date)
**✅ Estado**: Implementado y listo para pruebas
