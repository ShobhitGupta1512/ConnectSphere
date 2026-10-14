
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FuturisticBackground from "../components/FuturisticBackground";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({ name, username, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to register."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FuturisticBackground>
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold">Create your account</h1>
        <p className="mb-8 opacity-70">Start connecting with your team.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block">Full name</span>
            <input
              className="w-full rounded-lg border border-white/20 bg-black/20 p-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={100}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block">Username</span>
            <input
              className="w-full rounded-lg border border-white/20 bg-black/20 p-3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={50}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block">Password (at least 8 characters)</span>
            <input
              className="w-full rounded-lg border border-white/20 bg-black/20 p-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {error && <p role="alert" className="text-red-400">{error}</p>}

          <button
            className="w-full rounded-lg bg-indigo-500 p-3 font-semibold disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </main>
    </FuturisticBackground>
  );
}
