import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "./index.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Monitor from "./pages/Monitor";
import UsersPage from "./pages/UsersPage";
import SlotsPage from "./pages/SlotsPage";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import { getStatus } from "./api";

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    const poll = async () => {
      try {
        const r = await getStatus();
        setIsRunning(r.data.running);
        setChecks(r.data.checks);
      } catch {}
    };
    poll();
    const t = setInterval(poll, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar isRunning={isRunning} />
        <div className="main">
          <Topbar isRunning={isRunning} checks={checks} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/slots" element={<SlotsPage />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
