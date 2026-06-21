import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./sockets/socketHandler.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

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

import UserRouter from "./routes/user.routes.js";
import medicalRecord from "./routes/medicalRecod.routes.js";
import patient from "./routes/patient.routes.js";
import doctor from "./routes/doctor.routes.js";
import staff from "./routes/staff.routes.js";
import admin from "./routes/admin.routes.js";
import prescription from "./routes/prescription.routes.js";
import chatRouter from "./routes/chat.routes.js";

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/medical-records", medicalRecord);
app.use("/api/v1/patient", patient);
app.use("/api/v1/doctor", doctor);
app.use("/api/v1/staff", staff);
app.use("/api/v1/admin", admin);
app.use("/api/v1/prescription", prescription);
app.use("/api/v1/chat", chatRouter);

initializeSocket(io);

export { app, server }; 
