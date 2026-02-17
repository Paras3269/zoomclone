import React from 'react'
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';
export default function LandingPage() {

const router = useNavigate();

  return (
    <div className='landingPageContainer'>
     <nav>
        <div className='navHeader'><h2>Apna Videocall</h2></div>
        <div className='navlist'>
          <p onClick={()=>{
            const meetCode = prompt("Enter Meeting Code:");
            if(meetCode){

              router(`${meetCode}`);
            }
          }}>Join as Guest</p>
          <p onClick={()=>{
            router('/auth')
          }}>Register</p>
          <div onClick={()=>{
            router('/auth')
          }} role='button'>
            <p>Login</p>
          </div>
        </div>
     </nav>

    <div className="landingMainContainer">
      <div>
        <h1><span style={{color:"#FF9839"}}>Connect</span> with Your loved Ones</h1>
        <p>Conver a distance by Apna Video Call</p>
        <div role='button'>
          <Link to={"/auth"}>Get Started</Link>
        </div>
      </div>
      <div>
        <img src='/mobile.png' />
      </div>
    </div>




    </div>
  )
}
