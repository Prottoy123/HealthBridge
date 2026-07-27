import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchActiveFollowups } from "./Slices/doctorSlice";
import { MessageSquare, Clock, ShieldCheck, Inbox } from "lucide-react";

const Messages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeFollowUps, isActiveFollowUpsLoading, activeFollowUpsError } = useSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchActiveFollowups());
  }, [dispatch]);

  const handleOpenChat = (appointmentId) => {
    navigate(`/doctor/messages/${appointmentId}`, { state: { status: "ACTIVE" } });
  };

  const calculateTimeToLive = (expiresAt) => {
    if (!expiresAt) return { text: "Expired", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", active: false };

    const difference = new Date(expiresAt) - new Date();
    if (difference <= 0) return { text: "Closed", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", active: false };

    const totalMinutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const colorClass = hours < 6 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-teal-400 bg-teal-500/10 border-teal-500/20";
    return { text: `${hours}h ${minutes}m`, color: colorClass, active: true };
  };

  if (activeFollowUpsError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
          <h3 className="text-lg font-semibold text-rose-500 mb-2">Inbox Error</h3>
          <p className="text-slate-400">{activeFollowUpsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* LEFT PANE: Inbox List */}
      <div className="w-full md:w-96 shrink-0 flex flex-col h-full bg-[#03090a] rounded-2xl border border-white/[0.05] overflow-hidden">
         <div className="p-5 border-b border-white/[0.05] flex items-center gap-3">
           <MessageSquare className="w-5 h-5 text-teal-400" />
           <div>
             <h2 className="text-lg font-semibold text-slate-200">Secure Inbox</h2>
             <p className="text-xs text-slate-400 mt-0.5">Active follow-ups</p>
           </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {isActiveFollowUpsLoading ? (
              <div className="flex items-center justify-center h-full">
                 <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !activeFollowUps || activeFollowUps.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Inbox className="w-8 h-8 text-slate-600 mb-3" />
                  <p className="text-slate-300 font-medium text-sm">Inbox Clear</p>
                  <p className="text-xs text-slate-500 mt-1">No active follow-ups</p>
               </div>
            ) : (
              activeFollowUps.map((chat) => {
                const ttl = calculateTimeToLive(chat.expiresAt);
                return (
                  <button
                    key={chat._id}
                    onClick={() => ttl.active && handleOpenChat(chat.originalAppointmentId)}
                    disabled={!ttl.active}
                    className={`w-full text-left p-4 rounded-xl transition-colors flex flex-col gap-3 ${
                      ttl.active 
                        ? "bg-[#051316] hover:bg-white/[0.05] border border-white/[0.02]" 
                        : "bg-white/[0.01] opacity-60 border border-transparent cursor-not-allowed"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="flex items-center gap-3">
                         <img 
                           src={chat.patientInfo.profileImage || "https://via.placeholder.com/150"} 
                           alt="Patient" 
                           className="w-10 h-10 rounded-lg object-cover border border-white/[0.05]" 
                         />
                         <div>
                           <h4 className={`font-medium text-sm transition-colors ${ttl.active ? 'text-slate-200 hover:text-teal-400' : 'text-slate-400'}`}>
                             {chat.patientInfo.fullName}
                           </h4>
                           <p className="text-xs text-slate-500 mt-0.5">
                             {new Date(chat.appointmentDetails.appointmentDate).toLocaleDateString()}
                           </p>
                         </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                           <Clock className="w-3 h-3" /> Time Left
                         </span>
                         <span className={`text-xs font-medium px-2 py-0.5 rounded border ${ttl.color}`}>
                           {ttl.text}
                         </span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
         </div>
      </div>

      {/* RIGHT PANE: Placeholder state */}
      <div className="hidden md:flex flex-1 bg-[#03090a] rounded-2xl border border-white/[0.05] items-center justify-center h-full">
        <div className="text-center flex flex-col items-center max-w-sm px-6">
          <div className="w-16 h-16 bg-[#051316] rounded-2xl flex items-center justify-center border border-white/[0.05] mb-5">
             <ShieldCheck className="w-8 h-8 text-teal-500/70" />
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Secure Communications</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Select an active channel from your inbox to initiate an end-to-end encrypted connection with your patient.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Messages;
