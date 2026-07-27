import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { analyzeSymptoms, clearSymptomSummary } from "../Slices/AI-Slices";
import { Loader2, RefreshCw, ArrowRight, Brain } from "lucide-react";

function AiSymptomBot() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { symptomSummary, isAnalyzingSymptom, symptomError } = useSelector(
    (state) => state.ai,
  );

  const [symptomText, setSymptomText] = useState("");
  const isValidInput = symptomText.trim().length >= 20;

  const handleAnalyze = () => {
    if (!isValidInput) {
      toast.error("Please enter at least 20 characters for symptom analysis.");
      return;
    }

    dispatch(analyzeSymptoms(symptomText))
      .unwrap()
      .then(() => toast.success("Analysis complete! Review your summary."))
      .catch((error) => toast.error(error || "Failed to analyze symptoms."));
  };

  const handleClear = () => {
    dispatch(clearSymptomSummary());
    setSymptomText("");
  };

  const handleProceed = () => navigate("/patient/get-doctors");

  return (
    <div className="w-full h-full flex flex-col relative z-10">
      {/* 
        ========================================================================
        STATE 2: RESULTS MATRIX (When AI has processed the text)
        ========================================================================
      */}
      {symptomSummary ? (
        <div className="flex-1 flex flex-col justify-between animate-in zoom-in-95 duration-500 h-full p-2">
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {/* The Clinical Matrix Output */}
            <div className="bg-[#051316] border border-white/[0.05] rounded-2xl p-5 relative shadow-sm">
              <div className="absolute top-0 right-0 px-3 py-1 bg-teal-500/10 text-teal-400 font-bold text-[10px] uppercase tracking-widest rounded-bl-xl rounded-tr-2xl border-b border-l border-white/[0.05]">
                Analysis Complete
              </div>

              <div className="flex items-start gap-3 mb-4">
                <div className="mt-1 flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </div>
                <div>
                  <h3 className="text-teal-400 font-bold uppercase tracking-widest text-[10px]">AI Summary</h3>
                  <p className="text-slate-200 text-sm font-medium leading-relaxed mt-1">
                    {symptomSummary.aiSymptomSummary}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/[0.05] pt-4 mt-2">
                {/* Specialist Card */}
                <div className="bg-[#03090a] border border-white/[0.05] rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Target Specialist</span>
                  <span className="text-teal-400 font-semibold text-sm leading-tight">{symptomSummary.specialistRecommendation}</span>
                </div>
                
                {/* Severity Badge */}
                <div className={`border rounded-xl p-3 flex flex-col justify-between ${
                  symptomSummary.severityLevel?.toLowerCase().includes("high") || symptomSummary.severityLevel?.toLowerCase().includes("severe")
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : symptomSummary.severityLevel?.toLowerCase().includes("moderate")
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-teal-500/10 border-teal-500/30 text-teal-400"
                }`}>
                  <span className="text-inherit opacity-70 text-[10px] font-bold uppercase tracking-widest mb-1">Severity Level</span>
                  <span className="font-bold text-sm leading-tight uppercase tracking-wide">{symptomSummary.severityLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-4 pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-3 shrink-0">
             <button
              onClick={handleClear}
              className="py-3 bg-[#03090a] hover:bg-white/[0.05] border border-white/[0.05] text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleProceed}
              className="py-3 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              Consult
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* 
          ========================================================================
          STATE 1: INPUT TERMINAL
          ========================================================================
        */
        <div className="flex-1 flex flex-col p-2">
          <div className="relative flex-1 group min-h-[200px]">
            {/* Terminal Styling */}
            <div className="absolute inset-0 bg-[#051316] rounded-2xl border border-white/[0.05] pointer-events-none transition-colors duration-300 shadow-sm"></div>
            
            <textarea
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              placeholder="How are you feeling? Describe your symptoms... (e.g. Sharp pain in the lower back radiating downwards for 2 days.)"
              className="absolute inset-0 w-full h-full p-6 bg-transparent text-slate-200 placeholder-slate-600 resize-none outline-none z-10 custom-scrollbar font-medium"
              disabled={isAnalyzingSymptom}
            />

            {/* Character Count Overlay */}
            <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
               <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-[#03090a] border ${symptomText.trim().length >= 20 ? 'text-teal-400 border-teal-500/20' : 'text-slate-500 border-white/[0.05]'}`}>
                  {symptomText.trim().length} Chars
               </span>
            </div>
          </div>

          <div className="mt-4 shrink-0">
             {symptomError && (
                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg text-center">
                  {symptomError}
                </div>
              )}
            <button
              onClick={handleAnalyze}
              disabled={!isValidInput || isAnalyzingSymptom}
              className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-3 ${
                !isValidInput || isAnalyzingSymptom
                  ? "bg-[#051316] text-slate-600 border border-white/[0.05] cursor-not-allowed"
                  : "bg-teal-500 text-slate-900 shadow-sm hover:bg-teal-600"
              }`}
            >
              {isAnalyzingSymptom ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-900" />
                  Processing Data...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Symptoms
                </>
              )}
            </button>
            {!isValidInput && (
              <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-3">
                Minimum 20 characters required to activate AI engine.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AiSymptomBot;
