const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const { insertFormulario, getAllFormularios, getFormularioById, updateFormulario, aprobarFormulario, deleteFormulario, getAllClientes, getClienteById, insertCliente, updateCliente, deleteCliente, getAllSoftware, getSoftwareById, insertSoftware, updateSoftware, deleteSoftware } = require('./database');
const authConfig = require('./auth-config');
const emailService = require('./aws-email-service');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());

// Middleware para limpiar cookies de NextAuth en cada request
app.use((req, res, next) => {
    // Limpiar cookies de NextAuth si existen
    if (req.headers.cookie) {
        const cookies = req.headers.cookie;
        if (cookies.includes('next-auth.session-token') || cookies.includes('next-auth.csrf-token')) {
            // Limpiar cookies de NextAuth del header
            req.headers.cookie = cookies
                .split(';')
                .filter(cookie => !cookie.trim().startsWith('next-auth.'))
                .join(';');
        }
    }
    next();
});

// Configuración de sesiones
app.use(session({
    secret: 'nbteam-it-onboarding-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    name: 'nbteam.sid', // Nombre único para evitar conflictos
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'strict' // Más estricto para evitar conflictos
    }
}));

// Middleware para verificar autenticación
app.use((req, res, next) => {
    // Si la petición es para un archivo HTML y no es login.html
    if (req.path.endsWith('.html') && req.path !== '/login.html') {
        // Verificar autenticación
        if (req.session && req.session.userId) {
            const user = authConfig.findUserById(req.session.userId);
            if (user) {
                req.user = user;
                return next();
            }
        }
        
        // Si no está autenticado, redirigir a login
        return res.redirect('/login.html');
    }
    next();
});

// Servir archivos estáticos (excepto HTML que se maneja arriba)
app.use(express.static('.', {
    index: false // No servir index.html automáticamente
}));

// Middleware de autenticación
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        const user = authConfig.findUserById(req.session.userId);
        if (user) {
            req.user = user;
            return next();
        }
    }
    
    // Si es una petición HTML, redirigir a login
    if (req.accepts('html')) {
        return res.redirect('/login.html');
    }
    
    // Si es una petición API, devolver JSON
    res.status(401).json({ success: false, error: 'No autorizado' });
}

// Middleware para verificar rol específico
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'No autorizado' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'No tienes permisos para esta acción' });
        }
        
        next();
    };
}

// Middleware para verificar si el usuario puede editar un formulario
function canEditFormulario(req, res, next) {
    const formularioId = req.params.id;
    const user = req.user;
    
    // Si es admin, puede editar cualquier formulario
    if (user.role === 'admin') {
        return next();
    }
    
    // Si es solicitante, NO puede editar formularios existentes
    if (user.role === 'solicitante') {
        return res.status(403).json({ 
            success: false, 
            error: 'Los solicitantes solo pueden crear nuevos formularios, no editarlos' 
        });
    }
    
    // Si es IT, solo puede editar formularios en "Fase de asignación"
    if (user.role === 'it') {
        getFormularioById(formularioId)
            .then(formulario => {
                if (!formulario) {
                    return res.status(404).json({ success: false, error: 'Formulario no encontrado' });
                }
                
                if (formulario.status !== 'Fase de asignación') {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Solo puedes editar formularios en "Fase de asignación"' 
                    });
                }
                
                next();
            })
            .catch(error => {
                res.status(500).json({ success: false, error: 'Error verificando formulario' });
            });
        return;
    }
    
    // Si es HR, puede editar formularios en "Requerimiento inicial" y "Fase de contratación"
    if (user.role === 'hr') {
        getFormularioById(formularioId)
            .then(formulario => {
                if (!formulario) {
                    return res.status(404).json({ success: false, error: 'Formulario no encontrado' });
                }
                
                if (!['Requerimiento inicial', 'Fase de contratación'].includes(formulario.status)) {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'No puedes editar formularios en "Fase de asignación"' 
                    });
                }
                
                next();
            })
            .catch(error => {
                res.status(500).json({ success: false, error: 'Error verificando formulario' });
            });
        return;
    }
    
    res.status(403).json({ success: false, error: 'No tienes permisos para editar formularios' });
}

// Middleware para verificar rol de administrador
function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, error: 'Acceso denegado. Se requiere rol de administrador.' });
}

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/index.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/list.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'list.html'));
});

app.get('/edit.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'edit.html'));
});

