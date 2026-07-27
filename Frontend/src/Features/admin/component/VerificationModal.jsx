import React from "react";
import { X, CheckCircle, FileText } from "lucide-react";

function VerificationModal({ isOpen, doctor, onClose, onVerify }) {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-[#03090a] rounded-2xl shadow-2xl border border-white/[0.05] w-full max-w-lg overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="bg-[#051316] px-6 py-5 border-b border-white/[0.05] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            Review Doctor Profile
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            
            <div className="bg-[#051316] p-4 rounded-xl border border-white/[0.02]">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1.5">
                Full Name
              </p>
              <p className="font-medium text-slate-200">
                {doctor.User_details?.fullName}
              </p>
            </div>
            
            <div className="bg-[#051316] p-4 rounded-xl border border-white/[0.02]">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1.5">
                Email
              </p>
              <p className="font-medium text-slate-200 truncate">
                {doctor.User_details?.email}
              </p>
            </div>

            <div className="bg-[#051316] p-4 rounded-xl border border-white/[0.02]">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1.5">
                BM&DC Reg No
              </p>
              <p className="font-mono text-teal-400 font-semibold tracking-wide">
                {doctor.bmdcRegistration || "Not Provided"}
              </p>
            </div>

            <div className="bg-[#051316] p-4 rounded-xl border border-white/[0.02]">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1.5">
                Specialization
              </p>
              <p className="font-medium text-slate-200">
                {doctor.specialization}
              </p>
            </div>
            
            <div className="bg-[#051316] p-4 rounded-xl border border-white/[0.02] sm:col-span-2">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1.5">
                Experience
              </p>
              <p className="font-medium text-slate-200">
                {doctor.experienceYears} Years
              </p>
            </div>
          </div>

          <div className="bg-[#051316] p-5 rounded-xl border border-white/[0.02]">
            <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-3">
              Qualifications
            </p>
            {doctor.qualifications && doctor.qualifications.length > 0 ? (
              <ul className="space-y-2">
                {doctor.qualifications.map((qual, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-300 font-medium">
                    <CheckCircle className="w-4 h-4 text-teal-500/70 shrink-0 mt-0.5" />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-amber-500 font-medium">
                No qualifications provided by the doctor.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#051316] px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-white/[0.05]">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-300 bg-transparent border border-white/[0.1] rounded-xl hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onVerify(doctor._id)}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-900 bg-teal-500 rounded-xl hover:bg-teal-600 transition-colors shadow-sm"
          >
            Confirm & Verify
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationModal;
