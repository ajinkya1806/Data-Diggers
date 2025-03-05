"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

const OutputPage = ({ extractedData }) => {
  const [copied, setCopied] = useState(false);

  // Default data if none is provided
  const data = extractedData || {
    name: "John Doe",
    dob: "01/01/1990",
    gender: "Male",
    identifier: "ABCDE1234F",
  };

  const copyToClipboard = () => {
    const text = `Name: ${data.name}\nDOB: ${data.dob}\nGender: ${data.gender}\nIdentifier: ${data.identifier}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Extracted Information
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Here's the information extracted from your documents
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-3xl mx-auto border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Document Details
            </h2>
            <p className="text-indigo-100 mt-1 text-lg">
              Extracted from your uploaded document
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 border-b pb-4"
              >
                <div className="text-gray-500 font-medium mb-1 md:mb-0 text-lg">
                  Name:
                </div>
                <div className="col-span-2 font-semibold text-gray-900 text-xl">
                  {data.name}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 border-b pb-4"
              >
                <div className="text-gray-500 font-medium mb-1 md:mb-0 text-lg">
                  Date of Birth:
                </div>
                <div className="col-span-2 font-semibold text-gray-900 text-xl">
                  {data.dob}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 border-b pb-4"
              >
                <div className="text-gray-500 font-medium mb-1 md:mb-0 text-lg">
                  Gender:
                </div>
                <div className="col-span-2 font-semibold text-gray-900 text-xl">
                  {data.gender}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 pb-4"
              >
                <div className="text-gray-500 font-medium mb-1 md:mb-0 text-lg">
                  Identifier:
                </div>
                <div className="col-span-2 font-semibold text-gray-900 text-xl">
                  {data.identifier}
                </div>
              </motion.div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </motion.button>

              <Link
                to="/upload"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Upload Another Document
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Need to process more documents?
          </h3>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
            >
              Go to Upload Page
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OutputPage;
