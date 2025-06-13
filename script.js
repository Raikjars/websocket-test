// Configuración de Ably
const ably = new Ably.Realtime('2r98MA.r42eNQ:v2ef69vFT-SWpLRqt4kuIlcDfPHXoapfDkRgwmFanT4');
const channel = ably.channels.get('canal-prueba');

// Arrays
let myArray = [false, false, false, false, false];
let otherArray = [false, false, false, false, false];
const arraySize = 5;

// Función para agregar logs
function agregarLog(mensaje) {
    const logs = document.getElementById('logs');
    const log = document.createElement('div');
    log.textContent = `${new Date().toLocaleTimeString()}: ${mensaje}`;
    logs.appendChild(log);
    logs.scrollTop = logs.scrollHeight;
}

// Crear botones para los arrays
function crearBotonesArray() {
    const myArrayDiv = document.getElementById('myArray');
    const otherArrayDiv = document.getElementById('otherArray');
    const combinedArrayDiv = document.getElementById('combinedArray');
    
    myArrayDiv.innerHTML = '';
    otherArrayDiv.innerHTML = '';
    combinedArrayDiv.innerHTML = '';

    for (let i = 0; i < arraySize; i++) {
        // Botones para mi array
        const button = document.createElement('button');
        button.className = 'array-button false';
        button.textContent = 'Falso';
        button.onclick = () => toggleValor(i);
        myArrayDiv.appendChild(button);

        // Botones para el array del otro usuario
        const otherButton = document.createElement('button');
        otherButton.className = 'array-button false';
        otherButton.textContent = 'Falso';
        otherButton.disabled = true;
        otherArrayDiv.appendChild(otherButton);

        // Botones para el array combinado
        const combinedButton = document.createElement('button');
        combinedButton.className = 'array-button false';
        combinedButton.textContent = 'Falso';
        combinedButton.disabled = true;
        combinedArrayDiv.appendChild(combinedButton);
    }
}

// Actualizar visualización de los arrays
function actualizarArrays() {
    const myButtons = document.getElementById('myArray').children;
    const otherButtons = document.getElementById('otherArray').children;
    const combinedButtons = document.getElementById('combinedArray').children;

    for (let i = 0; i < arraySize; i++) {
        // Actualizar mi array
        myButtons[i].textContent = myArray[i] ? 'Verdadero' : 'Falso';
        myButtons[i].className = `array-button ${myArray[i]}`;

        // Actualizar array del otro usuario
        otherButtons[i].textContent = otherArray[i] ? 'Verdadero' : 'Falso';
        otherButtons[i].className = `array-button ${otherArray[i]}`;

        // Actualizar array combinado
        const combinedValue = myArray[i] || otherArray[i];
        combinedButtons[i].textContent = combinedValue ? 'Verdadero' : 'Falso';
        combinedButtons[i].className = `array-button ${combinedValue}`;
    }
}

// Cambiar valor de un elemento del array
function toggleValor(index) {
    myArray[index] = !myArray[index];
    actualizarArrays();
    
    // Enviar actualización
    const mensaje = {
        array: myArray,
        clientId: ably.connection.id
    };
    channel.publish('array-update', mensaje);
    agregarLog(`Enviando array: ${JSON.stringify(myArray)}`);
}

// Evento de conexión
ably.connection.on('connected', () => {
    document.getElementById('status').className = 'status connected';
    document.getElementById('status').textContent = 'Conectado';
    agregarLog('✅ Conectado a Ably');
    
    // Enviar array inicial
    const mensaje = {
        array: myArray,
        clientId: ably.connection.id
    };
    channel.publish('array-update', mensaje);
});

ably.connection.on('failed', () => {
    document.getElementById('status').className = 'status disconnected';
    document.getElementById('status').textContent = 'Error de conexión';
    agregarLog('❌ Error de conexión');
});

// Suscripción a actualizaciones de array
channel.subscribe('array-update', (mensaje) => {
    const data = mensaje.data;
    
    // Ignorar mensajes propios
    if (data.clientId === ably.connection.id) {
        return;
    }

    otherArray = data.array;
    actualizarArrays();
    agregarLog(`📨 Array recibido: ${JSON.stringify(data.array)}`);
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    crearBotonesArray();
    actualizarArrays();
    agregarLog('🚀 Iniciando conexión...');
}); 