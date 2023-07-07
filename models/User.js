import mongoose from 'mongoose';

const User= mongoose.model(
    'User',
    new mongoose.Schema({
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true
        },
        otp:{
            type:String,
        },
        isOnline:{
            type:Boolean,
            default:false
        }, 
    },
    {
        timestamps:true
    })
)

export default User;