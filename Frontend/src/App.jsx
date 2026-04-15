import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./Pages/AuthPage";
import EmployeePage from "./Pages/EmployeePage";
import HRPage from "./Pages/HRPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Pages */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/hr" element={<HRPage />} />
      </Routes>
    </BrowserRouter>
  );
}