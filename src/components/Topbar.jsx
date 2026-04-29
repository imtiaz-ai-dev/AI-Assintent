import { useLocation } from "react-router-dom";
import { Bell, RefreshCw } from "lucide-react";

const titles = {
  "/":        { title: "Dashboard",      sub: "Overview & real-time stats" },
  "/monitor": { title: "Monitor",        sub: "Automated slot detection engine" },
  "/users":   { title: "Applications",   sub: "Manage visa applicant profiles" },
  "/slots":   { title: "Available Slots",sub: "Pakistan to Qatar visa appointments" },
  "/logs":    { title: "Activity Logs",  sub: "Full system event history" },
  "/settings":{ title: "Settings",       sub: "Configure monitoring & notifications" },
};

export default function Topbar({ isRunning, checks }) {
  const { pathname } = useLocation();
  const { title, sub } = titles[pathname] || titles["/"];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        <span className="topbar-sep">/</span>
        <div className="topbar-sub">{sub}</div>
      </div>

      <div className="topbar-right">
        {checks > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)" }}>
            <RefreshCw size={12} className={isRunning ? "spin" : ""} />
            {checks} checks
          </div>
        )}
        <div className={`topbar-pill ${isRunning ? "on" : "off"}`}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
          {isRunning ? "Live" : "Idle"}
        </div>
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}
