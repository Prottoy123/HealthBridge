import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchDoctorProfile,
  updateDoctorProfile,
} from "../Slices/doctorProfileSlice"; 

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
      prev.includes(day)
        ? prev.filter((d) => d !== day) 
        : [...prev, day],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      qualifications,
      workingDays,
    };

    try {
      await dispatch(updateDoctorProfile(payload)).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error || "Failed to update profile");
    }
  };

  if (status === "loading" && !profile) {
    return (
      <div className="flex justify-center py-20 text-gray-500 font-medium">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden my-8">
      {/* Header Section (Read-Only) */}
      <div className="bg-gray-50 px-6 py-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src={
              profile?.userId?.profileImage || "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border border-gray-300"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Dr. {profile?.userId?.fullName || "Doctor"}
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              {profile?.userId?.email}
            </p>
            <span
              className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profile?.isVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {profile?.isVerified
                ? "Verified Practitioner"
                : "Verification Pending"}
            </span>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Basic Info Grid*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BM&DC Registration No
            </label>
            <input
              type="text"
              name="bmdcRegistration"
              value={formData.bmdcRegistration}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Fee (৳)
            </label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slot Duration (Minutes)
            </label>
            <input
              type="number"
              name="slotDuration"
              value={formData.slotDuration}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Schedule Time Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div>
            <label className="block text-sm font-bold text-blue-800 mb-1">
              Shift Start Time
            </label>
            <input
              type="time"
              name="shiftStartTime"
              value={formData.shiftStartTime}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-800 mb-1">
              Shift End Time
            </label>
            <input
              type="time"
              name="shiftEndTime"
              value={formData.shiftEndTime}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dynamic Array : Qualifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualifications
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {qualifications.map((qual, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
              >
                {qual}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQualification(index)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    ✕
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
                placeholder="e.g. MBBS, FCPS"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddQualification}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Checkbox: Working Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Working Days
          </label>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = workingDays.includes(day);
              return (
                <label
                  key={day}
                  className={`flex items-center px-4 py-2 border rounded-md cursor-pointer transition-colors text-sm font-medium ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  } ${!isEditing ? "opacity-75 pointer-events-none" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handleWorkingDayToggle(day)}
                    disabled={!isEditing}
                  />
                  {day}
                </label>
              );
            })}
          </div>
        </div>

        {/* About Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            About
          </label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Write a short professional bio..."
          />
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={status === "loading"}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center"
            >
              {status === "loading" ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default DoctorProfile;
