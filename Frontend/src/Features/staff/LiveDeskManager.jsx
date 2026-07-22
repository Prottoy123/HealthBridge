import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useSocket } from "../../hook/useSocket.js";

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
    <div className="h-full flex flex-col bg-gray-50 p-6">
      {/* Header & Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Live Desk Control</h2>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">
            Select Doctor:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="">-- Select Doctor --</option>
            {doctorsList?.map((doc) => (
              // Extracting the correct ID based on exact database structure
              <option key={doc._id} value={doc._id}>
                Dr. {doc.User_details?.fullName || "Unknown"}
                {doc.specialization ? ` (${doc.specialization})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Queue View */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {!selectedDoctorId ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a doctor from the top to view the live queue.
          </div>
        ) : queueStatus === "loading" ? (
          <div className="flex items-center justify-center h-full text-blue-500 font-medium">
            Loading live queue...
          </div>
        ) : todayQueue?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No appointments found for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="p-4 font-semibold">Patient Name</th>
                  <th className="p-4 font-semibold">Time Slot</th>
                  <th className="p-4 font-semibold">Current Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayQueue.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {/* Fixed Data Mapping: Using patientInfo as per Backend Aggregation */}
                      {appointment.patientInfo?.fullName || "Unknown Patient"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {appointment.startTime}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          appointment.status === "CHECKED-IN"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "IN-PROGRESS"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {/* Action Controllers */}
                      <button
                        onClick={() =>
                          handleStatusChange(
                            appointment._id,
                            appointment.status,
                            "CHECKED-IN",
                          )
                        }
                        className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-100 transition"
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
                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
                      >
                        In Progress
                      </button>
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

export default LiveDeskManager;
