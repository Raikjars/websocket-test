const WebSocket = require('ws');

// Crear el servidor WebSocket
const wss = new WebSocket.Server({ port: 8080 });

// Almacenar las conexiones activas
const clients = new Set();

// Función para combinar arrays de booleanos
function combinarArrays(arrays) {
    return arrays.reduce((resultado, array) => {
        return resultado.map((valor, index) => valor || array[index]);
    });
}

wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado');
    clients.add(ws);

    // Enviar mensaje de bienvenida
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Conectado al servidor'
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'array') {
                // Recolectar arrays de todos los clientes
                const arrays = Array.from(clients).map(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        return data.array;
                    }
                    return null;
                }).filter(arr => arr !== null);

                // Combinar los arrays
                const resultado = combinarArrays(arrays);

                // Enviar el resultado a todos los clientes
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'resultado',
                            array: resultado
                        }));
                    }
                });
            }
        } catch (error) {
            console.error('Error al procesar mensaje:', error);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
        clients.delete(ws);
    });
});

console.log('Servidor WebSocket iniciado en el puerto 8080');

// Código del cliente (para probar)
const client = new WebSocket('ws://localhost:8080');

client.on('open', () => {
    console.log('Conectado al servidor');
    
    // Enviar un array de ejemplo
    const miArray = [true, false, true, false, true];
    client.send(JSON.stringify({
        type: 'array',
        array: miArray
    }));
});

client.on('message', (data) => {
    const mensaje = JSON.parse(data);
    if (mensaje.type === 'resultado') {
        console.log('Array combinado recibido:', mensaje.array);
    } else {
        console.log('Mensaje recibido:', mensaje);
    }
});

client.on('error', (error) => {
    console.error('Error en la conexión:', error);
}); 