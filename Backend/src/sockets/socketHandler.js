import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const initializeSocket = (io) => {

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(
          new ApiError(401, "Socket connection denied: No token provided")
        );
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        return next(
          new ApiError(401, "Socket connection denied: Invalid user")
        );
      }

      socket.user = user;

      next();
    } catch (error) {
      return next(
        new ApiError(
          401,
          "Socket connection denied: Invalid or expired access token"
        )
      );
    }
  });


  io.on("connection", (socket) => {
    console.log(
      `🟢 Authenticated User Connected: ${socket.user.fullName} (${socket.id})`
    );

    socket.on("join_room", (appointmentId) => {
      if (!appointmentId) return;

      socket.join(appointmentId);
      console.log(
        `User ${socket.user.fullName} locked into isolated room: ${appointmentId}`
      );
    });

    socket.on("disconnect", () => {
      console.log(
        `🔴 User Disconnected: ${socket.user.fullName} (${socket.id})`
      );
    });
  });
};
