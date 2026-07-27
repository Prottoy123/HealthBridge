import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  provisionStaffAccount,
  clearNewlyCreatedCredentials,
} from "../slices/staffProvisioningSlice"
import { X, CheckCircle, AlertCircle, Loader2, UserPlus } from "lucide-react";

function CreateStaffModal({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const { isProvisioning, newlyCreatedCredentials } = useSelector(
    (state) => state.adminStaff, 
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "STAFF",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!isOpen) {
      dispatch(clearNewlyCreatedCredentials());
      setFormData({ fullName: "", email: "", role: "STAFF" });
    }
  }, [isOpen, dispatch]);

  const handleProvisionAccount = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please provide a valid email address.");
      return;
    }

    dispatch(provisionStaffAccount(formData))
      .unwrap()
      .then(() => toast.success("Account provisioned successfully!"))
      .catch((error) => toast.error(error || "Failed to create account."));
  };

  const handleCloseModal = () => {
    dispatch(clearNewlyCreatedCredentials());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
      
      {/* Modal Content */}
      <div className="bg-[#03090a] rounded-2xl border border-white/[0.05] shadow-2xl w-full max-w-md overflow-hidden relative z-10 transform transition-all">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-[#051316]">
          <h2 className="text-lg font-semibold text-slate-200 tracking-wide flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-400" />
            Provision New Account
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {newlyCreatedCredentials ? (
          <div className="p-6 space-y-6">
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-6 text-center shadow-inner">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-500/20 mb-4">
                 <CheckCircle className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-1">Success!</h3>
              <p className="text-sm text-slate-400 mb-6">
                The <span className="font-semibold text-teal-400">{newlyCreatedCredentials.user?.role}</span> account has been created.
              </p>

              <div className="bg-[#03090a] rounded-xl p-5 border border-white/[0.05] shadow-sm mb-6 relative group">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">
                  Temporary Password
                </p>
                <p className="text-3xl font-mono font-bold text-slate-200 tracking-wider">
                  {newlyCreatedCredentials.temporaryPassword}
                </p>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-left flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-500/90 font-medium leading-relaxed">
                  This password is shown only once. Please copy it and share it securely with the staff member before closing.
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
            >
              I have copied the password
            </button>
          </div>
        ) : (
          <div className="p-6">
            <form onSubmit={handleProvisionAccount} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-[#051316] border border-white/[0.05] rounded-xl focus:outline-none focus:border-teal-500/50 text-slate-200 placeholder-slate-600 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="staff@healthbridge.com"
                  className="w-full px-4 py-3 bg-[#051316] border border-white/[0.05] rounded-xl focus:outline-none focus:border-teal-500/50 text-slate-200 placeholder-slate-600 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Assign Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#051316] border border-white/[0.05] rounded-xl focus:outline-none focus:border-teal-500/50 text-slate-200 transition-colors text-sm appearance-none"
                >
                  <option value="STAFF" className="bg-slate-800 text-white">STAFF</option>
                  <option value="ADMIN" className="bg-slate-800 text-white">ADMIN</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className={`w-full py-3 px-4 rounded-xl text-slate-900 font-semibold text-sm transition-colors flex justify-center items-center gap-2 ${
                    isProvisioning
                      ? "bg-teal-500/50 cursor-not-allowed"
                      : "bg-teal-500 hover:bg-teal-600"
                  }`}
                >
                  {isProvisioning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateStaffModal;
