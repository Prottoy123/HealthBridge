import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useSocket } from "../../hook/useSocket.js";
import { Users, Clock, CheckCircle, Activity, ChevronRight } from "lucide-react";

import { fetchTodayQueue, updateQueueStatus } from "../staff/Slices/staffSlice";
import { fetchDoctorsForDropdown } from "../staff/Slices/SlotSlice";

const LiveDeskManager = () => {
  const dispatch = useDispatch();

  // 1. Global Socket Activation
  useSocket();

  // 2. Global Memory Extraction
  const { queueStatus, todayQueue } = useSelector((state) => state.staff);
  const { doctorsList } = useSelector((state) => state.slot);

  // 3. Local Component States
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  // 4. Lifecycle: Fetch doctor list on mount
  useEffect(() => {
    dispatch(fetchDoctorsForDropdown());
  }, [dispatch]);

  // 5. Lifecycle: Fetch queue when a doctor is selected
  useEffect(() => {
    if (selectedDoctorId) {
      dispatch(fetchTodayQueue(selectedDoctorId));
    }
  }, [dispatch, selectedDoctorId]);

  // 6. Action Controller: Optimistic Status Update
  const handleStatusChange = async (
    appointmentId,
    currentStatus,
    newStatus,
  ) => {
    if (currentStatus === newStatus) return;

    dispatch(updateQueueStatus({ appointmentId, newStatus }));

    try {
      await api.patch(`/staff/queue-status/${appointmentId}`, {
        status: newStatus,
      });
      toast.success("Status updated successfully.");
    } catch (error) {
      // Rollback Protocol
      dispatch(updateQueueStatus({ appointmentId, newStatus: currentStatus }));
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-400" />
            Live Desk Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time patient queue and status management
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#051316] p-2 rounded-xl border border-white/[0.05]">
          <div className="flex items-center bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.05]">
            <label className="text-sm text-slate-400 mr-3">Target Doctor:</label>
            <select
              className="bg-transparent text-slate-200 text-sm font-medium focus:outline-none focus:ring-0 outline-none min-w-[200px]"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
            >
              <option value="" className="bg-slate-800 text-white">-- Select Doctor --</option>
              {doctorsList?.map((doc) => (
                <option key={doc._id} value={doc._id} className="bg-slate-800 text-white">
                  Dr. {doc.User_details?.fullName || "Unknown"}
                  {doc.specialization ? ` (${doc.specialization})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Queue View */}
      <div className="bg-[#03090a] rounded-2xl border border-white/[0.05] overflow-hidden min-h-[300px]">
        {!selectedDoctorId ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-[#051316] border border-white/[0.05] rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">No Doctor Selected</h3>
            <p className="text-sm text-slate-500">Please select a doctor to view their live queue.</p>
          </div>
        ) : queueStatus === "loading" ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
             <div className="text-teal-400 font-medium flex items-center gap-2">
               <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
               Syncing live queue...
             </div>
          </div>
        ) : todayQueue?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-[#051316] border border-white/[0.05] rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">Queue is Empty</h3>
            <p className="text-sm text-slate-500">No appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {todayQueue.map((appointment, index) => (
              <div
                key={appointment._id}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-[#051316] border border-white/[0.05] text-slate-400 font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-lg font-medium text-slate-200 group-hover:text-teal-400 transition-colors">
                      {appointment.patientInfo?.fullName || "Unknown Patient"}
                    </span>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        {appointment.startTime}
                      </div>
                      
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-medium border ${
                          appointment.status === "CHECKED-IN"
                            ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            : appointment.status === "IN-PROGRESS"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {appointment.status === "COMPLETED" ? (
                     <div className="flex items-center gap-2 text-teal-400 font-medium px-4 py-2">
                        <CheckCircle className="w-5 h-5" />
                        Completed
                     </div>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            appointment._id,
                            appointment.status,
                            "CHECKED-IN",
                          )
                        }
                        disabled={appointment.status === "CHECKED-IN"}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-medium rounded-lg transition-colors text-sm border border-white/[0.05]"
                      >
                        Check In
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            appointment._id,
                            appointment.status,
                            "IN-PROGRESS",
                          )
                        }
                        disabled={appointment.status === "IN-PROGRESS"}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/20 disabled:text-teal-500 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
                      >
                        In Progress
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDeskManager;
