import React from "react";

const RecordGrid = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mt-6">
        <h3 className="text-lg font-medium text-gray-900">No Records Found</h3>
        <p className="text-gray-500 text-sm mt-1">
          Upload your lab reports or prescriptions to keep them safe.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {records.map((record) => (
        <div
          key={record._id}
          className="bg-white group rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden flex flex-col"
        >
          {/* File Thumbnail / Preview Zone */}
          <div className="h-40 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
            {record.recordType === "PRESCRIPTION" ||
            record.fileUrl.match(/\.(jpeg|jpg|png|webp)$/i) ? (
              <img
                src={record.fileUrl}
                alt="Medical Record"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-gray-400 font-bold tracking-widest group-hover:scale-110 transition-transform duration-300">
                [ DOCUMENT ]
              </div>
            )}

            {/* Record Type Badge */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
              {record.recordType || "REPORT"}
            </div>
          </div>

          {/* Record Metadata */}
          <div className="p-4 flex flex-col flex-grow">
            <h4
              className="font-semibold text-gray-800 text-sm truncate"
              title={record.note || "Medical Document"}
            >
              {record.note || "Medical Document"}
            </h4>
            <div className="text-xs text-gray-500 mt-2">
              <span className="font-medium">Uploaded: </span>
              {record.uploadedAt
                ? new Date(record.uploadedAt).toLocaleDateString("en-GB")
                : "Unknown Date"}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <a
                href={record.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Full &rarr;
              </a>

              {/* Future Integration Point for AI Decode Button */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordGrid;
