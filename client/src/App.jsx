import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from 'react-hot-toast'
import {AuthContext} from './context/AuthContext'


const App = () => {

  const {AuthUser} = useContext(AuthContext)
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <Toaster/>
     <Routes>
      <Route path='/' element={AuthUser ? <HomePage/> : <Navigate to="/login"/>}/>
      <Route path='/login' element={!AuthUser ? <LoginPage/> : <Navigate to="/"/>}/>
      <Route path='/profile' element={AuthUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
     </Routes>
    </div>
  )
}

export default App