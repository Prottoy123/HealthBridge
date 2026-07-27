import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchDoctorProfile,
  updateDoctorProfile,
} from "../Slices/doctorProfileSlice";
import { Plus, X, User, Calendar, Settings } from "lucide-react";
import { MEDICAL_DOMAINS } from "../../../constants/medicalDomains";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function DoctorProfile() {
  const dispatch = useDispatch();
  const { profile, status } = useSelector((state) => state.doctorProfile);

  const [activeTab, setActiveTab] = useState("IDENTITY"); 
  const [isEditing, setIsEditing] = useState(false);
  const [qualInput, setQualInput] = useState("");
  const [qualifications, setQualifications] = useState([]);
  const [workingDays, setWorkingDays] = useState([]);
  const [formData, setFormData] = useState({
    consultationFee: "",
    experienceYears: "",
    slotDuration: "",
    shiftStartTime: "",
    shiftEndTime: "",
    roomNumber: "",
    specialization: "",
    about: "",
    bmdcRegistration: "",
  });

  useEffect(() => {
    if (!profile && status === "idle") {
      dispatch(fetchDoctorProfile());
    }
  }, [dispatch, profile, status]);

  useEffect(() => {
    if (profile) {
      setFormData({
        consultationFee: profile.consultationFee || "",
        experienceYears: profile.experienceYears || "",
        slotDuration: profile.slotDuration || "",
        shiftStartTime: profile.shiftStartTime || "",
        shiftEndTime: profile.shiftEndTime || "",
        roomNumber: profile.roomNumber || "",
        specialization: profile.specialization || "",
        about: profile.about || "",
        bmdcRegistration: profile.bmdcRegistration || "",
      });
      setQualifications(profile.qualifications || []);
      setWorkingDays(profile.workingDays || []);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        consultationFee: profile.consultationFee || "",
        experienceYears: profile.experienceYears || "",
        slotDuration: profile.slotDuration || "",
        shiftStartTime: profile.shiftStartTime || "",
        shiftEndTime: profile.shiftEndTime || "",
        roomNumber: profile.roomNumber || "",
        specialization: profile.specialization || "",
        about: profile.about || "",
        bmdcRegistration: profile.bmdcRegistration || "",
      });
      setQualifications(profile.qualifications || []);
      setWorkingDays(profile.workingDays || []);
      setQualInput("");
    }
  };

  const handleAddQualification = () => {
    if (qualInput.trim() !== "") {
      setQualifications((prev) => [...prev, qualInput.trim()]);
      setQualInput("");
    }
  };

  const handleRemoveQualification = (index) => {
    setQualifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleWorkingDayToggle = (day) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, qualifications, workingDays };

    try {
      await dispatch(updateDoctorProfile(payload)).unwrap();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error || "Failed to update profile");
    }
  };

  if (status === "loading" && !profile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-teal-400 font-medium flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 pb-10">
      
      {/* LEFT PANE: Navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
        <div className="bg-[#051316] p-6 rounded-2xl border border-white/[0.05] flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-xl bg-[#03090a] border border-white/[0.05] mb-4 overflow-hidden">
             <img
               src={profile?.userId?.profileImage || "https://via.placeholder.com/150"}
               alt="Profile"
               className="w-full h-full object-cover"
             />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">
            Dr. {profile?.userId?.fullName || "Doctor"}
          </h2>
          <p className="text-sm text-slate-400 mb-3">
            {profile?.userId?.email}
          </p>
          <div className={`px-3 py-1 rounded text-xs font-medium border ${
              profile?.isVerified ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}
          >
            {profile?.isVerified ? "Verified Practitioner" : "Pending Verification"}
          </div>
        </div>

        <div className="bg-[#03090a] p-2 rounded-xl border border-white/[0.05] flex flex-col gap-1">
           <button
             onClick={() => setActiveTab("IDENTITY")}
             className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left flex items-center gap-3 ${
               activeTab === "IDENTITY" ? "bg-white/[0.05] text-teal-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
             }`}
           >
             <User className="w-4 h-4" /> Identity
           </button>
           <button
             onClick={() => setActiveTab("SCHEDULE")}
             className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left flex items-center gap-3 ${
               activeTab === "SCHEDULE" ? "bg-white/[0.05] text-teal-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
             }`}
           >
             <Calendar className="w-4 h-4" /> Schedule
           </button>
           <button
             onClick={() => setActiveTab("CONSULTATION")}
             className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left flex items-center gap-3 ${
               activeTab === "CONSULTATION" ? "bg-white/[0.05] text-teal-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
             }`}
           >
             <Settings className="w-4 h-4" /> Consultation
           </button>
        </div>
      </div>

      {/* RIGHT PANE: Forms */}
      <div className="flex-1 bg-[#03090a] rounded-2xl border border-white/[0.05] flex flex-col min-h-[500px]">
        <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
           <div>
             <h2 className="text-lg font-semibold text-slate-200">Professional Configuration</h2>
             <p className="text-sm text-slate-400 mt-1">Manage your professional details</p>
           </div>
           
           {!isEditing ? (
             <button
               onClick={() => setIsEditing(true)}
               className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-white/[0.05]"
             >
               Edit Profile
             </button>
           ) : (
             <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={status === "loading"}
                  className="px-4 py-2 hover:bg-white/[0.05] rounded-lg text-sm font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? "Saving..." : "Save Changes"}
                </button>
             </div>
           )}
        </div>

        <div className="flex-1 p-6">
           <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
             
             {/* IDENTITY TAB */}
             {activeTab === "IDENTITY" && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Specialization</label>
                      <div className="relative">
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50 appearance-none"
                        >
                          <option value="" disabled className="text-slate-500">Select a specialization</option>
                          {MEDICAL_DOMAINS.map((domain) => (
                            <option key={domain} value={domain}>
                              {domain}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                           <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">BM&DC Reg No</label>
                      <input
                        type="text"
                        name="bmdcRegistration"
                        value={formData.bmdcRegistration}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50"
                        placeholder="Registration ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Experience (Years)</label>
                      <input
                        type="number"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">Qualifications</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {qualifications.map((qual, index) => (
                        <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/[0.05] text-slate-200 border border-white/[0.05]">
                          {qual}
                          {isEditing && (
                            <button type="button" onClick={() => handleRemoveQualification(index)} className="text-slate-400 hover:text-rose-400">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={qualInput}
                          onChange={(e) => setQualInput(e.target.value)}
                          placeholder="Add qualification (e.g. MBBS)"
                          className="flex-1 bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50"
                        />
                        <button type="button" onClick={handleAddQualification} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2 border border-white/[0.05]">
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Professional Bio</label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50 resize-none"
                      placeholder="Write a short professional bio..."
                    />
                  </div>
               </div>
             )}

             {/* SCHEDULE TAB */}
             {activeTab === "SCHEDULE" && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Shift Start Time</label>
                      <input
                        type="time"
                        style={{ colorScheme: 'dark' }}
                        name="shiftStartTime"
                        value={formData.shiftStartTime}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Shift End Time</label>
                      <input
                        type="time"
                        style={{ colorScheme: 'dark' }}
                        name="shiftEndTime"
                        value={formData.shiftEndTime}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">Working Days</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = workingDays.includes(day);
                        return (
                          <label
                            key={day}
                            className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors border ${
                              isSelected
                                ? "bg-teal-500/10 border-teal-500/20 text-teal-400 font-medium"
                                : "bg-[#051316] border-white/[0.05] text-slate-400 hover:bg-white/[0.02]"
                            } ${!isEditing ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={isSelected}
                              onChange={() => handleWorkingDayToggle(day)}
                              disabled={!isEditing}
                            />
                            <span className="text-sm">{day.substring(0,3)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
               </div>
             )}

             {/* CONSULTATION TAB */}
             {activeTab === "CONSULTATION" && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Consultation Fee (৳)</label>
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Slot Duration (Mins)</label>
                      <input
                        type="number"
                        name="slotDuration"
                        value={formData.slotDuration}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50"
                        placeholder="e.g. 15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Room / Chamber Number</label>
                      <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-[#051316] border border-white/[0.05] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-50"
                        placeholder="e.g. 402B"
                      />
                    </div>
                  </div>
               </div>
             )}
             
           </form>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
