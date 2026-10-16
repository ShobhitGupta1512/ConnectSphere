
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://connectsphere-backend-u45y.onrender.com";

export default function useMeetingSocket(meetingCode) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [socketError, setSocketError] = useState("");

  useEffect(() => {
    if (!meetingCode) return;

    const currentSocket = io(SOCKET_URL);

    const handleConnect = () => {
      setSocket(currentSocket);
      setConnected(true);
      setSocketError("");
      currentSocket.emit("join-call", meetingCode);
    };

    const handleDisconnect = () => {
      setConnected(false);
      setParticipants([]);
      setSocket(null);
    };

    const handleConnectError = () => {
      setConnected(false);
      setSocketError("Unable to connect to the meeting server.");
    };

    const handleMeetingError = (payload) => {
      setSocketError(payload?.message || "Unable to join this meeting.");
    };

    const handleExistingParticipants = (ids) => {
      setParticipants(Array.isArray(ids) ? ids : []);
    };

    const handleUserJoined = (id) => {
      setParticipants((current) =>
        current.includes(id) ? current : [...current, id]
      );
    };

    const handleUserLeft = (id, remaining) => {
      setParticipants((current) =>
        Array.isArray(remaining)
          ? remaining.filter((participantId) => participantId !== currentSocket.id)
          : current.filter((participantId) => participantId !== id)
      );
    };

    currentSocket.on("connect", handleConnect);
    currentSocket.on("disconnect", handleDisconnect);
    currentSocket.on("connect_error", handleConnectError);
    currentSocket.on("meeting-error", handleMeetingError);
    currentSocket.on("existing-participants", handleExistingParticipants);
    currentSocket.on("user-joined", handleUserJoined);
    currentSocket.on("user-left", handleUserLeft);

    return () => {
      currentSocket.emit("leave-call");

      currentSocket.off("connect", handleConnect);
      currentSocket.off("disconnect", handleDisconnect);
      currentSocket.off("connect_error", handleConnectError);
      currentSocket.off("meeting-error", handleMeetingError);
      currentSocket.off("existing-participants", handleExistingParticipants);
      currentSocket.off("user-joined", handleUserJoined);
      currentSocket.off("user-left", handleUserLeft);

      currentSocket.disconnect();
    };
  }, [meetingCode]);

  return {
    socket,
    connected,
    participants,
    socketError,
  };
}
