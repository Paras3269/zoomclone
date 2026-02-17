import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import './App.css'
import { Route,BrowserRouter as Router ,Routes } from 'react-router-dom'
import LandingPage from './pages/Landing.jsx'
import Authentication from './pages/Authentication.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import VideoMeet from './pages/VideoMeet.jsx'
import Home from './pages/Home.jsx'
import History from './pages/History.jsx'
function App(){
  return (
    <>
     <div className='App'>
      <Router>
        <AuthProvider>
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/auth' element={<Authentication/>}/>
          <Route path='/home' element={<Home/>}/>
          <Route path='/history' element={<History/>}/>
          <Route path="/:url" element={<VideoMeet/>}/>
        </Routes>
        </AuthProvider>
      </Router>
     </div>

    </>
  )
}
 

 

export default App
