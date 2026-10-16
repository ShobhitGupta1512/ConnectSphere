
import { useCallback, useEffect, useRef, useState } from "react";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export default function useWebRTC({
  socket,
  localStream,
  participants = [],
}) {
  const peers = useRef(new Map());
  const pendingCandidates = useRef(new Map());
  const localStreamRef = useRef(localStream);
  const [remoteStreams, setRemoteStreams] = useState({});

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const removePeer = useCallback((peerId) => {
    const pc = peers.current.get(peerId);

    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peers.current.delete(peerId);
    }

    pendingCandidates.current.delete(peerId);

    setRemoteStreams((current) => {
      if (!current[peerId]) return current;
      const next = { ...current };
      delete next[peerId];
      return next;
    });
  }, []);

  const createPeer = useCallback(
    (peerId) => {
      const existing = peers.current.get(peerId);
      if (existing) return existing;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      peers.current.set(peerId, pc);

<<<<<<< HEAD
      // Add transceivers so audio/video can be added later.
      pc.addTransceiver("audio", { direction: "sendrecv" });
      pc.addTransceiver("video", { direction: "sendrecv" });

      const syncTracks = () => {
        const stream = localStreamRef.current;

        for (const kind of ["audio", "video"]) {
          const track =
            stream?.getTracks().find((item) => item.kind === kind) || null;

          const sender = pc
            .getSenders()
            .find((item) => item.track?.kind === kind);

          const transceiver = pc
            .getTransceivers()
            .find((item) => item.receiver.track.kind === kind);

          if (transceiver?.sender) {
            transceiver.sender.replaceTrack(track).catch(console.error);
          } else if (sender) {
            sender.replaceTrack(track).catch(console.error);
          }
        }
      };

      syncTracks();
=======
      // Reserve both media senders even when tracks are not
      // enabled yet. This allows later track replacement.
      const audioTransceiver = pc.addTransceiver("audio", {
        direction: "sendrecv",
      });
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)

      const videoTransceiver = pc.addTransceiver("video", {
        direction: "sendrecv",
      });

      const attachLocalTracks = async () => {
        const stream = localStreamRef.current;

        for (const [kind, transceiver] of [
          ["audio", audioTransceiver],
          ["video", videoTransceiver],
        ]) {
          const track =
            stream?.getTracks().find(
              (item) =>
                item.kind === kind &&
                item.readyState === "live"
            ) || null;

          await transceiver.sender.replaceTrack(track);
        }
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate && socket?.connected) {
          socket.emit("signal", peerId, {
            type: "candidate",
            candidate,
          });
        }
      };

<<<<<<< HEAD
      pc.ontrack = ({ track, streams }) => {
        if (streams[0]) {
          setRemoteStreams((current) => ({
            ...current,
            [peerId]: streams[0],
          }));
        } else {
          setRemoteStreams((current) => {
            const stream =
              current[peerId] || new MediaStream();

            if (!stream.getTracks().some((item) => item.id === track.id)) {
              stream.addTrack(track);
            }

            return { ...current, [peerId]: stream };
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`WebRTC ${peerId}:`, pc.connectionState);

        if (["failed", "closed"].includes(pc.connectionState)) {
          pc.close();
          peers.current.delete(peerId);
          pendingCandidates.current.delete(peerId);
=======
      pc.ontrack = (event) => {
        const incoming = event.streams[0];

        setRemoteStreams((current) => {
          if (incoming) {
            return {
              ...current,
              [peerId]: incoming,
            };
          }

          const stream =
            current[peerId] || new MediaStream();

          if (
            !stream.getTracks().some(
              (track) => track.id === event.track.id
            )
          ) {
            stream.addTrack(event.track);
          }

          return {
            ...current,
            [peerId]: stream,
          };
        });
      };

      pc.onconnectionstatechange = () => {
        console.log(
          `WebRTC ${peerId}:`,
          pc.connectionState
        );
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)

        if (
          ["failed", "closed"].includes(pc.connectionState)
        ) {
          removePeer(peerId);
        }
      };

      // Attach tracks immediately if permission was already granted.
      void attachLocalTracks().catch((error) => {
        console.error("Unable to attach local media:", error);
      });

      return pc;
    },
    [socket, removePeer]
  );

  // Keep media senders synchronized when users toggle devices.
  useEffect(() => {
    const synchronizeTracks = async () => {
      for (const pc of peers.current.values()) {
        for (const sender of pc.getSenders()) {
          const kind = sender.track?.kind;

          // A transceiver sender may have no track yet.
          const transceiver = pc
            .getTransceivers()
            .find((item) => item.sender === sender);

          const mediaKind =
            kind || transceiver?.receiver.track.kind;

          if (
            mediaKind !== "audio" &&
            mediaKind !== "video"
          ) {
            continue;
          }

          const track =
            localStream?.getTracks().find(
              (item) =>
                item.kind === mediaKind &&
                item.readyState === "live"
            ) || null;

          await sender.replaceTrack(track);
        }
      }
    };

    void synchronizeTracks().catch((error) => {
      console.error("Media track synchronization failed:", error);
    });
  }, [localStream]);

  // Receive offers, answers, and ICE candidates.
  useEffect(() => {
    if (!socket) return;

    const handleSignal = async (peerId, message) => {
      try {
        if (!peerId || peerId === socket.id) return;

        const pc = createPeer(peerId);

        if (message.type === "offer") {
          await pc.setRemoteDescription(message.description);

          const queued =
            pendingCandidates.current.get(peerId) || [];

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
<<<<<<< HEAD
        } else if (message.type === "answer") {
          if (pc.signalingState !== "have-local-offer") return;
=======
        } else if (message?.type === "answer") {
          if (pc.signalingState !== "have-local-offer") {
            return;
          }
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)

          await pc.setRemoteDescription(message.description);

          const queued =
            pendingCandidates.current.get(peerId) || [];

          for (const candidate of queued) {
            await pc.addIceCandidate(candidate);
          }

          pendingCandidates.current.delete(peerId);
<<<<<<< HEAD
        } else if (message.type === "candidate" && message.candidate) {
=======
        } else if (
          message?.type === "candidate" &&
          message.candidate
        ) {
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)
          if (pc.remoteDescription) {
            await pc.addIceCandidate(message.candidate);
          } else {
            const queued =
              pendingCandidates.current.get(peerId) || [];

            queued.push(message.candidate);
            pendingCandidates.current.set(peerId, queued);
          }
        }
      } catch (error) {
<<<<<<< HEAD
        console.error("WebRTC signaling error:", peerId, error);
=======
        console.error(
          `WebRTC signaling error with ${peerId}:`,
          error
        );
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)
      }
    };

    socket.on("signal", handleSignal);

