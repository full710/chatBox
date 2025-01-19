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
let messages = []; // Historial de mensajes

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Escuchar cuando un nuevo usuario se conecta
  socket.on("newUser", (userName) => {
    console.log(`${userName} se ha conectado`);
    io.emit("userConnected", userName);
  });

  // Escuchar y enviar solo el mensaje nuevo a los clientes
  socket.on("message", (data) => {
    messages.push(data); // Guardar el mensaje en el historial
    io.emit("newMessage", data); // Enviar solo el nuevo mensaje a todos los clientes
  });

  socket.on("buzz", (userName) => {
    console.log(`${userName} envió un zumbido`);
    io.emit("receiveBuzz", userName); // Reenviar el zumbido a todos los clientes
  });
  
});
