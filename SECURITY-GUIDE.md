# 🔐 Guía de Seguridad - NBTeam IT Onboarding

## ⚠️ **PROTEGIENDO CREDENCIALES AWS SES**

### **1. Variables de Entorno (OBLIGATORIO)**

**✅ COMPLETADO**: El sistema está configurado para usar variables de entorno.

**Archivo `.env`** (NO subir a Git):
```env
# AWS SES Configuration
AWS_ACCESS_KEY_ID=tu-access-key-real-aqui
AWS_SECRET_ACCESS_KEY=tu-secret-key-real-aqui
AWS_REGION=us-east-1
FROM_EMAIL=noreply@nbteamconsulting.com

# Server Configuration
PORT=3001
SESSION_SECRET=tu-session-secret-aqui
```

### **2. Archivos Protegidos por `.gitignore`**

Los siguientes archivos están protegidos y NO se subirán al repositorio:

```
.env                          # Variables de entorno con credenciales
aws-email-service.js          # Servicio AWS con credenciales
email-service.js              # Servicio email con credenciales
test-aws-ses.js              # Script de prueba AWS
formularios.db                # Base de datos local
*.log                        # Archivos de log
```

### **3. Configuración Segura en Producción**

#### **A. Servidor Local/Desarrollo**
```bash
# Crear archivo .env
cp .env.example .env

# Editar credenciales (NUNCA hardcodeear)
nano .env
```

#### **B. Servidor en la Nube**
```bash
# Variables de entorno del sistema
export AWS_ACCESS_KEY_ID="tu-access-key"
export AWS_SECRET_ACCESS_KEY="tu-secret-key"
export AWS_REGION="us-east-1"
```

#### **C. Docker Deployment**
```dockerfile
# En docker-compose.yml
environment:
  - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
  - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
  - AWS_REGION=${AWS_REGION}
```

### **4. Creación Segura de Credenciales AWS**

#### **A. Usuario IAM en AWS**
1. **AWS Console** → **IAM** → **Users** → **Create User**
2. **Username**: `nbteam-ses-user`
3. **Access Type**: `Programmatic access`

#### **B. Política Creada**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:GetSendQuota",
                "ses:GetSendStatistics",
                "ses:ListIdentities",
                "ses:VerifyEmailAddress"
            ],
            "Resource": "*"
        }
    ]
}
```

#### **C. Configurar Registros**
```bash
# Crear Acces Key
# Copiar Access Key ID y Secret Access Key
# GUARDAR SEGURO - No se puede recuperar después
```

### **5. Verificación de Seguridad**

#### **A. Verificar que NO hay credenciales en código**
```bash
# Buscar patrones de credenciales
grep -r "AKIA" . --exclude-dir=node_modules
grep -r "AWS_SECRET" . --exclude-dir=node_modules
```

#### **B. Verificar .gitignore**
```bash
git status
# NO debe mostrar: .env, aws-email-service.js, email-service.js
```

### **6. Rotación de Credenciales**

#### **A. Plan de Rotación**
- **Cada 90 días** crear nuevas credenciales
- **Documentar cambio** en equipo interno
- **Actualizar `.env`** en todos los servidores

#### **B. Proceso de Rotación**
1. Crear nuevas credenciales en AWS IAM
2. Probar en entorno de desarrollo
3. Actualizar en producción 
4. Revocar credenciales antiguas (después de 7 días)

### **7. Monitoreo de Seguridad**

#### **A. AWS CloudTrail**
- Monitorear accesos a SES
- Alertas por actividad inusual
- Reportes mensuales

#### **B. Logs de Aplicación**
```bash
# Verificar logs del servidor
tail -f *.log | grep "AWS-SES"
```

### **8. Respaldo Seguro**

#### **A. Archivo `.env`**
```bash
# Crear respaldo cifrado
openssl enc -aes-256-cbc -salt -in .env -out .env.backup.enc
```

#### **B. Recuperación**
```bash
# Descifrar respaldo
openssl enc -aes-256-cbc -d -in .env.backup.enc -out .env
```

### **9. Checklist de Seguridad**

✅ **Credenciales AWS solo en `.env`**  
✅ **`.env` en `.gitignore`**  
✅ **No credenciales hardcodeadas en código**  
✅ **Usuario IAM con permisos mínimos**  
✅ **Dominio verificado en AWS SES**  
✅ **Sandbox deshabilitado**  
✅ **Logs de AWS CloudTrail habilitados**  
✅ **Plan de rotación de credenciales**  
✅ **Respaldo cifrado de `.env`**  
✅ **Monitor de actividad AWS**  

### **10. Alertas de Seguridad**

#### **A. Configurar Alertas**
- Email de administración por envíos fallidos
- Alertas de consumo inusual de SES
- Notificaciones de acceso desde IPs nuevas

#### **B. Contactos de Emergencia**
```
Administrador AWS: tu-email@nbteamconsulting.com
Admin Técnico: giovanni.ripoli@nbteamconsulting.com
```

---

## 🚨 **EN CASO DE COMPROMISO**

1. **INMEDIATAMENTE**: Revocar credenciales en AWS IAM
2. **Verificar**: Logs de AWS CloudTrail
3. **Actualizar**: Crear nuevas credenciales
4. **Notificar**: Afectados por compromiso
5. **Documentar**: Incidente para prevención

---

**🛡️ Este sistema está configurado siguiendo las mejores prácticas de seguridad para AWS SES y protección de credenciales.**