<<<<<<< HEAD
    return () => socket.off("signal", handleSignal);
  }, [socket]);
=======
    return () => {
      socket.off("signal", handleSignal);
    };
  }, [socket, createPeer]);
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)

  // One participant initiates the offer to avoid offer collisions.
  useEffect(() => {
    if (!socket?.connected || !socket.id) return;

    let cancelled = false;

    const startOffer = async (peerId) => {
      if (!peerId || peerId === socket.id) return;
      if (socket.id.localeCompare(peerId) <= 0) return;
      if (peers.current.has(peerId)) return;

      try {
<<<<<<< HEAD
        const pc = (() => {
          // The incoming signal handler owns peer creation.
          // Create the offer through the same peer factory instead.
          return null;
        })();

        if (cancelled || pc) return;

        // Trigger offer creation using the peer already managed above.
        // Use a single offerer per pair to avoid offer collisions.
        const peer = new RTCPeerConnection(RTC_CONFIG);
        peers.current.set(peerId, peer);

        peer.addTransceiver("audio", { direction: "sendrecv" });
        peer.addTransceiver("video", { direction: "sendrecv" });

        for (const track of localStreamRef.current?.getTracks() || []) {
          const transceiver = peer
            .getTransceivers()
            .find((item) => item.sender.track === null &&
              item.receiver.track.kind === track.kind);

          if (transceiver) {
            await transceiver.sender.replaceTrack(track);
          }
        }

        peer.onicecandidate = ({ candidate }) => {
          if (candidate) {
            socket.emit("signal", peerId, {
              type: "candidate",
              candidate,
            });
          }
        };

        peer.ontrack = ({ streams }) => {
          if (streams[0]) {
            setRemoteStreams((current) => ({
              ...current,
              [peerId]: streams[0],
            }));
          }
        };

        peer.onconnectionstatechange = () => {
          console.log(`WebRTC ${peerId}:`, peer.connectionState);
        };

        const offer = await peer.createOffer();
        if (cancelled) {
          peer.close();
          peers.current.delete(peerId);
          return;
        }
=======
        const pc = createPeer(peerId);
        const offer = await pc.createOffer();

        if (cancelled) return;
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)

        await peer.setLocalDescription(offer);
        socket.emit("signal", peerId, {
          type: "offer",
          description: peer.localDescription,
        });
      } catch (error) {
<<<<<<< HEAD
        console.error("Unable to start WebRTC offer:", peerId, error);
=======
        console.error(
          `Unable to start connection with ${peerId}:`,
          error
        );
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)
      }
    };

    participants.forEach((peerId) => void startOffer(peerId));

    return () => {
      cancelled = true;
    };
<<<<<<< HEAD
  }, [socket, participants]);

  useEffect(() => {
    for (const pc of peers.current.values()) {
      const stream = localStream;

      for (const kind of ["audio", "video"]) {
        const track =
          stream?.getTracks().find((item) => item.kind === kind) || null;

        const transceiver = pc
          .getTransceivers()
          .find((item) => item.receiver.track.kind === kind);

        if (transceiver) {
          void transceiver.sender.replaceTrack(track).catch(console.error);
        }
      }
    }
  }, [localStream]);
=======
  }, [socket, participants, createPeer]);
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)

  // Remove peers who leave the meeting.
  useEffect(() => {
    const activeIds = new Set(participants);

<<<<<<< HEAD
    for (const [peerId, pc] of peers.current) {
=======
    for (const peerId of peers.current.keys()) {
>>>>>>> 7f69253 (Fix WebRTC audio and video streaming)
      if (!activeIds.has(peerId)) {
        removePeer(peerId);
      }
    }
  }, [participants, removePeer]);

  useEffect(() => () => {
    for (const pc of peers.current.values()) pc.close();
    peers.current.clear();
    pendingCandidates.current.clear();
  }, []);

  return { remoteStreams };
}
