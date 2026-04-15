import React from "react";

export default function EmployeePage() {
  const [rawRequest, setRawRequest] = React.useState("");
  const [leaveRequests, setLeaveRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const API_BASE = "http://127.0.0.1:8000";

  // logged in user from localStorage
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const fetchLeaves = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/leave`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch leave requests");
      }

      // only show leave requests of the logged in user
      const currentEmail = (user.email || "").toLowerCase();

      const filteredLeaves = Array.isArray(data)
        ? data.filter(
            (leave) =>
              (leave.email || leave.employee_email || "")
                .toLowerCase()
                .trim() === currentEmail
          )
        : [];

      setLeaveRequests(filteredLeaves);
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

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          raw_request: rawRequest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail || data, null, 2);

        throw new Error(errorMessage);
      }

      setMessage("Leave request submitted successfully!");
      setRawRequest("");
      fetchLeaves();
    } catch (err) {
      console.error("Leave submit error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      case "Rejected":
        return "bg-red-500/20 text-red-300 border border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Employee Dashboard
            </h1>
            <p className="text-slate-400 mt-3 text-lg">
              Welcome, {user.name || user.email}
            </p>
            <p className="text-slate-500 text-sm mt-1">{user.email}</p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("role");
              window.location.href = "/auth";
            }}
            className="px-6 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl sticky top-6 h-fit">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-3xl">
                📝
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Apply Leave</h2>
                <p className="text-slate-400 text-sm">
                  Requesting leave as {user.name || user.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <p className="text-sm text-slate-300">Logged in user</p>
                <p className="text-lg font-semibold text-cyan-300 mt-1">
                  {user.name || "Employee"}
                </p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Leave Request
                </label>
                <textarea
                  rows={8}
                  value={rawRequest}
                  onChange={(e) => setRawRequest(e.target.value)}
                  required
                  placeholder="Example: Hi, I need sick leave from 2026-04-20 to 2026-04-22 because I have fever."
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 resize-none transition"
                />
              </div>

              {message && (
                <div className="rounded-2xl bg-green-500/20 border border-green-500/30 p-4 text-green-300">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-red-500/20 border border-red-500/30 p-4 text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg hover:scale-[1.02] transition disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Leave Request"}
              </button>
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-semibold">Your Leave Requests</h2>
                <p className="text-slate-400 mt-1">
                  Only your leave requests are shown here.
                </p>
              </div>

              <button
                onClick={fetchLeaves}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-6">
              {leaveRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-14 text-center text-slate-400">
                  No leave requests found for {user.email}
                </div>
              ) : (
                leaveRequests.map((leave) => (
                  <div
                    key={leave.id}
                    className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7 hover:border-cyan-500/40 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-semibold text-cyan-300">
                          {leave.employee_name || user.name}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {leave.email || leave.employee_email}
                        </p>
                      </div>

                      <div
                        className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${getStatusClasses(
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

                    <div className="rounded-2xl bg-slate-900/70 p-5 border border-white/5">
                      <p className="text-slate-400 text-sm mb-2">Reason</p>
                      <p className="text-slate-200 leading-7">{leave.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
