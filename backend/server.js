import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import {fileURLToPath} from 'url';
import cors from 'cors';

import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/messages.route.js";
import chatroomsRoute from "./routes/chatrooms.route.js";
import tasksRoute from "./routes/tasks.route.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import {app, server} from "./socket/socket.js";

const PORT = 55001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(cors({
    origin: 'http://127.0.0.1:55001',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use("/api/auth", authRoute)
app.use("/api/messages", messageRoute)
app.use("/api/chatrooms", chatroomsRoute)
app.use("/api/tasks", tasksRoute)

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

server.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Listening on port ${PORT}`);
});
