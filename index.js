import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
const app = express();
dotenv.config();
app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);
connectDB();
const PORT = process.env.PORT || 6060;
app.listen(PORT, () => console.log(`Server Started on port ${PORT} 🚀`));
