
import { useParams, useNavigate } from "react-router-dom";

export default function MeetingRoom() {
  const { meetingCode } = useParams();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-5 text-white">
      <h1 className="text-3xl font-bold">ConnectSphere Meeting</h1>

      <p className="text-white/60">Meeting code: {meetingCode}</p>

      <p className="text-sm text-amber-300">
        Meeting room UI and video calling are the next implementation step.
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
      >
        Back to dashboard
      </button>
    </main>
  );
}
