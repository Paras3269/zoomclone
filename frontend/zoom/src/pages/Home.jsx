import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import  '../App.css'
import { IconButton,Button, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore'
import { AuthContext } from '../contexts/AuthContext';
function Home() {
let navigate = useNavigate();
const [meetingCode,setMeetingCode] = useState("");

const {addToUserHistory} = useContext(AuthContext);



    let handleJoinVideoCall = async()=>{
        await addToUserHistory(meetingCode)
        console.log("hello from home.jsz")
        navigate(`/${meetingCode}`)
    }


  return (
    <>
    
    <div className="navBar">
        <div style={{display:"flex",alignItems:"center"}}>
            <h2>Apna Video Call</h2>
        </div>
        <div style={{display:"flex",alignItems:"center"}}>
            <IconButton onClick={()=>navigate("/history")}>
                <RestoreIcon/>
            </IconButton>
                <p>History</p>
            <Button
            onClick={()=>{
                localStorage.removeItem("token")
                navigate("/auth")
            }}
            >Logout</Button>
        </div>
    </div>
    <div className="meetContainer">
        <div className="leftPanel">
            <h2 style={{marginRight:"20px"}}>Enter Meeting Code  </h2>
            <div style={{display:"flex",gap:'20px'}}>
                <TextField onChange={e => setMeetingCode(e.target.value)} id='outlined-basic' variant="outlined"/>
                    <Button onClick={ handleJoinVideoCall} variant='contained'>Join</Button>
            </div>
        </div>
    <div className='rightPanel'>
  <img srcSet='/logo3.png' alt=''/>
    </div>
    </div>
    
    </>
  )
}

export default withAuth(Home)
