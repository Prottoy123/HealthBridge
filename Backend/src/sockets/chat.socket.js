import { FollowUp } from "../models/followUp.models.js";
import { Message } from "../models/message.models.js";

export const initializeChatEvents = (io, socket) => {
  // ১. Join Room
  socket.on("join_chat_room", (appointmentId) => {
    if (!appointmentId) {
      return socket.emit("error", {
        status: 400,
        message: "Appointment ID is required",
      });
    }
    socket.join(appointmentId);
    console.log(`User ${socket.user._id} joined room: ${appointmentId}`);
  });

  // ২. Send Message
  socket.on("send_message", async (payload) => {
    try {
      const checking = await FollowUp.findOne({
        originalAppointmentId: payload.originalAppointmentId,
      });

      if (!checking || checking.status !== "ACTIVE") {
        return socket.emit("error", {
          status: 403,
          message: "Chat is closed or not found",
        });
      }

      const savedMessage = await Message.create({
        senderId: socket.user._id,
        originalAppointmentId: payload.originalAppointmentId,
        content: payload.content,
        attachmentUrl: payload.attachmentUrl || "",
      });

      io.to(payload.originalAppointmentId).emit(
        "receive_message",
        savedMessage
      );
    } catch (error) {
      console.error("Message Error:", error);
      socket.emit("error", { status: 500, message: "Failed to send message" });
    }
  });

  // ৩. Mark as Seen
  socket.on("mark_as_seen", async (payload) => {
    try {
      const { messageId, appointmentId } = payload;

      await Message.findByIdAndUpdate(messageId, { isRead: true });

      io.to(appointmentId).emit("message_seen_update", { messageId });
    } catch (error) {
      console.error("Seen Update Error:", error);
    }
  });

  // ৪. Memory Leak Prevention (The Cleanup)
  socket.on("leave_chat_room", (appointmentId) => {
    socket.leave(appointmentId);
    console.log(`User ${socket.user._id} left room: ${appointmentId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected for User: ${socket.user?._id}`);
  });
};
