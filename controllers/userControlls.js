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