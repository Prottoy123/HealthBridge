import React from "react";
import { FolderOpen, FileText, Stethoscope, UserRound, ExternalLink,Sparkles } from "lucide-react";

const RecordGrid = ({ records, isPrescriptionTab, onDecodeClick }) => {
  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] border border-dashed border-white/[0.05] rounded-3xl mt-2 bg-[#03090a]/50">
        <div className="w-16 h-16 bg-[#051316] rounded-2xl flex items-center justify-center mb-4 border border-white/[0.05]">
          <FolderOpen className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-300 tracking-tight">Directory Empty</h3>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-2 max-w-xs text-center leading-relaxed">
          Upload records to synchronize encrypted data to this vault sector.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 mt-2 auto-rows-max">
      {records.map((record) => (
        <div
          key={record._id}
          className="group relative bg-[#051316] rounded-2xl border border-white/[0.05] hover:border-teal-500/30 transition-colors flex flex-col overflow-hidden shadow-sm h-64"
        >
          {/* File Header Tab */}
          <div className="h-1 w-full bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-0 left-0 z-20"></div>

          {/* Thumbnail Section */}
          <div className="h-32 w-full bg-[#03090a] border-b border-white/[0.05] relative overflow-hidden flex items-center justify-center group-hover:bg-[#06181b] transition-colors shrink-0">
            {record.fileUrl.match(/\.(jpeg|jpg|png|webp|gif)/i) ? (
              <img src={record.fileUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : record.fileUrl.match(/\.pdf/i) && record.fileUrl.includes("cloudinary") ? (
              <img src={record.fileUrl.replace(/\.pdf/i, ".jpg")} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <FileText className="w-10 h-10 text-slate-700 group-hover:text-teal-500/50 transition-colors" />
            )}
            
            {/* Date Badge Overlay */}
            <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest text-slate-300 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/[0.1]">
              {record.createdAt || record.prescriptionDate
                ? new Date(record.createdAt || record.prescriptionDate).toLocaleDateString("en-GB")
                : "NO DATE"}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 p-4 flex flex-col justify-between relative z-10 bg-[#051316]">
            <div>
              <h4
                className="font-bold text-slate-200 text-sm truncate group-hover:text-teal-400 transition-colors"
                title={record.description || record.title || record.note || "Medical Document"}
              >
                {record.description || record.title || record.note || "Medical Document"}
              </h4>
              
              {record.doctorName && (
                <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest flex items-center gap-1.5 truncate">
                  <UserRound className="w-3.5 h-3.5 text-slate-600" />
                  {record.doctorName}
                </p>
              )}
            </div>

            {/* Bottom Area: Actions */}
            <div className="mt-4 flex items-center justify-between">
              <a
                href={record.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#03090a] hover:bg-white/[0.05] border border-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Open Document"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {(isPrescriptionTab || record.recordType === "PRESCRIPTION") && onDecodeClick && (
                <button
                  onClick={() => onDecodeClick(record)}
                  className="bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-slate-900 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 border border-teal-500/20 group-hover:border-teal-500/30"
                >
                  <Sparkles className="w-3 h-3" />
                  Analyze
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordGrid;
