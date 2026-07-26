import { FollowUp } from "../models/followUp.models.js";
import { Message } from "../models/message.models.js";

export const initializeChatEvents = (io, socket) => {
  // ১. Join Room (Fixed Object Destructuring)
  socket.on("join_chat_room", (payload) => {
    const roomId = payload.appointmentId || payload;

    if (!roomId) {
      return socket.emit("error", {
        status: 400,
        message: "Appointment ID is required",
      });
    }

    socket.join(roomId);
    console.log(`⚡ User ${socket.user._id} joined room: ${roomId}`);
  });

  // ২. Send Message (Fixed Payload Mapping)
  socket.on("send_message", async (payload) => {
    try {
      const roomId = payload.appointmentId;

      if (!roomId) throw new Error("Room ID missing in payload");

      const checking = await FollowUp.findOne({
        originalAppointmentId: roomId,
      });

      if (
        !checking ||
        checking.status !== "ACTIVE" ||
        new Date(checking.expiresAt) < new Date()
      ) {
        return socket.emit("error", {
          status: 403,
          message: "Chat is closed or not found",
        });
      }

      const savedMessage = await Message.create({
        senderId: socket.user._id,
        originalAppointmentId: roomId,
        content: payload.content,
        attachmentUrl: payload.attachmentUrl || "",
      });

      io.to(roomId).emit("receive_message", savedMessage);
    } catch (error) {
      console.error("Message Error:", error);
      socket.emit("error", { status: 500, message: "Failed to send message" });
    }
  });

  // ৩. Mark as Seen (Fixed Payload Mapping)
  socket.on("mark_as_seen", async (payload) => {
    try {
      const { messageId, appointmentId } = payload;
      if (!messageId || !appointmentId) return;

      await Message.findByIdAndUpdate(messageId, { isRead: true });

      io.to(appointmentId).emit("message_seen_update", { messageId });
    } catch (error) {
      console.error("Seen Update Error:", error);
    }
  });

  // ৪. Memory Leak Prevention (Fixed Object Destructuring)
  socket.on("leave_chat_room", (payload) => {
    const roomId = payload.appointmentId || payload;
    if (!roomId) return;

    socket.leave(roomId);
    console.log(`🔌 User ${socket.user._id} left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected for User: ${socket.user?._id}`);
  });
};
