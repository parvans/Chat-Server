import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js';
dotenv.config();
const app = express();

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/user',userRoutes)
app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);
connectDB();
const PORT = process.env.PORT || 6060;
app.listen(PORT, () => console.log(`Server Started on port ${PORT} 🚀`))
