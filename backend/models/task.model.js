import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['to do', 'in progress', 'done'],
        default: 'to do',
    },
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
