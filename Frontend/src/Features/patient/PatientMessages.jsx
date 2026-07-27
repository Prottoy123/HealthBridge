import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchPatientFollowups,
  clearInboxData,
} from "./Slices/patientInboxSlice";
import { Inbox, MessageSquare, Loader2, AlertCircle, ArrowRight } from "lucide-react";

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
       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Time Left</span>
       <span
         className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
           timeLeft === "Expired"
             ? "bg-rose-500/10 text-rose-400"
             : "bg-teal-500/10 text-teal-400"
         }`}
       >
         {timeLeft === "Expired" ? "CLOSED" : `${timeLeft}`}
       </span>
    </div>
  );
};

const PatientMessages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("ACTIVE"); 

  const { activeFollowups, pastHistory, status, error } = useSelector(
    (state) => state.patientInbox,
  );

  useEffect(() => {
    dispatch(fetchPatientFollowups());
    return () => dispatch(clearInboxData());
  }, [dispatch]);

  const displayData = activeTab === "ACTIVE" ? activeFollowups : pastHistory;

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 h-full min-h-[calc(100vh-8rem)] animate-in fade-in duration-700">
      
      {/* LEFT SIDEBAR: INBOX NAV */}
      <div className="w-full md:w-96 shrink-0 flex flex-col h-full bg-[#051316] rounded-3xl border border-white/[0.05] shadow-sm relative overflow-hidden">

         <div className="p-6 pb-4 relative z-10 shrink-0 border-b border-white/[0.05]">
            <h1 className="text-2xl font-bold text-slate-200 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-[#03090a] rounded-xl flex items-center justify-center border border-white/[0.05]">
                 <Inbox className="w-5 h-5 text-teal-400" />
              </div>
              Messages
            </h1>

            {/* Smart Navigation Tabs */}
            <div className="flex bg-[#03090a] p-1 rounded-xl border border-white/[0.05] mt-6">
              <button
                onClick={() => setActiveTab("ACTIVE")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === "ACTIVE"
                    ? "bg-teal-500/10 text-teal-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Active <span className="ml-1 opacity-70">({activeFollowups.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("HISTORY")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === "HISTORY"
                    ? "bg-teal-500/10 text-teal-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                History
              </button>
            </div>
         </div>

         {/* Conversation List */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10 space-y-3">
            {status === "loading" ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[200px]">
                 <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                 <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">Loading Messages...</p>
              </div>
            ) : status === "failed" ? (
               <div className="p-4 bg-[#03090a] border border-rose-500/20 rounded-2xl text-center mt-4">
                 <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                 <p className="text-rose-400 font-bold text-sm">Connection Error</p>
                 <p className="text-slate-400 text-xs mt-1">{error}</p>
               </div>
            ) : displayData.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-4">
                  <div className="w-12 h-12 bg-[#03090a] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
                     <MessageSquare className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-slate-300 font-bold text-base">No Active Chats</p>
                  <p className="text-slate-500 text-xs font-medium mt-1">Inbox is currently empty.</p>
               </div>
            ) : (
               displayData.map((chat) => (
                 <button
                   key={chat._id}
                   onClick={() => navigate(`/patient/messages/${chat.appointmentId}`, { state: { status: chat.status } })}
                   className="w-full text-left bg-[#03090a] hover:bg-white/[0.05] p-4 rounded-2xl border border-white/[0.05] transition-colors flex flex-col gap-4 group"
                 >
                   <div className="flex justify-between items-start w-full">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-[#051316] border border-white/[0.05] flex items-center justify-center text-teal-400 font-bold overflow-hidden">
                             {chat.doctorImage ? (
                               <img src={chat.doctorImage} alt="Dr." className="w-full h-full object-cover" />
                             ) : chat.doctorName ? chat.doctorName.charAt(0).toUpperCase() : "D"}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-teal-500 border-2 border-[#03090a] rounded-full"></div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-200 text-sm group-hover:text-teal-400 transition-colors">
                            Dr. {chat.doctorName || "Unknown"}
                          </h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">
                            {new Date(chat.appointmentDate).toLocaleDateString("en-GB")}
                          </p>
                        </div>
                     </div>

                     {activeTab === "ACTIVE" ? (
                       <CountdownTimer expiresAt={chat.expiresAt} />
                     ) : (
                       <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-[#051316] text-slate-500 uppercase tracking-widest">
                         ARCHIVED
                       </span>
                     )}
                   </div>
                   
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-teal-500/70 group-hover:text-teal-400 transition-colors">
                      Open Message <ArrowRight className="w-3 h-3" />
                   </div>
                 </button>
               ))
            )}
         </div>
      </div>

      {/* RIGHT PANE: EMPTY WORKSPACE PLACEHOLDER */}
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#03090a] rounded-3xl border border-white/[0.05] relative overflow-hidden">
         <div className="relative z-10 flex flex-col items-center justify-center opacity-50">
            <div className="w-20 h-20 bg-[#051316] border border-white/[0.05] rounded-full flex items-center justify-center mb-6">
               <MessageSquare className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-bold text-xl text-slate-300 mb-2">No Chat Selected</h3>
            <p className="text-sm font-medium text-slate-500 max-w-xs text-center">
              Select an active conversation from the sidebar to establish a secure connection.
            </p>
         </div>
      </div>

    </div>
  );
};

export default PatientMessages;
