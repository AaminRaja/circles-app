import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success("Welcome to Circles!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-7 shadow-sm">
        <h1 className="font-display font-bold text-2xl mb-1">Join Circles</h1>
        <p className="text-text-muted text-sm mb-6">
          Create an account to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-sm font-medium block mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={update("username")}
              required
              minLength={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={update("password")}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-text-muted mt-5 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
