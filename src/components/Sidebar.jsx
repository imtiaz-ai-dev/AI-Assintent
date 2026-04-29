import { NavLink } from "react-router-dom";
import { LayoutDashboard, Radio, Users, ScrollText, Settings, Calendar, Zap, ShieldCheck } from "lucide-react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/monitor", icon: Radio, label: "Monitor" },
  { to: "/users", icon: Users, label: "Applications" },
  { to: "/slots", icon: Calendar, label: "Available Slots" },
  { to: "/logs", icon: ScrollText, label: "Activity Logs" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ isRunning }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="13" height="17" rx="2" fill="white" opacity="0.9"/>
            <rect x="6.5" y="6" width="8" height="1.5" rx="0.75" fill="#6366f1"/>
            <rect x="6.5" y="9" width="6" height="1" rx="0.5" fill="#a5b4fc"/>
            <rect x="6.5" y="11.5" width="7" height="1" rx="0.5" fill="#a5b4fc"/>
            <circle cx="18" cy="17" r="5" fill="#10b981"/>
            <polyline points="15.5,17 17,18.5 20.5,15" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">QVC Monitor</div>
          <div className="sidebar-logo-sub">Qatar Visa Automation</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <div className="sidebar-nav-label">Main Menu</div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <Zap size={14} />
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {isRunning ? "Monitoring Active" : "Monitor Stopped"}
            </div>
            <div className="sidebar-user-role" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span className={`status-dot ${isRunning ? "on" : "off"}`} />
              {isRunning ? "Checking slots..." : "Click Monitor to start"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
