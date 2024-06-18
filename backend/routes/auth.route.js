import express from 'express';
import {login, signup, logout, loadPage} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.post('/load-page', loadPage)

export default router;