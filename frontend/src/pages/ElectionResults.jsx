import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const ElectionResults = () => {
  const { electionId } = useParams();
  const { user } = useAuth();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, [electionId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/elections/${electionId}/results`);
      if (res.data?.success) {
        setResults(res.data.results || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Results are not available at this time."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = results.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);
  const winner = results.length > 0 ? results[0] : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Election Results & Standings</h1>
          <p className="page-subtitle">
            Official ballot tallies and winner declaration
          </p>
        </div>
        <Link
          to={user?.role === "Admin" ? "/admin/elections" : "/dashboard"}
          className="btn btn-secondary btn-sm"
        >
          ← Back
        </Link>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
          <p style={{ color: "var(--text-muted)" }}>Tabulating election results...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏳</div>
          <h2 className="card-title">Results In Progress</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "460px", margin: "0.5rem auto 1.5rem" }}>
            {error}
          </p>
          <button onClick={fetchResults} className="btn btn-secondary btn-sm">
            Refresh Standings
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2 className="card-title">No Votes Recorded</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            No ballots were cast in this election.
          </p>
        </div>
      ) : (
        <>
          {/* Winner Spotlight */}
          {winner && (
            <div
              className="card"
              style={{
                border: "2px solid #fbbf24",
                background: "linear-gradient(180deg, rgba(251, 191, 36, 0.06) 0%, var(--bg-card) 100%)",
                marginBottom: "2rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fbbf24", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
                <span>🏆</span> Declared Winner
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>
                    {winner.user?.name}
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "var(--font-mono)" }}>
                    {winner.user?.rollNumber} • {winner.user?.department} (Year {winner.user?.year})
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)" }}>
                    {winner.voteCount} <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>votes</span>
                  </div>
                  <div style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: 600 }}>
                    {totalVotes > 0 ? ((winner.voteCount / totalVotes) * 100).toFixed(1) : 0}% of total vote
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Candidate Tally */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Vote Distribution</h3>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Total Ballots: <strong>{totalVotes}</strong>
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {results.map((cand, index) => {
                const percent = totalVotes > 0 ? ((cand.voteCount / totalVotes) * 100).toFixed(1) : 0;
                return (
                  <div key={cand._id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontWeight: 700, color: index === 0 ? "#fbbf24" : "var(--text-muted)", width: "20px" }}>
                          #{index + 1}
                        </span>
                        <div>
                          <strong style={{ color: "var(--text-main)" }}>{cand.user?.name}</strong>
                          <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginLeft: "0.5rem" }}>
                            ({cand.user?.department})
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
                        <strong>{cand.voteCount}</strong> votes <span style={{ color: "var(--text-muted)" }}>({percent}%)</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: "8px", width: "100%", background: "var(--bg-input)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${percent}%`,
                          background: index === 0 ? "var(--primary)" : "var(--secondary)",
                          borderRadius: "var(--radius-full)",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionResults;
