import {io} from "../socket/socket.js";
import Task from "../models/task.model.js";

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();  // Виклик методу find для отримання всіх тасків з бази даних

        if (!tasks) {
            return res.status(400).json({error: "Tasks not found"});
        }

        res.status(200).json({tasks: tasks});

    } catch (error) {
        console.log("Error in tasks controller \"[GETTASKS]\"", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const createNewTask = async (req, res) => {
    try {
        const {taskMessage} = req.body;

        const newTask = new Task({
            message: taskMessage,
        })

        if (newTask) {
            await newTask.save();

            io.emit("newTask", {
                task: newTask
            })

            io.emit("task-notification", {
                task: newTask
            });

            res.status(200)
        } else {
            res.status(400).json({error: "Invalid task date"});
        }
    } catch (error) {
        console.log("Error in task controller \"[CREATETASK]\"", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const changeTaskStatus = async (req, res) => {
    try {
        const {taskStatus, taskId} = req.body;


        if (!taskId || !taskStatus) {
            return res.status(400).json({error: "Task ID and task status are required"});
        }


        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({error: "Task not found"});
        }

        task.status = taskStatus;

        await task.save();


        io.emit("task-status", {
            task: task
        });

        io.emit("task-notification", {
            task: task
        });


        res.status(200).json({task: task});


    } catch (error) {
        console.error('Error in task controller "[CHANGETASKSTATUS]"', error.message);
        res.status(500).json({error: "Internal server error"});
    }
}