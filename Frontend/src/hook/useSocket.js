import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateQueueStatus } from "../Features/staff/Slices/staffSlice";
import {
  addLiveMessage,
  updateMessageStatus,
} from "../Features/chat/chatSlice";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

// 1. THE SINGLETON INSTANCE
let globalSocket = null;

export const useSocket = (roomId = null) => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken) return;

    // 2. INITIALIZE CONNECTION (Only if it doesn't exist)
    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      globalSocket.on("connect", () => {

      });

      // --- GLOBAL LISTENERS (Always Active) ---
      globalSocket.on("queue_update", (data) => {
        dispatch(
          updateQueueStatus({
            appointmentId: data.appointmentId,
            newStatus: data.newStatus,
          }),
        );
        toast.success(`Patient status updated: ${data.newStatus}`, {
          id: "queue_toast",
        });
      });

      globalSocket.on("appointment_reminder", (data) => {
        toast(data.message, { icon: "🔔", duration: 5000 });
      });

      globalSocket.on("connect_error", (err) => {
        console.error("Socket Connection Error:", err.message);
      });
    }

    // 3. ISOLATED CHAT LISTENERS (Activates only if roomId is provided)
    if (roomId && globalSocket) {
      // Join the private chat room securely
      globalSocket.emit("join_chat_room", { appointmentId: roomId });

      // 🚀 দ্য মাস্টার ফিক্স: সঠিক রিডিউসার কল করা হলো
      globalSocket.on("receive_message", (message) => {
        dispatch(addLiveMessage(message));
      });

      globalSocket.on("message_seen_update", (data) => {
        dispatch(updateMessageStatus(data));
      });
    }

    // 4. THE CLEANUP PROTOCOL (Memory Leak Prevention)
    return () => {
      // If the user leaves the chat page, we ONLY leave the room and remove chat listeners.
      if (roomId && globalSocket) {
        globalSocket.emit("leave_chat_room", { appointmentId: roomId });
        globalSocket.off("receive_message");
        globalSocket.off("message_seen_update");
      }
    };
  }, [dispatch, accessToken, roomId]);

  return globalSocket;
};

export default useSocket;
