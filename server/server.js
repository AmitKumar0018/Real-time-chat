import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRouter.js'
import{Server} from 'socket.io'


//create express app and HTTP server
const app = express()
const server = http.createServer(app)

// initialize socket.io server
export const io = new Server(server,{
    cors: {origin: "*"}
})

//store online users
export const userSocketMap = {} //{userId:socetId}

//socket.io connection handler
io.on("connection",(socket)=>{
  const userId = socket.handshake.query.userId
  console.log("user coonected",userId);
  
  if(userId) userSocketMap[userId] = socket.id

  //emit online users to all connected client
  io.emit("getOnlineUsers",Object.keys(userSocketMap))

  socket.on("disconnect",()=>{
    console.log("user disconnected",userId);
    delete userSocketMap[userId]
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
  })
})

//middleware setup
app.use(express.json({limit: "4mb"}))
app.use(cors())

//routes setup
app.use('/api/status',(req,res)=> res.send("server is live"))
app.use('/api/auth',userRouter)
app.use('/api/messages',messageRouter)

//database connection
await connectDB()


if(process.env.NODE_ENV !== "production"){
const PORT = process.env.PORT || 5000
server.listen(PORT , ()=>console.log("server is running on :" + PORT));
}

export default server