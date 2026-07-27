import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctorsForDropdown,
  generateDoctorSlots,
  clearSlotFeedback,
} from "../Slices/SlotSlice";
import toast from "react-hot-toast";
import { CalendarClock, Calendar, Clock, Loader2, ArrowRight } from "lucide-react";

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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-teal-400" />
          Slot Configuration Engine
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Generate and manage available appointment slots for doctors.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#03090a] p-6 rounded-2xl border border-white/[0.05] flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Target Doctor
            </label>
            <div className="relative">
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                disabled={isLoadingDoctors}
                className="w-full bg-[#051316] border border-white/[0.05] rounded-xl px-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500/50 appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-slate-800 text-white">
                  {isLoadingDoctors ? "Syncing..." : "-- Select Doctor --"}
                </option>
                {doctorsList?.map((doctor) => (
                  <option key={doctor._id} value={doctor._id} className="bg-slate-800 text-white">
                    Dr. {doctor.User_details?.fullName || "Unknown"}
                    {doctor.specialization ? ` (${doctor.specialization})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Appointment Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="date"
                style={{ colorScheme: 'dark' }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#051316] border border-white/[0.05] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500/50"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#03090a] p-6 rounded-2xl border border-white/[0.05]">
          <div className="mb-6 flex items-center justify-between border-b border-white/[0.05] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                Custom Time Overrides
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Leave blank to inherit the doctor's default profile schedule.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Start Time</label>
              <input
                type="time"
                style={{ colorScheme: 'dark' }}
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="w-full bg-[#051316] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">End Time</label>
              <input
                type="time"
                style={{ colorScheme: 'dark' }}
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="w-full bg-[#051316] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="e.g. 15"
                className="w-full bg-[#051316] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500/50 placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isGenerating || isLoadingDoctors}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying Slots...
              </>
            ) : (
              <>
                Generate Slots
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SlotManager;
