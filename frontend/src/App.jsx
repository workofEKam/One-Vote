import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import VotingPage from "./pages/student/VotingPage";
import ElectionResults from "./pages/ElectionResults";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ElectionManager from "./pages/admin/ElectionManager";
import CandidateManager from "./pages/admin/CandidateManager";
import StudentManager from "./pages/admin/StudentManager";

// Root redirect handler based on user role
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "Admin" ? "/admin" : "/dashboard"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />

              {/* Root index redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Student routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/elections/:electionId/vote"
                element={
                  <ProtectedRoute>
                    <VotingPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared results route */}
              <Route
                path="/elections/:electionId/results"
                element={
                  <ProtectedRoute>
                    <ElectionResults />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/elections"
                element={
                  <AdminRoute>
                    <ElectionManager />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/elections/:electionId/candidates"
                element={
                  <AdminRoute>
                    <CandidateManager />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <AdminRoute>
                    <StudentManager />
                  </AdminRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
