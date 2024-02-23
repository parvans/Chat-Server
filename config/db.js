import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

import CONFIG from './configData.js';
export const connectDB = async () => {
    try {
        // const conn = await mongoose.connect(CONFIG.MONGO_CLOUD_URI);
        const conn = await mongoose.connect(CONFIG.db_url);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }

}