import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

import CONFIG from './configData.js';
export const connectDB = async () => {
    try {
        // const conn = await mongoose.connect(CONFIG.MONGO_CLOUD_URI);
        const conn = await mongoose.connect(CONFIG.dbCloud_url);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
    }

}