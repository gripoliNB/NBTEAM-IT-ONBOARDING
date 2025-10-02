const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear conexión a la base de datos
const dbPath = path.join(__dirname, 'formularios.db');
const db = new sqlite3.Database(dbPath);

// Crear tabla de formularios
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS formularios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_number TEXT,
            full_name TEXT NOT NULL,
            department TEXT NOT NULL,
            start_date TEXT NOT NULL,
            hardware TEXT NOT NULL,
            hardware_brand TEXT,
            hardware_model TEXT,
            hardware_serial TEXT,
            hardware_accessories TEXT,
            trainings TEXT NOT NULL,
            software_requirements TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Agregar las nuevas columnas si no existen (para bases de datos existentes)
    db.run(`ALTER TABLE formularios ADD COLUMN hardware_brand TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando hardware_brand:', err.message);
        }
    });
    
    db.run(`ALTER TABLE formularios ADD COLUMN hardware_model TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando hardware_model:', err.message);
        }
    });
    
    db.run(`ALTER TABLE formularios ADD COLUMN hardware_serial TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando hardware_serial:', err.message);
        }
    });
    
    db.run(`ALTER TABLE formularios ADD COLUMN hardware_accessories TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando hardware_accessories:', err.message);
        }
    });
    
    // Agregar campos de auditoría
    db.run(`ALTER TABLE formularios ADD COLUMN created_by TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando created_by:', err.message);
        }
    });
    
    db.run(`ALTER TABLE formularios ADD COLUMN updated_by TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando updated_by:', err.message);
        }
    });
    
    // Agregar campos de clientes y observaciones
    db.run(`ALTER TABLE formularios ADD COLUMN clients TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando clients:', err.message);
        }
    });
    
    db.run(`ALTER TABLE formularios ADD COLUMN observations TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando observations:', err.message);
        }
    });
    
    // Agregar campos de email personal y rol
    db.run(`ALTER TABLE formularios ADD COLUMN email_personal TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando email_personal:', err.message);
        }
    });
    
    db.run(`ALTER TABLE formularios ADD COLUMN rol TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando rol:', err.message);
        }
    });
    
    // Agregar columna de status
    db.run(`ALTER TABLE formularios ADD COLUMN status TEXT DEFAULT 'Requerimiento inicial'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando status:', err.message);
        }
    });

    // Agregar columna de aprobación de requerimiento inicial
    db.run(`ALTER TABLE formularios ADD COLUMN aprobado_requerimiento TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando aprobado_requerimiento:', err.message);
        }
    });

    // Agregar columna de aprobación de fase de contratación
    db.run(`ALTER TABLE formularios ADD COLUMN aprobado_contratacion TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando aprobado_contratacion:', err.message);
        }
    });

    // Agregar columna de aprobación de fase de asignación
    db.run(`ALTER TABLE formularios ADD COLUMN aprobado_asignacion TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando aprobado_asignacion:', err.message);
        }
    });

    // Agregar columna de usuario que aprobó
    db.run(`ALTER TABLE formularios ADD COLUMN aprobado_por TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando aprobado_por:', err.message);
        }
    });

    // Agregar columna de fecha de aprobación
    db.run(`ALTER TABLE formularios ADD COLUMN fecha_aprobacion TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando fecha_aprobacion:', err.message);
        }
    });

    // Agregar columna de centro de costos
    db.run(`ALTER TABLE formularios ADD COLUMN centro_costos TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando centro_costos:', err.message);
        }
    });

    // Agregar columna de tipo de contrato
    db.run(`ALTER TABLE formularios ADD COLUMN tipo_contrato TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.log('Error agregando tipo_contrato:', err.message);
        }
    });

    // Crear tabla de clientes
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT,
            activo BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Crear tabla de software
    db.run(`
        CREATE TABLE IF NOT EXISTS software (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT,
            categoria TEXT,
            activo BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    console.log('Base de datos inicializada correctamente');
});

// Función para insertar un nuevo formulario
function insertFormulario(formData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO formularios 
            (employee_number, full_name, email_personal, rol, department, start_date, hardware, hardware_brand, hardware_model, hardware_serial, hardware_accessories, trainings, software_requirements, clients, observations, status, created_by, centro_costos, tipo_contrato)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run([
            formData.employeeNumber || null,
            formData.fullName,
            formData.emailPersonal || null,
            formData.rol || null,
            formData.department,
            formData.startDate,
            formData.hardware,
            formData.hardwareBrand || null,
            formData.hardwareModel || null,
            formData.hardwareSerial || null,
            formData.hardwareAccessories || null,
            JSON.stringify(formData.trainings),
            JSON.stringify(formData.softwareRequirements),
            JSON.stringify(formData.clients || []),
            formData.observations || null,
            formData.status || 'Requerimiento inicial',
            formData.createdBy || 'Sistema',
            formData.centroCostos || null,
            formData.tipoContrato || null
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, ...formData });
            }
        });
        
        stmt.finalize();
    });
}

// Función para obtener todos los formularios
function getAllFormularios() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM formularios 
            ORDER BY created_at DESC
        `, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                try {
                    // Parsear JSON strings con manejo de errores
                    const formularios = rows.map(row => {
                        const formulario = { ...row };
                        
                        // Manejo seguro del parsing JSON
                        try {
                            formulario.trainings = JSON.parse(row.trainings || '[]');
                        } catch (parseErr) {
                            console.warn(`Error parsing trainings for ID ${row.id}:`, parseErr.message);
                            formulario.trainings = [];
                        }
                        
                        try {
                            formulario.software_requirements = JSON.parse(row.software_requirements || '[]');
                        } catch (parseErr) {
                            console.warn(`Error parsing software_requirements for ID ${row.id}:`, parseErr.message);
                            formulario.software_requirements = [];
                        }
                        
                        try {
                            formulario.clients = row.clients ? JSON.parse(row.clients) : [];
                        } catch (parseErr) {
                            console.warn(`Error parsing clients for ID ${row.id}:`, parseErr.message);
                            formulario.clients = [];
                        }
                        
                        return formulario;
                    });
                    resolve(formularios);
                } catch (error) {
                    console.error('Error processing formularios:', error);
                    reject(new Error('Error procesando datos de formularios: ' + error.message));
                }
            }
        });
    });
}

