# 🚀 Guía Completa de Configuración AWS SES

## 📋 Checklist de Configuración AWS SES

### ✅ PASO 1: Crear Usuario IAM AWS

1. **Acceder a AWS Console**
   - Ve a https://console.aws.amazon.com/
   - Inicia sesión con tu cuenta AWS

2. **Crear Usuario IAM**
   - Ve a **IAM** → **Users** → **Add User**
   - Username: `ses-sender-nbteam`
   - Access type: ✅ **Programmatic access**

3. **Attach Políticas**
   - Attach existing policies directly
   - Busca y selecciona: `AmazonSESFullAccess`

### ✅ PASO 2: Configurar SES

1. **Verificar Dominio**
   - Ve a **SES** → **Identities** → **Create Identity**
   - Selecciona **Domain**
   - Domain: `nbteamconsulting.com`
   - Verifica usando DKIM (recomendado)

2. **Salir del Sandbox** (OPCIONAL)
   - Por defecto SES está en sandbox mode
   - Para enviar a cualquier email, solicita salir del sandbox
   - Ve a **SES** → **Account dashboard** → **Request production access**

### ✅ PASO 3: Configurar Variables de Entorno

**MÉTODO 1: Variables de Entorno (Recomendado)**

```bash
# Windows PowerShell
$env:AWS_ACCESS_KEY_ID="AKIA..."
$env:AWS_SECRET_ACCESS_KEY="..."
$env:AWS_REGION="us-east-1"
$env:FROM_EMAIL="noreply@nbteamconsulting.com"
```

**MÉTODO 2: Archivo .env**
Crea archivo `.env<｜tool▁calls▁end｜> ` en la raíz del proyecto:
```env
AWS_ACCESS_KEY_ID=tu-access-key-aqui
AWS_SECRET_ACCESS_KEY=tu-secret-key-aqui
AWS_REGION=us-east-1
FROM_EMAIL=noreply@nbteamconsulting.com
```

### ✅ PASO 4: Probar Configuración

Una vez configurado, puedes probar con:
```bash
npm run test-email
```

## 🔧 Código de Prueba para AWS SES

```javascript
const AWS = require('aws-sdk');

// Configurar SES
AWS.config.update({
    region: 'us-east-1'
});

const ses = new AWS.SES({apiVersion: '2010-12-01'});

// Probar envío
const params = {
    Source: 'noreply@nbteamconsulting.com',
    Destination: {
        ToAddresses: ['test@example.com']
    },
    Message: {
        Subject: { Data: 'Prueba SES' },
        Body: {
            Text: { Data: '¡SES funcionando correctamente!' }
        }
    }
};

ses.sendEmail(params).promise()
    .then(result => console.log('✅ Email enviado:', result.MessageId))
    .catch(err => console.log('❌ Error:', err.message));
```

## ⚠️ Troubleshooting

### Error: "The request signature we calculated does not match..."
- ✅ Verifica que AWS_ACCESS_KEY_ID sea correcta
- ✅ Verifica que AWS_SECRET_ACCESS_KEY sea correcta  
- ✅ Verifica que la región coincida con tu SES

### Error: "Email address not verified"
- ✅ SES en sandbox solo acepta emails verificados
- ✅ Agrega emails a **SES** → **Identities** → **Email addresses**
- ✅ Verifica emails enviados a través de sus bandejas

### Error: "Domain not verified"
- ✅ Completa la verificación DNS en SES
- ✅ Agrega los registros TXT a tu DNS

## 🚀 Estado Actual del Sistema

**✅ Lo que funciona:**
- Detección de nuevos formularios ✅
- Obtención de emails de usuarios ✅  
- Template de emails ✅
- Lógica de envío ✅

**🔧 Lo que necesita configuración:**
- Credenciales AWS válidas
- Dominio verificado en SES
- Configuración de variables de entorno

**📧 Una vez configurado, el sistema enviará automáticamente:**
- ✉️ **Al crear formulario:** Solicitante + HR + IT
- ✉️ **Al cambiar estado:** A destinatarios correspondientes
