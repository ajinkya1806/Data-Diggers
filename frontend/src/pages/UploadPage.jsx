import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

const UploadPage = ({ uploadedFiles, onFileUpload, onSubmit }) => {
  const [files, setFiles] = useState(uploadedFiles || []);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback(
    (acceptedFiles) => {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        setFiles((prevFiles) => [
          ...prevFiles,
          ...acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          ),
        ]);
        setIsUploading(false);
        onFileUpload([...files, ...acceptedFiles]);
      }, 1000);
    },
    [files, onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp"],
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFileUpload(newFiles);
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    // Call onSubmit callback (if needed by parent)
    onSubmit();
    // Clear the files state
    setFiles([]);
    // Update parent state with empty array
    onFileUpload([]);
    // Navigate to /output
    navigate("/output");
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Upload Documents
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Upload your Aadhar or PAN card images or PDFs for text extraction
          </p>
        </div>

        <div className="space-y-10">
          {/* Dropzone */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="border-2 border-dashed rounded-xl p-8"
            style={{
              borderColor: isDragActive ? "#6366f1" : "#e5e7eb",
              backgroundColor: isDragActive
                ? "rgba(99, 102, 241, 0.05)"
                : "white",
              boxShadow: isDragActive
                ? "0 0 0 2px rgba(99, 102, 241, 0.2)"
                : "none",
              transition: "all 0.2s ease",
            }}
          >
            <div
              {...getRootProps()}
              className="flex flex-col items-center justify-center py-12 cursor-pointer"
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <motion.div
                  animate={{
                    y: isDragActive ? [0, -10, 0] : 0,
                  }}
                  transition={{
                    repeat: isDragActive ? Number.POSITIVE_INFINITY : 0,
                    duration: 1.5,
                  }}
                >
                  <svg
                    className={`mx-auto h-16 w-16 ${
                      isDragActive ? "text-indigo-500" : "text-gray-400"
                    }`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <div className="flex flex-col items-center text-center mt-4">
                  <h3
                    className={`text-xl font-medium ${
                      isDragActive ? "text-indigo-600" : "text-gray-900"
                    }`}
                  >
                    {isDragActive
                      ? "Drop the files here"
                      : "Drag and drop files here"}
                  </h3>
                  <p className="text-base text-gray-500 mt-1">or</p>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.querySelector('input[type="file"]').click();
                    }}
                  >
                    Select files
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Supports JPG, PNG, GIF, and PDF up to 10MB
                </p>
              </div>
              {isUploading && (
                <div className="mt-6 w-full max-w-md">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1 }}
                    ></motion.div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 text-center flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="indigo" />
                    <span>Uploading...</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* File List */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
              Uploaded Files
            </h2>
            {files.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-gray-500 mt-4">No files uploaded yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Upload files using the drag and drop area above
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      transition={{ duration: 0.2 }}
                      className="relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={file.preview || "/placeholder.svg"}
                            alt={file.name}
                            className="h-full w-full object-cover"
                            onLoad={() => {
                              URL.revokeObjectURL(file.preview);
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-16 w-16"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="mt-2">PDF Document</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
                      </motion.button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-12">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={files.length === 0 || isUploading}
              className={`px-8 py-4 rounded-xl text-white font-medium text-lg md:text-xl shadow-lg flex items-center justify-center gap-2 ${
                files.length === 0 || isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              }`}
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Processing...</span>
                </>
              ) : files.length === 0 ? (
                "Upload Files to Continue"
              ) : (
                "Process Documents"
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
