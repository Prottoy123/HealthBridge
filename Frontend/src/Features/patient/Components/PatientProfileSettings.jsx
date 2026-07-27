import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePatientProfile,
  fetchPatientProfile,
} from "../Slices/patientSlice.js";
import toast from "react-hot-toast";
import { UserCircle, FileHeart, Edit3, X, Check, Activity, Loader2 } from "lucide-react";

function PatientProfileSettings() {
  const dispatch = useDispatch();
  const { profile, status } = useSelector((state) => state.patient);

  const [activeTab, setActiveTab] = useState("IDENTITY"); 
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    bloodGroup: "",
    allergies: "",
    chronicDiseases: "",
    emergencyContact: "",
  });

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
      toast.success("Profile updated securely!");
      setIsEditing(false);
    } else {
      toast("No changes were made", { icon: "ℹ️" });
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 h-full animate-in fade-in duration-700">
      
      {/* 
        ========================================================================
        LEFT SIDEBAR: PROFILE SUMMARY & TABS
        ========================================================================
      */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="bg-[#051316] p-8 rounded-3xl border border-white/[0.05] shadow-sm relative overflow-hidden flex flex-col items-center text-center">
           
           <div className="relative z-10 w-24 h-24 mb-4">
             <div className="w-full h-full bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center text-4xl font-bold border border-teal-500/20">
               {profile?.userId?.fullName?.charAt(0)?.toUpperCase() || "U"}
             </div>
             <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-teal-500 border-4 border-[#051316]"></div>
           </div>

           <h1 className="text-xl font-bold tracking-tight text-slate-200 relative z-10">
              {profile?.userId?.fullName || "Not specified"}
           </h1>
           <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-2 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20 relative z-10">
              @{profile?.userId?.username || "username"}
           </p>

           <div className="w-full h-[1px] bg-white/[0.05] my-6 relative z-10"></div>

           <div className="w-full flex flex-col gap-4 relative z-10">
              <div className="flex flex-col items-start text-xs">
                 <span className="text-slate-500 font-bold uppercase tracking-widest mb-1">Email</span>
                 <span className="text-slate-300 font-medium">{profile?.userId?.email || "No email"}</span>
              </div>
              <div className="flex flex-col items-start text-xs">
                 <span className="text-slate-500 font-bold uppercase tracking-widest mb-1">Network ID</span>
                 <span className="text-slate-300 font-mono bg-[#03090a] px-2 py-1 rounded border border-white/[0.05]">{profile?.userId?._id?.slice(-6).toUpperCase() || "N/A"}</span>
              </div>
           </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#03090a] p-2 rounded-2xl border border-white/[0.05] flex flex-col gap-1 shadow-sm">
           <button
             onClick={() => setActiveTab("IDENTITY")}
             className={`px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 ${
               activeTab === "IDENTITY"
                 ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                 : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] border border-transparent"
             }`}
           >
             <UserCircle className="w-4 h-4" />
             Identity Profile
           </button>
           <button
             onClick={() => setActiveTab("MEDICAL")}
             className={`px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-3 ${
               activeTab === "MEDICAL"
                 ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                 : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] border border-transparent"
             }`}
           >
             <FileHeart className="w-4 h-4" />
             Medical Dossier
           </button>
        </div>

      </div>

      {/* 
        ========================================================================
        RIGHT PANE: CONTENT AREA
        ========================================================================
      */}
      <div className="flex-1 bg-[#051316] rounded-3xl border border-white/[0.05] shadow-sm relative overflow-hidden flex flex-col">
         
         {/* Top Actions Bar */}
         <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/[0.05] shrink-0 relative z-10">
            <div>
               <h2 className="text-xl font-bold text-slate-200 tracking-tight flex items-center gap-2">
                 {activeTab === "IDENTITY" ? "Identity Parameters" : "Medical Dossier"}
               </h2>
               <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-2">
                 {activeTab === "IDENTITY" ? "Manage your core contact and identity details." : "Manage your clinical data and vitals."}
               </p>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-[#03090a] hover:bg-white/[0.05] border border-white/[0.05] text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Modify</span> Data
              </button>
            )}
         </div>

         {/* Content Scroll Area */}
         <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
           {isEditing ? (
             <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                
                {activeTab === "IDENTITY" && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 font-medium focus:outline-none focus:border-teal-500/50 transition-colors"
                          style={{ colorScheme: "dark" }}
                        />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                          Emergency Contact (ICE)
                        </label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          placeholder="e.g. +1 555-0198"
                          className="w-full px-5 py-4 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 font-medium placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                        />
                     </div>
                   </div>
                )}

                {activeTab === "MEDICAL" && (
                   <div className="space-y-6 animate-in fade-in duration-300">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                          Blood Group
                        </label>
                        <div className="relative">
                          <select
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 font-medium focus:outline-none focus:border-teal-500/50 transition-colors appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-[#03090a]">Select Blood Type</option>
                            <option value="A+" className="bg-[#03090a]">A+</option>
                            <option value="A-" className="bg-[#03090a]">A-</option>
                            <option value="B+" className="bg-[#03090a]">B+</option>
                            <option value="B-" className="bg-[#03090a]">B-</option>
                            <option value="O+" className="bg-[#03090a]">O+</option>
                            <option value="O-" className="bg-[#03090a]">O-</option>
                            <option value="AB+" className="bg-[#03090a]">AB+</option>
                            <option value="AB-" className="bg-[#03090a]">AB-</option>
                          </select>
                        </div>
                     </div>
                     
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                          Allergy Declarations <span className="text-slate-600 lowercase tracking-normal font-semibold">(comma separated)</span>
                        </label>
                        <input
                          type="text"
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          placeholder="Dust, Pollen, Peanuts..."
                          className="w-full px-5 py-4 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 font-medium placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                        />
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                          Chronic Diseases <span className="text-slate-600 lowercase tracking-normal font-semibold">(comma separated)</span>
                        </label>
                        <input
                          type="text"
                          name="chronicDiseases"
                          value={formData.chronicDiseases}
                          onChange={handleInputChange}
                          placeholder="Diabetes, Asthma..."
                          className="w-full px-5 py-4 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 font-medium placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                        />
                     </div>
                   </div>
                )}
             </form>
           ) : (
             <div className="h-full">
               
               {activeTab === "IDENTITY" && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <div className="bg-[#03090a] border border-white/[0.05] p-6 rounded-2xl shadow-sm">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                          <UserCircle className="w-4 h-4 text-teal-400" />
                          Date of Birth
                       </p>
                       <p className="text-lg font-bold text-slate-200">
                         {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not specified"}
                       </p>
                    </div>

                    <div className="bg-[#03090a] border border-white/[0.05] p-6 rounded-2xl shadow-sm">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-amber-400" />
                          Emergency Line
                       </p>
                       <p className="text-lg font-bold text-slate-200">
                         {profile?.emergencyContact || "Not specified"}
                       </p>
                    </div>
                 </div>
               )}

               {activeTab === "MEDICAL" && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-[#03090a] border border-white/[0.05] p-6 rounded-2xl shadow-sm">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                          <FileHeart className="w-4 h-4 text-rose-400" />
                          Blood Type
                       </p>
                       <p className="text-3xl font-bold text-rose-400">
                         {profile?.bloodGroup || "N/A"}
                       </p>
                    </div>

                    <div className="bg-[#03090a] border border-white/[0.05] p-6 rounded-2xl shadow-sm">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Allergy Declarations
                       </p>
                       <div className="flex flex-wrap gap-3">
                         {profile?.allergies?.length > 0 ? (
                           profile.allergies.map((allergy, index) => (
                             <span key={index} className="inline-flex items-center px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20 uppercase tracking-widest">
                               {allergy}
                             </span>
                           ))
                         ) : (
                           <div className="flex items-center gap-2 text-teal-400 bg-teal-500/10 border border-teal-500/20 px-4 py-3.5 rounded-xl text-[10px] font-bold w-full uppercase tracking-widest">
                             <Check className="w-4 h-4" />
                             No known allergies reported.
                           </div>
                         )}
                       </div>
                    </div>

                    <div className="bg-[#03090a] border border-white/[0.05] p-6 rounded-2xl shadow-sm">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Chronic Diseases
                       </p>
                       <div className="flex flex-wrap gap-3">
                         {profile?.chronicDiseases?.length > 0 ? (
                           profile.chronicDiseases.map((disease, index) => (
                             <span key={index} className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 uppercase tracking-widest">
                               {disease}
                             </span>
                           ))
                         ) : (
                           <div className="flex items-center gap-2 text-teal-400 bg-teal-500/10 border border-teal-500/20 px-4 py-3.5 rounded-xl text-[10px] font-bold w-full uppercase tracking-widest">
                             <Check className="w-4 h-4" />
                             No chronic diseases reported.
                           </div>
                         )}
                       </div>
                    </div>
                 </div>
               )}
             </div>
           )}
         </div>

         {/* Edit Mode Footer Actions */}
         {isEditing && (
           <div className="p-6 md:p-8 border-t border-white/[0.05] bg-[#03090a] shrink-0 flex items-center justify-end gap-4 relative z-10">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3.5 border border-white/[0.05] bg-[#051316] hover:bg-white/[0.05] text-slate-300 font-bold uppercase tracking-widest rounded-xl transition-colors text-[10px] shadow-sm flex items-center gap-2"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={status === "loading"}
                className="px-6 py-3.5 bg-teal-500 text-slate-900 hover:bg-teal-600 font-bold uppercase tracking-widest rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[10px] flex items-center gap-2"
              >
                {status === "loading" ? (
                   <>
                     <Loader2 className="w-3.5 h-3.5 animate-spin" />
                     Encrypting...
                   </>
                ) : (
                   <>
                     <Check className="w-3.5 h-3.5" />
                     Secure Save
                   </>
                )}
              </button>
           </div>
         )}
         
      </div>
    </div>
  );
}

export default PatientProfileSettings;
