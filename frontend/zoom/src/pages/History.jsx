import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card  from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home'
import { IconButton } from '@mui/material';





export default function History() {

    const {getHistoryOfUser} = useContext(AuthContext);

    const [meetings,setMeetings] = useState([])

    const routeTo = useNavigate();
    useEffect(()=>{
    const fetchHistory= async()=>{
        try {
            const history = await getHistoryOfUser();
            setMeetings(history);

        } catch (error) {
            
        }
    }
    fetchHistory();
    },[])

let formatDate = (dateString)=>{
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2,"0");
    const month = (date.getMonth()+1).toString().padStart(2,"0")
    const year = date.getFullYear();

    return`${day}/${month}/${year}`
}

  return (
    <div>
        <IconButton onClick={()=>{
            routeTo("/home")
        }}>
            <HomeIcon/>
        </IconButton>
       
        { (meetings.length !== 0 ? 
            meetings.map((e,i)=>{
                console.log(e)
                return(
                    < div key={i}>
                    <Box  sx={{ minWidth: 275 }}>
      <Card variant="outlined">
 <CardContent>
    <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
      Meeting Code
    </Typography>

    <Typography variant="h5" component="div">
      {e.meetingCode}
    </Typography>

    <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
      User: {e.user_id}
    </Typography>
    <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
      User: {formatDate(e.date)}
    </Typography>
  </CardContent>

 

        
      </Card>
    </Box>
                    </div>
                )
            }):<></>
        )}
    </div>
  )
}
