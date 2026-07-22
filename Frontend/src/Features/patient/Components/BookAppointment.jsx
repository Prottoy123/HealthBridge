import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchAvailableSlots,
  bookAppointment,
  selectSlot,
  clearAppointmentState,
} from "../slices/appointmentSlice";

function BookAppointment() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { availableSlots, selectedSlot, isFetchingSlots, isBooking } =
    useSelector((state) => state.appointment);

  // এআই অবজেক্ট এক্সট্র্যাক্ট করা হচ্ছে
  const aiSymptomSummary = useSelector(
    (state) => state.ai?.symptomSummary || null,
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const doctorId = searchParams.get("doctorId");

  useEffect(() => {
    if (doctorId && selectedDate) {
      dispatch(fetchAvailableSlots({ doctorId, date: selectedDate }));
    }

    return () => {
      dispatch(clearAppointmentState());
    };
  }, [doctorId, selectedDate, dispatch]);

  const handleSlotClick = (slot) => {
    dispatch(selectSlot(slot));
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot first.");
      return;
    }

    // THE FIX 1: API পে-লোডে অবজেক্টের ভেতর থেকে শুধু স্ট্রিংটি পাঠানো হচ্ছে
    const payload = {
      appointmentId: selectedSlot._id,
      aiSymptomSummary: aiSymptomSummary?.aiSymptomSummary || "",
    };

    dispatch(bookAppointment(payload))
      .unwrap()
      .then(() => {
        toast.success("Appointment booked successfully!");
        navigate("/patient/dashboard");
      })
      .catch((err) => {
        toast.error(err || "Failed to book appointment");
      });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select an available time slot to proceed.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              dispatch(selectSlot(null));
            }}
            className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>Available Slots</span>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {availableSlots?.length || 0}
            </span>
          </h2>

          {isFetchingSlots ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium text-sm">
                Finding best slots for you...
              </p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-16 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">
                No slots available on this date.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Please select another date from the calendar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?._id === slot._id;
                return (
                  <button
                    key={slot._id}
                    onClick={() => handleSlotClick(slot)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {slot.startTime}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit space-y-6">
          <h2 className="text-lg font-bold text-gray-800">Booking Details</h2>

          <div className="space-y-5">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                Selected Time
              </p>
              <p className="font-bold text-gray-800 text-lg">
                {selectedSlot ? selectedSlot.startTime : "Not Selected"}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">
                AI Symptom Summary
              </p>

              {/* THE FIX 2: UI-তে অবজেক্ট রেন্ডারিং ফিক্স করা হয়েছে */}
              {aiSymptomSummary ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 italic font-medium leading-relaxed">
                    "{aiSymptomSummary.aiSymptomSummary}"
                  </p>
                  <p className="text-xs font-bold text-blue-700 bg-blue-100 inline-block px-2 py-1 rounded shadow-sm">
                    Recommended: {aiSymptomSummary.specialistRecommendation}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No AI consultation summary found. Proceeding with standard
                  booking.
                </p>
              )}
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={isBooking || !selectedSlot}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                isBooking || !selectedSlot
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-md"
              }`}
            >
              {isBooking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Confirming...
                </>
              ) : (
                "Confirm Appointment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;
