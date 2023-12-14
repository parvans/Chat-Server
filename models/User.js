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
        // image:{
        //     type:String,
        //     default:"https://res.cloudinary.com/dgupyenrw/image/upload/v1689912117/chatbot/428-4287240_no-avatar-user-circle-icon-png_yvvvo1.png"
        // },
        password:{
            type:String,
            required:true
        },
        otp:{
            type:String,
        },
    },
    {
        timestamps:true
    })
)

export default User;