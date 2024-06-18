import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:55001", "http://127.0.0.1:55001"],
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    socket.on('enterRoom', ({chatroomId}) => {
        const prevRooms = Array.from(socket.rooms);

        prevRooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });

        socket.join(chatroomId);
        console.log("User: " + socket.id + " entered room: " + chatroomId);

    });

    socket.on('leaveRoom', ({chatroomId}) => {
        socket.leave(chatroomId);
        console.log("User: " + socket.id + " leaved room: " + chatroomId);

    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });
});

export { app, io, server };

