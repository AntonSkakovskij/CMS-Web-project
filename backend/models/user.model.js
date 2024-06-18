import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
        email: {
            type: String,
            required: true,
        },
        nickname: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 5,
        },
        gender:{
            type: String,
            required: true,
            enum: ['male', 'female'],
        },
        profilePic:{
            type: String,
            default: ""
        }
    }
)

const User = mongoose.model("User", userSchema);
export default User;