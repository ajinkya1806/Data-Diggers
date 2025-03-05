// src/App.jsx
import { useState, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingActionButton from "./components/FloatingActionButton";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import OutputPage from "./pages/OutputPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// ProtectedRoute component using context
function ProtectedRoute({ children }) {
  const { authState } = useContext(AuthContext);

  if (authState === "loading") {
    return <div>Loading...</div>;
  }
  return authState === "authenticated" ? children : <Navigate to="/login" />;
}

function App() {
  const { authState, user } = useContext(AuthContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedData, setExtractedData] = useState(null);

  // Handler for file uploads
  const handleFileUpload = (files) => {
    setUploadedFiles(files);
  };

  // Handler for form submission (mock extraction for demo)
  const handleSubmit = () => {
    const mockExtractedData = {
      name: "John Doe",
      dob: "01/01/1990",
      gender: "Male",
      identifier: "ABCDE1234F",
    };
    setExtractedData(mockExtractedData);
  };

  if (authState === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                authState === "unauthenticated" ? (
                  <LoginPage />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/register"
              element={
                authState === "unauthenticated" ? (
                  <RegisterPage />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleFileUpload}
                    onSubmit={handleSubmit}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/output"
              element={
                <ProtectedRoute>
                  <OutputPage extractedData={extractedData} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage propUser={user} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <FloatingActionButton />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
