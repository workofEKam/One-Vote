import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/students");
      if (res.data?.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load student roster");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a .csv file to import");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("students", selectedFile);

    try {
      const res = await api.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        setSuccess(
          `Import complete: ${res.data.importedCount || 0} students added, ${res.data.skippedCount || 0} skipped.`
        );
        setSelectedFile(null);
        // Reset file input element
        const fileInput = document.getElementById("csvFileInput");
        if (fileInput) fileInput.value = "";
        fetchStudents();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload and parse CSV");
    } finally {
      setUploading(false);
    }
  };

  // Derive unique departments for filter
  const departments = ["All", ...new Set(students.map((s) => s.department).filter(Boolean))];

  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "All" ||
      st.department?.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Voter Directory</h1>
          <p className="page-subtitle">
            Manage student registrations, departments, and bulk voter roll imports
          </p>
        </div>
        <Link to="/admin" className="btn btn-secondary btn-sm">
          ← Back to Console
        </Link>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* CSV Bulk Import Card */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
            📂 Bulk Import Students (CSV)
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Columns required: <code>name, rollNumber, email, department, year</code>
          </span>
        </div>

        <form onSubmit={handleFileUpload} style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          <input
            id="csvFileInput"
            type="file"
            accept=".csv"
            className="form-input"
            style={{ flex: 1, minWidth: "250px" }}
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || !selectedFile}
          >
            {uploading ? "Importing Roster..." : "Upload & Parse CSV"}
          </button>
        </form>
      </div>

      {/* Directory Search & Filter Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: "240px", maxWidth: "450px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by Name, Roll Number, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Department:</span>
          <select
            className="form-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner" style={{ margin: "0 auto" }}></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            No students found matching your filters.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => (
                  <tr key={st._id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-main)" }}>
                      {st.rollNumber}
                    </td>
                    <td>{st.name}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {st.email}
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
                        {st.department}
                      </span>
                    </td>
                    <td>Year {st.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManager;
