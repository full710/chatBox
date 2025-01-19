const socket = io();
let user;
const chatBox = document.getElementById("chatBox");
const log = document.getElementById("messagesLogs");
const sendBtn = document.getElementById("sendBtn");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");

// Inicializar el Picker de Emoji Mart
const picker = new EmojiMart.Picker({
  data: window.EmojiMart.data,  // Usar los datos de Emoji Mart cargados
  onEmojiSelect: (emoji) => {
    chatBox.value += emoji.native;  // Agregar el emoji al chat box
    emojiPicker.style.display = "none"; // Ocultar el selector de emojis
  }
});

// Agregar el picker al DOM (fuera de la interfaz)
emojiPicker.appendChild(picker);

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
  socket.emit("newUser", user); // Emitir el nombre de usuario inmediatamente
});

// Enviar mensaje al hacer clic en el botón de enviar
sendBtn.addEventListener("click", () => {
  if (chatBox.value.trim().length > 0) {
    socket.emit("message", { user: user, message: chatBox.value });
    chatBox.value = "";
  }
});

// Mostrar y ocultar el selector de emojis
emojiBtn.addEventListener("click", () => {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
});

// Listener para el evento 'keyup' en el chat box
chatBox.addEventListener("keyup", (event) => {
  if (event.key === "Enter" && chatBox.value.trim().length > 0) {
    socket.emit("message", { user: user, message: chatBox.value });
    chatBox.value = "";
  }
});

// Mostrar mensajes nuevos en tiempo real
socket.on("newMessage", (data) => {
  log.innerHTML += `${data.user}: ${data.message} <br>`;
  log.scrollTop = log.scrollHeight; // Scroll hacia abajo
});

// Mostrar mensaje de usuario conectado
socket.on("userConnected", (userName) => {
  const userConnectedMessage = `<p><em>${userName} se ha conectado, molestalo/a</em></p>`;
  log.innerHTML += userConnectedMessage;
  log.scrollTop = log.scrollHeight;
});

const buzzBtn = document.getElementById("buzzBtn");

// Enviar zumbido al servidor
buzzBtn.addEventListener("click", () => {
  socket.emit("buzz", user); // Enviamos el zumbido con el nombre del usuario
});

// Recibir el zumbido y ejecutar la animación
socket.on("receiveBuzz", (userName) => {
  // Mostrar un mensaje que indique el zumbido
  const buzzMessage = `<p><em>${userName} te envió un zumbido 🔔</em></p>`;
  log.innerHTML += buzzMessage;
  log.scrollTop = log.scrollHeight;

  // Aplicar animación al contenedor del chat
  const chatContainer = document.getElementById("chatContainer"); // Cambia el ID al contenedor principal
  chatContainer.classList.add("shake");

  // Quitar la animación después de 1 segundo
  setTimeout(() => {
    chatContainer.classList.remove("shake");
  }, 1000);
});