app.get('/hardware-report.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'hardware-report.html'));
});

app.get('/users.html', requireAuth, requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'users.html'));
});

app.get('/clientes.html', requireAuth, requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'clientes.html'));
});

app.get('/software.html', requireAuth, requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'software.html'));
});

// API Routes de Autenticación

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' });
        }
        
        const user = authConfig.findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }
        
        const isValidPassword = await authConfig.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }
        
        // Crear sesión
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        
        // Devolver información del usuario (sin contraseña)
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ 
            success: true, 
            message: 'Login exitoso',
            user: userWithoutPassword
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Error al cerrar sesión' });
        }
        res.json({ success: true, message: 'Sesión cerrada exitosamente' });
    });
});

// Verificar autenticación
app.get('/api/auth/check', (req, res) => {
    if (req.session && req.session.userId) {
        const user = authConfig.findUserById(req.session.userId);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return res.json({ 
                success: true, 
                authenticated: true,
                user: userWithoutPassword
            });
        }
    }
    res.json({ success: true, authenticated: false });
});

// API Routes Protegidas

// Obtener todos los formularios
app.get('/api/formularios', requireAuth, async (req, res) => {
    try {
        const formularios = await getAllFormularios();
        res.json({ success: true, data: formularios });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener solicitudes del usuario actual (DEBE ir ANTES de /:id)
app.get('/api/formularios/my-requests', requireAuth, async (req, res) => {
    try {
        const username = req.user.username;
        console.log(`[MY-REQUESTS] Usuario solicitando sus formularios: ${username}`);
        
        // Obtener todos los formularios
        const formularios = await getAllFormularios();
        console.log(`[MY-REQUESTS] Total formularios encontrados: ${formularios.length}`);
        
        // Filtrar solo los formularios creados por el usuario actual
        const userRequests = formularios.filter(formulario => {
            console.log(`[MY-REQUESTS] Verificando formulario ${formulario.id}: ${formulario.created_by} === ${username}`);
            return formulario.created_by === username;
        });
        
        console.log(`[MY-REQUESTS] Solicitudes del usuario: ${userRequests.length}`);
        
        // Ordenar por fecha de creación descendente (más recientes primera)
        userRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json({ 
            success: true, 
            data: userRequests,
            message: `Encontradas ${userRequests.length} solicitudes para ${username}`
        });
        
    } catch (error) {
        console.error('[MY-REQUESTS] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener un formulario por ID
app.get('/api/formularios/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const formulario = await getFormularioById(id);
        
        if (!formulario) {
            return res.status(404).json({ success: false, error: 'Formulario no encontrado' });
        }
        
        res.json({ success: true, data: formulario });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Crear nuevo formulario
app.post('/api/formularios', requireAuth, async (req, res) => {
    try {
        const { employeeNumber, fullName, emailPersonal, rol, department, startDate, hardware, hardwareBrand, hardwareModel, hardwareSerial, hardwareAccessories, trainings, softwareRequirements, clients, observations, createdBy, centroCostos, tipoContrato } = req.body;
        
        // Validaciones
        if (!fullName || !department || !startDate || !hardware) {
            return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
        }
        
        if (!trainings || trainings.length === 0) {
            return res.status(400).json({ success: false, error: 'Debe seleccionar al menos una capacitación' });
        }
        
        if (!softwareRequirements || softwareRequirements.length === 0) {
            return res.status(400).json({ success: false, error: 'Debe seleccionar al menos un software requerido' });
        }
        
        const formData = {
            employeeNumber,
            fullName,
            emailPersonal,
            rol,
            department,
            startDate,
            hardware,
            hardwareBrand,
            hardwareModel,
            hardwareSerial,
            hardwareAccessories,
            trainings,
            softwareRequirements,
            clients: clients || [],
            observations: observations || '',
            createdBy: createdBy || req.session.user?.username || 'Usuario',
            centroCostos,
            tipoContrato
        };
        
        const nuevoFormulario = await insertFormulario(formData);
        
        // Enviar notificación por email al crear nuevo formulario
        try {
            console.log(`[EMAIL] Nuevo formulario creado - ID: ${nuevoFormulario.id}`);
            const emailResult = await emailService.sendNewFormNotification(nuevoFormulario);
            
            if (emailResult.success) {
                console.log('[EMAIL] ✅ Notificaciones de nueva solicitud enviadas:', emailResult.results?.map(r => r.recipient || r.name));
            } else {
                console.error('[EMAIL] ❌ Error enviando notificaciones de nueva solicitud:', emailResult.message);
            }
        } catch (emailError) {
            console.error('[EMAIL] Error crítico enviando notificaciones de nueva solicitud:', emailError.message);
            // No bloqueamos la operación principal si falla el email
        }
        
        res.status(201).json({ 
            success: true, 
            data: nuevoFormulario, 
            message: 'Formulario creado exitosamente. Notificaciones enviadas al equipo.'
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Actualizar formulario
app.put('/api/formularios/:id', requireAuth, canEditFormulario, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { employeeNumber, fullName, emailPersonal, rol, department, startDate, hardware, hardwareBrand, hardwareModel, hardwareSerial, hardwareAccessories, trainings, softwareRequirements, clients, observations, updatedBy, centroCostos, tipoContrato } = req.body;
        
        // Validaciones
        if (!fullName || !department || !startDate || !hardware) {
            return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
        }
        
        if (!trainings || trainings.length === 0) {
            return res.status(400).json({ success: false, error: 'Debe seleccionar al menos una capacitación' });
        }
        
        if (!softwareRequirements || softwareRequirements.length === 0) {
            return res.status(400).json({ success: false, error: 'Debe seleccionar al menos un software requerido' });
        }
        
        const formData = {
            employeeNumber,
            fullName,
            emailPersonal,
            rol,
            department,
            startDate,
            hardware,
            hardwareBrand,
            hardwareModel,
            hardwareSerial,
            hardwareAccessories,
            trainings,
            softwareRequirements,
            clients: clients || [],
            observations: observations || '',
            updatedBy: updatedBy || req.session.user?.username || 'Usuario',
            centroCostos,
            tipoContrato
        };
        
        const formularioActualizado = await updateFormulario(id, formData);
        res.json({ success: true, data: formularioActualizado, message: 'Formulario actualizado exitosamente' });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Aprobar formulario (cambiar status)
app.post('/api/formularios/:id/aprobar', requireAuth, requireRole(['admin', 'hr', 'it']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nuevoStatus } = req.body;
        const user = req.user;
        
        // Validar que el status sea válido
        const statusValidos = ['Requerimiento inicial', 'Fase de contratación', 'Fase de asignación'];
        if (!statusValidos.includes(nuevoStatus)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Status inválido. Debe ser: Requerimiento inicial, Fase de contratación, o Fase de asignación' 
            });
        }
        
        // Obtener el formulario actual para validar transiciones
        const formularioActual = await getFormularioById(id);
        if (!formularioActual) {
            return res.status(404).json({ success: false, error: 'Formulario no encontrado' });
        }
        
        // Validar transiciones de status según el rol
        const statusActual = formularioActual.status;
        
        if (user.role === 'hr') {
            // HR puede aprobar de "Requerimiento inicial" a "Fase de contratación"
            if (statusActual === 'Requerimiento inicial' && nuevoStatus === 'Fase de contratación') {
                // Permitir
            } else if (statusActual === 'Fase de contratación' && nuevoStatus === 'Requerimiento inicial') {
                // Permitir retroceso
            } else {
                return res.status(403).json({ 
                    success: false, 
                    error: 'HR solo puede aprobar de "Requerimiento inicial" a "Fase de contratación"' 
                });
            }
        } else if (user.role === 'it') {
            // IT puede aprobar de "Fase de contratación" a "Fase de asignación"
            if (statusActual === 'Fase de contratación' && nuevoStatus === 'Fase de asignación') {
                // Permitir
            } else if (statusActual === 'Fase de asignación' && nuevoStatus === 'Fase de contratación') {
                // Permitir retroceso
            } else {
                return res.status(403).json({ 
                    success: false, 
                    error: 'IT solo puede aprobar de "Fase de contratación" a "Fase de asignación"' 
                });
            }
        }
        // Admin puede hacer cualquier transición
        
        const resultado = await aprobarFormulario(id, nuevoStatus, user.username);
        
        // Enviar notificación por email
        try {
            console.log(`[EMAIL] Enviando notificación: ${statusActual} -> ${nuevoStatus}`);
            const emailResult = await emailService.sendStatusNotification(formularioActual, statusActual, nuevoStatus);
            
            if (emailResult.success) {
                console.log('[EMAIL] ✅ Notificaciones enviadas exitosamente:', emailResult.results?.map(r => r.recipient));
            } else {
                console.error('[EMAIL] ❌ Error enviando notificaciones:', emailResult.message);
            }
        } catch (emailError) {
            console.error('[EMAIL] Error crítico en servicio de email:', emailError.message);
            // No bloqueamos la operación principal si falla el email
        }
        
        res.json({ 
            success: true, 
            data: resultado, 
            message: `Formulario aprobado y movido a "${nuevoStatus}". ${emailResult?.success ? 'Notificaciones enviadas.' : 'Problema con notificaciones por email.'}` 
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener estados disponibles para un usuario
app.get('/api/formularios/estados-disponibles', requireAuth, (req, res) => {
    const user = req.user;
    let estadosDisponibles = [];
    
    if (user.role === 'admin') {
        estadosDisponibles = ['Requerimiento inicial', 'Fase de contratación', 'Fase de asignación'];
    } else if (user.role === 'hr') {
        estadosDisponibles = ['Requerimiento inicial', 'Fase de contratación'];
    } else if (user.role === 'it') {
        estadosDisponibles = ['Fase de contratación', 'Fase de asignación'];
    }
    
    res.json({ success: true, data: estadosDisponibles });
});

// Eliminar formulario
app.delete('/api/formularios/:id', requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await deleteFormulario(id);
        
        if (!result.deleted) {
            return res.status(404).json({ success: false, error: 'Formulario no encontrado' });
        }
        
        res.json({ success: true, message: 'Formulario eliminado exitosamente' });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Routes de Gestión de Usuarios (Solo Administradores)

// Obtener todos los usuarios
app.get('/api/users', requireAuth, requireAdmin, (req, res) => {
    try {
        const users = authConfig.getAllUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Crear nuevo usuario
app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { username, password, role, fullName, email } = req.body;
        
        if (!username || !password || !role || !fullName || !email) {
            return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
        }
        
        const newUser = await authConfig.createUser({ username, password, role, fullName, email });
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({ success: true, data: userWithoutPassword, message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Actualizar usuario
app.put('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { fullName, email, role, password } = req.body;
        
        const updatedUser = await authConfig.updateUser(id, { fullName, email, role, password });
        const { password: _, ...userWithoutPassword } = updatedUser;
        
        res.json({ success: true, data: userWithoutPassword, message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Eliminar usuario
app.delete('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deletedUser = authConfig.deleteUser(id);
        const { password: _, ...userWithoutPassword } = deletedUser;
        
        res.json({ success: true, data: userWithoutPassword, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Routes de Gestión de Clientes (Solo Administradores)

// Obtener todos los clientes
app.get('/api/clientes', requireAuth, requireAdmin, async (req, res) => {
    try {
        const clientes = await getAllClientes();
        res.json({ success: true, data: clientes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener clientes activos (para formularios)
app.get('/api/clientes/activos', requireAuth, async (req, res) => {
    try {
        const clientes = await getAllClientes();
        const clientesActivos = clientes.filter(cliente => cliente.activo);
        res.json({ success: true, data: clientesActivos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener un cliente por ID
app.get('/api/clientes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await getClienteById(id);
        
        if (!cliente) {
            return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
        }
        
        res.json({ success: true, data: cliente });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Crear nuevo cliente
app.post('/api/clientes', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ success: false, error: 'El nombre del cliente es requerido' });
        }
        
        const nuevoCliente = await insertCliente({ nombre, descripcion, activo });
        res.status(201).json({ success: true, data: nuevoCliente, message: 'Cliente creado exitosamente' });
        
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ success: false, error: 'Ya existe un cliente con ese nombre' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// Actualizar cliente
app.put('/api/clientes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nombre, descripcion, activo } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ success: false, error: 'El nombre del cliente es requerido' });
        }
        
        const clienteActualizado = await updateCliente(id, { nombre, descripcion, activo });
        res.json({ success: true, data: clienteActualizado, message: 'Cliente actualizado exitosamente' });
        
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ success: false, error: 'Ya existe un cliente con ese nombre' });
        } else if (error.message.includes('Cliente no encontrado')) {
            res.status(404).json({ success: false, error: 'Cliente no encontrado' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// Eliminar cliente
app.delete('/api/clientes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await deleteCliente(id);
        
        if (!result.deleted) {
            return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
        }
        
        res.json({ success: true, message: 'Cliente eliminado exitosamente' });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API Routes de Gestión de Software (Solo Administradores)

// Obtener todos los software
app.get('/api/software', requireAuth, requireAdmin, async (req, res) => {
    try {
        const software = await getAllSoftware();
        res.json({ success: true, data: software });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener software activos (para formularios)
app.get('/api/software/activos', requireAuth, async (req, res) => {
    try {
        const software = await getAllSoftware();
        const softwareActivos = software.filter(s => s.activo);
        res.json({ success: true, data: softwareActivos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener un software por ID
app.get('/api/software/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const software = await getSoftwareById(id);
        
        if (!software) {
            return res.status(404).json({ success: false, error: 'Software no encontrado' });
        }
        
        res.json({ success: true, data: software });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Crear nuevo software
app.post('/api/software', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { nombre, descripcion, categoria, activo } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ success: false, error: 'El nombre del software es requerido' });
        }
        
        const nuevoSoftware = await insertSoftware({ nombre, descripcion, categoria, activo });
        res.status(201).json({ success: true, data: nuevoSoftware, message: 'Software creado exitosamente' });
        
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ success: false, error: 'Ya existe un software con ese nombre' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// Actualizar software
app.put('/api/software/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nombre, descripcion, categoria, activo } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ success: false, error: 'El nombre del software es requerido' });
        }
        
        const softwareActualizado = await updateSoftware(id, { nombre, descripcion, categoria, activo });
        res.json({ success: true, data: softwareActualizado, message: 'Software actualizado exitosamente' });
        
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ success: false, error: 'Ya existe un software con ese nombre' });
        } else if (error.message.includes('Software no encontrado')) {
            res.status(404).json({ success: false, error: 'Software no encontrado' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// Eliminar software
app.delete('/api/software/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await deleteSoftware(id);
        
        if (!result.deleted) {
            return res.status(404).json({ success: false, error: 'Software no encontrado' });
        }
        
        res.json({ success: true, message: 'Software eliminado exitosamente' });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// API para obtener usuarios del sistema
app.get('/api/users', requireAuth, requireRole(['admin']), (req, res) => {
    try {
        const users = authModule.getAllUsers(); // Obtener usuarios sin contraseñas
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('[API-USERS] Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo usuarios del sistema'
        });
    }
});

// API para actualizar email de usuario
app.put('/api/users/:id/email', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }
        
        console.log(`[API-USERS] Actualizando email usuario ${id}: ${email}`);
        
        const updatedUser = await authModule.updateUser(id, { email });
        
        // Remover contraseña de la respuesta
        const { password, ...userWithoutPassword } = updatedUser;
        
        res.json({
            success: true,
            message: 'Email actualizado correctamente',
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('[API-USERS] Error actualizando email:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error actualizando email del usuario'
        });
    }
});

// Función helper para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Endpoint para probar emails (temporal - solo para desarrollo)
app.post('/api/test-email', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const testFormulario = {
            id: 999,
            full_name: 'Usuario de Prueba',
            department: 'IT',
            start_date: '2025-01-15',
            hardware: 'Windows Laptop',
            trainings: ['Workshop 1', 'Workshop 2'],
            software_requirements: ['Software A', 'Software B'],
            created_by: 'solicitante',
            status: 'Requerimiento inicial'
        };
        
        const emailResult = await emailService.sendStatusNotification(
            testFormulario, 
            'Requerimiento inicial', 
            'Fase de contratación'
        );
        
        res.json({
            success: emailResult.success,
            message: emailResult.message,
            details: emailResult.results || [],
            devMode: emailResult.devMode || false
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Verificar configuración de email al iniciar
emailService.verifyEmailConfig().then((result) => {
    if (result.success) {
        if (result.devMode) {
            console.log(`📧 Servicio de email en modo desarrollo (simulado)`);
            console.log(`📝 Para usar emails reales: configura EMAIL_USER y EMAIL_PASS`);
        } else {
            console.log(`📧 Servicio de email configurado correctamente`);
        }
    } else {
        console.log(`⚠️ Problema con configuración de email: ${result.message}`);
        console.log(`📝 Para configurar emails, edita email-service.js con tus credenciales SMTP`);
    }
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
    console.log(`📊 API disponible en http://${HOST}:${PORT}/api`);
    console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
    console.log(`🌐 Acceso desde red: http://[TU-IP]:${PORT}`);
    console.log(`📧 Notificaciones por email: ${process.env.EMAIL_USER ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);
});
