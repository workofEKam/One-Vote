import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [electionsRes, studentsRes] = await Promise.all([
        api.get("/elections"),
        api.get("/students"),
      ]);

      if (electionsRes.data?.success) {
        setElections(electionsRes.data.elections || []);
      }
      if (studentsRes.data?.success) {
        setStudentCount(studentsRes.data.count ?? (studentsRes.data.students?.length || 0));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  const activeElections = elections.filter((e) => e.status === "Active");
  const upcomingElections = elections.filter((e) => e.status === "Upcoming");
  const closedElections = elections.filter((e) => e.status === "Closed");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Election Commission Console</h1>
          <p className="page-subtitle">Overview of campus voter rolls, elections, and active balloting</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/admin/students" className="btn btn-secondary">
            📁 Import Students CSV
          </Link>
          <Link to="/admin/elections" className="btn btn-primary">
            + Manage Elections
          </Link>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* KPI Stats Grid */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-label">Active Elections</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>
            {activeElections.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Upcoming Elections</div>
          <div className="stat-value" style={{ color: "var(--warning)" }}>
            {upcomingElections.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Elections</div>
          <div className="stat-value">{elections.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Registered Voters</div>
          <div className="stat-value" style={{ color: "var(--accent-teal)" }}>
            {studentCount}
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Active Elections Monitoring</h2>
            <Link to="/admin/elections" className="btn btn-secondary btn-sm">
              All Elections →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" style={{ margin: "0 auto" }}></div>
            </div>
          ) : activeElections.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "1rem 0" }}>
              No elections are currently in the Active state.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activeElections.map((elec) => (
                <div
                  key={elec._id}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{elec.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Ends: {new Date(elec.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link to={`/admin/elections/${elec._id}/candidates`} className="btn btn-secondary btn-sm">
                      Candidates
                    </Link>
                    <Link to={`/elections/${elec._id}/results`} className="btn btn-primary btn-sm">
                      Results
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Administrative Actions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <Link
              to="/admin/elections"
              style={{
                display: "block",
                padding: "1rem",
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--primary)" }}>🗳️ Election Lifecycles</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Create new elections, change statuses from Upcoming to Active or Closed, and inspect voter participation.
              </div>
            </Link>

            <Link
              to="/admin/students"
              style={{
                display: "block",
                padding: "1rem",
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--accent-teal)" }}>👥 Student Roster & CSV Import</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Upload batch CSV sheets to populate voter rolls with verified student credentials.
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
