import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { setCredentials } from "./authSlice";
import { Activity, ShieldCheck, Stethoscope } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("All fields are required");
    }

    setIsLoading(true);

    try {
      const response = await api.post("/user/login", { email, password });
      const { user, accessToken } = response.data.data;

      dispatch(setCredentials({ user, accessToken }));
      toast.success("Login successful!");

      if (user.role === "PATIENT") {
        navigate("/patient/dashboard");
      } else if (user.role === "DOCTOR") {
        navigate("/doctor/queue");
      } else if (user.role === "STAFF") {
        navigate("/staff/dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#03090a] relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Column: Login Form */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-12 lg:px-20 xl:px-24 relative z-10 w-full max-w-xl mx-auto lg:max-w-none">
        <div className="w-full bg-[#051316] border border-white/[0.05] p-6 sm:p-10 rounded-3xl shadow-2xl">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-200">
              Health<span className="text-teal-400">Bridge</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-200 leading-tight">
              Welcome back
            </h2>
            <p className="mt-2.5 text-sm text-slate-400">
              Sign in to manage patient profiles, appointment queues, and
              clinical configurations.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-400">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-xl bg-teal-500 hover:bg-teal-600 py-3 text-sm font-semibold text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              New to HealthBridge?{" "}
              <span
                className="font-semibold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer transition-colors"
                onClick={() => navigate("/register")}
              >
                Create an account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#03090a] p-16 text-white border-l border-white/[0.05] relative overflow-hidden">
        
        {/* Top brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20">
            <ShieldCheck className="w-4 h-4" />
            HIPAA Compliant
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Active Stream
          </span>
        </div>

        {/* Middle visual representation */}
        <div className="relative z-10 my-auto max-w-md space-y-8">
          <div className="bg-[#051316] rounded-2xl p-6 border border-white/[0.05] shadow-2xl space-y-6">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                Real-Time Intake
              </span>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#03090a] rounded-xl p-4 border border-white/[0.05] text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                  Avg Wait
                </span>
                <span className="text-lg font-bold text-teal-400 mt-1 block">
                  18 min
                </span>
              </div>
              <div className="bg-[#03090a] rounded-xl p-4 border border-white/[0.05] text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                  Intake
                </span>
                <span className="text-lg font-bold text-teal-400 mt-1 block">
                  142/hr
                </span>
              </div>
              <div className="bg-[#03090a] rounded-xl p-4 border border-white/[0.05] text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                  Load
                </span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">
                  Normal
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold tracking-tight leading-snug text-slate-200">
              Smart Healthcare Operations
            </h3>
            <p className="mt-4 text-slate-400 leading-relaxed text-sm">
              An all-in-one system designed for smart patient management, secure
              communication channels, and real-time medical staff scheduling.
            </p>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="relative z-10 text-xs text-slate-400 border-t border-white/[0.05] pt-8">
          <span className="italic leading-normal text-slate-400">
            "This platform has transformed how our clinic coordinates schedules
            and handles patient walk-ins." — Dr. Sarah Rahman, MD
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
