
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FuturisticBackground from "../components/FuturisticBackground";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch {
      setError("Logout failed. Please try again.");
    }
  };

  return (
    <FuturisticBackground>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">ConnectSphere</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 px-4 py-2"
          >
            Log out
          </button>
        </header>

        <section className="py-12">
          <p className="opacity-70">Your dashboard</p>
          <h2 className="mt-2 text-3xl font-bold">
            Welcome, {user?.name}!
          </h2>
          <p className="mt-2 opacity-70">
            You're signed in as @{user?.username}.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/15 p-6">
            <h3 className="text-xl font-semibold">Create a meeting</h3>
            <p className="my-3 opacity-70">
              Create a meeting room and invite participants.
            </p>
            <button
              disabled
              className="rounded-lg bg-indigo-500 px-5 py-3 opacity-60"
              title="Meeting creation API is the next implementation step"
            >
              Coming next
            </button>
          </div>

          <div className="rounded-2xl border border-white/15 p-6">
            <h3 className="text-xl font-semibold">Join a meeting</h3>
            <p className="my-3 opacity-70">
              Enter a meeting code when meeting support is connected.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                setError("Meeting joining has not been connected yet.");
              }}
              className="space-y-3"
            >
              <input
                value={meetingCode}
                onChange={(event) => setMeetingCode(event.target.value)}
                placeholder="Enter meeting code"
                className="w-full rounded-lg border border-white/20 bg-black/20 p-3"
                required
              />
              <button
                type="submit"
                className="rounded-lg border border-white/20 px-5 py-3"
              >
                Join meeting
              </button>
            </form>
          </div>
        </section>

        {error && (
          <p role="alert" className="mt-4 text-amber-300">
            {error}
          </p>
        )}
      </main>
    </FuturisticBackground>
  );
}
