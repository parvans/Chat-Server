import mongoose from 'mongoose';

export const User= mongoose.model(
    'User',
    {
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
        }
    },{
        timestamps:true
    });