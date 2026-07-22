import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorsForDropdown,
  generateDoctorSlots,
  clearSlotFeedback,
} from "../slices/slotSlice";
import toast from "react-hot-toast";

function SlotManager() {
  const dispatch = useDispatch();

  const { doctorsList, isGenerating, isLoadingDoctors, successMessage, error } =
    useSelector((state) => state.slot);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [customDuration, setCustomDuration] = useState("");

  useEffect(() => {
    dispatch(fetchDoctorsForDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setSelectedDoctor("");
      setSelectedDate("");
      setCustomStartTime("");
      setCustomEndTime("");
      setCustomDuration("");
      dispatch(clearSlotFeedback());
    }

    if (error) {
      toast.error(error);
      dispatch(clearSlotFeedback());
    }
  }, [successMessage, error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDoctor || !selectedDate) {
      toast.error("Doctor selection and Date are mandatory!");
      return;
    }

    const payload = {
      doctorId: selectedDoctor,
      date: selectedDate,
      startTime: customStartTime || undefined,
      endTime: customEndTime || undefined,
      duration: customDuration || undefined,
    };

    dispatch(generateDoctorSlots(payload));
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Slot Configuration Engine
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Generate available appointment slots for doctors.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          {/* Doctor Dropdown Engine */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              disabled={isLoadingDoctors}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">
                {isLoadingDoctors
                  ? "Loading doctors..."
                  : "-- Select a Doctor --"}
              </option>

              {doctorsList?.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.User_details?.fullName || "Unknown"}
                  {doctor.specialization ? ` (${doctor.specialization})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-4 border border-dashed border-gray-300 rounded-lg">
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700">
              Custom Time Overrides
            </h3>
            <p className="text-xs text-gray-500">
              Leave blank to use the doctor's default profile schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="e.g. 15"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isGenerating || isLoadingDoctors}
            className={`px-6 py-2 rounded-md font-semibold text-white transition-colors ${
              isGenerating || isLoadingDoctors
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isGenerating ? "Deploying Slots..." : "Generate Slots"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SlotManager;
