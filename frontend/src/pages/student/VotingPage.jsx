import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

const VotingPage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [votedSuccess, setVotedSuccess] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [electionId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/elections/${electionId}/candidates`);
      if (res.data?.success) {
        setCandidates(res.data.candidates || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await api.post(`/elections/${electionId}/vote`, {
        candidateID: selectedCandidate._id,
      });

      if (res.data?.success) {
        setShowConfirm(false);
        setVotedSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ballot");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (votedSuccess) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{ width: "60px", height: "60px", background: "var(--success-bg)", color: "var(--success)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "2rem" }}>
          ✓
        </div>
        <h2 className="card-title" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Ballot Cast Successfully</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          Your vote for <strong>{selectedCandidate?.user?.name}</strong> has been securely and immutably recorded. Thank you for participating in campus governance!
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link to="/dashboard" className="btn btn-secondary">
            Return to Dashboard
          </Link>
          <Link to={`/elections/${electionId}/results`} className="btn btn-primary">
            View Live Results ➔
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Official Ballot</h1>
          <p className="page-subtitle">
            Select one candidate to cast your vote. Votes cannot be modified once submitted.
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          ← Cancel & Back
        </Link>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
          <p style={{ color: "var(--text-muted)" }}>Loading nominated candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h3 className="card-title">No Candidates Nominated Yet</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            The administrator has not finalized candidates for this election.
          </p>
        </div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: "2rem" }}>
            {candidates.map((cand) => {
              const isSelected = selectedCandidate?._id === cand._id;
              return (
                <div
                  key={cand._id}
                  className={`candidate-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedCandidate(cand)}
                >
                  <div>
                    <div className="candidate-header">
                      <div className="candidate-avatar">
                        {cand.user?.name ? cand.user.name.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div className="candidate-info">
                        <h3>{cand.user?.name}</h3>
                        <p>{cand.user?.rollNumber} • {cand.user?.department}</p>
                      </div>
                    </div>

                    <div className="candidate-agenda">
                      <strong style={{ color: "var(--text-main)", display: "block", marginBottom: "0.25rem" }}>Manifesto / Agenda:</strong>
                      {cand.agenda || "No manifesto submitted."}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                    style={{ width: "100%", pointerEvents: "none" }}
                  >
                    {isSelected ? "✓ Selected Candidate" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sticky confirmation bar at bottom if candidate selected */}
          {selectedCandidate && (
            <div
              className="card"
              style={{
                position: "sticky",
                bottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                zIndex: 40,
                border: "1px solid var(--primary)",
              }}
            >
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Ready to confirm:</span>
                <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "1rem" }}>
                  Vote for {selectedCandidate.user?.name}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => setShowConfirm(true)}
              >
                Cast Ballot ➔
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Your Vote</h2>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              Are you sure you want to cast your official vote for{" "}
              <strong style={{ color: "var(--text-main)" }}>{selectedCandidate?.user?.name}</strong>?
              <br />
              <br />
              <span style={{ color: "var(--warning)", fontSize: "0.85rem" }}>
                ⚠️ This decision is final, encrypted, and cannot be changed or undone.
              </span>
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCastVote}
                disabled={submitting}
              >
                {submitting ? "Securing Ballot..." : "Yes, Cast My Vote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
