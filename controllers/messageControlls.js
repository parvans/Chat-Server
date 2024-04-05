import Chat from "../models/Chat.js"
import Message from "../models/Message.js"
import User from "../models/User.js"
import { ReE, ReS, isEmpty, isNull, too } from "../services/util.service.js";
import { ISVALIDID } from "../services/validation.js";
import { encryptData } from "../services/encryptDecrypt.js";
import HttpStatus from "http-status";
export const sendMessage = async (req, res) => {
    let err;
    let body = req.body;
    let user = req.user.id;
    let fields = ['chatId', 'content'];
    let inValidFields = fields.filter((field) => isNull(body[field]));

    if(!isEmpty(inValidFields)){

        return ReE(res,{ message: `Please enter required fields ${inValidFields}!.` },HttpStatus.BAD_REQUEST);

    }

    let {chatId,content}=body;

    if(isNull(user)){

        return ReE(res,{ message: `Please provide user!.` },HttpStatus.BAD_REQUEST);

    }

    if(!ISVALIDID(user)){

        return ReE(res,{ message: `Please provide valid user!.` },HttpStatus.BAD_REQUEST);

    }

    let checkUser,optionsForCheckUser = { _id: user };

    [err, checkUser] = await too(User.findOne(optionsForCheckUser));

    if(err){

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);

    }

    if(isNull(checkUser)){

        return ReE(res,{ message: `User not found!.` },HttpStatus.BAD_REQUEST);

    }

    if(isNull(chatId)){

        return ReE(res,{ message: `Please provide chatId!.` },HttpStatus.BAD_REQUEST);

    }

    if(!ISVALIDID(chatId)){
            
        return ReE(res,{ message: `Please provide valid chatId!.` },HttpStatus.BAD_REQUEST);
    
    }

    let checkChat,optionsForCheckChat = { 
        _id: chatId,
        users: { $in: [user] }
    };

    [err, checkChat] = await too(Chat.findOne(optionsForCheckChat));


    if(err){

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);

    }

    if(isNull(checkChat)){

        return ReE(res,{ message: `Chat not found or you not in this chat!.` },HttpStatus.BAD_REQUEST);

    }

    //Let's encrypt the message

    let encryptedMessage;

    // if(!isNull(content)){
    //     encryptedMessage = encryptData(String(content));
    // }else{
    //     encryptedMessage = null;
    // }

    let newMessage, optionsForNewMessage = {
        sender: user,
        content: content,
        chat: chatId
    };

    [err, newMessage] = await too(Message.create(optionsForNewMessage));

    if(err){

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);

    }

    if(isNull(newMessage)){

        return ReE(res,{ message: `Message not created!.` },HttpStatus.BAD_REQUEST);

    }

    newMessage = await newMessage.populate('sender','name email image');
    newMessage = await newMessage.populate('chat');
    newMessage = await User.populate(newMessage,{
        path:'chat.users',
        select:'name email image'
    });

    let updateChat,optionsForUpdateChat = {
        latestMessage: newMessage
    };

    [err, updateChat] = await too(Chat.findByIdAndUpdate(chatId,optionsForUpdateChat));
    if(err){

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);

    }

    if(isNull(updateChat)){
            
        return ReE(res,{ message: `Chat not updated!.` },HttpStatus.BAD_REQUEST);
    
    }

    return ReS(res,{message: `Message sent successfully!.`,data: newMessage },HttpStatus.OK);



    // const {chatId,content}=req.body
    // // if(!chatId||!content){
    // //     return res.status(400).json({message:'All Fields Are Required'})
    // // } 
    // var newMessage={
    //     sender:req.user.id,
    //     content:content,
    //     chat:chatId
    // }
    // try {
    //     var message=await Message.create(newMessage)
    //     message=await message.populate('sender','name email image')
    //     message=await message.populate('chat')
    //     message=await User.populate(message,{
    //         path:'chat.users',
    //         select:'name email image'
    //     })
    //     await Chat.findByIdAndUpdate(chatId,{latestMessage:message})
    //     return res.status(201).json({data:message})
    // } catch (error) {
    //     return res.status(500).json({message:error})
    // }
}
export const allMessage = async (req, res) => {
    const {chatId}=req.params
    try {
        const message=await Message.find({chat:chatId}).populate('sender','name email image').populate('chat')
        return res.status(200).json({data:message})
    } catch (error) {
        return res.status(500).json({message:error})
    }
}
export const readMessage = async (req, res) => {
    let err;
    let user = req.user.id;
    let body = req.body;
    let readby = {};
    let fields = ["chatId", "messgId"];
  
    let inVaildFields = fields.filter((x) => isNull(body[x]));
  
    if (!isEmpty(inVaildFields)) {
  
      return ReE(res,{ message: `Please enter required fields ${inVaildFields}!.` },HttpStatus.BAD_REQUEST);
  
    }
  
    const { chatId, messgId } = body;
  
    if (isNull(user)) {
  
      return ReE(res,{ message: `Please provide user!.` },HttpStatus.BAD_REQUEST);
  
    }
  
    if (!ISVALIDID(user)) {
  
      return ReE(res,{ message: `Please provide valid user!.` },HttpStatus.BAD_REQUEST);
      
    }

    let checkUser,optionsForUser = {
        _id: user
    };
    
    [err, checkUser] = await too(User.findOne(optionsForUser).select('-password'));

    if (err) {

        return ReE(res, err, HttpStatus.BAD_REQUEST);
    
    }
    
    if (isNull(checkUser)) {
    
        return ReE(res, { message: `User not found!.` }, HttpStatus.BAD_REQUEST);
    
    }

    readby = {
        user: checkUser._id,
        // readAt: new Date()
    };

    if (isNull(chatId)) {

        return ReE(res,{ message: `Please provide chat id  !.` },HttpStatus.BAD_REQUEST);
    
    }
    
    if (!ISVALIDID(chatId)) {
    
        return ReE(res,{ message: `Please provide valid chat id  !.` },HttpStatus.BAD_REQUEST);
    
    }

    let checkChat,optionsForChat = {
        _id: chatId,
    };
    
    [err, checkChat] = await too(Chat.findOne(optionsForChat));

    if (err) {

        return ReE(res, err, HttpStatus.BAD_REQUEST);

    }

    if (isNull(checkChat)) {

        return ReE(res, { message: `Chat not found!.` }, HttpStatus.BAD_REQUEST);

    }

    if (isNull(messgId)) {

        return ReE(res,{ message: `Please provide message id !.` },HttpStatus.BAD_REQUEST);

    }

    if (!ISVALIDID(messgId)) {

        return ReE(res,{ message: `Please provide valid message id !.` },HttpStatus.BAD_REQUEST);

    }

    let checkMessage,optionsForMessage = {
        _id: messgId,
        chat: checkChat._id,
    };

    [err, checkMessage] = await too(Message.findOne(optionsForMessage).populate('readBy','-password').populate('chat'));
    

    if (err) {

        return ReE(res, err, HttpStatus.BAD_REQUEST);

    }

    if (isNull(checkMessage)) {

        return ReE(res, { message: `Message not found!.` }, HttpStatus.BAD_REQUEST);

    }

    if(checkUser._id.toString() === checkMessage.sender.toString()){

        return ReE(res,{ message: `You can't read your own message!.` },HttpStatus.BAD_REQUEST);

    }

    // console.log(checkMessage);
    if (!isNull(checkMessage.readBy) && !isEmpty(checkMessage.readBy)) {

        let checkUserRead = checkMessage.readBy?.filter((x) => x.user !== checkUser._id);
        // console.log(checkUserRead);
    
        if (!isEmpty(checkUserRead)) {
    
          return ReE(res,{ message: `Message already read!.` },HttpStatus.BAD_REQUEST);
    
        }
    
    }

    let updateMessage,optionsForUpdateMesg = {
        _id: checkMessage._id,
    };

    let readArray = [];
    if (!isNull(checkMessage.readBy) && !isEmpty(checkMessage.readBy)) {

    readArray = [...checkMessage.readBy, readby];

    } else {

    readArray.push(readby);

    }

    [err, updateMessage] = await too(Message.findByIdAndUpdate(optionsForUpdateMesg,{$set:{readBy: readArray}},{new:true}));

    if (err) {

    return ReE(res, err, HttpStatus.BAD_REQUEST);

    }

    if (isNull(updateMessage)) {

    return ReE(res,{ message: `Message not updated!.` },HttpStatus.BAD_REQUEST);

    }
    
    return ReS(res,{ message: `Message read successfully!`,data:checkMessage },HttpStatus.OK);



    
    
  
}
export const editMessage = async (req, res) => {
    const {id}=req.params
    try {
        const existMessage=await Message.findById(id)
        if(!existMessage){
            return res.status(404).json({message:'Message Not Found'})
        }
        const edit=await Message.findByIdAndUpdate(id,{$set:req.body},{new:true})
        .populate('sender','name email image').populate('chat')
        return res.status(200).json({data:edit})
    } catch (error) {
        return res.status(500).json({message:error})
    }
}