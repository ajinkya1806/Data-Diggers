// src/pages/ProfilePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ProfilePage = ({ propUser }) => {
  const [user] = useState(propUser); // Use propUser directly, no local state updates
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Mock data for Aadhar and PAN cards (replace with real data later)
  const aadharData = {
    name: "John Doe",
    dob: "01/01/1990",
    gender: "Male",
    aadharNumber: "123456789012",
  };

  const panData = {
    name: "John Doe",
    fatherName: "James Doe",
    dob: "01/01/1990",
    panNumber: "ABCDE1234F",
  };

  // Loading state (shouldn’t trigger since no fetch)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-xl font-medium bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
        >
          Loading profile data...
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white bg-white bg-opacity-10 p-8 rounded-lg shadow-lg"
        >
          <p className="text-lg font-medium">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-lg font-medium rounded-md text-white bg-transparent hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // No user data state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white bg-white bg-opacity-10 p-8 rounded-lg shadow-lg"
        >
          <p className="text-lg font-medium">
            No user data available. Please log in.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-white text-lg font-medium rounded-md text-white bg-transparent hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  // Main profile content
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8"
      >
        {/* Profile Header */}
        <div className="flex items-center space-x-6 mb-10">
          <motion.div
            className="flex-shrink-0"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
              src={user.profilePic}
              alt={user.name}
            />
          </motion.div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {user.name}
            </h1>
            <p className="text-lg text-indigo-600 font-medium">{user.email}</p>
          </div>
        </div>

        {/* Aadhar Card Details */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Aadhar Card Details
          </h2>
          <motion.div
            className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-gray-700 text-lg">
              <span className="font-medium text-indigo-600">Name:</span>{" "}
              {aadharData.name}
            </p>
            <p className="text-gray-700 text-lg">
              <span className="font-medium text-indigo-600">DOB:</span>{" "}
              {aadharData.dob}
            </p>
            <p className="text-gray-700 text-lg">
              <span className="font-medium text-indigo-600">Gender:</span>{" "}
              {aadharData.gender}
            </p>
            <p className="text-gray-700 text-lg">
              <span className="font-medium text-indigo-600">
                Aadhar Number:
              </span>{" "}
              {aadharData.aadharNumber}
            </p>
          </motion.div>
        </div>

        {/* PAN Card Details */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            PAN Card Details
          </h2>
          <motion.div
            className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-gray-700 text-lg">
              <span className="font-medium text-indigo-600">Name:</span>{" "}
              {panData.name}
            </p>
            <p className="text-gray-700 text-lg">
              <span className="font-medium text-indigo-600">
                Father's Name:
              </span>{" "}
              {panData.fatherName}
            </p>
            <p className="text-gray-700 text-lg">
              <span className="font-medium text-indigo-600">DOB:</span>{" "}
              {panData.dob}
            </p>
            <p className="text-gray-700 text-lg">
              <span className="font-medium text-indigo-600">PAN Number:</span>{" "}
              {panData.panNumber}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