// Función para obtener un formulario por ID
function getFormularioById(id) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM formularios WHERE id = ?
        `, [id], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null);
            } else {
                // Parsear JSON strings
                const formulario = {
                    ...row,
                    trainings: JSON.parse(row.trainings),
                    software_requirements: JSON.parse(row.software_requirements),
                    clients: row.clients ? JSON.parse(row.clients) : []
                };
                resolve(formulario);
            }
        });
    });
}

// Función para actualizar un formulario
function updateFormulario(id, formData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            UPDATE formularios 
            SET employee_number = ?, full_name = ?, email_personal = ?, rol = ?, department = ?, start_date = ?, 
                hardware = ?, hardware_brand = ?, hardware_model = ?, hardware_serial = ?, hardware_accessories = ?,
                trainings = ?, software_requirements = ?, clients = ?, observations = ?, status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, centro_costos = ?, tipo_contrato = ?
            WHERE id = ?
        `);
        
        stmt.run([
            formData.employeeNumber || null,
            formData.fullName,
            formData.emailPersonal || null,
            formData.rol || null,
            formData.department,
            formData.startDate,
            formData.hardware,
            formData.hardwareBrand || null,
            formData.hardwareModel || null,
            formData.hardwareSerial || null,
            formData.hardwareAccessories || null,
            JSON.stringify(formData.trainings),
            JSON.stringify(formData.softwareRequirements),
            JSON.stringify(formData.clients || []),
            formData.observations || null,
            formData.status || 'Requerimiento inicial',
            formData.updatedBy || 'Sistema',
            formData.centroCostos || null,
            formData.tipoContrato || null,
            id
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id, ...formData });
            }
        });
        
        stmt.finalize();
    });
}

// Función para aprobar un formulario (cambiar status)
function aprobarFormulario(id, nuevoStatus, aprobadoPor) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            UPDATE formularios 
            SET status = ?, aprobado_por = ?, fecha_aprobacion = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run([nuevoStatus, aprobadoPor, id], function(err) {
            if (err) {
                reject(err);
            } else {
                // Obtener el formulario completo actualizado para las notificaciones
                db.get(`
                    SELECT * FROM formularios WHERE id = ?
                `, [id], function(err, row) {
                    if (err) {
                        console.error('[DB] Error obteniendo formulario actualizado:', err);
                        resolve({ id, status: nuevoStatus, aprobadoPor });
                    } else if (row) {
                        // Parsear JSON strings
                        const formularioCompleto = {
                            ...row,
                            trainings: JSON.parse(row.trainings || '[]'),
                            software_requirements: JSON.parse(row.software_requirements || '[]'),
                            clients: row.clients ? JSON.parse(row.clients) : []
                        };
                        resolve(formularioCompleto);
                    } else {
                        resolve({ id, status: nuevoStatus, aprobadoPor });
                    }
                });
            }
        });
        
        stmt.finalize();
        
        // Opción alternativa: usar el ID del servicio de email directamente
        // return emailService.sendStatusNotification(formulario, statusActual, nuevoStatus);
    });
}

