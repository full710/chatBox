const socket = io();
let user;
const chatBox = document.getElementById("chatBox");

// Solicitar el nombre de usuario con SweetAlert2
Swal.fire({
    title: "Identifícate",
    input: "text",
    text: "Ingrese un usuario para identificarse en el chat",
    inputValidator: (value) => {
        return !value && "Necesitas escribir un nombre para continuar";
    },
    allowOutsideClick: false
}).then(result => {
    user = result.value;
    console.log(user); 
});

chatBox.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        if (chatBox.value.trim().length > 0) {
            // Enviar el mensaje al servidor
            socket.emit("message", { user: user, message: chatBox.value });
            chatBox.value = "";
        }
    }
});

// Listener para mensajes
socket.on("messagesLogs", data => {
    const log = document.getElementById("messagesLogs");
    let mensajes = "";
    data.forEach(mensaje => {
        mensajes += `${mensaje.user}: ${mensaje.message} <br>`;
    });
    log.innerHTML = mensajes; // o log.textContent = mensajes; si no necesitas HTML.
});
