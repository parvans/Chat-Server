import Chat from "../models/Chat.js"
import Message from "../models/Message.js"
import User from "../models/User.js"
import { ReE, ReS, isNull, too } from "../services/util.service.js"
import { ISVALIDID } from "../services/validation.js"
import HttpStatus from 'http-status'
export const accessthechat = async (req, res) => {
    const {userId}=req.body
    if(!userId) return res.status(400).json({message:'user id is required'})
    const userEx=await User.findOne({_id:userId})
    if(!userEx) return res.status(400).json({message:'user does not exist'})
    var isTheChat=await Chat.find({
        isGroupChat:false,$and:[
            {users:{$elemMatch:{$eq:req.user.id}}},
            {users:{$elemMatch:{$eq:userId}}}
        ]
    }).populate('users','-password').populate('latestMessage')
    isTheChat=await User.populate(isTheChat,
        {
            path:'latestMessage.sender',
            select:'name email ',
        })
        
        if(isTheChat.length>0){
            return res.status(200).json({data:isTheChat[0]})
        }else{
            var chatData={
                chatName:'sender',
                isGroupChat:false,
                users:[req.user.id,userId],
            }
            try {
                const createTheChat=await Chat.create(chatData)
                const fullChat=await Chat.findOne({_id:createTheChat._id}).populate('users','-password')
                res.status(201).json({data:fullChat})
            } catch (error) {
                res.status(500).json({message:error.message})
            }
        }
}

export const fetchChat = async (req, res) => {
    let err;
    let user = req.user.id;
    if(isNull(user)){

        return ReE(res, {message: "Please provide user"}, HttpStatus.BAD_REQUEST);

    }
    if(!ISVALIDID(user)){

        return ReE(res, {message: "Please provide valid user"}, HttpStatus.BAD_REQUEST);

    }
    let fetchChats,optionsFetch = {
        users: {
            $elemMatch: {
                $eq: user
            }
        }
    };
    [err, fetchChats] = await too(Chat.find(optionsFetch)
    .populate('users','-password')
    .populate('groupAdmin','-password')
    .populate('latestMessage').sort({updatedAt:-1}));

    if(err){
            
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    
    }

    if(isNull(fetchChats)){

        return ReE(res,{ message: `Chat not found!.` },HttpStatus.NOT_FOUND);

    }

    fetchChats = await User.populate(fetchChats,{
        path:'latestMessage.sender',
        select:'name email',
    });

    let fetchArr = [];
    for (let index = 0; index < fetchChats.length; index++) {
        let element = fetchChats[index];
        //unReadMsgCount for login user
        let messgCount = 0;
        let unreadCount,optionsCout = {
            chat: element._id,
            sender: {
                $ne: user
            },

        };

        [err, unreadCount] = await too(Message.find(optionsCout));

        if(!err && !isNull(unreadCount)){
            // console.log(unreadCount);
            unreadCount.map((item)=>{
                if(item.readBy.length===0){
                    messgCount++;
                }else{
                    
                    item.readBy.some((u)=>u.user.toString()===user.toString())?null:messgCount++;
                }
            })

            element = element.toObject();
            element.unReadMsgCount = messgCount;

            fetchArr.push(element);
            
        }
        
        messgCount = 0;
        
    }
    // console.log(fetchChats);


    return ReS(res, {message: "Chat fetch successfully", data: fetchArr}, HttpStatus.OK);


    // try {
    //     Chat.find({users:{$elemMatch:{$eq:req.user.id}}})
    //     .populate('users','-password')
    //     .populate('groupAdmin','-password')
    //     .populate('latestMessage').sort({updatedAt:-1})
    //     .then(async(result)=>{
    //         result=await User.populate(result,{
    //             path:'latestMessage.sender',
    //             select:'name email',

    //         })
    //         res.status(200).json({data:result})
    //     })
    // } catch (error) {
    //     res.status(500).json({message:error.message})
    // }
}

export const createGroupChat=async(req,res)=>{
    const {users,name}=req.body

    if(!users||!name) {
        return res.status(400).json({message:'Please Fill All Fields'})
    } 
    var theUsers=JSON.parse(users)
    if(theUsers.length<=2){
        return res.status(400).json({message:'More than 2 users are required'})
    }

    theUsers.push(req.user.id)

    try {
        const groupChat=await Chat.create({
            chatName:name,
            users:theUsers,
            isGroupChat:true,
            groupAdmin:req.user.id, 
        })

        const fullGroupChat=await Chat.findOne({_id:groupChat._id}).
        populate('users','-password').
        populate('groupAdmin','-password') 

        res.status(201).json({data:fullGroupChat})
    } catch (error) {
        return res.status(500).json({message:error})
    }

}

export const renameGroup=async(req,res)=>{
    const {chatId,chatName}=req.body
    try {
        const updateChat=await Chat.findByIdAndUpdate(chatId,{chatName},{new:true})
        .populate('users','-password')
        .populate('groupAdmin','-password')
        if(!updateChat){
            return res.status(404).json({message:'Chat Not Found'})
        }else{
            return res.status(200).json({data:updateChat})
        }
    } catch (error) {
        return res.status(500).json({message:error})
    }
}

export const groupAddMember=async(req,res)=>{
    const {chatId,userId}=req.body
    try {
        const userExist=await Chat.findOne({_id:chatId,users:{$elemMatch:{$eq:userId}}})
        if(userExist){
            return res.status(400).json({message:'User Already Exist'})
        }

        // if(userExist?.groupAdmin?._id!==req.user.id){
        //     return res.status(400).json({message:'Only Admin Can Add Member'})
        // }
    
        const add=await Chat.findByIdAndUpdate(chatId,{$push:{users:userId}},{new:true})
        .populate('users','-password')
        .populate('groupAdmin','-password')
        if(!add){
            return res.status(404).json({message:'Chat Not Found'})
        }else{
            return res.status(200).json({data:add})
        }
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

export const groupRemoveMember=async(req,res)=>{
    const {chatId,userId}=req.body
    try {
        const userExist=await Chat.findOne({_id:chatId,users:{$elemMatch:{$eq:userId}}})
        if(!userExist){
            return res.status(400).json({message:'User Not Exist'})
        }
        const remOve=await Chat.findByIdAndUpdate(chatId,{$pull:{users:userId}},{new:true})
        .populate('users','-password')
        .populate('groupAdmin','-password')
        if(userExist.groupAdmin==userId){
            remOve.groupAdmin=remOve.users[0]
            await remOve.save()
        }
        if(!remOve){
            return res.status(404).json({message:'Chat Not Found'})
        }else{
            return res.status(200).json({data:remOve})
        }
    } catch (error) {
        return res.status(500).json({message:error})   
    }
}