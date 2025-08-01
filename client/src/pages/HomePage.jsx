import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainner from '../components/ChatContainner'
import RightSide from '../components/RightSide'
import { chatContext } from '../context/ChatContext'

const HomePage = () => {
  const { selectedUser } = useContext(chatContext)

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid relative 
        grid-cols-1 
        ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
        <Sidebar />
        <ChatContainner />
        <RightSide />
      </div>
    </div>
  )
}

export default HomePage
