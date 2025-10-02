const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Skip internal (loopback) addresses
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    
    return 'localhost';
}

const ip = getLocalIP();
console.log(`🌐 IP del servidor: ${ip}`);
console.log(`🔗 URL de acceso: http://${ip}:3001`);
console.log(`📱 Acceso desde móviles: http://${ip}:3001`);
console.log(`💻 Acceso desde otros PCs: http://${ip}:3001`);






