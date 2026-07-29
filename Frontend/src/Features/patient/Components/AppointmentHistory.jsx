import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointmentHistory, clearHistoryState } from "../Slices/appointmentHistorySlice";
import { Calendar, Clock, Activity, CalendarDays, Loader2, AlertCircle } from "lucide-react";

const AppointmentHistory = () => {
  const dispatch = useDispatch();
  const { history, isLoading, error } = useSelector((state) => state.appointmentHistory);

  useEffect(() => {
    dispatch(fetchAppointmentHistory());

    return () => {
      dispatch(clearHistoryState());
    };
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-200 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20 shadow-inner">
             <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-teal-400" />
          </div>
          Appointment History
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-medium max-w-2xl">
          Review all your past and upcoming medical appointments with HealthBridge specialists.
        </p>
      </div>

      {/* Content Area */}
      <div className="bg-[#051316] rounded-2xl md:rounded-[2rem] border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading History...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-rose-400 font-bold mb-2">Failed to load history</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : history?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-300 font-bold text-lg mb-1">No Appointments Found</p>
            <p className="text-sm text-slate-500">You haven't booked any appointments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#03090a]/50 text-slate-400 text-xs uppercase tracking-widest border-b border-white/[0.05]">
                  <th className="p-4 md:px-6 md:py-5 font-bold">Doctor</th>
                  <th className="p-4 md:px-6 md:py-5 font-bold">Date & Time</th>
                  <th className="p-4 md:px-6 md:py-5 font-bold">Status</th>
                  <th className="p-4 md:px-6 md:py-5 font-bold">Follow Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {history?.map((apt) => (
                  <tr key={apt._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 md:px-6 md:py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#03090a] border border-white/[0.05] shrink-0">
                          {apt.doctor?.profileImage ? (
                            <img src={apt.doctor.profileImage} alt={apt.doctor.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-slate-800">
                              {apt.doctor?.fullName?.charAt(0) || "D"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 group-hover:text-teal-400 transition-colors">
                            {apt.doctor?.fullName || "Unknown Doctor"}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Specialist</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4 md:px-6 md:py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                          <Calendar className="w-4 h-4 text-teal-500/70" />
                          {new Date(apt.appointmentDate).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {apt.startTime}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 md:px-6 md:py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>

                    <td className="p-4 md:px-6 md:py-5 text-sm">
                      {apt.followUp ? (
                        <div className="flex flex-col gap-1">
                           <span className="text-teal-400 font-medium">Follow Up Advised</span>
                           <span className="text-[10px] text-slate-500">
                             Within {apt.followUp.durationInDays} days
                           </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;
