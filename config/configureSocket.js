import { Server } from "socket.io";
import Message from "../models/Message.js";
const configureSocket = (server) => {
    let users=[];

    let onlineUsers = [], onlineUserForSend = [];

    const addNewUser = (userId, socketId) => {
        !onlineUsers.some((user) => user.userId === userId ) && userId !== null && 
        onlineUsers.push({ userId , socketId });
        !onlineUserForSend.some((user) => user.userId === userId && user.socketId === socketId ) && userId !== null && 
        onlineUserForSend.push({ userId , socketId });
    };  

    const io = new Server(server, {
        pingTimeout: 60000,
        cors: 'http://localhost:3001',
    });
    
    io.on('connection', (socket) => {
        console.log('Socket connected🔥',socket.id);
        socket.on('setup',(userData)=>{
            socket.join(userData.id);
    
            // if(!users.some(user => user.userId === userData.id)){
            //     users.push({userId: userData.id, socketId: socket.id});
            //     //console.log("New User is here",users);
            // }
            // console.log(socket.id);
    
            // io.emit('get-users',users);
            socket.emit('connected')
        })

        socket.on("newUser",(user)=>{
            if(user){
                addNewUser(user, socket.id);
            } 
            io.emit("getUsers", onlineUsers);
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
        
        socket.on("readMessage",(recieve)=>{
            try {
                let chat = recieve.chat; 
                if (!chat.users) return console.log("chat.users not defined");
                chat.users.forEach((user) => { 
                    if (user != recieve.sender) return;
                    let founSocketId = users.filter((item)=>item.userId == user) 
                    if(!founSocketId)  return;
                    founSocketId.map((item)=>{
                        // console.log(item.socketId);
                        if(!item.socketId) return;
                        io.to(item.socketId).emit("readMessageSender", recieve);   
                    })
                });
                //multiple recevier login means update read message all
                let getUsers = users.filter((item)=>recieve.loginUserId === item.userId)
                if(!getUsers) return;
                getUsers.map((item)=>{
                    if(!item.socketId) return;
                    io.to(item.socketId).emit("readMessageUser", recieve);   
                })
            } catch (error) {
                console.log("error in new msg socket",error);
            } 
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

        socket.on('allMessageSeen', async(chatId) => {
            try {
                const read=await Message.updateMany({chat:chatId},{status:"seen"}).populate('sender','name email').populate('chat')
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