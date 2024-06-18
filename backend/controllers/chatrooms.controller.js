import { io } from "../socket/socket.js";
import Chatroom from "../models/chatroom.model.js";
import User from "../models/user.model.js";


export const getNotExistedUsers = async (req, res) => {
    try{
        const { chatId } = req.body;

        const chatroom = await Chatroom.findById(chatId)

        if (!chatroom) {
            return res.status(400).json({error: "Chatroom not found"});
        }

        const notExistedUsers = await User.find({
            _id: {$nin: chatroom.members}
        });

        if (chatroom) {
            res.status(200).json({notmembers: notExistedUsers})
        }

    }
    catch (error) {
        console.log("Error in chatrooms controller \"[GETNOTEXISTEDUSERS]\"", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getUsers = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({error: "User does not exist"});
        }

        const users = await User.find({
            _id: {$ne: userId}
        });

        if (user) {
            res.status(200).json({users})
        }

    } catch (error) {
        console.log("Error in chatrooms controller \"[GETUSERS]\"", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const getChatRoomData = async (req, res) => {
    try {
        const {chatId} = req.body;

        const chatroom = await Chatroom.findById(chatId)
            .populate("members")
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    model: 'User'
                }
            })

        if (!chatroom) {
            return res.status(400).json({error: "Chatroom not found"});
        }

        if (chatroom) {
            res.status(200).json({chatroom: chatroom})
        }
    } catch (error) {
        console.log("Error in chatrooms controller \"[GETCHATROOMDATA]\"", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const getChatrooms = async (req, res) => {
    try
    {
        const {userId} = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({error: "User not found"});
        }

        const chatrooms = await Chatroom.find({
            members: {$in: [user]},
        })

        if (!chatrooms) {
            return res.status(400).json({error: "Chatrooms not found"});
        }

        if (chatrooms) {
            res.status(200).json({chatrooms: chatrooms})
        }

    }
    catch (error) {
        console.log("Error in chatrooms controller \"[GETCHATROOMS]\"", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const createChat = async (req, res) => {
    try
    {
        const {chatroomName, membersId} = req.body;

        if (!Array.isArray(membersId)) {
            return res.status(400).send({error: "You need to add members"});
        }

        const members = await User.find({_id: {$in: membersId}});

        const newChatroom = new Chatroom({
            name: chatroomName,
            members
        })



        if (newChatroom) {
            await newChatroom.save();

            io.emit("newChat", {
                chat: newChatroom,
                membersId
            })

            res.status(200).json({
                chatroom: newChatroom,
            });
        } else {
            res.status(400).json({error: "Invalid chatroom date"});
        }
    }
    catch (error) {
        console.log("Error in chatrooms controller \"[CREATECHAT]\"", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const addUserToChat = async (req, res) => {
    try
    {
        const {userId, chatroomId} = req.body;

        const user = await User.findById(userId)
        const chatroom = await Chatroom.findById(chatroomId)


        if (!user) {
            return res.status(400).json({error: "User not found"});
        }

        if (!chatroom) {
            return res.status(400).json({error: "chatroom not found"});
        }

        const isUserInChatroom = chatroom.members.some(member => member.equals(user._id));

        if (isUserInChatroom) {
            return res.status(400).json({error: "User already in chatroom"});
        }


        chatroom.members.push(user);
        chatroom.save();

        io.to(chatroomId).emit("newUser", {
            userNickname: user.nickname
        })

        io.emit("join-room",{
            userId: userId,
            chat: chatroom
        })

        res.status(200).json({
            user,
            chatroom
        });
    }
    catch (error) {
        console.log("Error in chatrooms controller \"[ADDUSERTOCHAT]\"", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

