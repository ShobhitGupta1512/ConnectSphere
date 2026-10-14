
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FuturisticBackground from "../components/FuturisticBackground";
import {
  createMeeting,
  getMeetingByCode,
} from "../services/meetingService";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleCreateMeeting = async () => {
    setError("");
    setIsCreating(true);

    try {
      const meeting = await createMeeting();

      if (!meeting?.meetingCode) {
        throw new Error("The server did not return a meeting code.");
      }

      navigate(`/meeting/${encodeURIComponent(meeting.meetingCode)}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not create the meeting."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = async (event) => {
    event.preventDefault();
    setError("");

    const code = meetingCode.trim();

    if (!code) {
      setError("Please enter a meeting code.");
      return;
    }

    setIsJoining(true);

    try {
      const meeting = await getMeetingByCode(code);

      if (!meeting?.meetingCode) {
        throw new Error("The server did not return meeting details.");
      }

      navigate(`/meeting/${encodeURIComponent(meeting.meetingCode)}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not join the meeting."
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <FuturisticBackground>
      <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 text-white sm:px-8 lg:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-xl font-bold text-indigo-300 ring-1 ring-indigo-400/30">
              C
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                ConnectSphere
              </h1>
              <p className="text-xs text-white/50">
                Video meetings, made simple
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium transition hover:border-red-400/40 hover:bg-red-500/10 disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </header>

        <section className="py-10 sm:py-14">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
            Your workspace
          </p>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
            Start a new video meeting or join an existing room using
            its meeting code.
          </p>

          {user?.username && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Signed in as @{user.username}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-2xl text-indigo-300">
              <span aria-hidden="true">＋</span>
            </div>

            <h3 className="text-xl font-semibold">Create a meeting</h3>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Create a new room and share its meeting code with participants.
            </p>

            <button
              type="button"
              onClick={handleCreateMeeting}
              disabled={isCreating || isJoining}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-semibold transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "Creating meeting..." : "Create new meeting"}
            </button>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-2xl text-cyan-300">
              <span aria-hidden="true">↗</span>
            </div>

            <h3 className="text-xl font-semibold">Join a meeting</h3>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Enter a valid meeting code to open an existing room.
            </p>

            <form onSubmit={handleJoinMeeting} className="mt-7 space-y-4">
              <label
                htmlFor="meetingCode"
                className="block text-sm font-medium text-white/80"
              >
                Meeting code
              </label>

              <input
                id="meetingCode"
                name="meetingCode"
                value={meetingCode}
                onChange={(event) => setMeetingCode(event.target.value)}
                placeholder="Enter meeting code"
                autoComplete="off"
                required
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
              />

              <button
                type="submit"
                disabled={isJoining || isCreating}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold transition hover:border-cyan-400/40 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isJoining ? "Checking meeting..." : "Join meeting"}
              </button>
            </form>
          </article>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200"
          >
            {error}
          </p>
        )}

        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          ConnectSphere · Connect, collaborate, and communicate.
        </footer>
      </main>
    </FuturisticBackground>
  );
}
