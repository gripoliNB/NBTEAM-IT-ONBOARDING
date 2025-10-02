const bcrypt = require('bcryptjs');

// Configuración de usuarios del sistema
const users = [
           {
               id: 1,
               username: 'admin',
               password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
               role: 'admin',
               fullName: 'Administrador del Sistema',
               email: 'admintest@nbteamconsulting.com',
               createdAt: new Date().toISOString()
           },
           {
               id: 2,
               username: 'hr',
               password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
               role: 'hr',
               fullName: 'Equipo de Recursos Humanos',
               email: 'hrtest@nbteamconsulting.com',
               createdAt: new Date().toISOString()
           },
           {
               id: 3,
               username: 'it',
               password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
               role: 'it',
               fullName: 'Equipo de IT',
               email: 'ittest@nbteamconsulting.com',
               createdAt: new Date().toISOString()
           },
    {
        id: 4,
        username: 'solicitante',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'solicitante',
        fullName: 'Gerencia General',
        email: 'gerenciatest@nbteamconsulting.com',
        createdAt: new Date().toISOString()
    }
];

// Función para encontrar usuario por username
function findUserByUsername(username) {
    return users.find(user => user.username === username);
}

// Función para encontrar usuario por ID
function findUserById(id) {
    return users.find(user => user.id === parseInt(id));
}

// Función para verificar contraseña
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Función para crear hash de contraseña
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Función para crear nuevo usuario
async function createUser(userData) {
    const { username, password, role, fullName, email } = userData;
    
    // Verificar si el usuario ya existe
    if (findUserByUsername(username)) {
        throw new Error('El usuario ya existe');
    }
    
    // Crear hash de la contraseña
    const hashedPassword = await hashPassword(password);
    
    // Crear nuevo usuario
    const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword,
        role,
        fullName,
        email,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    return newUser;
}

// Función para obtener todos los usuarios (sin contraseñas)
function getAllUsers() {
    return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
}

// Función para actualizar usuario
async function updateUser(id, userData) {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
    }
    
    const user = users[userIndex];
    
    // Actualizar campos permitidos
    if (userData.fullName) user.fullName = userData.fullName;
    if (userData.email) user.email = userData.email;
    if (userData.role) user.role = userData.role;
    
    // Si se proporciona nueva contraseña, hashearla
    if (userData.password) {
        user.password = await hashPassword(userData.password);
    }
    
    users[userIndex] = user;
    return user;
}

// Función para eliminar usuario
function deleteUser(id) {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
    }
    
    // No permitir eliminar el usuario admin
    if (users[userIndex].username === 'admin') {
        throw new Error('No se puede eliminar el usuario administrador');
    }
    
    return users.splice(userIndex, 1)[0];
}

module.exports = {
    users,
    findUserByUsername,
    findUserById,
    verifyPassword,
    hashPassword,
    createUser,
    getAllUsers,
    updateUser,
    deleteUser
};





