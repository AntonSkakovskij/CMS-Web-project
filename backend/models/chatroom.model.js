import mongoose from 'mongoose'

const chatroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    messages:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: [],
        }
    ],
});

const Chatroom = mongoose.model("Chatroom", chatroomSchema);
export default Chatroom;
