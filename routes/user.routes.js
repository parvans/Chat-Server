import express from 'express';
import auth from '../middleware/auth.js';
import { getUser, login, register } from '../controllers/userControlls.js';
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.get('/users',auth,getUser)
export default router;