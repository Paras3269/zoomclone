import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import '../Video.css'
import { Button, TextField } from '@mui/material';
const server_url = import.meta.env.VITE_SERVER;


import { io } from "socket.io-client";


const peerConfigconnections ={
    "iceServers" :[
        {"urls":"stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeet() {
    const connections = useRef({});
  
    const socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    let[videoAvailable,setVideoAvailable] = useState(true);
    let [audioAvailable,setAudioAvailable] = useState(true);
    let [video ,setVideo] = useState();
    let [audio,setAudio] = useState();
    let[screen,setScreen] = useState();
    let[showModel,setShowModel]  = useState();
    let[screenAvailable,setScreenAvailable]  = useState();
    let[messages,setMessages] = useState([]);
    let[message,setMessage] = useState("");
    let[newMessage,setNewMessage] = useState(0);
    let[askForUsername,setAskUsername] = useState(true);
    let[username,setUsername] = useState("");
    const videoRef = useRef([]);
    let[videos,setVideos] = useState([]);

      
    // if(isChrome() === false){

    // }

    const getPermissions = async() =>{
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true})

            if(videoPermission){
                setVideoAvailable(true);
            }else{
                setVideoAvailable(false);
            }
            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true})

            if(audioPermission){
                setAudioAvailable(true);
            }else{
                setAudioAvailable(false);
            }
     
            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }
    
            if(videoAvailable || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable , audio:audioAvailable})
                if(userMediaStream){
                    window.localStream = userMediaStream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream
                    }
                }
            }

            
        } catch (error) {
            console.log(error)
        }
    }

 useEffect(()=>{
     getPermissions();
 },[])

 let getUserMediaSuccess = ( stream) =>{
 
    try {
        window.localStream.getTracks().forEach(track => track.stop())
    } catch (error) {
        console.log(error)
    }
    
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    
    for(let id in connections.current){
        if(id === socketIdRef.current) continue
        const senders = connections.current[id].getSenders();
       window.localStream.getTracks().forEach(track => {
    const existingSender = senders.find(
        sender => sender.track && sender.track.kind === track.kind
    );

    if (existingSender) {
        existingSender.replaceTrack(track);
    } else {
        connections.current[id].addTrack(track, window.localStream);
    }
});
       
  if(connections.current[id].signalingState == "stable"){
        connections.current[id].createOffer().then((description)=>{
            connections.current[id].setLocalDescription(description)
            .then(()=>{
                socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections.current[id].localDescription}))

            }).catch(e=>console.log(e))
        })
    }else{
        console.log("Peer not stable ,skippinf offer for ",id)
    }
    }

    stream.getTracks().forEach(track => track.onended = () =>{
        setVideo(false);
        setAudio(false);
  
    try{

        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
    }catch(e){
        console.log(e)
    }

     let blackSilence = (...args) => new MediaStream([black(...args),silence()])
                    window.localStream = blackSilence();
                   localVideoRef.current.srcObject  = window.localStream;
                
    for (let id in connections.current) {
          window.localStream.getTracks().forEach(track => {
  connections.current[id].addTrack(track, window.localStream)
})
               

                connections.current[id].createOffer().then((description) => {
                    connections.current[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections.current[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        
      })

    
    
 }

let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator()
    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false})
}

let black = ({width = 640,height = 480} = {} ) =>{
   let canvas = Object.assign(document.createElement("canvas"),{width,height})

   canvas.getContext('2d').fillRect(0,0,width,height);
   let stream = canvas.captureStream();
   return Object.assign(stream.getVideoTracks()[0],{enabled:false})
}



 let getUserMedia = () =>{
    if((video && videoAvailable) || (audio && audioAvailable)){
        navigator.mediaDevices.getUserMedia({video:video,audio:audio})
        .then( getUserMediaSuccess)
        .catch((e)=>console.log(e))
    }else{
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop())
        } catch (e) {
            
        }
    }
 }

 useEffect(()=>{
  if(video != undefined && audio != undefined){
    getUserMedia();
  }
 },[audio,video])

 let gotMessageFromServer = (fromId,message) => {
    var signal = JSON.parse(message)
console.log(signal)
    if(fromId != socketIdRef.current){
        if(signal.sdp){
            connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
                if(signal.sdp.type === "offer"){
                    connections.current[fromId].createAnswer()
                    .then((description)=>{ return connections.current[fromId].setLocalDescription(description)})
                    .catch(e=>console.log(e))
                   
                    .then(()=>{ socketRef.current.emit("signal",fromId,JSON.stringify({"sdp":connections.current[fromId].localDescription}))})
                    .catch(e=>console.log(e))
                    
                }
            }).catch(e=>console.log(e))
        }

    
    if(signal.ice){
        connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
        .then(()=>{console.log("ice added")})
        .catch(e=>console.log(e))
    }
 }}

 let addMessage = () =>{

 }

 let connectToSocketServer = () =>{
    socketRef.current = io.connect(server_url,{secure:false})

    socketRef.current.on('signal',gotMessageFromServer)

    socketRef.current.on('connect', ()=>{
        socketRef.current.emit('join-call',window.location.href)
       

        socketIdRef.current = socketRef.current.id 

        socketRef.current.on('chat-message',addMessage)

        socketRef.current.on("user-left",(id)=>{
            setVideos((videos)=>videos.filter((video)=>video.socketId !== id))
        })

         
        socketRef.current.on("user-joined",(id,clients)=>{
            clients.forEach((socketListId)=>{
             if(socketListId === socketIdRef.current) return;
             if(connections.current[socketListId] )return;

                connections.current[socketListId]  = new RTCPeerConnection(peerConfigconnections.current)

                connections.current[socketListId].onicecandidate = (event) =>{
                    
                    if(event.candidate != null){
                        socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}))
                         
                    }
                }

                
               connections.current[socketListId].ontrack = (event) => {
                console.log(event.streams[0].getVideoTracks());

    setVideos(prevVideos => {
        const exists = prevVideos.find(
            video => video.socketId === socketListId
        );

        if (exists) {
            return prevVideos.map(video =>
                video.socketId === socketListId
                    ? { ...video, stream: event.streams[0] }
                    : video
            );
        } else {
            return [
                ...prevVideos,
                {
                    socketId: socketListId,
                    stream: event.streams[0],
                    autoPlay: true,
                    playsInline: true
                }
            ];
        }
    });
};


                if(window.localStream != undefined && window.localStream != null){
                     
       window.localStream.getTracks().forEach(track => {
         connections.current[socketListId].addTrack(track,window.localStream)
});
                }else{
                    let blackSilence = (...args) => new MediaStream([black(...args),silence()])
                    if(!videoAvailable){
                    window.localStream = blackSilence();}
                         window.localStream.getTracks().forEach(track=>{
            connections.current[socketListId].addTrack(track,window.localStream)
        })
                }
            })

            if(id === socketIdRef.current){
                
                for (let id2 in connections.current){
                    if(id2 === socketIdRef.current) continue
                        connections.current[id2].createOffer().then((description)=>{
                          return  connections.current[id2].setLocalDescription(description)})
                            .then(()=>{
                                socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections.current[id2].localDescription}))
                            })
                            .catch(e => console.log(e))
                        
                    
                }
            }
        })
    })
 }


 let getMedia = () =>{
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
 }
 let connect= () =>{
    setAskUsername(false);
    getMedia();
 }
for(let  i = 0;i<=videos.length;i++){
   console.log( videos[i])
}
   
  return (
    <>
    <div>
        {askForUsername === true ? 
        <div>

         <h2>Enter into Lobby</h2>
         <TextField id="outlined-basic" label="Username" value={username} variant='outlined'
         onChange={(e)=>setUsername(e.target.value)} />
         <Button variant='contained' onClick={connect}>Connect</Button>

         <div>
            <video ref={localVideoRef}  autoPlay muted></video>
            </div>
        </div> :<>
      
     <video ref={localVideoRef}  autoPlay muted></video>
       
   
         <div>
        
            {videos.map((video,index)=>{
               if(video.socketId === socketIdRef.current){
                return null;
               }
             return (
                <div key={video.socketId}>
                    <h2>{video.socketId}</h2>
                   
                    <video
                    
                    data-socket={video.socketId}
                    ref={ref=>{
                        if(ref && video.stream){
                            ref.srcObject = video.stream;
                        }
                    }}
                    autoPlay  playsInline
                    ></video>
                </div>)
        })}</div>
    
        </>}
    </div>
    
    </>

  )
}
