
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
  const [showPassword, setShowPassword] = useState(false);
  
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
      
<main className="login-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b18] px-8 py-18 text-white">

  {/* Background glow effects */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
    <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  </div>

  {/* Centered login container */}
  <div className="relative z-2 w-full max-w-md">

    {/* Brand */}
    <div className="mb-4 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 shadow-lg shadow-indigo-500/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cyan-300"
        >
          <rect x="3" y="6" width="13" height="12" rx="3" />
          <path d="m16 10 5-3v10l-5-3" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Connect<span className="text-cyan-300">Sphere</span>
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        Connect, collaborate, and communicate.
      </p>
    </div>

    {/* Login card */}
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">

      <div className="mb-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Username */}
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Username
          </span>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        {/* Password */}
  <label
    htmlFor="password"
    className="mb-2 block text-sm font-medium text-slate-200"
  >
    Password
  </label>

  <div className="relative">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="Create a password"
      className="block w-full rounded-xl border border-white/10 bg-[#090e1b] px-4 py-3.5 pr-12 text-[15px] text-white outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete="new-password"
      minLength={8}
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-white focus:outline-none focus:text-indigo-300"
    >
      {showPassword ? (
        // Eye-off icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.3 4.5 9 7-.3 1.1-1.1 2.4-2.3 3.5" />
          <path d="M6.2 6.2C3.9 7.6 2.4 10 2 12c.7 2.5 4 7 10 7 1.3 0 2.5-.3 3.5-.7" />
        </svg>
      ) : (
        // Eye icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  </div>

  <span className="mt-0 block text-xs leading-3 text-slate-500">
    Use at least 8 characters.
  </span>

        {/* Error message */}
        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-200 hover:from-indigo-400 hover:to-blue-400 hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Logging in...
            </>
          ) : (
            <>
              Log in to your account
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      {/* Registration link */}
      <div className="mt-7 border-t border-white/10 pt-6 text-center">
        <p className="text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-cyan-300 transition hover:text-cyan-200 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>

    {/* Footer */}
    <p className="mt-7 text-center text-xs text-slate-500">
      Secure access to your conversations.
    </p>
  </div>
</main>
</FuturisticBackground>

    
  );
}
