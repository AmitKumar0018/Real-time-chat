import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import {io} from 'socket.io-client'


const backEndUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backEndUrl

export const AuthContext = createContext()

export const AuthProvider = ({children})=>{

const [token, settoken] = useState(localStorage.getItem("token"))
const [AuthUser, setAuthUser] = useState(null)
const [onlineUsers, setonlineUsers] = useState([])
const [socket, setsocket] = useState(null)

//check if user is authenticated and if so set the user data and connect the socket 
const checkAuth = async()=>{
  try {
    const {data} = await axios.get("/api/auth/check")
    if(data.success){
      setAuthUser(data.user)
      connectSocket(data.user)
    }
  } catch (error) {
    toast.error(error.message)
  }
}

//login function to handle user authentication and socket connection
const login = async(state,credentials) =>{
 try {
  const {data} = await axios.post(`/api/auth/${state}`,credentials)
  if(data.success){
    setAuthUser(data.userData)
    connectSocket(data.userData)
    axios.defaults.headers.common["token"] = data.token
    settoken(data.token)
    localStorage.setItem("token",data.token)
    toast.success(data.message)
  }else{
    toast.error(data.message)
  }
 } catch (error) {
  toast.error(error.message)
 }
}

//logout function to handle user logout and socket discoonection
const logout = async()=>{
  localStorage.removeItem("token")
  settoken(null)
  setAuthUser(null)
  setonlineUsers([])
  axios.defaults.headers.common["token"] = null
  toast.success("Logged out successfully")
  socket.disconnect()
}

//update profile fuction to handle user profile updates
const updateProfiles = async(body)=>{
  try {
    const {data} = await axios.put("/api/auth/update-profile",body)
    if(data.success){
      setAuthUser(data.user)
      toast.success("Profile Updated Succesfully")
    }
  } catch (error) {
    toast.error(error.message)
  }
}

//connect socket function to handle socket connection and online user updates
const connectSocket = (userData)=>{
  if(!userData || socket?.connected) return
  const newSocket = io(backEndUrl,{
    query:{
      userId : userData._id
    }
  })
  newSocket.connect()
  setsocket(newSocket)

  newSocket.on("getOnlineUsers",(userIds)=>{
   setonlineUsers(userIds)
  })
}

useEffect(()=>{
if(token){
  axios.defaults.headers.common["token"] = token
}
checkAuth()
},[])

  const value = {
    axios,AuthUser,onlineUsers,socket,login,logout,updateProfiles
  }

  return(
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
}