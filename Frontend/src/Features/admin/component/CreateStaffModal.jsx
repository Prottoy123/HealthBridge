import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  provisionStaffAccount,
  clearNewlyCreatedCredentials,
} from "../slices/staffProvisioningSlice"

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

  // সিকিউরিটি ফ্লাশ: মডাল বন্ধ হলে বা আনমাউন্ট হলে মেমরি ক্লিনআপ
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
      .then(() => {
        toast.success("Account provisioned successfully!");
      })
      .catch((error) => {
        toast.error(error || "Failed to create account.");
      });
  };

  const handleCloseModal = () => {
    dispatch(clearNewlyCreatedCredentials());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* মডাল হেডার */}
        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white tracking-wide">
            Provision New Account
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {newlyCreatedCredentials ? (
          <div className="p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center shadow-inner">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Success!</h3>
              <p className="text-sm text-gray-600 mb-4">
                The {newlyCreatedCredentials.user?.role} account has been
                created.
              </p>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Temporary Password
                </p>
                <p className="text-3xl font-mono font-black text-gray-900 tracking-widest">
                  {newlyCreatedCredentials.temporaryPassword}
                </p>
              </div>

              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-red-600 font-bold flex items-start gap-1 text-left">
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  This password is shown only once. Please copy it and share it
                  securely with the staff member.
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-colors focus:ring-4 focus:ring-gray-200"
            >
              I have copied the password
            </button>
          </div>
        ) : (
          // --- স্টেট ১: প্রভিশনিং ফর্ম ---
          <div className="p-6">
            <form onSubmit={handleProvisionAccount} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="staff@healthbridge.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Assign Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none font-semibold text-gray-700"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2 ${
                    isProvisioning
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                  }`}
                >
                  {isProvisioning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Provisioning Account...
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
