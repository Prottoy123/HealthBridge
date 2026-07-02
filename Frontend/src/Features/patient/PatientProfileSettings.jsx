import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePatientProfile,
  fetchPatientProfile,
} from "./Slices/patientSlice.js";
import toast from "react-hot-toast";

function PatientProfileSettings() {
  const dispatch = useDispatch();
  const { profile, status } = useSelector((state) => state.patient);

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    bloodGroup: "",
    allergies: "",
    chronicDiseases: "",
    emergencyContact: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // 1. Data Injector
  useEffect(() => {
    setFormData({
      dateOfBirth: profile?.dateOfBirth?.split("T")[0] || "",
      bloodGroup: profile?.bloodGroup || "",
      allergies: profile?.allergies?.join(", ") || "",
      chronicDiseases: profile?.chronicDiseases?.join(", ") || "",
      emergencyContact: profile?.emergencyContact || "",
    });
  }, [profile]);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchPatientProfile());
    }
  }, [dispatch, profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      dateOfBirth: profile?.dateOfBirth?.split("T")[0] || "",
      bloodGroup: profile?.bloodGroup || "",
      allergies: profile?.allergies?.join(", ") || "",
      chronicDiseases: profile?.chronicDiseases?.join(", ") || "",
      emergencyContact: profile?.emergencyContact || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentAllergies = profile?.allergies?.join(", ") || "";
    const currentChronicDiseases = profile?.chronicDiseases?.join(", ") || "";

    const payload = {};

    if (formData.dateOfBirth !== (profile?.dateOfBirth?.split("T")[0] || ""))
      payload.dateOfBirth = formData.dateOfBirth;
    if (formData.bloodGroup !== profile?.bloodGroup)
      payload.bloodGroup = formData.bloodGroup;
    if (formData.emergencyContact !== profile?.emergencyContact)
      payload.emergencyContact = formData.emergencyContact;

    if (formData.allergies !== currentAllergies) {
      payload.allergies = formData.allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (formData.chronicDiseases !== currentChronicDiseases) {
      payload.chronicDiseases = formData.chronicDiseases
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (Object.keys(payload).length > 0) {
      dispatch(updatePatientProfile(payload));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } else {
      toast("No changes were made", { icon: "ℹ️" });
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
      {/* ================= IDENTITY HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* Avatar Circle */}
          <div className="h-16 w-16 bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-900 rounded-2xl flex items-center justify-center text-2xl font-extrabold shadow-sm border border-slate-200 shrink-0">
            {profile?.userId?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2 justify-center sm:justify-start">
              {profile?.userId?.fullName || "Not specified"}
              <span
                className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_#10b981]"
                title="Active Patient Status"
              ></span>
            </h1>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              {profile?.userId?.email || "No email available"} • @
              {profile?.userId?.username || "username"}
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 shadow-sm flex items-center gap-1.5 cursor-pointer self-center sm:self-start"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit Medical Info
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-teal-600">
          Medical profile
        </h2>
      </div>

      {isEditing ? (
        /* ================= EDIT MODE (FORM) ================= */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Blood Group
              </label>
              <div className="relative">
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 text-sm shadow-sm appearance-none"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="+880 1..."
                className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 text-sm shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Allergies
            </label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              placeholder="Dust, Pollen, Peanuts..."
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 text-sm shadow-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              * Separate multiple items with a comma (e.g. Pollen, Peanuts)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Chronic Diseases
            </label>
            <input
              type="text"
              name="chronicDiseases"
              value={formData.chronicDiseases}
              onChange={handleInputChange}
              placeholder="Diabetes, Asthma..."
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 text-sm shadow-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              * Separate multiple items with a comma (e.g. Asthma, Hypertension)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition duration-150 text-xs cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold uppercase tracking-wider rounded-xl shadow-md shadow-teal-500/10 hover:shadow-lg disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition duration-150 text-xs flex items-center cursor-pointer"
            >
              {status === "loading" ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        /* ================= VIEW MODE (READ-ONLY) ================= */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Blood Group */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[100px] hover:border-teal-300 hover:shadow-md transition duration-300">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Blood Type
              </span>
              <span className="text-xl font-black text-rose-600 mt-2 inline-block">
                {profile?.bloodGroup || "Not specified"}
              </span>
            </div>

            {/* Date of Birth */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[100px] hover:border-teal-300 hover:shadow-md transition duration-300">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                DOB
              </span>
              <span className="text-base font-black text-slate-800 mt-2 inline-block">
                {profile?.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Not specified"}
              </span>
            </div>

            {/* Emergency Contact */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[100px] hover:border-teal-300 hover:shadow-md transition duration-300">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Emergency Line
              </span>
              <span className="text-base font-black text-slate-800 mt-2 inline-block">
                {profile?.emergencyContact || "Not specified"}
              </span>
            </div>
          </div>

          {/* Allergies Block */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Allergy Declarations
            </span>
            <div className="flex flex-wrap gap-2">
              {profile?.allergies?.length > 0 ? (
                profile.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100 shadow-sm hover:scale-[1.02] transition"
                  >
                    {allergy}
                  </span>
                ))
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 px-4 py-2.5 rounded-xl text-xs font-semibold w-full">
                  <svg
                    className="w-4 h-4 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No known allergies reported. Profile clinically clear.
                </div>
              )}
            </div>
          </div>

          {/* Chronic Diseases Block */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-400">
              Chronic Diseases
            </span>
            <div className="flex flex-wrap gap-2">
              {profile?.chronicDiseases?.length > 0 ? (
                profile.chronicDiseases.map((disease, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 shadow-sm hover:scale-[1.02] transition"
                  >
                    {disease}
                  </span>
                ))
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 px-4 py-2.5 rounded-xl text-xs font-semibold w-full">
                  <svg
                    className="w-4 h-4 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No chronic diseases reported. Active wellness monitoring.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientProfileSettings;
