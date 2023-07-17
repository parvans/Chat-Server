import { Server } from "socket.io";
import Message from "../models/Message.js";
let users=[];
const configureSocket = (server) => {
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: 'http://192.168.1.41:3000',
        }
    });
    
    io.on('connection', (socket) => {
        console.log('Socket connected 🔥');
        socket.on('setup',(userData)=>{
            socket.join(userData.id);
    
            if(!users.some(user => user.userId === userData.id)){
                users.push({userId: userData.id, socketId: socket.id});
                //console.log("New User is here",users);
            }
            // console.log(socket.id);
    
            io.emit('get-users',users);
            socket.emit('connected')
        })
    
        
    
        socket.on('join room', (room) => {
            socket.join(room)
            console.log('User Joined Room :',room);
        });
    
        socket.on('typing', (room) =>{
            socket.in(room).emit('typing')
            //  console.log("typing")
            });
        
        socket.on('stop typing', (room) =>{
            socket.in(room).emit('stop typing')
            // console.log("stop typing")
        });
    
        socket.on('new message', (newMessage) => {
            var chat = newMessage.chat;
            if(!chat.users) return console.log('Chat.users not defined');
    
            chat.users.map((user) => {
                if(user._id == newMessage.sender._id)return;
                socket.in(user._id).emit('message received', newMessage); 
            })
        })

        socket.on('messageSend', async(mId) => {
            try {
                const send=await Message.findByIdAndUpdate(mId,{status:"send"}).populate('sender','name email').populate('chat')
                io.emit('messageStatusUpdated',send)
                
            } catch (error) {
                console.log(error);
            }
        })

        socket.on('messageReceived', async(mId) => {
            try {
               const receive= await Message.findByIdAndUpdate(mId,{status:"received"}).populate('sender','name email').populate('chat')
                io.emit('messageStatusUpdated',receive)
                
            } catch (error) {
                console.log(error);
            }
        })

        socket.on('messageSeen', async(mId) => {
            try {
                const read=await Message.findByIdAndUpdate(mId,{status:"seen"}).populate('sender','name email').populate('chat')
                io.emit('messageStatusUpdated',read)
            } catch (error) {
                console.log(error);
            }
        })
        
        socket.off('setup', () => {
            console.log('Socket disconnected 🔥');
            socket.emit('updateUserStatus',users);
            socket.leave(userData.id);
        });
    
        socket.on('disconnect', ()=>{
            // console.log(socket.id);
            users=users.filter((user) => user.socketId !== socket.id);
            // console.log("User is disconnected",users);
            io.emit('get-users',users);
        });
    
        socket.on('offline',()=>{
            users=users.filter((user) => user.socketId !== socket.id);
            // console.log("User is offline",users);
            io.emit('get-users',users);
        })
        
    });
}

export default configureSocket;