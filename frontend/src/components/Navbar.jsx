import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAdmin = user.role === "Admin";

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="brand-logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">OneVote</span>
            <span className="brand-subtitle">{isAdmin ? "Admin Console" : "Student Portal"}</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          {isAdmin ? (
            <>
              <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
                Dashboard
              </Link>
              <Link to="/admin/elections" className={`nav-link ${isActive("/admin/elections") ? "active" : ""}`}>
                Elections
              </Link>
              <Link to="/admin/students" className={`nav-link ${isActive("/admin/students") ? "active" : ""}`}>
                Students
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="user-profile-section">
          <div className="user-chip">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-meta">
              <span className="user-name">{user.name}</span>
              <span className="user-roll">{user.rollNumber} • {user.department || user.role}</span>
            </div>
            <span className={`role-badge ${isAdmin ? "role-admin" : "role-student"}`}>
              {user.role}
            </span>
          </div>

          <button onClick={handleLogout} className="btn-logout" title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
