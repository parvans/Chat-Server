import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
export const connectDB = async () => {
    try {
        // const conn = await mongoose.connect(process.env.MONGO_CLOUD_URI);
        const conn = await mongoose.connect("mongodb://localhost:27017/chatapp");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }

}