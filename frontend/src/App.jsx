import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingActionButton from "./components/FloatingActionButton";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import OutputPage from "./pages/OutputPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // Scroll on pathname change, not just mount

  return null;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedData, setExtractedData] = useState(null);

  // Check authentication status and fetch user data on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Fetch user profile from backend
      fetch("http://localhost:5000/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token in Authorization header
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch profile");
          }
          return response.json();
        })
        .then((data) => {
          setUser({
            name: data.fullName || "User",
            username: data.username, // Using username as username for consistency
            profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              data.fullName || data.username
            )}&background=random`, // Generate avatar based on name or username
          });
          setIsLoggedIn(true);
        })
        .catch((err) => {
          console.error(err);
          // If token is invalid/expired, clear it and log out
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
          setUser(null);
        });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Token is already set in LoginPage/RegisterPage, so no need to set it here
    // Optionally fetch profile again if userData is incomplete
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setUploadedFiles([]); // Optional: Clear files on logout
    setExtractedData(null); // Optional: Clear extracted data on logout
    localStorage.removeItem("authToken"); // Remove JWT token
  };

  const handleFileUpload = (files) => {
    setUploadedFiles(files);
  };

  const handleSubmit = () => {
    // Simulate OCR extraction (replace with real API call if needed)
    const mockExtractedData = {
      name: "John Doe",
      dob: "01/01/1990",
      gender: "Male",
      identifier: "ABCDE1234F",
    };
    setExtractedData(mockExtractedData);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
        <ScrollToTop />
        <Navbar user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/upload"
              element={
                isLoggedIn ? (
                  <UploadPage
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleFileUpload}
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/output"
              element={
                isLoggedIn ? (
                  <OutputPage extractedData={extractedData} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/login"
              element={
                !isLoggedIn ? (
                  <LoginPage onLogin={handleLogin} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/register"
              element={
                !isLoggedIn ? (
                  <RegisterPage onRegister={handleLogin} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </main>
        <FloatingActionButton isLoggedIn={isLoggedIn} />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
