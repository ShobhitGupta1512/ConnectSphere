
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FuturisticBackground from "../components/FuturisticBackground";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ username, password });
      navigate(location.state?.from || "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FuturisticBackground>
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold">Welcome back</h1>
        <p className="mb-8 opacity-70">Log in to ConnectSphere.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block">Username</span>
            <input
              className="w-full rounded-lg border border-white/20 bg-black/20 p-3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block">Password</span>
            <input
              className="w-full rounded-lg border border-white/20 bg-black/20 p-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p role="alert" className="text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-500 p-3 font-semibold disabled:opacity-50"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </main>
    </FuturisticBackground>
  );
}
