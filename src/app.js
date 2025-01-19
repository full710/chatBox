import express from "express";
import viewsRouter from "./routes/views.router.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";

const app = express();
const PUERTO = 8080;

app.use(express.json());
app.use(express.static("./src/public"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use("/", viewsRouter);

const httpServer = app.listen(PUERTO, () => {
  console.log("Escuchando desde puerto 8080");
});

const io = new Server(httpServer);

// Lista de usuarios conectados
let connectedUsers = [];

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Escuchar cuando un nuevo usuario se conecta
  socket.on("newUser", (userName) => {
    console.log(`${userName} se ha conectado`);
    
    // Agregar el usuario a la lista de conectados
    connectedUsers.push({ id: socket.id, username: userName });
    
    // Emitir la lista de usuarios conectados a todos los clientes
    io.emit("updateUsers", connectedUsers);

    // Notificar a todos los clientes que el nuevo usuario se ha conectado
    io.emit("userConnected", userName);
  });

  // Escuchar y enviar solo el mensaje nuevo a los clientes
  socket.on("message", (data) => {
    io.emit("newMessage", data); // Enviar solo el nuevo mensaje a todos los clientes
  });

  // Escuchar zumbidos
  socket.on("buzz", (userName) => {
    console.log(`${userName} envió un zumbido`);
    io.emit("receiveBuzz", userName); // Reenviar el zumbido a todos los clientes
  });

  // Cuando un usuario se desconecta
  socket.on("disconnect", () => {
      
      // Buscar el usuario desconectado en la lista de usuarios conectados
      const disconnectedUser = connectedUsers.find(user => user.id === socket.id);

      console.log(`Usuario desconectado`);
      
    if (disconnectedUser) {
      // Eliminar el usuario de la lista de conectados
      connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
  
      // Emitir la lista actualizada de usuarios conectados a todos los clientes
      io.emit("updateUsers", connectedUsers);
  
      // Notificar a todos los clientes que un usuario se ha desconectado
      io.emit("userDisconnected", disconnectedUser.username);
    }
  });
});
