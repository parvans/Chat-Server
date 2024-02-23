import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloud from "../utils/cloudinary.js";
import { ReE, ReS, firstNameSecondNameCapForReg, isCurrectPassword, isEmail, isEmpty, isNull, too } from "../services/util.service.js";
import HttpStatus from 'http-status';
import { ISVALIDID } from "../services/validation.js";
import CONFIG from '../config/configData.js';

export const register = async (req, res) => {
    let body=req.body;
    let err
    let fields = ['name','email','password'];
    let inVaildFields = fields.filter(x => isNull(body[x]));

    if(!isEmpty(inVaildFields)){
        return ReE(res,{ message: `Please enter required fields ${inVaildFields}!.` }, HttpStatus.BAD_REQUEST);
    }
    body.email = String(body.email).toLowerCase();
    const {name,email,password} = body;
    if(String(name).trim().length<3){

        return ReE(res, { message: "Enter vaild first name with more then 3 character!." }, HttpStatus.BAD_REQUEST);

    }
    if (!isEmail(email)) {

        return ReE(res, { message: "Enter vaild email detail!." }, HttpStatus.BAD_REQUEST);

    }

    // if(!isCurrectPassword(password)){

    //     return ReE(res, { message: "Enter vaild password detail!" }, HttpStatus.BAD_REQUEST);
    // }

    let checkEmail
    [err, checkEmail] = await too(User.findOne({ email: email }));
    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(!isNull(checkEmail)){
        return ReE(res, { message: "Email id already taken!." }, HttpStatus.BAD_REQUEST);
    }
    let passwordHash
    [err, passwordHash] = await too(bcrypt.hash(password,bcrypt.genSaltSync(10)));
    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(passwordHash)){
        return ReE(res, { message: "Something went wrong to genrate password!." }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // let userCreate = new User({
    //     name: name,
    //     email: email,
    //     password: passwordHash
    // })


    let userCreate,optionsUser = {
        name: firstNameSecondNameCapForReg(String(name)),
        email: String(email).toLowerCase(),
        password: passwordHash
    };
    [err,userCreate] = await too(User.create(optionsUser));
    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(userCreate)){
        return ReE(res, { message: `Something went wrong ${err}!` }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await userCreate.save();
    return ReS(res, { message: "User created successfully!." }, HttpStatus.OK);


    // const { name, email, password } = req.body;
    // const image=req.body.data
    // try {
    //     const exUser=await User.findOne({email})
    //     if(exUser) return res.status(400).json({message:'user already exists'})
    //     const hash=await bcrypt.hash(password,10)
    //     // const uploadResponse = await cloud.uploader.upload(image,{upload_preset:"chatbot"})
    //     const newUser = new User({
    //         name,
    //         email,
    //         password:hash,
    //         // image:uploadResponse.secure_url,
    //     })
    //     await newUser.save()
    //     res.status(201).json({message:'user created successfully'})
    // } catch (error) {
    //     res.status(500).json({message:error.message})
    // }
}

export const login = async (req, res) => {
    let body = req.body;
    let err;
    let fields = ['email','password'];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if(!isEmpty(inVaildFields)){
        return ReE(res,{ message: `Please enter required fields ${inVaildFields}!.` }, HttpStatus.BAD_REQUEST);
    }
    body.email = String(body.email).toLowerCase();
    const {email,password} = body;

    let checkUser,optionsUser = {
        email: email
    };
    [err, checkUser] = await too(User.findOne(optionsUser));

    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(checkUser)){
        return ReE(res, { message: "User does not exist!." }, HttpStatus.BAD_REQUEST);

    }

    let matchPassword
    [err, matchPassword] = await too(bcrypt.compare(password,checkUser.password));
    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if(!matchPassword){
        return ReE(res, { message: "Password does not match!." }, HttpStatus.BAD_REQUEST);
    }

    let token = jwt.sign({id:checkUser._id},CONFIG.jwt_secret,{expiresIn:CONFIG.jwt_expiration});

    if(isNull(token)){
        return ReE(res, { message: "Something went wrong to genrate token!." }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ReS(res, { message: `Welcome ${checkUser.name}`, token: token }, HttpStatus.OK);

    // const { email, password } = req.body;
    // try {
    //     const theUser=await User.findOne({email})
    //     if(!theUser) return res.status(400).json({message:'user does not exist'})
    //     const match=await bcrypt.compare(password,theUser.password)
    //     if(!match) return res.status(400).json({message:'incorrect password'})
    //     const token=jwt.sign({id:theUser._id},process.env.JWT_SECRET,{expiresIn:'30d'})
        // res.header("auth-token", token).json({ message: "login successfully", token: token });
    // } catch (error) {
    //     res.status(500).json({message:error.message})
    // }
}

export const getUser = async (req, res) => {
    let err;
    let user = req.user.id;
    let search = req.query.search;

    let getUsers,optionsUser = search ?{
        $or:[
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },       
        ]
    } : {};
    [err, getUsers] = await too(User.find(optionsUser).select('-password').where('_id').ne(user));

    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ReS(res, { data: getUsers }, HttpStatus.OK);
    // const keyword = req.query.search
    // ? {
    //     $or: [
    //         { name: { $regex: req.query.search, $options: 'i' } },
    //         { email: { $regex: req.query.search, $options: 'i' } },
    //     ]
    // }: {};

    // try {
    //     const findUser = await User.find(keyword).find({ _id: { $ne: req.user.id } }).select('-password')
    //     res.status(200).json({ data: findUser })
    // } catch (error) {
    //     res.status(500).json({message:error.message})
    // }
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

export const userEdit = async (req, res) => {
    const userId = req.user.id
    try {
        const userExist = await User.findById(userId)
        if (!userExist) return res.status(400).json({ message: "User does not exist" })
        await User.findByIdAndUpdate({ _id: userId },{ $set: req.body },{ new: true })
        res.status(200).json({ message: "User updated successfully" })
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
}

// export const userProfileUpdate = async (req, res) => {
//     const userId = req.user.id
//     const image=req.body.data
//     try {
//         const userExist = await User.findById(userId)
//         if (!userExist) return res.status(400).json({ message: "User does not exist" })
//         const deleteOldImage=await cloud.uploader.destroy(userExist.image)
//         const uploadResponse = await cloud.uploader.upload(image,{upload_preset:"chatbot"})
//         await User.findByIdAndUpdate({ _id: userId },{ $set: {image:uploadResponse.secure_url} },{ new: true })
//         res.status(200).json({ message: "User updated successfully" })
//     } catch (error) {
//         return res.status(400).json({message:error.message})
//     }
// }

export const userProfile = async (req, res) => {
    let err;
    let user = req.user.id;
    if(isNull(user)){
        return ReE(res, { message: "Something went wrong to get user profile!." }, HttpStatus.BAD_REQUEST);
    }

    if(!ISVALIDID(user)){
        return ReE(res, { message: "Something went wrong to get user profile!." }, HttpStatus.BAD_REQUEST);
    }

    let getUser,optionsUser = {
        _id: user
    };

    [err, getUser] = await too(User.findOne(optionsUser).select('-password'));

    if(err){
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(getUser)){
        return ReE(res, { message: "User does not exist!." }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res,{message:'User profile',data:getUser},HttpStatus.OK)

    // const userId = req.user.id
    // try {
    //     const userExist = await User.findById(userId)
    //     if (!userExist) return res.status(400).json({ message: "User does not exist" })
    //     res.status(200).json({ data: userExist })
    // } catch (error) {
    //     return res.status(400).json({message:error.message})
    // }
}
