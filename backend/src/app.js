import express from "express";
import {createServer} from "node:http";
import {connectToSocket} from "./controllers/socketManger.js";
import {Server} from "socket.io";

import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
const app  = express();
const server = createServer(app);
const io = connectToSocket(server);
import userRoutes from './routes/users.routes.js'
dotenv.config({
    path:"./.env"
})

app.use(cors(
    {
    origin:"*",
    credentials:true
} 
))
app.use(express.json({limit:"40kb"}))
app.use(express.urlencoded({limit:"40kb",extended:true}))
app.use("/api/v1/users",userRoutes);

const start = async () =>{
    const connectDb = await mongoose.connect(`${process.env.MONGO_URL}/zoomClone`);
   console.log(connectDb.connection.host)

    server.listen(process.env.PORT || 8000,()=>{
        console.log("Listing on port 8000")
    });
}



start();