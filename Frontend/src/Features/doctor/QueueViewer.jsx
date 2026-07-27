import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchTodaysQueue } from "./Slices/doctorSlice";
import { Users, Clock, User, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";

const QueueViewer = () => {
  const { queue, isLoading, error } = useSelector((state) => state.doctor);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchTodaysQueue());
  }, [dispatch]);

  const handleStartConsultation = (appointmentId) => {
    if (!appointmentId) {
      toast.error("Invalid Appointment ID");
      return;
    }
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-teal-400 font-medium flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          Loading Queue...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-rose-500 mb-2">Sync Error</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchTodaysQueue())}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" />
            Today's Queue
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage your appointments for today.</p>
        </div>
        <div className="px-4 py-2 bg-[#051316] text-teal-400 rounded-lg border border-teal-500/20 flex items-center gap-2">
          <span className="text-sm text-slate-400">Total Patients:</span>
          <span className="text-lg font-semibold">{queue?.length || 0}</span>
        </div>
      </div>

      <div className="bg-[#03090a] rounded-2xl border border-white/[0.05] overflow-hidden min-h-[300px]">
        {queue?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">Queue is Empty</h3>
            <p className="text-sm text-slate-500">No appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {queue.map((appointment, index) => (
              <div
                key={appointment._id}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-[#051316] border border-white/[0.05] text-slate-400 font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-lg font-medium text-slate-200 group-hover:text-teal-400 transition-colors">
                      {appointment.patientDetails?.name || "Unknown Patient"}
                    </span>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        {appointment.startTime || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <User className="w-4 h-4" />
                        Age: {appointment.patientDetails?.age || "N/A"}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-medium border ${
                          appointment.status === "COMPLETED"
                            ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {appointment.status || "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {appointment.status === "COMPLETED" ? (
                    <div className="flex items-center gap-2 text-teal-400 font-medium px-4 py-2">
                      <CheckCircle className="w-5 h-5" />
                      Completed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartConsultation(appointment._id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-900 font-semibold rounded-lg transition-colors text-sm"
                    >
                      Start Consultation
                      <ArrowRight className="w-4 h-4" />
                    </button>
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

export default QueueViewer;
