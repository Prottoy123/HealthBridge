import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchChatHistory,
  updateMessageStatus,
  clearChatMemory,
  addLiveMessage,
} from "./chatSlice";
import { fetchPatientFollowups } from "../patient/Slices/patientInboxSlice";
import useSocket from "../../hook/useSocket";

import PatientHistoryDrawer from "./component/PatientHistoryDrawer";
import DoctorProfileDrawer from "./component/DoctorProfileDrawer";

// Reusable timer for sidebar items
const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const total = Date.parse(expiresAt) - Date.parse(new Date());
      if (total <= 0) return "Expired";

      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      return `${hours}h ${minutes}m`;
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 60000); 
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className={`flex flex-col items-end`}>
       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Time Left</span>
       <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-widest ${
           timeLeft === "Expired"
             ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
             : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
         }`}>
         {timeLeft === "Expired" ? "CLOSED" : `${timeLeft}`}
       </span>
    </div>
  );
};

function ChatInterface() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const chatStatus = location.state?.status || "ACTIVE";

  // Redux States
  const { messages, pagination, isLoading, isFetchingMore } = useSelector((state) => state.chat);
  const { currentPage, hasNextPage } = pagination;
  const { user } = useSelector((state) => state.auth);
  
  // Sidebar State
  const { activeFollowups, pastHistory, status: inboxStatus } = useSelector((state) => state.patientInbox);
  const [activeTab, setActiveTab] = useState(chatStatus === "ACTIVE" ? "ACTIVE" : "HISTORY"); 
  const displayData = activeTab === "ACTIVE" ? activeFollowups : pastHistory;

  const [text, setText] = useState("");
  const observerTargetRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isDoctorProfileOpen, setIsDoctorProfileOpen] = useState(false);

  const socket = useSocket(chatStatus === "ACTIVE" ? appointmentId : null);

  // Initialize Data
  useEffect(() => {
    if (!appointmentId) return;
    dispatch(fetchChatHistory({ appointmentId, page: 1 }));
    
    // Also fetch inbox so sidebar is populated if directly loaded
    if (user?.role === "PATIENT") {
      dispatch(fetchPatientFollowups());
    }

    return () => {
      dispatch(clearChatMemory());
    };
  }, [dispatch, appointmentId, user?.role]);

  // Infinite Scroll Engine
  useEffect(() => {
    if (isLoading || isFetchingMore || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          dispatch(fetchChatHistory({ appointmentId, page: currentPage + 1 }));
        }
      }, { threshold: 1.0 }
    );

    if (observerTargetRef.current) observer.observe(observerTargetRef.current);
    return () => { if (observerTargetRef.current) observer.disconnect(); };
  }, [hasNextPage, isFetchingMore, currentPage, dispatch, appointmentId, isLoading]);

  // Auto-Scroll Engine
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  // Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || chatStatus !== "ACTIVE") return;

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

  const patientId = user?.role === "DOCTOR" ? messages.find((msg) => msg.senderId !== user._id)?.senderId : user?._id;
  const activeDoctorId = user?.role === "PATIENT" ? messages.find((msg) => msg.senderId !== user._id)?.senderId : null;

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 h-full min-h-[calc(100vh-8rem)] animate-in fade-in duration-700">
      
      {/* 
        ========================================================================
        LEFT SIDEBAR: INBOX NAV (Only show for patients for true unified workspace)
        ========================================================================
      */}
      {user?.role === "PATIENT" && (
        <div className="hidden md:flex w-96 shrink-0 flex-col h-[calc(100vh-10rem)] bg-[#051316] rounded-[2.5rem] border border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

           <div className="p-6 pb-4 relative z-10 shrink-0 border-b border-white/[0.05]">
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20 shadow-inner">
                   <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                Messages
              </h1>
              <div className="flex bg-[#020607] p-1.5 rounded-xl border border-white/[0.05] shadow-inner mt-6">
                <button
                  onClick={() => setActiveTab("ACTIVE")}
                  className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === "ACTIVE" ? "bg-white/[0.05] text-teal-400 border border-white/[0.1] shadow-md" : "border border-transparent text-slate-600 hover:text-slate-400"}`}
                >
                  Active <span className="ml-1 opacity-70">({activeFollowups.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("HISTORY")}
                  className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === "HISTORY" ? "bg-white/[0.05] text-teal-400 border border-white/[0.1] shadow-md" : "border border-transparent text-slate-600 hover:text-slate-400"}`}
                >
                  History
                </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative z-10 space-y-2">
              {inboxStatus === "loading" ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[200px]">
                   <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
                </div>
              ) : displayData.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-50">
                    <p className="text-slate-300 font-black text-sm">No Active Channels</p>
                 </div>
              ) : (
                 displayData.map((chat) => (
                   <button
                     key={chat._id}
                     onClick={() => navigate(`/patient/messages/${chat.appointmentId}`, { state: { status: chat.status } })}
                     className={`w-full text-left p-4 rounded-[1.5rem] transition-all duration-300 flex flex-col gap-4 group ${chat.appointmentId === appointmentId ? "bg-white/[0.05] border-teal-500/30 border shadow-md" : "bg-white/[0.01] hover:bg-white/[0.04] border border-transparent hover:border-teal-500/20"}`}
                   >
                     <div className="flex justify-between items-start w-full">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black overflow-hidden">
                             {chat.doctorImage ? <img src={chat.doctorImage} alt="Dr." className="w-full h-full object-cover" /> : chat.doctorName ? chat.doctorName.charAt(0).toUpperCase() : "D"}
                          </div>
                          <div>
                            <h4 className="font-black text-white text-sm tracking-tight group-hover:text-teal-300 transition-colors">Dr. {chat.doctorName || "Unknown"}</h4>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{new Date(chat.appointmentDate).toLocaleDateString("en-GB")}</p>
                          </div>
                       </div>
                       {activeTab === "ACTIVE" ? <CountdownTimer expiresAt={chat.expiresAt} /> : <span className="text-[8px] font-black px-2 py-1 rounded bg-white/[0.05] text-slate-500 border border-white/[0.05] uppercase tracking-widest">ARCHIVED</span>}
                     </div>
                   </button>
                 ))
              )}
           </div>
        </div>
      )}

      {/* 
        ========================================================================
        RIGHT PANE: CHAT INTERFACE
        ========================================================================
      */}
      <div className="flex-1 bg-[#03090a] rounded-[2.5rem] border border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col h-[calc(100vh-10rem)]">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

        {/* Header */}
        <div className="px-6 md:px-8 py-5 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between z-10 shrink-0">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
               <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               </div>
              {chatStatus === "ACTIVE" ? "Live Chat" : "Archived Chat"}
            </h2>
            <p className={`text-[10px] uppercase tracking-[0.2em] font-black flex items-center mt-2 ${chatStatus === "ACTIVE" ? "text-teal-400" : "text-slate-500"}`}>
              {chatStatus === "ACTIVE" && <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-2 shadow-[0_0_8px_#2dd4bf] animate-pulse"></span>}
              {chatStatus === "ACTIVE" ? "Secure Messaging" : "Chat Closed"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === "DOCTOR" && (
              <button onClick={() => setIsVaultOpen(true)} className="px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/20 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all shadow-sm">
                Vault
              </button>
            )}

            {user?.role === "PATIENT" && (
              <button onClick={() => setIsDoctorProfileOpen(true)} className="px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/20 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all shadow-sm">
                View Doctor
              </button>
            )}

            <button onClick={() => navigate(user?.role === "PATIENT" ? '/patient/messages' : -1)} className="px-4 py-2 bg-white/[0.02] hover:bg-rose-500/10 border border-white/[0.05] hover:border-rose-500/20 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 hover:text-rose-400 transition-all">
              Close
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 custom-scrollbar bg-[#020607]">
          <div ref={observerTargetRef} className="h-4 w-full">
            {isFetchingMore && (
              <div className="flex justify-center">
                <span className="bg-white/[0.05] border border-white/[0.05] text-teal-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] animate-pulse shadow-inner">
                  Loading older messages...
                </span>
              </div>
            )}
          </div>

          {isLoading && messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full space-y-4">
               <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
               <p className="text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Loading Chat...</p>
             </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mb-4 border border-white/[0.05]">
                 <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              </div>
              <span className="font-black text-slate-300 text-lg tracking-tight mb-1">No Messages Yet</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Start a new chat below</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?._id;
              return (
                <div key={msg._id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-3xl text-sm font-medium leading-relaxed relative group shadow-lg ${
                      isMe
                        ? "bg-gradient-to-br from-teal-500 to-cyan-400 text-slate-950 rounded-br-sm shadow-[0_10px_20px_rgba(20,184,166,0.2)]"
                        : "bg-[#051316] border border-white/[0.05] text-slate-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="font-semibold">{msg.content}</p>
                    <div className={`flex items-center justify-end mt-3 space-x-2 ${isMe ? "text-teal-950/70" : "text-slate-500"}`}>
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-bold flex items-center">
                          {msg.isRead ? (
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7M5 13l4 4L19 7"></path></svg>
                          ) : (
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          )}
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
        {chatStatus === "ACTIVE" ? (
          <div className="p-4 md:p-6 bg-[#051316] border-t border-white/[0.05] z-10 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-[#020607] p-2 rounded-2xl border border-white/[0.05] shadow-inner focus-within:border-teal-500/30 focus-within:ring-1 focus-within:ring-teal-500/30 transition-all">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent px-4 py-3 text-sm font-medium text-white placeholder-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="bg-teal-500 hover:bg-teal-400 disabled:bg-white/[0.02] disabled:text-slate-600 disabled:shadow-none text-slate-950 rounded-xl px-6 py-4 transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.3)] font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 shrink-0"
              >
                Send
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 bg-[#051316] border-t border-white/[0.05] z-10 text-center shrink-0">
            <p className="text-[10px] font-black text-rose-500/80 uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/20 py-4 rounded-2xl">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              This chat has been closed.
            </p>
          </div>
        )}

      </div>

      <PatientHistoryDrawer isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} patientId={patientId} />
      <DoctorProfileDrawer isOpen={isDoctorProfileOpen} onClose={() => setIsDoctorProfileOpen(false)} doctorId={activeDoctorId} />
    </div>
  );
}

export default ChatInterface;
