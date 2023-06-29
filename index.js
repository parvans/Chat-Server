import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
const app = express();
dotenv.config();
app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);
const PORT = process.env.PORT || 6060;
app.listen(PORT, () => console.log(`Server Started on port ${PORT} 🚀`));
