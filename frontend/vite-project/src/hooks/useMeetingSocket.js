import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export default function useMeetingSocket(meetingCode) {
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [socketError, setSocketError] = useState("");

  useEffect(() => {
    if (!meetingCode) return;

    const socket = io(SOCKET_URL);

    const handleConnect = () => {
      setConnected(true);
      setSocketError("");
      socket.emit("join-call", meetingCode);
    };

    const handleDisconnect = () => {
      setConnected(false);
      setParticipants([]);
    };

    const handleConnectError = () => {
      setConnected(false);
      setSocketError("Unable to connect to the meeting server.");
    };

    const handleMeetingError = (payload) => {
      setSocketError(payload?.message || "Unable to join this meeting.");
    };

    const handleExistingParticipants = (participantIds) => {
      setParticipants(participantIds);
    };

    const handleUserJoined = (participantId) => {
      setParticipants((current) =>
        current.includes(participantId)
          ? current
          : [...current, participantId]
      );
    };

    const handleUserLeft = (participantId, remainingParticipants) => {
      setParticipants((current) =>
        Array.isArray(remainingParticipants)
          ? remainingParticipants.filter((id) => id !== socket.id)
          : current.filter((id) => id !== participantId)
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("meeting-error", handleMeetingError);
    socket.on("existing-participants", handleExistingParticipants);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.emit("leave-call");
      socket.disconnect();

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("meeting-error", handleMeetingError);
      socket.off("existing-participants", handleExistingParticipants);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, [meetingCode]);

  return { connected, participants, socketError };
}