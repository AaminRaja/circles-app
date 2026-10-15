import { Link, useNavigate } from "react-router-dom";
import { Users, LogOut, Plus, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("You've been logged out");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-bold text-xl text-primary"
        >
          <Users size={22} strokeWidth={2.5} />
          Circles
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/communities/new"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full text-primary hover:bg-primary-light transition-colors"
              >
                <Plus size={16} /> New community
              </Link>
              <Link
                to="/notifications"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-border transition-colors"
                aria-label="Notifications"
              >
                <Bell size={19} />
              </Link>
              <span className="hidden sm:inline text-sm text-text-muted">
                Hi, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full hover:bg-border transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium px-3 py-2 rounded-full hover:bg-border transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
