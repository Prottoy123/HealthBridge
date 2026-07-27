import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchAvailableSlots,
  bookAppointment,
  selectSlot,
  clearAppointmentState,
} from "../Slices/appointmentSlice";
import { Calendar, Clock, Loader2, CalendarDays, Brain, XCircle, CheckCircle } from "lucide-react";

function BookAppointment() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { availableSlots, selectedSlot, isFetchingSlots, isBooking } =
    useSelector((state) => state.appointment);

  const aiSymptomSummary = useSelector(
    (state) => state.ai?.symptomSummary || null,
  );

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

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

    const payload = {
      appointmentId: selectedSlot._id,
      aiSymptomSummary: aiSymptomSummary?.aiSymptomSummary || "",
    };

    dispatch(bookAppointment(payload))
      .unwrap()
      .then(() => {
        toast.success("Appointment booked securely!");
        navigate("/patient/dashboard");
      })
      .catch((err) => {
        toast.error(err || "Failed to book appointment");
      });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col animate-in fade-in duration-700 pb-20">
      
      {/* Wizard Header */}
      <div className="mb-8 bg-[#051316] p-6 sm:p-8 rounded-3xl border border-white/[0.05] shadow-sm relative overflow-hidden shrink-0">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 shadow-sm">
                <Calendar className="w-6 h-6 text-teal-400" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-200 tracking-tight">
                  Schedule Consultation
                </h1>
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mt-1">
                  Select Date & Time
                </p>
             </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 bg-[#03090a] p-2 rounded-2xl border border-white/[0.05]">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-900 flex items-center justify-center text-[10px] font-bold">1</span>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest hidden sm:block">Date</span>
             </div>
             <div className="w-4 h-[1px] bg-white/[0.1]"></div>
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${selectedDate && !isFetchingSlots ? 'bg-teal-500/10 border-teal-500/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${selectedDate && !isFetchingSlots ? 'bg-teal-500 text-slate-900' : 'bg-[#051316] text-slate-500 border border-white/[0.05]'}`}>2</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block transition-colors ${selectedDate && !isFetchingSlots ? 'text-teal-400' : 'text-slate-500'}`}>Slot</span>
             </div>
             <div className="w-4 h-[1px] bg-white/[0.1]"></div>
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${selectedSlot ? 'bg-teal-500/10 border-teal-500/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${selectedSlot ? 'bg-teal-500 text-slate-900' : 'bg-[#051316] text-slate-500 border border-white/[0.05]'}`}>3</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block transition-colors ${selectedSlot ? 'text-teal-400' : 'text-slate-500'}`}>Review</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Wizard Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Selection Area (Date & Slots) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Date Picker Row */}
          <div className="bg-[#051316] p-6 rounded-3xl border border-white/[0.05] shadow-sm relative overflow-hidden flex items-center justify-between gap-6 shrink-0">
             <div className="relative z-10 flex-1">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                   <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                   Select Target Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={getLocalDateString()}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    dispatch(selectSlot(null));
                  }}
                  className="w-full max-w-sm bg-[#03090a] border border-white/[0.05] rounded-xl px-5 py-3 text-sm font-semibold text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors cursor-pointer hover:bg-white/[0.02]"
                  style={{ colorScheme: "dark" }}
                />
             </div>
             
             <div className="hidden sm:flex w-14 h-14 bg-[#03090a] rounded-full border border-white/[0.05] items-center justify-center relative z-10">
                <CalendarDays className="w-6 h-6 text-slate-500" />
             </div>
          </div>

          {/* Slot Grid Row */}
          <div className="bg-[#051316] p-6 rounded-3xl border border-white/[0.05] shadow-sm relative overflow-hidden flex flex-col">
            
            <div className="relative z-10 flex items-center justify-between mb-6 shrink-0 border-b border-white/[0.05] pb-6">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 <span className={`w-1.5 h-1.5 rounded-full ${selectedDate && !isFetchingSlots ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
                 Available Times
              </label>
              <div className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20 uppercase tracking-widest">
                {availableSlots?.length || 0} Slots Found
              </div>
            </div>

            <div className="relative z-10">
               {isFetchingSlots ? (
                 <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[200px]">
                   <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                   <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">
                     Loading Available Times...
                   </p>
                 </div>
               ) : availableSlots.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full min-h-[200px] border border-dashed border-white/[0.05] rounded-2xl bg-[#03090a]/50">
                   <div className="w-12 h-12 bg-[#051316] rounded-xl border border-white/[0.05] flex items-center justify-center mb-4">
                      <XCircle className="w-6 h-6 text-slate-500" />
                   </div>
                   <p className="text-slate-300 font-bold text-base">
                     No Availability
                   </p>
                   <p className="text-xs font-medium text-slate-500 mt-2 max-w-xs text-center leading-relaxed">
                     This date is fully booked. Please select an alternative date above.
                   </p>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 auto-rows-max">
                   {availableSlots.map((slot) => {
                     const isSelected = selectedSlot?._id === slot._id;
                     return (
                       <button
                         key={slot._id}
                         onClick={() => handleSlotClick(slot)}
                         className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors border flex flex-col items-center justify-center gap-1 ${
                           isSelected
                             ? "bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-sm"
                             : "bg-[#03090a] text-slate-400 border-white/[0.05] hover:bg-white/[0.05] hover:text-slate-200"
                         }`}
                       >
                         <span>{slot.startTime}</span>
                       </button>
                     );
                   })}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Review & Book Summary */}
        <div className="lg:w-[350px] shrink-0 flex flex-col lg:sticky lg:top-6 h-max">
           <div className="bg-[#051316] p-6 sm:p-8 rounded-3xl shadow-sm border border-white/[0.05] flex flex-col relative overflow-hidden">
              
              <h2 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10">
                 <span className={`w-1.5 h-1.5 rounded-full ${selectedSlot ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
                 Booking Summary
              </h2>

              <div className="space-y-4 relative z-10 flex flex-col">
                
                {/* Selected Node Display */}
                <div className="bg-[#03090a] p-6 rounded-2xl border border-white/[0.05] flex flex-col items-center justify-center min-h-[120px] transition-colors">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
                     Selected Time
                  </p>
                  <p className={`font-bold ${selectedSlot ? "text-3xl text-slate-200" : "text-3xl text-slate-600"}`}>
                    {selectedSlot ? selectedSlot.startTime : "--:--"}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-2">{selectedDate}</p>
                </div>

                {/* AI Summary Block */}
                <div className="flex-1 bg-[#03090a] p-5 rounded-2xl border border-white/[0.05] flex flex-col">
                  <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Brain className="w-3.5 h-3.5" />
                     AI Symptom Summary
                  </p>

                  {aiSymptomSummary ? (
                    <div className="flex-1 flex flex-col">
                      <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-teal-500/50 pl-3 mb-4 flex-1">
                        "{aiSymptomSummary.aiSymptomSummary}"
                      </p>
                      <div className="bg-teal-500/10 border border-teal-500/20 px-4 py-3 rounded-xl flex flex-col gap-1 shrink-0">
                         <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Matched Domain</span>
                         <span className="text-sm font-semibold text-teal-400">{aiSymptomSummary.specialistRecommendation}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                       <Clock className="w-6 h-6 text-slate-600 mb-3" />
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                         No AI pre-diagnosis attached.<br/>Standard booking protocol active.
                       </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Button */}
              <div className="mt-6 shrink-0 relative z-10 pt-6 border-t border-white/[0.05]">
                <button
                  onClick={handleConfirmBooking}
                  disabled={isBooking || !selectedSlot}
                  className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                    isBooking || !selectedSlot
                      ? "bg-[#03090a] text-slate-600 border border-white/[0.05] cursor-not-allowed"
                      : "bg-teal-500 text-slate-900 hover:bg-teal-600 shadow-sm"
                  }`}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-teal-900" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;
