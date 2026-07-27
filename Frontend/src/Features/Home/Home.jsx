import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#050f11] flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-100 overflow-hidden relative">
      {/* Ambient background glows matching Login.jsx */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#153e43_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

      {/* 1. Navigation Bar */}
      <nav className="bg-[#050f11]/80 backdrop-blur-xl border-b border-white/[0.05] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(20,184,166,0.25)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
                Health<span className="text-teal-400">Bridge</span>
              </Link>
            </div>

            {/* Support & Auth Links */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex flex-col text-right mr-4 border-r border-white/[0.1] pr-6">
                <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest">
                  24/7 Helpline
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  16XXX (Toll-Free)
                </span>
              </div>

              <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:brightness-110 text-slate-950 px-6 py-2 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition duration-150"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow relative z-10">
        {/* 2. Hero Section */}
        <section className="relative pt-20 pb-24 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-inner backdrop-blur-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
              AI-Powered Healthcare Ecosystem
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-4xl mx-auto tracking-tight">
            Next-Generation Healthcare, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Built Around You.
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the perfect blend of artificial intelligence and human medical expertise. Get guided pre-assessments, secure digital vaults, and 48-hour live post-consultation support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:brightness-110 text-slate-950 px-8 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition duration-150 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span>Book a Consultation</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
            <a
              href="#features"
              className="bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.08] text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition duration-150 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span>Discover Features</span>
              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </a>
          </div>
        </section>

        {/* 3. Platform Statistics (New Section added as requested) */}
        <section className="py-12 border-y border-white/[0.05] bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-sm">
                <span className="block text-[10px] text-teal-400 uppercase font-bold tracking-widest mb-1">Active Doctors</span>
                <span className="text-3xl font-extrabold text-white">500+</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-sm">
                <span className="block text-[10px] text-teal-400 uppercase font-bold tracking-widest mb-1">Avg. Wait Time</span>
                <span className="text-3xl font-extrabold text-white">{"<"}15 min</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-sm">
                <span className="block text-[10px] text-teal-400 uppercase font-bold tracking-widest mb-1">Prescriptions Decoded</span>
                <span className="text-3xl font-extrabold text-white">1.2M</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-sm">
                <span className="block text-[10px] text-teal-400 uppercase font-bold tracking-widest mb-1">Patient Satisfaction</span>
                <span className="text-3xl font-extrabold text-white">99.8%</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. The Patient Experience */}
        <section id="features" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                Everything You Need, <span className="text-teal-400">In One Platform</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                From the moment you feel unwell to your complete recovery, HealthBridge provides seamless, secure, and HIPAA-compliant smart tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/[0.06] shadow-2xl backdrop-blur-sm hover:bg-white/[0.04] transition duration-200">
                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-5 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  AI-Powered Health Assistant
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Before you even meet the doctor, our advanced AI Symptom Bot analyzes your health conditions, providing initial guidance and preparing a comprehensive report to save consultation time.
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_#22d3ee]"></span> Instant Symptom Analysis
                  </li>
                  <li className="flex items-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_#22d3ee]"></span> Precision Doctor Matching
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/[0.06] shadow-2xl backdrop-blur-sm hover:bg-white/[0.04] transition duration-200">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-5 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  Vision AI Decoder
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Struggling to read handwritten prescriptions? Simply upload an image, and our Vision AI engine will instantly decode it into clear, digital text, entering it directly into your medical record.
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mr-2 shadow-[0_0_8px_#2dd4bf]"></span> High Text Recognition Accuracy
                  </li>
                  <li className="flex items-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mr-2 shadow-[0_0_8px_#2dd4bf]"></span> Automated Record Entry
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/[0.06] shadow-2xl backdrop-blur-sm hover:bg-white/[0.04] transition duration-200">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  The Digital Medical Vault
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Carry your entire medical history in your pocket. Safely store lab reports, past prescriptions, and clinical summaries in an encrypted cloud vault that only you and your authorized doctors can access.
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_#34d399]"></span> End-to-End Cloud Encryption
                  </li>
                  <li className="flex items-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_#34d399]"></span> Never Lose a Report Again
                  </li>
                </ul>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/[0.06] shadow-2xl backdrop-blur-sm hover:bg-white/[0.04] transition duration-200">
                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-5 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  48-Hour Live Follow-Up
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Have a question about your new medication? Every consultation includes an exclusive 48-hour secure chat window, allowing you to message your doctor directly without needing to book another appointment.
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_#22d3ee]"></span> Direct Doctor-Patient Chat
                  </li>
                  <li className="flex items-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-2 shadow-[0_0_8px_#22d3ee]"></span> Instant Clarifications on Rx
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. The Dual-Market CTA (For Doctors) */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-t from-[#03090a] to-transparent">
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10 bg-white/[0.02] border border-white/[0.08] p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">
              Are you a Medical Professional?
            </h2>
            <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed max-w-2xl mx-auto">
              Join HealthBridge to digitize your practice, manage patient records seamlessly, and provide top-tier live follow-ups. Expand your reach without the clinic hassle.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-white hover:bg-slate-200 text-slate-900 px-8 py-3 rounded-xl text-sm font-bold transition duration-150 uppercase tracking-widest gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <span>Join the Network</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </Link>
          </div>
        </section>
      </main>

      {/* 6. Minimal Modern Footer */}
      <footer className="bg-[#03090a] border-t border-white/[0.05] py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tighter">Health<span className="text-teal-400">Bridge</span></span>
          </div>
          
          <p className="text-xs text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} HealthBridge Inc. All rights reserved.
          </p>
          
          <div className="flex gap-6 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-teal-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
