import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActiveElection();
  }, []);

  const fetchActiveElection = async () => {
    try {
      setLoading(true);
      const res = await api.get("/elections/active");
      if (res.data?.success && res.data.election) {
        setElection(res.data.election);
      } else {
        setElection(null);
      }
    } catch (err) {
      // 404 simply means no active election right now
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || "Failed to load election data");
      }
      setElection(null);
    } finally {
      setLoading(false);
    }
  };

  // Check student eligibility based on election scope
  const isEligible = () => {
    if (!election || !user) return false;
    const { department, year } = election.scope || {};
    const deptMatch = !department || department.toLowerCase() === user.department?.toLowerCase();
    const yearMatch = !year || Number(year) === Number(user.year);
    return deptMatch && yearMatch;
  };

  return (
    <div>
      {/* Student Welcome Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0] || "Student"}</h1>
          <p className="page-subtitle">
            Roll No: <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>{user?.rollNumber}</span> • {user?.department} (Year {user?.year})
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
          <p style={{ color: "var(--text-muted)" }}>Checking current elections...</p>
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : election ? (
        <div className="card" style={{ borderLeft: "4px solid var(--primary)", marginBottom: "2rem" }}>
          <div className="card-header">
            <div>
              <span className="badge badge-active" style={{ marginBottom: "0.5rem" }}>
                <span className="pulse-dot"></span> Active Election
              </span>
              <h2 className="card-title" style={{ fontSize: "1.4rem" }}>{election.title}</h2>
            </div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Ends: {new Date(election.endDate).toLocaleDateString()} at {new Date(election.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            {election.description || "Participate in this official campus election. Every vote is securely recorded."}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Eligibility:</span>
              {isEligible() ? (
                <span className="badge" style={{ background: "var(--success-bg)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
                  ✓ You are eligible to vote
                </span>
              ) : (
                <span className="badge" style={{ background: "var(--warning-bg)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>
                  Restricted to {election.scope?.department || "all"} (Year {election.scope?.year || "all"})
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link to={`/elections/${election._id}/results`} className="btn btn-secondary">
                View Results
              </Link>
              {isEligible() && (
                <Link to={`/elections/${election._id}/vote`} className="btn btn-primary">
                  Cast Your Ballot ➔
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🗳️</div>
          <h2 className="card-title">No Active Election Right Now</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "450px", margin: "0.5rem auto 1.5rem" }}>
            There are currently no open polls for your department. Check back when an election is officially activated by the administration.
          </p>
        </div>
      )}

      {/* Guidelines Grid */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
            🛡️ Voter Guidelines
          </h3>
          <ul style={{ color: "var(--text-muted)", fontSize: "0.88rem", paddingLeft: "1.25rem", lineHeight: "1.7" }}>
            <li>You can only cast a ballot once per election cycle.</li>
            <li>Your ballot submission is anonymous and immutable.</li>
            <li>Review candidate agendas carefully before final confirmation.</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
            ℹ️ Institutional Support
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: "1.6" }}>
            If your eligibility status is incorrect or you experience any issues accessing your ballot, contact your department election officer or student administration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
