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
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.response?.data?.message || "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FuturisticBackground>
      <main className="register-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b16] px-5 py-10 text-white sm:px-8">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-35 -top-35 h-[350px] w-[350px] rounded-full bg-indigo-600/[0.12] blur-[150px]" />
          <div className="absolute -bottom-40 -right-32 h-[350px] w-[350px] rounded-full bg-cyan-500/[0.08] blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.6) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Centered registration content */}
        <div className="relative z-10 mx-auto w-full max-w-[460px]">
          {/* Brand */}
          <div className="mb-7 text-center">
            <div className="mb-4 inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-indigo-500/20 to-cyan-400/10 shadow-lg shadow-indigo-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyan-300"
                  aria-hidden="true"
                >
                  <rect x="3" y="6" width="13" height="12" rx="3" />
                  <path d="m16 10 5-3v10l-5-3" />
                </svg>
              </div>

              <span className="text-2xl font-bold tracking-tight">
                Connect<span className="text-cyan-200">Sphere</span>
              </span>
            </div>

            <p className="text-sm text-slate-200">
              Your next great conversation starts here.
            </p>
          </div>

          {/* Registration card */}
          <section className="rounded-3xl border border-white/[0.10] bg-[#101626]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7">
            <div className="mb-1 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Create your account
              </h1>

              <span className="mt-3 text-sm leading-6 text-slate-400">
                Join your team and start connecting.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full name */}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Full name
                </span>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className="block w-full rounded-xl border border-white/10 bg-[#090e1b] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </label>

              {/* Username */}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Username
                </span>

                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  className="block w-full rounded-xl border border-white/10 bg-[#090e1b] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  maxLength={50}
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

              <p className="mt-2 block text-xs leading-5 text-slate-500">
                Use at least 8 characters.
              </p>

              {/* Error message */}
              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm leading-5 text-red-300"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-200 hover:bg-indigo-400 hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-400/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Login navigation */}
            <div className="mt-7 border-t border-white/[0.08] pt-6 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>

          {/* Footer */}
          <p className="mt-6 text-center text-xs tracking-wide text-slate-500">
            Secure registration · ConnectSphere
          </p>
        </div>
      </main>
    </FuturisticBackground>
  );
}
