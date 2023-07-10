import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
// import { createServer } from 'http';
import { Server } from 'socket.io';
dotenv.config();
const app = express();

let users=[];

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)
app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);
connectDB();
const PORT = process.env.PORT || 9000;
const server=app.listen(PORT, () => console.log(`Server Started on port ${PORT} 🚀`))

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
            console.log("New User is here",users);
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

    socket.off('setup', () => {
        console.log('Socket disconnected 🔥');
        socket.emit('updateUserStatus',users);
        socket.leave(userData.id);
    });

    socket.on('disconnect', ()=>{
        console.log(socket.id);
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