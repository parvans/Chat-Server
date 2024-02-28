import express from 'express';
import auth from '../middleware/auth.js';
import { allMessage, editMessage, readMessage, sendMessage } from '../controllers/messageControlls.js';
const router = express.Router();
router.post('/sendmessage',auth,sendMessage)
router.get('/:chatId',auth,allMessage)
router.put('/readmessage',auth,readMessage)
router.put('/editmessage/:id',auth,editMessage)
export default router;