import React from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

export default function HRPage() {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = React.useState("");
  const [rawRequest, setRawRequest] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [leaveRequests, setLeaveRequests] = React.useState([]);

  const API_BASE = "http://127.0.0.1:8000";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await fetch(`${API_BASE}/leave`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unauthorized");
      }

      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeaveRequests([]);
      setError(err.message);
    }
  };

  React.useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: employeeId,
          raw_request: rawRequest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to submit leave request");
      }

      setMessage("Leave request submitted successfully!");
      setEmployeeId("");
      setRawRequest("");
      fetchLeaves();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/leave/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update leave status");
      }

      fetchLeaves();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteLeave = async (leaveId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave request?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/leave/${leaveId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete leave request");
      }

      fetchLeaves();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteEmployeeLeaves = async (employeeId) => {
    const confirmed = window.confirm(
      `Delete all leave requests for employee ${employeeId}?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/leave/employee/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete employee requests");
      }

      fetchLeaves();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Approved") {
      return "bg-green-500/20 text-green-300 border border-green-500/30";
    }

    if (status === "Rejected") {
      return "bg-red-500/20 text-red-300 border border-red-500/30";
    }

    return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              HR Dashboard
            </h1>
            <p className="text-slate-300 text-lg">
              Manage employee leave requests and approvals.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchLeaves}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 transition"
            >
              Refresh
            </button>

            <button
              onClick={logout}
              className="px-6 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition"
            >
              Logout
            </button>
                              <button
                    onClick={() => deleteEmployeeLeaves(leave.employee_id)}
                    className="flex-1 py-4 px-2 rounded-2xl bg-red-900 hover:bg-red-800 font-medium transition"
                  >
                    Delete All of Employee
                  </button>
          </div>
        </div>

        {/* Submit Leave Form */}

        {/* Leave Requests */}
        <div className="space-y-6">
          {leaveRequests.length === 0 ? (
            <div className="text-center py-14 text-slate-400 border border-dashed border-slate-700 rounded-3xl bg-white/5">
              No leave requests found.
            </div>
          ) : (
            leaveRequests.map((leave) => (
              <div
                key={leave.id}
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7 hover:border-cyan-500/40 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-cyan-300">
                      {leave.employee_name}
                    </h2>
                    <p className="text-slate-400 mt-1">
                      Employee ID: {leave.employee_id}
                    </p>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${getStatusColor(
                      leave.status
                    )}`}
                  >
                    {leave.status}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-5">
                  <div className="rounded-2xl bg-slate-900/70 p-5 border border-white/5">
                    <p className="text-slate-400 text-sm mb-2">Leave Type</p>
                    <p className="text-lg font-semibold">{leave.leave_type}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-900/70 p-5 border border-white/5">
                    <p className="text-slate-400 text-sm mb-2">Duration</p>
                    <p className="text-lg font-semibold">
                      {leave.start_date} → {leave.end_date}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/70 p-5 border border-white/5 mb-5">
                  <p className="text-slate-400 text-sm mb-2">Reason</p>
                  <p className="text-slate-200">{leave.reason}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  {leave.status === "Pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(leave.id, "Approved")}
                        className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-500 font-medium transition"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(leave.id, "Rejected")}
                        className="flex-1 py-3 rounded-2xl bg-yellow-600 hover:bg-yellow-500 font-medium transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteLeave(leave.id)}
                    className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 font-medium transition"
                  >
                    Delete Request
                  </button>


                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}