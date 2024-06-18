import User from "../models/user.model.js";
import Chatroom from "../models/chatroom.model.js";
import Task from "../models/task.model.js";
// import generateTokenAndSetCookie from "../utils/generateToken.js";


export const signup = async (req, res) => {
    try {
        const {email, nickname, gender, password, confirmPassword} = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({error: "Passwords do not match"});
        }

        const user = await User.findOne({email})

        if (user) {
            return res.status(400).json({error: "User already exists"});
        }

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${nickname}`
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${nickname}`

        const newUser = new User({
            email: email,
            nickname: nickname,
            password: password,
            gender: gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
        })

        if (newUser) {
            await newUser.save()

            res.status(200).json({
                id: newUser._id,
            })
        } else {
            res.status(400).json({error: "Invalid user date"});
        }
    } catch (error) {
        console.log("Error in auth controller \"[SIGNUP]\"", error.message);
        res.status(500).json({error: "internal server error"});
    }
}


export const login = async (req, res) => {
    try{
        const { email, password} = req.body;

        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({error: "User does not exist"});
        }

        if(password !== user.password){
            return res.status(401).json({error: "Incorrect password"});
        }

        res.status(200).json({
            id: user._id,
        })

    }
    catch(error){
        console.log("Error in auth controller \"[LOGIN]\"", error.message);
        res.status(500).json({error: "internal server error"});
    }
}


export const loadPage = async (req, res) => {
    try {
        const {userId} = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({error: "User does not exist"});
        }

        const chatrooms = await Chatroom.find({members: userId})
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    model: 'User'
                }
            });
        // Збираємо всі повідомлення з усіх чатів, де користувач є членом
        let allMessages = [];

        chatrooms.forEach(chat => {
            allMessages = allMessages.concat(chat.messages.map(message => ({
                chat: chat,
                message: message,
                sender: message.sender
            })));
        });

        // Сортуємо всі повідомлення по даті створення
        allMessages.sort((a, b) => new Date(b.message.createdAt) - new Date(a.message.createdAt));


        const todoTasks = await Task.find({status: 'to do'});

        res.status(200).json({
            profilePic: user.profilePic,
            nickname: user.nickname,

            notifications: allMessages,
            todoTasks: todoTasks
        });

    } catch (error) {
        console.log('Error in auth controller "[LOAD PAGE]"', error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const logout = async (req, res) => {
    try{
        res.status(200).json({message: "Logged out successfully"})
    }
    catch(error){
        console.log("Error in auth controller \"[LOGOUT]\"", error.message);
        res.status(500).json({error: "internal server error"});
    }
}

