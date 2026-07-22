import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchChatHistory,
  updateMessageStatus,
  clearChatMemory,
  addLiveMessage,
} from "./chatSlice";
import useSocket from "../../hook/useSocket";

import PatientHistoryDrawer from "./component/PatientHistoryDrawer";
import DoctorProfileDrawer from "./component/DoctorProfileDrawer";

function ChatInterface() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Memory Extraction
  const { messages, pagination, isLoading, isFetchingMore } = useSelector(
    (state) => state.chat,
  );
  const { currentPage, hasNextPage } = pagination;
  const { user } = useSelector((state) => state.auth);

  // 2. Local States & DOM Trackers
  const [text, setText] = useState("");
  const observerTargetRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 🚀 New states for side-drawer control
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isDoctorProfileOpen, setIsDoctorProfileOpen] = useState(false);

  // 3. Socket Initialization
  const socket = useSocket(appointmentId);

  // 4. STEP 5: The Master Lifecycle (Mount/Unmount)
  useEffect(() => {
    if (!appointmentId) return;

    // Fetch initial chat history (Page 1)
    dispatch(fetchChatHistory({ appointmentId, page: 1 }));

    // Cleanup: Flush Redux memory when leaving the page
    return () => {
      dispatch(clearChatMemory());
    };
  }, [dispatch, appointmentId]);

  // 5. STEP 4 LOGIC: Infinite Scroll Engine (Intersection Observer)
  useEffect(() => {
    if (isLoading || isFetchingMore || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          dispatch(fetchChatHistory({ appointmentId, page: currentPage + 1 }));
        }
      },
      { threshold: 1.0 },
    );

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }

    return () => {
      if (observerTargetRef.current) observer.disconnect();
    };
  }, [
    hasNextPage,
    isFetchingMore,
    currentPage,
    dispatch,
    appointmentId,
    isLoading,
  ]);

  // 6. STEP 6 LOGIC: Auto-Scroll Engine
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 7. Transmission Logic: Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!socket) {
      toast.error("Network disconnected. Cannot send message.");
      return;
    }

    const payload = {
      appointmentId,
      content: text,
      senderId: user?._id,
    };

    socket.emit("send_message", payload);
    setText("");
  };

  // 🚀 Dynamic ID extraction
  // Filtering the opposite user's ID from the message list based on role
  const patientId =
    user?.role === "DOCTOR"
      ? messages.find((msg) => msg.senderId !== user._id)?.senderId
      : user?._id;

  const activeDoctorId =
    user?.role === "PATIENT"
      ? messages.find((msg) => msg.senderId !== user._id)?.senderId
      : null;

  // 8. GUARD CLAUSE: Initial Loading
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 9. THE MAIN RETURN (UI)
  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[80vh] relative">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Live Consultation
          </h2>
          <p className="text-xs font-medium text-green-600 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            End-to-End Encrypted Session
          </p>
        </div>

        {/* 🚀 Action Buttons: Vault, Profile, and Close */}
        <div className="flex items-center space-x-4">
          {user?.role === "DOCTOR" && (
            <button
              onClick={() => setIsVaultOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <span>View Vault</span>
            </button>
          )}

          {user?.role === "PATIENT" && (
            <button
              onClick={() => setIsDoctorProfileOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              <span>View Doctor</span>
            </button>
          )}

          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition px-2 py-2"
          >
            Close Chat
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 relative">
        {/* INVISIBLE TOP TARGET: For Infinite Scroll */}
        <div ref={observerTargetRef} className="h-4 w-full">
          {isFetchingMore && (
            <p className="text-center text-xs text-slate-400">
              Loading older messages...
            </p>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-slate-400 mt-10">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?._id;

            return (
              <div
                key={msg._id}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <div
                    className={`flex items-center justify-end mt-1 space-x-1 ${isMe ? "text-blue-100" : "text-slate-400"}`}
                  >
                    <span className="text-[10px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && (
                      <span className="text-[10px] ml-1">
                        {msg.isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 z-10">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full p-3 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5 transform rotate-45 -mt-1 -ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              ></path>
            </svg>
          </button>
        </form>
      </div>

      {/* 🚀 Slide-out Drawers Mounting */}
      <PatientHistoryDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        patientId={patientId}
      />

      <DoctorProfileDrawer
        isOpen={isDoctorProfileOpen}
        onClose={() => setIsDoctorProfileOpen(false)}
        doctorId={activeDoctorId}
      />
    </div>
  );
}

export default ChatInterface;
