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
let nuevoUsuario
let messages = [];
io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado");

    // Escuchar cuando un nuevo usuario se conecta
    socket.on("newUser", (userName) => {
        nuevoUsuario = userName
        console.log(`${userName} se ha conectado`);
        io.emit("userConnected", userName);
    });

    // Envía el historial de mensajes al cliente recién conectado
    socket.emit("messagesLogs", messages);

    socket.on("message", data => {
        messages.push(data);
        io.emit("messagesLogs", messages); //  Envía los mensajes a todos los clientes
    });
});
