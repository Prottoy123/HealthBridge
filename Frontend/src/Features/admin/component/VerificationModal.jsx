import React from "react";

function VerificationModal({ isOpen, doctor, onClose, onVerify }) {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Review Doctor Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
          >
            {/* Update: Missing SVG Icon Fixed */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-1">
                Full Name
              </p>
              <p className="font-medium text-gray-900">
                {doctor.User_details?.fullName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-1">
                Email
              </p>
              <p className="font-medium text-gray-900">
                {doctor.User_details?.email}
              </p>
            </div>

            {/* Update: BM&DC Registration Number Added to Modal */}
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-1">
                BM&DC Reg No
              </p>
              <p className="font-mono text-yellow-800 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded inline-block font-bold">
                {doctor.bmdcRegistration || "Not Provided"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-1">
                Specialization
              </p>
              <p className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block">
                {doctor.specialization}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-1">
                Experience
              </p>
              <p className="font-medium text-gray-900">
                {doctor.experienceYears} Years
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-2">
              Qualifications
            </p>
            {doctor.qualifications && doctor.qualifications.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm font-medium">
                {doctor.qualifications.map((qual, index) => (
                  <li key={index}>{qual}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-500 font-medium">
                No qualifications provided by the doctor.
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onVerify(doctor._id)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors shadow-sm"
          >
            Confirm & Verify
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationModal;
