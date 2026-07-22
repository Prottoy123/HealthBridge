import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchTodaysQueue } from "./Slices/doctorSlice"; 

const QueueViewer = () => {
  // 1. Redux State Extraction
  const { queue, isLoading, error } = useSelector((state) => state.doctor);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 2. Lifecycle Data Hydration (Step 2 Logic)
  useEffect(() => {
    dispatch(fetchTodaysQueue());
  }, [dispatch]);

  // 3. The Interaction Handler (Step 3 Logic)
  const handleStartConsultation = (appointmentId) => {
    if (!appointmentId) {
      toast.error("Invalid Appointment ID");
      return;
    }
    // Imperative Routing: Push to workspace using patient ID
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  // 4. Guard Clause 1: Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading Today's Queue...
        </p>
      </div>
    );
  }

  // 5. Guard Clause 2: Error State
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto mt-10">
        <h3 className="text-lg font-bold text-red-700 mb-2">Sync Failure</h3>
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchTodaysQueue())}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // 6. Main Return: The Data Grid
  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Today's Queue</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage your daily appointments efficiently.
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-100">
          Total Patients: {queue?.length || 0}
        </div>
      </div>

      {/* Queue List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {queue?.length === 0 ? (
          // Empty State UI
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-slate-400">☕</span>
            </div>
            <h3 className="text-lg font-medium text-slate-700">
              Queue is Empty
            </h3>
            <p className="text-slate-500 mt-2">
              No appointments scheduled for today.
            </p>
          </div>
        ) : (
          // Data List UI
          <div className="divide-y divide-slate-100">
            {queue.map((appointment) => (
              <div
                key={appointment._id}
                className="p-5 hover:bg-slate-50 transition-colors duration-150 flex items-center justify-between group"
              >
                {/* Patient Info */}
                <div className="flex flex-col">
                  {/* FIXED: Using patientDetails.name based on backend projection */}
                  <span className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {appointment.patientDetails?.name || "Unknown Patient"}
                  </span>

                  <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center font-medium text-slate-700">
                      ⏱ {appointment.startTime || "N/A"}
                    </span>
                    <span className="flex items-center font-medium text-slate-700">
                      Age: {appointment.patientDetails?.age || "N/A"}
                    </span>
                    {/* ADDED: Conditional coloring for the status badge based on COMPLETED status */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        appointment.status === "COMPLETED"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {appointment.status || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* --- LOGIC FIX: Conditional Action Button Area --- */}
                {/* If status is COMPLETED, show bold text; otherwise, show the button */}
                {appointment.status === "COMPLETED" ? (
                  <div className="px-5 py-2.5">
                    <span className="font-bold text-green-600 tracking-wide">
                      ✓ COMPLETED
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartConsultation(appointment._id)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
                  >
                    Start Consultation
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueViewer;
