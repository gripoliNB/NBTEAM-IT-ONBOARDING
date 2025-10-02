// =============================================================================
// AWS SES CONFIGURATION EXAMPLE
// =============================================================================

// Este archivo muestra cómo configurar AWS SES para el envío de emails

const AWS_SES_CONFIG = {
    // 1. CREDENCIALES AWS (obtén estas en AWS IAM)
    credentials: {
        accessKeyId: 'AKIA...', // Tu Access Key ID de AWS
        secretAccessKey: '...', // Tu Secret Access Key de AWS
        region: 'us-east-1'      // Región AWS (us-east-1, us-west-2, etc.)
    },
    
    // 2. DOMAIN CONFIGURATION
    domain: {
        verifiedDomain: 'nbteamconsulting.com', // Dominio verificado en SES
        fromEmail: 'noreply@nbteamconsulting.com', // Email de remitente
        fromName: 'NBTeam IT Onboarding' // Nombre del remitente
    },
    
    // 3. RECIPIENTS CONFIGURATION
    recipients: {
        hr: 'hr@nbteamconsulting.com',
        it: 'it@nbteamconsulting.com', 
        admin: 'admin@nbteamconsulting.com',
        solicitantes: 'solicitantes@nbteamconsulting.com'
    }
};

// =============================================================================
// SETUP STEPS PARA AWS SES
// =============================================================================

/*
1. AWS CONSOLE CONFIGURATION:
   - Ve a AWS Console → IAM
   - Crea un usuario con políticas:
     * AmazonSESFullAccess
     * AmazonSESReadOnlyAccess
   - Genera Access Key ID y Secret Access Key
   - Guarda las credenciales de forma segura

2. SES DOMAIN VERIFICATION:
   - Ve a AWS Console → SES → Domains
   - Agrega Domain Identity: nbteamconsulting.com
   - Verifica agregando DNS records (MX, TXT, CNAME)
   - Confirma verificación en SES Console

3. SES SANDBOX EXIT:
   - Por defecto, SES está en Sandbox mode (limita a emails verificados)
   - Para salir del Sandbox:
     * Ve a SES → Account dashboard
     * Solicita "Request production access"
     * Proporciona use case detallado
     * Espera aprobación (24-48 horas típicamente)

4. ENVIRONMENT VARIABLES:
   Crea archivo .env con:
   
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   FROM_EMAIL=noreply@nbteamconsulting.com
   FROM_NAME=NBTeam IT Onboarding

5. PRODUCTION READY:
   - Usa AWS SDK v3 para mejor performance
   - Implementa retry logic para fallos temporales
   - Monitorea métricas de SES (bounces, complaints)
   - Configura CloudWatch alarms si es necesario
*/

// =============================================================================
// TESTING EN DEVELOPMENT
// =============================================================================

// Para desarrollo/pruebas sin configuración completa:
const DEV_CONFIG = {
    simulateEmails: true,       // Envía logs en lugar de emails reales
    logEmailDetails: true,      // Muestra detalles de emails en consola
    verifyConfig: false        // Omite verificación de dominio
};

// Exportar configuraciones
module.exports = {
    AWS_SES_CONFIG,
    DEV_CONFIG
};
