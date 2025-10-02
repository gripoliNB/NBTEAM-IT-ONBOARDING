# 🚀 Guía Completa: Configuración AWS SES para Emails

## 📋 **Resumen**
AWS SES (Simple Email Service) reemplaza el SMTP tradicional para envío de emails corporativos. Más confiable, escalable y profesional.

## ⚡ **Setup Rápido (5 minutos)**

### **1. AWS Console - Crear Usuario IAM** 🔐
```
1. Ir a AWS Console → IAM → Users
2. "Create user" → "nbteam-ses-user"
3. Attach policies:
   ✅ AmazonSESFullAccess
   ✅ AmazonSESReadOnlyAccess
4. Security credentials → Create access key
5. Guardar: Access Key ID + Secret Access Key
```

### **2. AWS SES - Verificar Dominio** 🌍
```
1. AWS Console → SES → Domains
2. "Verify Domain Identity" → "nbteamconsulting.com"
3. Agregar DNS Records en tu DNS provider:
   - TXT Record: SesDomainIdentityVerification
   - MX Record para bounces (opcional)
4. Confirmar verificación en SES Console
```

### **3. Configurar Variables de Ambiente** ⚙️
Crear archivo `.env`:
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
FROM_EMAIL=noreply@nbteamconsulting.com
FROM_NAME=NBTeam IT Onboarding
```

### **4. Salir del Sandbox** 📤
```
1. SES → Account dashboard → Sending statistics
2. "Request production access"
3. Use case: "Transactional emails for employee onboarding system"
4. Website: URL de tu aplicación
5. Esperar aprobación (1-2 días)
```

## 🎯 **Beneficios vs SMTP**

| Característica | Gmail SMTP | AWS SES |
|---------------|------------|---------|
| **Confiabilidad** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Deliverability** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Tracking** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Escalabilidad** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Costos** | Gratis (límites) | $0.10/1000 emails |
| **Configuración** | Compleja | Moderada |

## 📊 **Monitoring y Logs**

### **En AWS Console:**
- **SES Dashboard**: Estadísticas de envío
- **CloudWatch**: Métricas detalladas
- **SNS**: Notificaciones de bounces/complaints

### **En la Aplicación:**
```bash
# Logs del servidor muestran:
[AWS-SES] ✅ Email enviado exitosamente a Recursos Humanos
[AWS-SES] 🆔 Message ID: 0000014a-4fd4-4f2e-9f73-7e4b84eb1f4a-000000
[AWS-SES] 📊 Resultado AWS SES: 2 enviados, 0 falló
```

## 🚨 **Troubleshooting Común**

### **Error: "Email address not verified"**
```bash
# Solución: Verificar emails en SES Console
SES → Verified identities → Add email address
```

### **Error: "Daily sending quota exceeded"**
```bash
# Solución: Solicitar límite mayor en SES Console
Account dashboard → Sending quota → Request quota increase
```

### **Error: "Domain not verified"**
```bash
# Solución: Completar verificación DNS
SES → Domains → Verification status → Complete DNS setup
```

## 💰 **Costos Estimados**

```
📧 Pricing AWS SES (us-east-1):
- Primer 62,000 emails/mes: GRATIS
- Email adicional: $0.10 por 1,000 emails
- Data transfer: Incluido

Ejemplo uso típico:
- 100 formularios/mes = 200 emails
- Costo mensual: $0.00 (dentro de gratis tier)
```

## 🔧 **Configuración Avanzada**

### **Para Producción:**
```javascript
// Implementar retry logic
const sendEmailWithRetry = async (emailParams, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await ses.sendEmail(emailParams).promise();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
};
```

### **Para Desarrollo Local:**
```javascript
// Para desarrollo sin configurar AWS real:
const simulationMode = process.env.NODE_ENV !== 'production';
if (simulationMode) {
    console.log('[AWS-SES] Simulación: Email enviado');
    return { success: true, simulationMode: true };
}
```

## ✅ **Testing Checklist**

- [ ] Usuario IAM creado con permisos SES
- [ ] Access Key ID y Secret Key guardados
- [ ] Dominio verifycation completada
- [ ] Variables de ambiente configuradas
- [ ] Email de prueba enviado con éxito
- [ ] Logs muestran "AWS SES configurado correctamente"

## 🎉 **¡Listo!**

Una vez configurado, AWS SES manejará automáticamente:
- ✅ Envío confiable de emails transaccionales
- ✅ Mejor deliverability que SMTP tradicional  
- ✅ Tracking completo de emails enviados
- ✅ Escalabilidad automática según demanda
- ✅ Cumplimiento con mejores prácticas de email

¡Tu sistema de notificaciones por email ahora es **enterprise-grade**! 🚀
