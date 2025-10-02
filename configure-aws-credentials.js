#!/usr/bin/env node

/**
 * 🔧 Script para Configurar Credenciales AWS SES
 * Este script te ayuda a configurar AWS SES paso a paso
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurador de Credenciales AWS SES para NBTeam IT Onboarding');
console.log('='.repeat(70));

console.log('\n📋 PASOS ANTES DE CONTINUAR:');
console.log('1. Ve a https://console.aws.amazon.com/iam/');
console.log('2. IAM → Users → Tu usuario → Security credentials');
console.log('3. Create access key (si no tienes)');
console.log('4. Copia Access Key ID y Secret Access Key');

console.log('\n🔑 INSTRUCCIONES:');
console.log('   OPCIÓN A: Configurar en variables de entorno');
console.log('   $env:AWS_ACCESS_KEY_ID="tu-access-key-id"');
console.log('   $env:AWS_SECRET_ACCESS_KEY="tu-secret-access-key"');
console.log('   ');
console.log('   OPCIÓN B: Reemplazar en aws-email-service.js línase 6-7:');
console.log('   accessKeyId: process.env.AWS_ACCESS_KEY_ID || \'TU-KEY-AQUI\'');
console.log('   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || \'TU-SECRET-AQUI\'');

console.log('\n🌍 VERIFICACIONES NECESARIAS:');
console.log('✅ 1. AWS SES → Domain verification → nbteamconsulting.com');
console.log('✅ 2. IAM User tiene permisos: AmazonSESFullAccess');
console.log('✅ 3. Credenciales copiadas correctamente');
console.log('✅ 4. Región: us-east-1');

console.log('\n🧪 PROBAR CONFIGURACIÓN:');
console.log('   node test-aws-ses.js');

console.log('\n📧 DOMINIO VERIFICATION STEPS:');
console.log('1. AWS Console → SES → Identities → Create Identity');
console.log('2. Domain Identity → nbteamconsulting.com');
console.log('3. DNS verification → Add TXT record to your DNS');
console.log('4. Wait for verification (ususally 1-5 minutes)');

console.log('\n⚠️  PROBLEMAS COMUNES:');
console.log('❌ "SignatureDoesNotMatch": Credenciales incorrectas');
console.log('❌ "EmailAddressNotVerified": Dominio no verificado');
console.log('❌ "AccessDenied": Sin permisos SES');
console.log('❌ "MessageRejected": Sandbox mode activo');

console.log('\n🎯 SIGUIENTE PASO:');
console.log('   Una vez configuradas las credenciales:');
console.log('   1. node test-aws-ses.js');
console.log('   2. npm start');
console.log('   3. Crear formulario para probar emails');

console.log('\n' + '='.repeat(70));
console.log('💡 El sistema detectará automáticamente si AWS SES está configurado correctamente');

module.exports = {};
