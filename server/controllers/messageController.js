import User from '../models/user.js'
import Message from '../models/message.js'
import cloudinary from '../lib/clodinary.js'
import {io,userSocketMap} from '../server.js'


//get all user except logged in user
export const getUserForSideBar = async(req,res)=>{
    try {
        const userId = req.user._id
        const filteredUser = await User.find({_id: {$ne: userId}}).select("-password")

        //count number of messages not seen 
        const unseenMesages = {}
        const promises = filteredUser.map(async(user)=>{
        const messages = await Message.find({senderId:user._id ,receiverId: userId,seen: false})
        if(messages.length > 0){
            unseenMesages[user._id] = messages.length
        }
        })
        await Promise.all(promises)
        res.json({success:true,users:filteredUser,unseenMessages:unseenMesages})
    } catch (error) {
        console.log(error);
        res.json({success:false,Message:error.Message})
    }
}

//get all messages for selected user
export const getmessages = async(req,res)=>{
    try {
        const {id: selectedUserId} = req.params
        const myId = req.user._id

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId:selectedUserId},
                {senderId: selectedUserId, receiverId: myId}
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen:true})
        res.json({success:true,messages})
    } catch (error) {
        console.log(error);
        res.json({success:false,Message:error.Message})
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async(req,res)=>{
    try {
        const {id} = req.params
        await Message.findByIdAndUpdate(id, {seen:true})
        res.json({success:true})
    } catch (error) {
        console.log(error);
        res.json({success:false,Message:error.Message})
    }
}

//send msg to selected user
export const sendMessage = async(req,res)=>{
    try {
        const {text,image} = req.body
        const receiverId = req.params.id
        const senderId = req.user._id

        let imageUrl
        if(image){
            const uploadResponce = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponce.secure_url
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        //emit the new message to receivers socket
       const receiversSocketId = userSocketMap[receiverId]
       if(receiversSocketId){
        io.to(receiversSocketId).emit("newMessage",newMessage)
       }

        res.json({success:true,newMessage})
        
    } catch (error) {
        console.log(error);
        res.json({success:false,Message:error.Message})
    }
}