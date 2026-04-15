import React from "react";
import { useNavigate } from "react-router-dom";

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 6,
  duration: Math.random() * 8 + 6,
}));

const GridLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

export default function AuthPage() {
  const navigate = useNavigate();

  const [role, setRole] = React.useState("employee");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [focused, setFocused] = React.useState(null);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        role, // send selected frontend role: "hr" or "employee"
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    // save token
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify(data.user));

    // redirect based on backend role
    // Prefer the role returned by backend. If backend does not send one,
    // use the selected frontend role.
    const userRole = String(data.role || role || "employee")
      .toLowerCase()
      .trim();

    localStorage.setItem("role", userRole);

    if (userRole === "hr") {
      navigate("/hr");
    } else {
      navigate("/employee");
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    setLoading(false);
  }
};
  const isHR = role === "hr";

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .auth-root {
      min-height: 100svh;
      width: 100vw;
      overflow-x: hidden;
      background: #050812;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Sans', sans-serif;
      position: relative;
      padding: 12px 16px;
    }

    .particle {
      position: absolute;
      border-radius: 50%;
      background: white;
      pointer-events: none;
      animation: float linear infinite;
    }

    @keyframes float {
      0% { transform: translateY(0px) scale(1); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      animation: pulse 8s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.12); opacity: 1; }
    }

    .main-card {
      position: relative;
      width: 100%;
      max-width: 1050px;
      min-height: unset;
      border-radius: 28px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.025);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      box-shadow: 0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
      overflow: hidden;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      opacity: 0;
      transform: translateY(24px) scale(0.98);
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .main-card.mounted {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    @media (max-width: 900px) {
      .main-card { grid-template-columns: 1fr; }
      .left-panel { display: none; }
    }

    /* ─── LEFT PANEL ─── */
    .left-panel {
      padding: 36px 44px;
      background: linear-gradient(145deg, rgba(6, 182, 212, 0.07) 0%, rgba(15,20,50,0.4) 50%, rgba(139, 92, 246, 0.07) 100%);
      border-right: 1px solid rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .left-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 20% 30%, rgba(6,182,212,0.12) 0%, transparent 60%),
                  radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.10) 0%, transparent 60%);
      pointer-events: none;
    }

    .logo-badge {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, #22d3ee, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 22px;
      color: #030712;
      box-shadow: 0 8px 32px rgba(34,211,238,0.4);
      margin-bottom: 16px;
      flex-shrink: 0;
    }

    .brand-name {
      font-family: 'Syne', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: white;
      letter-spacing: -0.02em;
      margin-bottom: 3px;
    }

    .brand-tag {
      font-size: 10px;
      font-weight: 500;
      color: rgba(34,211,238,0.7);
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 22px;
    }

    .hero-heading {
      font-family: 'Syne', sans-serif;
      font-size: clamp(28px, 2.8vw, 38px);
      font-weight: 800;
      line-height: 1.08;
      color: white;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
    }

    .hero-heading span {
      background: linear-gradient(135deg, #22d3ee, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-body {
      font-size: 14px;
      line-height: 1.7;
      color: rgba(148,163,184,0.9);
      margin-bottom: 24px;
      max-width: 360px;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .feature-card {
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.03);
      padding: 14px 16px;
      transition: border-color 0.3s, background 0.3s;
    }

    .feature-card:hover {
      border-color: rgba(255,255,255,0.13);
      background: rgba(255,255,255,0.05);
    }

    .feature-icon { font-size: 22px; margin-bottom: 6px; display: block; }

    .feature-title {
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }

    .feature-desc {
      font-size: 11.5px;
      line-height: 1.5;
      color: rgba(148,163,184,0.75);
    }

    /* ─── RIGHT PANEL ─── */
    .right-panel {
      padding: 32px 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .form-wrap {
      width: 100%;
      max-width: 360px;
    }

    .form-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }

    .form-logo .logo-badge { margin-bottom: 10px; }

    .form-brand {
      font-family: 'Syne', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: white;
      margin-bottom: 2px;
    }

    .form-sub {
      font-size: 12.5px;
      color: rgba(148,163,184,0.7);
    }

    .form-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(26px, 3.5vw, 34px);
      font-weight: 800;
      color: white;
      letter-spacing: -0.03em;
      text-align: center;
      margin-bottom: 4px;
    }

    .form-desc {
      font-size: 13px;
      color: rgba(148,163,184,0.65);
      text-align: center;
      margin-bottom: 20px;
    }

    /* Role Toggle */
    .role-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }

    .role-btn {
      border-radius: 14px;
      border: 1.5px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
      padding: 12px 10px;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      color: rgba(148,163,184,0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      overflow: hidden;
    }

    .role-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .role-btn.emp.active {
      border-color: rgba(34,211,238,0.45);
      background: rgba(34,211,238,0.09);
      color: #67e8f9;
      box-shadow: 0 4px 24px rgba(34,211,238,0.12), inset 0 1px 0 rgba(34,211,238,0.15);
      transform: translateY(-2px);
    }

    .role-btn.hr.active {
      border-color: rgba(167,139,250,0.45);
      background: rgba(167,139,250,0.09);
      color: #c4b5fd;
      box-shadow: 0 4px 24px rgba(167,139,250,0.12), inset 0 1px 0 rgba(167,139,250,0.15);
      transform: translateY(-2px);
    }

    .role-btn:not(.active):hover {
      border-color: rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.9);
    }

    .role-emoji { font-size: 22px; line-height: 1; }

    .role-label {
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      font-weight: 700;
    }

    /* Inputs */
    .field-group {
      margin-bottom: 12px;
    }

    .field-label {
      display: block;
      font-size: 12.5px;
      font-weight: 600;
      color: rgba(148,163,184,0.85);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .field-wrap { position: relative; }

    .field-input {
      width: 100%;
      border-radius: 13px;
      border: 1.5px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04);
      padding: 11px 16px;
      color: white;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    }

    .field-input::placeholder { color: rgba(100,116,139,0.7); }

    .field-input:focus {
      border-color: rgba(34,211,238,0.45);
      background: rgba(34,211,238,0.04);
      box-shadow: 0 0 0 4px rgba(34,211,238,0.08);
    }

    .field-input.hr-focus:focus {
      border-color: rgba(167,139,250,0.45);
      background: rgba(167,139,250,0.04);
      box-shadow: 0 0 0 4px rgba(167,139,250,0.08);
    }

    .field-input.has-icon { padding-right: 52px; }

    .eye-btn {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(100,116,139,0.8);
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: color 0.2s;
    }

    .eye-btn:hover { color: rgba(255,255,255,0.85); }

    /* Remember row */
    .remember-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 2px 0 14px;
    }

    .remember-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: rgba(100,116,139,0.9);
      cursor: pointer;
    }

    .remember-label input[type="checkbox"] {
      width: 15px;
      height: 15px;
      accent-color: #22d3ee;
      cursor: pointer;
    }

    .forgot-link {
      font-size: 13px;
      color: rgba(34,211,238,0.8);
      text-decoration: none;
      transition: color 0.2s;
    }

    .forgot-link:hover { color: #67e8f9; }

    /* Submit button */
    .submit-btn {
      width: 100%;
      border: none;
      border-radius: 14px;
      padding: 13px;
      font-family: 'Syne', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: white;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s;
      letter-spacing: 0.01em;
    }

    .submit-btn.emp-btn {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      box-shadow: 0 8px 32px rgba(6,182,212,0.35);
    }

    .submit-btn.hr-btn {
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      box-shadow: 0 8px 32px rgba(139,92,246,0.35);
    }

    .submit-btn:hover { transform: translateY(-2px) scale(1.01); }
    .submit-btn:active { transform: scale(0.985); }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

    .btn-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%);
      background-size: 300%;
      animation: shimmer 2.4s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .security-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 0;
      font-size: 11.5px;
      color: rgba(71,85,105,0.85);
    }

    .security-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(34,211,238,0.5);
      flex-shrink: 0;
    }

    /* Divider line on right panel */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      margin: 16px 0;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        {/* Grid overlay */}
        <GridLines />

        {/* Orbs */}
        <div className="orb" style={{ width: 380, height: 380, top: -100, left: -100, background: "radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)" }} />
        <div className="orb" style={{ width: 440, height: 440, bottom: -120, right: -120, background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", animationDelay: "4s" }} />
        <div className="orb" style={{ width: 200, height: 200, top: "40%", left: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)", animationDelay: "2s" }} />

        {/* Particles */}
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: 0,
            }}
          />
        ))}

        {/* Card */}
        <div className={`main-card${mounted ? " mounted" : ""}`}>

          {/* ─── LEFT PANEL ─── */}
          <div className="left-panel">
            <div className="logo-badge">H</div>
            <div className="brand-name">HapticWare</div>
            <div className="brand-tag">Workforce Intelligence Platform</div>

            <h2 className="hero-heading">
              The smartest way<br />to manage your <span>team.</span>
            </h2>

            <p className="hero-body">
              Access employee workflows, leave approvals and HR operations in one secure, beautifully designed workspace.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <span className="feature-icon">🧑‍💻</span>
                <div className="feature-title">Employees</div>
                <div className="feature-desc">Submit leave requests and track approval status instantly.</div>
              </div>
              <div className="feature-card">
                <span className="feature-icon">👨‍💼</span>
                <div className="feature-title">HR Team</div>
                <div className="feature-desc">Review requests and manage your entire workforce ops.</div>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <div className="feature-title">Analytics</div>
                <div className="feature-desc">Real-time workforce data and actionable insights.</div>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🔒</span>
                <div className="feature-title">Secure</div>
                <div className="feature-desc">Enterprise-grade security with role-based access control.</div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT PANEL ─── */}
          <div className="right-panel">
            <div className="form-wrap">

              {/* Mobile logo */}
              <div className="form-logo">
                <div className="logo-badge">H</div>
                <div className="form-brand">HapticWare</div>
                <div className="form-sub">Welcome back 👋</div>
              </div>

              <div className="form-title">Sign In</div>
              <div className="form-desc">Choose your role and access your dashboard.</div>

              {/* Role toggle */}
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-btn emp${!isHR ? " active" : ""}`}
                  onClick={() => setRole("employee")}
                >
                  <span className="role-emoji">🧑‍💻</span>
                  <span className="role-label">Employee</span>
                </button>
                <button
                  type="button"
                  className={`role-btn hr${isHR ? " active" : ""}`}
                  onClick={() => setRole("hr")}
                >
                  <span className="role-emoji">👨‍💼</span>
                  <span className="role-label">HR Team</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>

                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <div className="field-wrap">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isHR ? "hr@hapticware.com" : "employee@hapticware.com"}
                      className={`field-input${isHR ? " hr-focus" : ""}${focused === "email" ? " focused" : ""}`}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Password</label>
                  <div className="field-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`field-input has-icon${isHR ? " hr-focus" : ""}`}
                      onFocus={() => setFocused("pw")}
                      onBlur={() => setFocused(null)}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="remember-row">
                  <label className="remember-label">
                    <input type="checkbox" />
                    Remember me
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`submit-btn${isHR ? " hr-btn" : " emp-btn"}`}
                >
                  <div className="btn-shimmer" />
                  <div className="btn-inner">
                    {loading ? (
                      <>
                        <div className="spinner" />
                        <span>Signing in…</span>
                      </>
                    ) : (
                      <span>Continue as {isHR ? "HR" : "Employee"}</span>
                    )}
                  </div>
                </button>
              </form>

              <div className="divider" />

              <div className="security-note">
                <div className="security-dot" />
                Protected by enterprise-grade security &amp; encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}