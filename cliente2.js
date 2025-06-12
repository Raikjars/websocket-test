const WebSocket = require('ws');

// Crear conexión al servidor
const client = new WebSocket('ws://localhost:8080');

client.on('open', () => {
    console.log('Cliente 2 conectado al servidor');
    
    // Enviar un array diferente al del primer cliente
    const miArray = [false, true, false, true, false];
    client.send(JSON.stringify({
        type: 'array',
        array: miArray
    }));
});

client.on('message', (data) => {
    const mensaje = JSON.parse(data);
    if (mensaje.type === 'resultado') {
        console.log('Cliente 2 - Array combinado recibido:', mensaje.array);
    } else {
        console.log('Cliente 2 - Mensaje recibido:', mensaje);
    }
});

client.on('error', (error) => {
    console.error('Error en la conexión del Cliente 2:', error);
}); 