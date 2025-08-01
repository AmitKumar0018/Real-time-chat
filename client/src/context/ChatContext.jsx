import { useContext, useEffect } from "react";
import { createContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const chatContext = createContext()

export const ChatProvider = ({children})=>{

    const [messages, setmessages] = useState([])
    const [users, setusers] = useState([])
    const [selectedUser, setselectedUser] = useState(null)
    const [unseenMessages, setunseenMessages] = useState({})

    const {socket,axios} = useContext(AuthContext)

    //function to get all users for side bar
    const getUsers = async()=>{
        try {
            const {data} = await axios.get("/api/messages/users")
            if(data.success){
                setusers(data.users)
                setunseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //message to get messages for selected user
    const getMessages = async(userId)=>{
      try {
        const {data} = await axios.get(`/api/messages/${userId}`)
        if(data.success){
            setmessages(data.messages)
        }
      } catch (error) {
         toast.error(error.message)
      }
    }

    //function to send message to selected user
    const sendMessage = async(messageData)=>{
    try {
         const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
     if(data.success){
         setmessages((prevmsg)=>[...prevmsg,data.newMessage])
     }else{
        toast.error(error.message)
     }
    } catch (error) {
        toast.error(error.message)
    }
    }

    //function to subscribe to message for selected user
    const subscribeToMessages = async()=>{
        if(!socket) return

        socket.on("newMessage",(newMessage)=>{
          if(selectedUser && newMessage.senderId === selectedUser._id){
            newMessage.seen = true
            setmessages((prevmsg)=>[...prevmsg,newMessage])
            axios.put(`/api/messages/mark/${newMessage._id}`)
          }else{
            setunseenMessages((prevUnseenmsg)=>({
                ...prevUnseenmsg, [newMessage.senderId]:prevUnseenmsg[newMessage.senderId] ? prevUnseenmsg[newMessage.senderId] + 1 : 1
            }))
          }
        })
    }

    //function to unsubscribe from messages
    const unsubscribeFromMessages = ()=>{
     if(socket) socket.off("newMessage")
    }

    useEffect(()=>{
     subscribeToMessages()
     return ()=> unsubscribeFromMessages()
    },[socket,selectedUser])
 
    const value = {
      messages,users,selectedUser,getMessages,getUsers,sendMessage,setselectedUser,unseenMessages,setunseenMessages
    }

  return(
    <chatContext.Provider value={value}>
        {children}
    </chatContext.Provider>
  )
}