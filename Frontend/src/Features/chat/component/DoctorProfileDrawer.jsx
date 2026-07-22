import React, { useEffect, useState } from "react";
import api from "../../../services/api";

const DoctorProfileDrawer = ({ isOpen, onClose, doctorId }) => {
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && doctorId) {
      const fetchDoctorProfile = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/patient/doctor-details/${doctorId}`);
          setDoctorInfo(response.data.data);
        } catch (error) {
          console.error("Failed to load doctor profile");
        } finally {
          setIsLoading(false);
        }
      };
      fetchDoctorProfile();
    }
  }, [isOpen, doctorId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* দ্য ওভারলে */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* দ্য ড্রয়ার প্যানেল */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right z-50">
        {/* ড্রয়ার হেডার */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Doctor Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
          >
            ✕
          </button>
        </div>

        {/* কন্টেন্ট এরিয়া */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : doctorInfo ? (
            <div className="space-y-6">
              {/* বেসিক ইনফো & ট্রাস্ট ব্যাজ */}
              <div className="flex flex-col items-center text-center">
                <img
                  src={
                    doctorInfo.userId?.profileImage ||
                    "https://via.placeholder.com/150"
                  }
                  alt={doctorInfo.userId?.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm mb-4"
                />
                <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center space-x-1">
                  <span>{doctorInfo.userId?.fullName}</span>
                  {/* isVerified ব্যাজ */}
                  {doctorInfo.isVerified && (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                </h3>
                <p className="text-sm text-blue-600 font-semibold mt-1">
                  {doctorInfo.specialization}
                </p>

                {doctorInfo.experienceYears > 0 && (
                  <span className="mt-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {doctorInfo.experienceYears}+ Years Experience
                  </span>
                )}
              </div>

              {/* বায়ো (About) */}
              {doctorInfo.about && (
                <div className="text-center text-sm text-slate-600 px-4 italic">
                  "{doctorInfo.about}"
                </div>
              )}

              {/* প্রফেশনাল ডিটেইলস কার্ড */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-sm text-slate-500">BM&DC Reg.</span>
                  <span className="text-sm font-bold text-slate-800">
                    {doctorInfo.bmdcRegistration || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-sm text-slate-500">
                    Consultation Fee
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    ৳ {doctorInfo.consultationFee}
                  </span>
                </div>
                <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                  <span className="text-sm text-slate-500">Availability</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800 block">
                      {doctorInfo.shiftStartTime} - {doctorInfo.shiftEndTime}
                    </span>
                    <span className="text-xs text-slate-500">
                      {doctorInfo.workingDays?.length > 0
                        ? doctorInfo.workingDays.join(", ")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* কোয়ালিফিকেশনস */}
              {doctorInfo.qualifications?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3">
                    Qualifications
                  </h4>
                  <ul className="space-y-2">
                    {doctorInfo.qualifications.map((qual, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3"
                      >
                        <span className="text-blue-500 mt-0.5">🎓</span>
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-10">
              Profile data unavailable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileDrawer;
