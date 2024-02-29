import express from 'express';
import auth from '../middleware/auth.js';
import { accessthechat, createGroupChat, deleteAllMessages, fetchChat, groupAddMember, groupRemoveMember, renameGroup } from '../controllers/chatControlls.js';
const router = express.Router();

router.post('/accesschat',auth,accessthechat)

router.get('/fetchchat',auth,fetchChat)

router.post('/creategroupchat',auth,createGroupChat)

router.put('/renamegroup',auth,renameGroup)

router.put('/groupadd',auth,groupAddMember)

router.put('/groupremove',auth,groupRemoveMember)

router.delete('/deletemessage',auth,deleteAllMessages)

export default router;