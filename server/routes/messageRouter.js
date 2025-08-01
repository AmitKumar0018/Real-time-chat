import express from 'express'
import protectRoutes  from '../middlewares/auth.js'
import {getUserForSideBar,getmessages,markMessageAsSeen, sendMessage} from '../controllers/messageController.js'

const messageRoute = express.Router()

messageRoute.get("/users", protectRoutes, getUserForSideBar)
messageRoute.get("/:id", protectRoutes, getmessages)
messageRoute.put("/mark/:id", protectRoutes, markMessageAsSeen)
messageRoute.post("/send/:id",protectRoutes,sendMessage)

export default messageRoute