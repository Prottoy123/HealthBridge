import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserPlus, Image as ImageIcon, ChevronDown } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "PATIENT",
    bmdcRegistration: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (formData.role === "DOCTOR" && !formData.bmdcRegistration.trim()) {
      return toast.error("BMDC Registration number is required for doctors.");
    }

    setIsLoading(true);

    const submitData = new FormData();
    submitData.append("fullName", formData.fullName);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("role", formData.role);
    if (formData.role === "DOCTOR") {
      submitData.append("bmdcRegistration", formData.bmdcRegistration);
    }
    if (profileImage) submitData.append("profileImage", profileImage);

    try {
      await api.post("/user/register", submitData);
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03090a] relative overflow-hidden font-sans py-12 px-4 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* Main Centered Form Container */}
      <div className="w-full max-w-md bg-[#051316] border border-white/[0.05] p-6 sm:p-10 rounded-3xl shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Logo / Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold mb-4">
             <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-200 leading-tight">
            Create an Account
          </h2>
          <p className="mt-2.5 text-sm text-slate-400">
            Join HealthBridge to access secure records and direct consultations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="block w-full px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
              placeholder="name@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Register As
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="block w-full px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors text-sm appearance-none cursor-pointer"
              >
                <option value="PATIENT" className="bg-slate-800 text-white">Patient (Looking for care)</option>
                <option value="DOCTOR" className="bg-slate-800 text-white">Doctor (Providing care)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* BMDC Registration (Doctors Only) */}
          {formData.role === "DOCTOR" && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                BM&DC Registration Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.bmdcRegistration}
                onChange={(e) => setFormData({ ...formData, bmdcRegistration: e.target.value })}
                className="block w-full px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
                placeholder="e.g. A12345"
              />
            </div>
          )}

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Profile Photo <span className="text-slate-500 normal-case">(Optional)</span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-white/[0.05] border-dashed rounded-xl cursor-pointer bg-[#03090a] hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-6 h-6 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400">
                    {profileImage ? (
                      <span className="text-teal-400 font-semibold">{profileImage.name}</span>
                    ) : (
                      <>Click to upload <span className="font-semibold text-teal-400">Image</span></>
                    )}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-xl bg-teal-500 hover:bg-teal-600 py-3 text-sm font-semibold text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <span
            className="font-semibold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer transition-colors"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
