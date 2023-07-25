const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = require('socket.io')(server, {
    cors: true,
    origin: "http://localhost:5000",
})

const PORT = process.env.Port||5000 ; 
const router = require('./router')
const{addUser,removeUser,getUser,getUsersInRoom} = require('./user')

io.on('connection',(socket)=>{
    socket.on('join',({name,room},callback)=>{
        // console.log(name,room)
        const {error,user}= addUser({id:socket.id , name,room})
        if(error){
            return callback(error)
        }
        socket.emit('message',{user:'admin',text:`${user.name} welcome to room ${user.room}`});
        socket.broadcast.to(user.room).emit('message',{user:'admin ', text:`${user.name} has joined`})
        socket.join(user.room)
        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})

    
        
    })
    socket.on('sendMessage',(message,callback)=>{
        console.log("here")
        let user = getUser(socket.id);
        
        io.to(user.room).emit('message',{user:user.name,text:message})
        
        callback();
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left`})
            io.to(user.room).emit('roomData',{room:user.room ,users:getUsersInRoom(user.id)})
        }
    })
})
app.use(router)

server.listen(PORT,()=>console.log(`Server has started on port ${PORT}`));
