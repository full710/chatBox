import express from "express"
import viewsRouter from "./routes/views.router.js"
import { engine } from "express-handlebars"
import { Server } from "socket.io"
const app = express()
const PUERTO = 8080

app.use(express.json())
app.use(express.static("./src/public"))
app.engine("handlebars", engine())
app.set("view engine","handlebars")
app.set("views", "./src/views")

app.use("/", viewsRouter)


const httpServer = app.listen(PUERTO, ()=>{
    console.log("Escuchando desde puerto 8080");
})

const io = new Server(httpServer)

let message = []
io.on("connection", (socket)=>{
    socket.on("message",data => {
        message.push(data)
        io.emit("messagesLogs", message)
    })
})