// Función para eliminar un formulario
function deleteFormulario(id) {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM formularios WHERE id = ?
        `, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ deleted: this.changes > 0 });
            }
        });
    });
}

// Funciones CRUD para clientes

// Obtener todos los clientes
function getAllClientes() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM clientes ORDER BY nombre ASC
        `, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Obtener un cliente por ID
function getClienteById(id) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM clientes WHERE id = ?
        `, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Crear nuevo cliente
function insertCliente(clienteData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO clientes (nombre, descripcion, activo)
            VALUES (?, ?, ?)
        `);
        
        stmt.run([
            clienteData.nombre,
            clienteData.descripcion || null,
            clienteData.activo !== undefined ? clienteData.activo : 1
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    id: this.lastID,
                    nombre: clienteData.nombre,
                    descripcion: clienteData.descripcion,
                    activo: clienteData.activo !== undefined ? clienteData.activo : 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
        });
        
        stmt.finalize();
    });
}

// Actualizar cliente
function updateCliente(id, clienteData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            UPDATE clientes 
            SET nombre = ?, descripcion = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run([
            clienteData.nombre,
            clienteData.descripcion || null,
            clienteData.activo !== undefined ? clienteData.activo : 1,
            id
        ], function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject(new Error('Cliente no encontrado'));
            } else {
                resolve({
                    id: id,
                    nombre: clienteData.nombre,
                    descripcion: clienteData.descripcion,
                    activo: clienteData.activo !== undefined ? clienteData.activo : 1,
                    updated_at: new Date().toISOString()
                });
            }
        });
        
        stmt.finalize();
    });
}

// Eliminar cliente
function deleteCliente(id) {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM clientes WHERE id = ?
        `, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ deleted: this.changes > 0 });
            }
        });
    });
}

// Funciones CRUD para software

// Obtener todos los software
function getAllSoftware() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM software ORDER BY categoria ASC, nombre ASC
        `, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Obtener un software por ID
function getSoftwareById(id) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM software WHERE id = ?
        `, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Crear nuevo software
function insertSoftware(softwareData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO software (nombre, descripcion, categoria, activo)
            VALUES (?, ?, ?, ?)
        `);
        
        stmt.run([
            softwareData.nombre,
            softwareData.descripcion || null,
            softwareData.categoria || null,
            softwareData.activo !== undefined ? softwareData.activo : 1
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    id: this.lastID,
                    nombre: softwareData.nombre,
                    descripcion: softwareData.descripcion,
                    categoria: softwareData.categoria,
                    activo: softwareData.activo !== undefined ? softwareData.activo : 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
        });
        
        stmt.finalize();
    });
}

// Actualizar software
function updateSoftware(id, softwareData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            UPDATE software 
            SET nombre = ?, descripcion = ?, categoria = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run([
            softwareData.nombre,
            softwareData.descripcion || null,
            softwareData.categoria || null,
            softwareData.activo !== undefined ? softwareData.activo : 1,
            id
        ], function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject(new Error('Software no encontrado'));
            } else {
                resolve({
                    id: id,
                    nombre: softwareData.nombre,
                    descripcion: softwareData.descripcion,
                    categoria: softwareData.categoria,
                    activo: softwareData.activo !== undefined ? softwareData.activo : 1,
                    updated_at: new Date().toISOString()
                });
            }
        });
        
        stmt.finalize();
    });
}

// Eliminar software
function deleteSoftware(id) {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM software WHERE id = ?
        `, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ deleted: this.changes > 0 });
            }
        });
    });
}

module.exports = {
    db,
    insertFormulario,
    getAllFormularios,
    getFormularioById,
    updateFormulario,
    aprobarFormulario,
    deleteFormulario,
    getAllClientes,
    getClienteById,
    insertCliente,
    updateCliente,
    deleteCliente,
    getAllSoftware,
    getSoftwareById,
    insertSoftware,
    updateSoftware,
    deleteSoftware
};
