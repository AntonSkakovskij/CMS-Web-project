import {io} from "../socket/socket.js";
import Chatroom from "../models/chatroom.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";


export const sendMessage = async(req, res) => {
    try{
        const {message, userId, chatroomId} = req.body;

        const user = await User.findById(userId)
        const chatroom = await Chatroom.findById(chatroomId)

        if (!user) {
            return res.status(400).json({error: "User not found"});
        }

        if (!chatroom) {
            return res.status(400).json({error: "Chatroom not found"});
        }

        const newMessage =  new Message({
            message,
            room: chatroom,
            sender: user
        })


        if(newMessage){
            chatroom.messages.push(newMessage._id)
        }
        

        await Promise.all([newMessage.save(), chatroom.save()])
        await newMessage.populate("sender")

        io.to(chatroomId).emit("message", {
            message: newMessage
        });

        io.emit("notification",{
            chat: chatroom,
            newMessage: newMessage,
            sender: user,
        })



        res.status(200).json({
            message: newMessage
        })
    }
    catch(error){
        console.log("Error in send messages controller \"[SENDMESSAGE]\"", error.message);
        res.status(500).json({error: "internal server error"});
    }
}
