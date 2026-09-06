import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const ElectionManager = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create election form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    year: "",
    startDate: "",
    endDate: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/elections");
      if (res.data?.success) {
        setElections(res.data.elections || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (electionId, newStatus) => {
    setError("");
    setSuccess("");
    try {
      const res = await api.patch(`/elections/${electionId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        setSuccess(`Election marked as ${newStatus}`);
        fetchElections();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update election status");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        scope: {
          department: formData.department ? formData.department.trim() : null,
          year: formData.year ? Number(formData.year) : null,
        },
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      };

      const res = await api.post("/elections", payload);
      if (res.data?.success) {
        setSuccess("Election created successfully!");
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          department: "",
          year: "",
          startDate: "",
          endDate: "",
        });
        fetchElections();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create election");
    } finally {
      setCreating(false);
    }
  };

  const filteredElections = elections.filter((e) => {
    if (filter === "All") return true;
    return e.status === filter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Elections Directory</h1>
          <p className="page-subtitle">Configure, activate, and oversee campus student council elections</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create New Election
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["All", "Active", "Upcoming", "Closed"].map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm ${filter === tab ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Elections Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner" style={{ margin: "0 auto" }}></div>
          </div>
        ) : filteredElections.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            No elections found matching "{filter}".
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Scope</th>
                  <th>Status</th>
                  <th>Timeline</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredElections.map((elec) => (
                  <tr key={elec._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{elec.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {elec.description || "No description provided"}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>
                        {elec.scope?.department || "All Depts"} • Year {elec.scope?.year || "All"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${elec.status.toLowerCase()}`}>
                        {elec.status === "Active" && <span className="pulse-dot"></span>}
                        {elec.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      <div>Start: {new Date(elec.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(elec.endDate).toLocaleDateString()}</div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <Link
                          to={`/admin/elections/${elec._id}/candidates`}
                          className="btn btn-secondary btn-sm"
                        >
                          Candidates
                        </Link>
                        <Link
                          to={`/elections/${elec._id}/results`}
                          className="btn btn-secondary btn-sm"
                        >
                          Results
                        </Link>

                        {elec.status === "Upcoming" && (
                          <button
                            onClick={() => handleStatusChange(elec._id, "Active")}
                            className="btn btn-primary btn-sm"
                            title="Activate voting (requires at least 2 candidates)"
                          >
                            Activate ▶
                          </button>
                        )}
                        {elec.status === "Active" && (
                          <button
                            onClick={() => handleStatusChange(elec._id, "Closed")}
                            className="btn btn-danger btn-sm"
                            title="Close election to publish final results"
                          >
                            Close ⏹
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Election Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Election</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="elec-title">Election Title *</label>
                <input
                  id="elec-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Student Council President 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="elec-desc">Description / Objectives</label>
                <textarea
                  id="elec-desc"
                  className="form-textarea"
                  placeholder="Details regarding this election..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="elec-dept">Target Department (Optional)</label>
                  <input
                    id="elec-dept"
                    type="text"
                    className="form-input"
                    placeholder="Leave empty for all depts"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="elec-year">Target Year (Optional)</label>
                  <select
                    id="elec-year"
                    className="form-select"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  >
                    <option value="">All Years (1-4)</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="elec-start">Start Date & Time *</label>
                  <input
                    id="elec-start"
                    type="datetime-local"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="elec-end">End Date & Time *</label>
                  <input
                    id="elec-end"
                    type="datetime-local"
                    className="form-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionManager;
