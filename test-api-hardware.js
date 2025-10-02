const fetch = require('node-fetch');

console.log('🧪 Probando API directamente...');

// Datos de prueba
const testData = {
    employeeNumber: 'API001',
    fullName: 'Usuario API Test',
    department: 'Operacion',
    startDate: '2025-09-17',
    hardware: 'MacBook Pro (Standard)',
    hardwareBrand: 'Apple',
    hardwareModel: 'MacBook Pro 16"',
    hardwareSerial: 'XYZ987654321',
    hardwareAccessories: 'Magic Mouse, Magic Keyboard',
    trainings: ['Onboarding de Seguridad', 'Capacitación básica sobre uso de herramientas'],
    softwareRequirements: ['Microsoft 365', 'Teams', 'Zoom']
};

console.log('📝 Datos a enviar:', testData);

// Probar la API
fetch('http://localhost:3001/api/formularios', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
    console.log('📡 Respuesta de la API:', data);
    
    if (data.success) {
        console.log('✅ API funcionando correctamente');
        
        // Verificar en la base de datos
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'formularios.db');
        const db = new sqlite3.Database(dbPath);
        
        db.get("SELECT * FROM formularios WHERE employee_number = ?", [testData.employeeNumber], (err, row) => {
            if (err) {
                console.error('❌ Error al verificar en BD:', err);
            } else if (row) {
                console.log('\n📋 Datos en base de datos:');
                console.log(`ID: ${row.id}`);
                console.log(`Empleado: ${row.full_name}`);
                console.log(`Hardware: ${row.hardware}`);
                console.log(`Marca: ${row.hardware_brand}`);
                console.log(`Modelo: ${row.hardware_model}`);
                console.log(`Serie: ${row.hardware_serial}`);
                console.log(`Accesorios: ${row.hardware_accessories}`);
                
                // Verificar si los datos son correctos
                if (row.hardware_brand === testData.hardwareBrand && 
                    row.hardware_model === testData.hardwareModel &&
                    row.hardware_serial === testData.hardwareSerial &&
                    row.hardware_accessories === testData.hardwareAccessories) {
                    console.log('\n✅ ¡Datos de hardware guardados correctamente via API!');
                } else {
                    console.log('\n❌ Los datos de hardware NO se guardaron correctamente via API');
                }
                
                // Eliminar el registro de prueba
                db.run("DELETE FROM formularios WHERE id = ?", [row.id], (err) => {
                    if (err) {
                        console.error('❌ Error al eliminar registro de prueba:', err);
                    } else {
                        console.log('\n🧹 Registro de prueba eliminado');
                    }
                    db.close();
                });
            } else {
                console.log('❌ No se encontró el registro en la base de datos');
                db.close();
            }
        });
    } else {
        console.log('❌ Error en la API:', data.error);
    }
})
.catch(error => {
    console.error('❌ Error de conexión:', error);
});






