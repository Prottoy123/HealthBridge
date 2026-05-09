import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

// 4. Socket.io ইনিশিয়ালাইজ করা এবং CORS সেট করা (খুবই জরুরি)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// 5. দ্য ইনভিজিবল ব্রিজ: গ্লোবাল ভেরিয়েবল হিসেবে io-কে Express-এ সেভ করা
app.set("io", io);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Socket Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  //join the room
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} silently joined room: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//Routes
import UserRouter from "./routes/user.routes.js";
import medicalRecord from "./routes/medicalRecod.routes.js";
import patient from "./routes/patient.routes.js";

//routes declaration
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/medical-records", medicalRecord);
app.use("/api/v1/patient", patient);

// 7. Export the explicitly created 'server' along with 'app'
export { app, server, io };
