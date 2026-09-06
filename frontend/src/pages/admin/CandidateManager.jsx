import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const CandidateManager = () => {
  const { electionId } = useParams();

  const [candidates, setCandidates] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [agenda, setAgenda] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, [electionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [candRes, eligibleRes] = await Promise.all([
        api.get(`/elections/${electionId}/candidates`),
        api.get(`/elections/${electionId}/eligible-students`),
      ]);

      if (candRes.data?.success) {
        setCandidates(candRes.data.candidates || []);
      }
      if (eligibleRes.data?.success) {
        setEligibleStudents(eligibleRes.data.students || eligibleRes.data.eligibleStudents || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidate information");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError("Please select a student to nominate");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post(`/elections/${electionId}/candidates`, {
        userId: selectedStudentId,
        agenda: agenda.trim(),
      });

      if (res.data?.success) {
        setSuccess("Candidate nominated successfully!");
        setSelectedStudentId("");
        setAgenda("");
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to nominate candidate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to remove this candidate nomination?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await api.delete(`/elections/${electionId}/candidates/${candidateId}`);
      if (res.data?.success) {
        setSuccess("Candidate removed successfully.");
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove candidate");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidate Nominations</h1>
          <p className="page-subtitle">
            Nominate verified students and review candidate agendas for this election
          </p>
        </div>
        <Link to="/admin/elections" className="btn btn-secondary btn-sm">
          ← Back to Elections
        </Link>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div className="grid-2">
        {/* Nomination Form */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: "1rem" }}>
            Nominate a Candidate
          </h2>
          <form onSubmit={handleAddCandidate}>
            <div className="form-group">
              <label className="form-label" htmlFor="select-student">
                Select Eligible Student *
              </label>
              <select
                id="select-student"
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">-- Select from verified roster --</option>
                {eligibleStudents.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.rollNumber} • {st.department} Year {st.year})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.2rem" }}>
                Only registered students matching the election scope appear here.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cand-agenda">
                Manifesto / Agenda
              </label>
              <textarea
                id="cand-agenda"
                className="form-textarea"
                placeholder="Candidate's campaign promises, vision, or objectives..."
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                rows={4}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !selectedStudentId}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {submitting ? "Nominating..." : "Confirm Nomination"}
            </button>
          </form>
        </div>

        {/* Current Candidates List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Nominated Roster</h2>
            <span className="badge badge-active">{candidates.length} Registered</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" style={{ margin: "0 auto" }}></div>
            </div>
          ) : candidates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              No candidates nominated yet. An election requires at least 2 candidates to be activated.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {candidates.map((cand) => (
                <div
                  key={cand._id}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
                      {cand.user?.name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {cand.user?.rollNumber} • {cand.user?.department} (Year {cand.user?.year})
                    </div>
                    {cand.agenda && (
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-dim)",
                          marginTop: "0.5rem",
                          background: "var(--bg-surface)",
                          padding: "0.5rem",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        "{cand.agenda}"
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCandidate(cand._id)}
                    className="btn btn-danger btn-sm"
                    title="Remove nomination"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateManager;
