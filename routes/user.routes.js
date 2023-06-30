import express from 'express';
import auth from '../middleware/auth.js';
import { getUser, login, register, resetPassword, verifyCode, verifyEmail } from '../controllers/userControlls.js';
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/verifyemail',verifyEmail)
router.post('/verifyotp',verifyCode)
router.post('/resetpassword',resetPassword)
router.get('/users',auth,getUser)
export default router;