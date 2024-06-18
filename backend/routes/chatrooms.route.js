import express from 'express';
import {
    getChatrooms,
    createChat,
    addUserToChat,
    getChatRoomData,
    getNotExistedUsers,
    getUsers
} from "../controllers/chatrooms.controller.js"

const router = express.Router();


router.post('/chats', getChatrooms)
router.post('/not-existed-users', getNotExistedUsers)
router.post('/users', getUsers)
router.post('/create-chat', createChat)
router.post('/add-user', addUserToChat)
router.post('/chat-data', getChatRoomData)

export default router;
