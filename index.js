import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import configureSocket from './config/configureSocket.js';
dotenv.config();
const app = express();


app.use(cors());
app.use(bodyParser.json({limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "Welcome to CHAT API service 🍎" });
});

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)
connectDB();
const PORT = process.env.PORT || 9000;
const server=app.listen(PORT, () => console.log(`Server Started on port ${PORT} 🚀`))

// socket.io
configureSocket(server);