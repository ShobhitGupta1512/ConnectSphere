
import { useEffect, useRef, useState } from "react";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export default function useWebRTC({ socket, localStream, participants }) {
  const peers = useRef(new Map());
  const pendingCandidates = useRef(new Map());
  const localStreamRef = useRef(localStream);
  const [remoteStreams, setRemoteStreams] = useState({});

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    if (!socket) return;

    const createPeer = (peerId) => {
      if (peers.current.has(peerId)) {
        return peers.current.get(peerId);
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);
      peers.current.set(peerId, pc);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit("signal", peerId, {
            type: "candidate",
            candidate,
          });
        }
      };

      pc.ontrack = ({ streams }) => {
        if (streams[0]) {
          setRemoteStreams((current) => ({
            ...current,
            [peerId]: streams[0],
          }));
        }
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) {
          pc.close();
          peers.current.delete(peerId);
          pendingCandidates.current.delete(peerId);

          setRemoteStreams((current) => {
            const next = { ...current };
            delete next[peerId];
            return next;
          });
        }
      };

      return pc;
    };

    const handleSignal = async (peerId, message) => {
      try {
        const pc = createPeer(peerId);

        if (message?.type === "offer") {
          await pc.setRemoteDescription(message.description);

          const queued = pendingCandidates.current.get(peerId) || [];
          for (const candidate of queued) {
            await pc.addIceCandidate(candidate);
          }
          pendingCandidates.current.delete(peerId);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("signal", peerId, {
            type: "answer",
            description: pc.localDescription,
          });
        } else if (message?.type === "answer") {
          if (pc.signalingState !== "have-local-offer") return;

          await pc.setRemoteDescription(message.description);

          const queued = pendingCandidates.current.get(peerId) || [];
          for (const candidate of queued) {
            await pc.addIceCandidate(candidate);
          }
          pendingCandidates.current.delete(peerId);
        } else if (message?.type === "candidate" && message.candidate) {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(message.candidate);
          } else {
            const queued = pendingCandidates.current.get(peerId) || [];
            queued.push(message.candidate);
            pendingCandidates.current.set(peerId, queued);
          }
        }
      } catch (error) {
        console.error(`WebRTC signaling error with ${peerId}:`, error);
      }
    };

    socket.on("signal", handleSignal);

    return () => {
      socket.off("signal", handleSignal);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket?.connected) return;

    let cancelled = false;

    const startOffer = async (peerId) => {
      if (peerId === socket.id) return;
      if (socket.id.localeCompare(peerId) <= 0) return;
      if (peers.current.has(peerId)) return;

      try {
        // Create the connection and its event handlers.
        const pc = new RTCPeerConnection(RTC_CONFIG);
        peers.current.set(peerId, pc);

        localStreamRef.current?.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            socket.emit("signal", peerId, {
              type: "candidate",
              candidate,
            });
          }
        };

        pc.ontrack = ({ streams }) => {
          if (streams[0]) {
            setRemoteStreams((current) => ({
              ...current,
              [peerId]: streams[0],
            }));
          }
        };

        pc.onconnectionstatechange = () => {
          if (["failed", "closed"].includes(pc.connectionState)) {
            pc.close();
            peers.current.delete(peerId);
            pendingCandidates.current.delete(peerId);

            setRemoteStreams((current) => {
              const next = { ...current };
              delete next[peerId];
              return next;
            });
          }
        };

        const offer = await pc.createOffer();

        if (cancelled) {
          pc.close();
          peers.current.delete(peerId);
          return;
        }

        await pc.setLocalDescription(offer);

        socket.emit("signal", peerId, {
          type: "offer",
          description: pc.localDescription,
        });
      } catch (error) {
        console.error(`Unable to start connection with ${peerId}:`, error);
      }
    };

    participants.forEach((peerId) => {
      void startOffer(peerId);
    });

    return () => {
      cancelled = true;
    };
  }, [socket, participants]);

  useEffect(() => {
    for (const pc of peers.current.values()) {
      for (const kind of ["audio", "video"]) {
        const track =
          localStream?.getTracks().find((item) => item.kind === kind) || null;

        const sender = pc
          .getSenders()
          .find((item) => item.track?.kind === kind);

        if (sender) {
          void sender.replaceTrack(track).catch((error) => {
            console.error(`Unable to replace ${kind} track:`, error);
          });
        } else if (track) {
          pc.addTrack(track, localStream);
        }
      }
    }
  }, [localStream]);

  useEffect(() => {
    const activeIds = new Set(participants);

    for (const [peerId, pc] of peers.current.entries()) {
      if (!activeIds.has(peerId)) {
        pc.close();
        peers.current.delete(peerId);
        pendingCandidates.current.delete(peerId);

        setRemoteStreams((current) => {
          const next = { ...current };
          delete next[peerId];
          return next;
        });
      }
    }
  }, [participants]);

  useEffect(() => {
    return () => {
      for (const pc of peers.current.values()) {
        pc.close();
      }

      peers.current.clear();
      pendingCandidates.current.clear();
    };
  }, []);

  return { remoteStreams };
}
