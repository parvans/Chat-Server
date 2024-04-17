import express from 'express';
import auth from '../middleware/auth.js';
import { allMessage, editMessage, getMessageStatus, readMessage, sendMessage } from '../controllers/messageControlls.js';
const router = express.Router();

router.post('/sendmessage',auth,sendMessage)

router.get('/:chatId',auth,allMessage)

router.put('/readmessage',auth,readMessage)

router.put('/editmessage/:id',auth,editMessage)

router.get('/status/:chatId',auth,getMessageStatus)

export default router;