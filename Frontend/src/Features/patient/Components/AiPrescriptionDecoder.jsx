import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  decodePrescription,
  clearDecodedPrescription,
} from "../Slices/AI-Slices";
import toast from "react-hot-toast";
import { Scan, X, FileText, Loader2, AlertCircle } from "lucide-react";

const AiPrescriptionDecoder = ({ record, onClose }) => {
  const dispatch = useDispatch();

  const { decodedPrescription, isDecodingPrescription, prescriptionError } =
    useSelector((state) => state.ai);

  const secureImageUrl = record?.fileUrl?.replace(/^http:\/\//i, 'https://');

  const handleDecodeSubmit = async () => {
    if (!secureImageUrl) {
      toast.error("Image source not found.");
      return;
    }

    try {
      const response = await fetch(secureImageUrl);
      const blob = await response.blob();

      const file = new File([blob], "prescription.jpg", {
        type: blob.type || "image/jpeg",
      });

      dispatch(decodePrescription(file));
    } catch (error) {
      toast.error("Network error: Failed to process image for AI.");
    }
  };

  useEffect(() => {
    if (prescriptionError) {
      toast.error(
        prescriptionError.includes("422") ||
          prescriptionError.includes("Unprocessable")
          ? "The image is unclear. Please take a clear photo in good lighting and upload again."
          : prescriptionError || "Failed to decode the prescription.",
      );
    }
  }, [prescriptionError]);

  useEffect(() => {
    return () => {
      dispatch(clearDecodedPrescription());
    };
  }, [dispatch]);

  let parsedPrescription = decodedPrescription;
  if (typeof decodedPrescription === "string") {
    try {
      parsedPrescription = JSON.parse(decodedPrescription);
    } catch (e) {
      parsedPrescription = { raw: decodedPrescription };
    }
  }

  return (
    <div className="fixed inset-0 bg-[#03090a]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-10">
      
      <div className={`w-full max-h-full flex flex-col relative transition-all duration-500 ease-in-out ${
        decodedPrescription ? "max-w-6xl" : "max-w-2xl"
      }`}>
        
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20 shadow-sm relative overflow-hidden">
                <Scan className="w-6 h-6 text-teal-400 relative z-10" />
             </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-200 tracking-tight">
                Vision AI Decoder
              </h3>
              <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mt-1">
                Target: {record.title || "Medical Document"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-[#051316] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 font-bold transition-colors rounded-xl border border-white/[0.05] hover:border-rose-500/20"
            disabled={isDecodingPrescription}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Workspace */}
        <div className={`flex flex-col ${decodedPrescription ? 'lg:flex-row' : ''} gap-6 h-full overflow-hidden`}>
          
          {/* Left/Center Panel: Image Preview & Scanning */}
          <div className={`flex flex-col relative transition-all duration-500 h-[60vh] lg:h-auto overflow-hidden ${
             decodedPrescription ? 'lg:w-1/2 shrink-0' : 'w-full h-[70vh]'
          }`}>
            <div className="bg-[#051316] rounded-3xl border border-white/[0.05] p-2 shadow-sm flex-1 relative overflow-hidden group flex items-center justify-center">

              {/* Main Image */}
              <img
                src={secureImageUrl}
                alt="Prescription Target"
                className={`w-full h-full object-contain rounded-2xl transition-all duration-500 ${
                  isDecodingPrescription ? "opacity-30 grayscale" : "opacity-90"
                }`}
              />

              {/* Holographic Scan Overlay */}
              {isDecodingPrescription && (
                <>
                  <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-transparent to-teal-500/20 shadow-[0_2px_20px_#2dd4bf] animate-[scan_2s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-[1px]">
                    <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                    <div className="mt-4 text-teal-400 font-bold uppercase tracking-widest text-xs animate-pulse">Neural Scan Initiated</div>
                    <div className="mt-2 text-teal-500/70 font-semibold uppercase tracking-widest text-[10px]">Extracting Medical Entities...</div>
                  </div>
                </>
              )}

              {/* Start Button (If not started and not done) */}
              {!isDecodingPrescription && !decodedPrescription && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={handleDecodeSubmit}
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl font-bold uppercase tracking-widest shadow-sm transition-all flex items-center gap-2 text-sm"
                  >
                    <FileText className="w-5 h-5" />
                    Extract Data
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Extracted Matrix (Only visible when decoded) */}
          {decodedPrescription && (
            <div className="flex-1 bg-[#051316] rounded-3xl border border-white/[0.05] p-6 md:p-8 flex flex-col shadow-sm relative overflow-hidden animate-in slide-in-from-right-8 duration-500 h-[60vh] lg:h-auto">
              
              <div className="flex items-center gap-3 mb-6 shrink-0 relative z-10">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
                  Extraction Matrix
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 relative z-10 space-y-4">
                
                {/* Visual Mapping of Data */}
                {parsedPrescription && typeof parsedPrescription === 'object' && !parsedPrescription.raw ? (
                  <div className="space-y-4">
                    {Object.entries(parsedPrescription).map(([key, value], idx) => (
                      <div key={idx} className="bg-[#03090a] border border-white/[0.05] rounded-2xl p-5">
                        <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-3">{key.replace(/_/g, ' ')}</h4>
                        
                        {Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-2">
                            {value.map((item, i) => (
                              <span key={i} className="px-3 py-1.5 bg-[#051316] rounded-lg text-sm text-slate-200 font-medium border border-white/[0.05]">
                                {typeof item === 'object' ? JSON.stringify(item) : item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-200 text-sm leading-relaxed font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback Raw Rendering */
                  <div className="bg-[#03090a] p-6 rounded-2xl border border-white/[0.05] h-full">
                    <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(parsedPrescription, null, 2)}
                    </pre>
                  </div>
                )}
                
              </div>

              <div className="mt-6 shrink-0 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 relative z-10">
                 <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                 <div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Medical Disclaimer</p>
                    <p className="text-xs text-amber-500/80 font-medium mt-1">This is an AI-generated interpretation of a handwritten document. Errors may exist. Always verify with your consulting physician.</p>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AiPrescriptionDecoder;
