
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useMediaStream from "../hooks/useMediaStream";
import useMeetingSocket from "../hooks/useMeetingSocket";
import useWebRTC from "../hooks/useWebRTC";

function Icon({ name, size = 20 }) {
  const paths = {
    mic: (
      <>
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8" />
      </>
    ),
    micOff: (
      <>
        <path d="M9 9V5a3 3 0 0 1 5.8-1M15 9v3a3 3 0 0 1-5.5 1.6M5 10a7 7 0 0 0 12 4.9M12 17v5m-4 0h8M3 3l18 18" />
      </>
    ),
    camera: (
      <>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="m16 10 5-3v10l-5-3" />
      </>
    ),
    cameraOff: (
      <>
        <path d="M3 3l18 18M10 6h4a2 2 0 0 1 2 2v1l5-3v10l-3-1.8M6 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11" />
      </>
    ),
    screen: (
      <>
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 19a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z" />
    ),
    copy: (
      <>
        <rect x="8" y="8" width="13" height="13" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function ParticipantTile({ stream, label, isLocal = false, micOn }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream || null;

    if (stream) {
      video.play().catch(() => {
        // The browser may require a user interaction before playback.
      });
    }

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const videoOn = Boolean(
    stream?.getVideoTracks().some((track) => track.readyState === "live" && track.enabled)
  );

  return (
    <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950 via-[#151b30] to-[#101522]">
      {videoOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          aria-label={`${label} video`}
          className={`absolute inset-0 h-full w-full object-cover ${
            isLocal ? "scale-x-[-1]" : ""
          }`}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20 text-2xl font-semibold text-indigo-200 ring-1 ring-indigo-300/30">
            {label.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-slate-300">
            {isLocal ? "Camera is turned off" : "Waiting for video..."}
          </p>
        </div>
      )}

      <div className="absolute left-4 top-4 max-w-[75%] truncate rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white">
        {label}
        {isLocal ? " (You)" : ""}
      </div>

      <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 p-2 text-white">
        <Icon
          name={isLocal ? (micOn ? "mic" : "micOff") : "users"}
          size={16}
        />
      </div>
    </div>
  );
}

function MeetingRoom() {
  const { meetingCode } = useParams();
  const navigate = useNavigate();

  const {
    socket,
    connected,
    participants,
    socketError,
  } = useMeetingSocket(meetingCode);

  const {
    stream,
    cameraOn,
    micOn,
    error,
    startCamera,
    stopCamera,
    startMicrophone,
    stopMicrophone,
  } = useMediaStream();

  const { remoteStreams } = useWebRTC({
    socket,
    localStream: stream,
    participants,
  });

  const [copied, setCopied] = useState(false);

  const copyMeetingCode = async () => {
    try {
      await navigator.clipboard.writeText(meetingCode || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const leaveMeeting = () => {
    stopCamera();
    stopMicrophone();
    navigate("/dashboard");
  };

  const remoteParticipantIds = [
    ...new Set([...participants, ...Object.keys(remoteStreams)]),
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold">
            C
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Connect<span className="text-indigo-400">Sphere</span>
            </h1>
            <p className="text-xs text-slate-400">Video meeting room</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span className="text-xs text-slate-300">
              {connected ? "Connected" : "Connecting..."}
            </span>
          </div>

          <button
            type="button"
            onClick={copyMeetingCode}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm transition hover:bg-white/10"
          >
            <Icon name="copy" size={16} />
            {copied ? "Copied!" : "Copy code"}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-indigo-300">Your meeting space</p>
            <h2 className="text-2xl font-semibold md:text-3xl">
              Welcome to the meeting
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Share your meeting code to invite others.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="mb-1 text-xs text-slate-400">Meeting code</p>
            <p className="font-mono text-sm tracking-wider text-indigo-300">
              {meetingCode || "No code"}
            </p>
          </div>
        </section>

        <section className="grid min-h-[360px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ParticipantTile
            stream={stream}
            label="You"
            isLocal
            micOn={micOn}
          />

          {remoteParticipantIds.map((participantId) => (
            <ParticipantTile
              key={participantId}
              stream={remoteStreams[participantId] || null}
              label={`Participant ${participantId.slice(0, 6)}`}
            />
          ))}

          {remoteParticipantIds.length === 0 && (
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#111723] px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300">
                <Icon name="users" size={28} />
              </div>
              <h3 className="text-lg font-medium">Waiting for others</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                Share the meeting code to invite people to your ConnectSphere room.
              </p>
              <button
                type="button"
                onClick={copyMeetingCode}
                className="mt-5 rounded-xl bg-indigo-500/15 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/25"
              >
                {copied ? "Meeting code copied" : "Invite participants"}
              </button>
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <span>
            {remoteParticipantIds.length} other participant
            {remoteParticipantIds.length === 1 ? "" : "s"}
          </span>
          <span>
            {Object.keys(remoteStreams).length} media connection
            {Object.keys(remoteStreams).length === 1 ? "" : "s"} active
          </span>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {socketError && (
          <p
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300"
          >
            {socketError}
          </p>
        )}

        <section className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-[#111723] px-4 py-5 sm:flex-row sm:px-6">
          <div className="hidden sm:block">
            <p className="text-sm font-medium">Meeting controls</p>
            <p className="mt-1 text-xs text-slate-400">
              Manage your camera and microphone
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={micOn ? stopMicrophone : startMicrophone}
              aria-pressed={micOn}
              title={micOn ? "Turn microphone off" : "Turn microphone on"}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                micOn
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-red-400/30 bg-red-500/15 text-red-300"
              }`}
            >
              <Icon name={micOn ? "mic" : "micOff"} />
            </button>

            <button
              type="button"
              onClick={cameraOn ? stopCamera : startCamera}
              aria-pressed={cameraOn}
              title={cameraOn ? "Turn camera off" : "Turn camera on"}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                cameraOn
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-red-400/30 bg-red-500/15 text-red-300"
              }`}
            >
              <Icon name={cameraOn ? "camera" : "cameraOff"} />
            </button>

            <button
              type="button"
              disabled
              title="Screen sharing will be added later"
              aria-label="Screen sharing coming soon"
              className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500 opacity-60"
            >
              <Icon name="screen" />
            </button>

            <button
              type="button"
              onClick={leaveMeeting}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 text-sm font-semibold transition hover:bg-red-600"
            >
              <Icon name="phone" size={18} />
              Leave
            </button>
          </div>

          <p className="text-xs text-slate-500 sm:hidden">
            Allow camera and microphone access when prompted.
          </p>
        </section>

        <p className="text-center text-xs text-slate-500">
          ConnectSphere · Your space to connect
        </p>
      </main>
    </div>
  );
}

export default MeetingRoom;
