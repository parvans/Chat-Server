import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exUser=await User.findOne({email})
        if(exUser) return res.status(400).json({message:'user already exists'})
        const hash=await bcrypt.hash(password,10)
        const newUser = new User({
            name,
            email,
            password:hash
        })
        await newUser.save()
        res.status(201).json({message:'user created successfully'})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const theUser=await User.findOne({email})
        if(!theUser) return res.status(400).json({message:'user does not exist'})
        const match=await bcrypt.compare(password,theUser.password)
        if(!match) return res.status(400).json({message:'incorrect password'})
        const token=jwt.sign({id:theUser._id},process.env.JWT_SECRET,{expiresIn:'1h'})
        res.header("auth-token", token).json({ message: "login successfully", token: token });
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const getUser = async (req, res) => {
    const keyword = req.query.search
    ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ]
    }: {};

    try {
        const findUser = await User.find(keyword).find({ _id: { $ne: req.user.id } }).select('-password')
        res.status(200).json({ data: findUser })
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const verifyEmail = async (req, res) => {
    const { email } = req.body
    let user = await User.findOne({ email })
    if (!user) {
        return res.status(400).json({ message: "User with this email does not exist" })
    } else {
        try {
            // gelerate code
            const otpCode = nanoid(5).toUpperCase()
            // save to db
            // if(user.otpCode){
            user.otp = otpCode
            // }else{
            //     const us=await User.updateOne({email},{$set:{otpCode}})
            //     us.otpCode=otpCode
            // }
            await user.save()

            // send email by using nodemailer

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                // port: 993,
                secure: false,
                auth: {
                    // type:"login",
                    user: "parvansajeevan666@gmail.com",
                    pass: "ksjwpghjpcqjvmwq"
                }

            });

            const mailOption = {
                from: "parvansajeevan666@gmail.com",
                to: email,
                subject: "Password Reset mail ⚒️",
                text: `Your OTP is : ${otpCode}`,
                // html: "Hello worlds"
            }
            transporter.sendMail(mailOption, (error, info) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log(info)
                }
            });

            res.status(200).json({ message: "Email sent successfully" })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }

}

export const verifyCode = async (req, res) => {
    const {email,otp} = req.body
    let user=await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"Invalid Email"})
    }else{
        try {
            if(user.otp===otp){
                return res.status(200).json({message:"OTP Verified"})
            }else{
                return res.status(400).json({message:"Invalid OTP"})
            }
        } catch (error) {
            return res.status(400).json({message:error.message})
        }
    }
}

export const resetPassword = async (req, res) => {
    const {email,password} = req.body
    let user=await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"Invalid Email"})
    }else{
        const saltRound = 10;
        bcrypt.hash(password, saltRound, (err, hash) => {
            user.password=hash
            user.save()
            return res.status(200).json({message:"Password Changed"})
        })

    }
}
