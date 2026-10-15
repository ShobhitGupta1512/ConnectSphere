
import { useEffect, useRef, useState } from "react";

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

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit("signal", peerId, {
            type: "candidate",
            candidate,
          });
        }
      };

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

        if (message.type === "offer") {
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
        } else if (message.type === "answer") {
          if (pc.signalingState !== "have-local-offer") return;

          await pc.setRemoteDescription(message.description);

          const queued = pendingCandidates.current.get(peerId) || [];
          for (const candidate of queued) {
            await pc.addIceCandidate(candidate);
          }
          pendingCandidates.current.delete(peerId);
        } else if (message.type === "candidate" && message.candidate) {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(message.candidate);
          } else {
            const queued = pendingCandidates.current.get(peerId) || [];
            queued.push(message.candidate);
            pendingCandidates.current.set(peerId, queued);
          }
        }
      } catch (error) {
        console.error("WebRTC signaling error:", peerId, error);
      }
    };

    socket.on("signal", handleSignal);

    return () => socket.off("signal", handleSignal);
  }, [socket]);

  useEffect(() => {
    if (!socket?.connected) return;

    let cancelled = false;

    const startOffer = async (peerId) => {
      if (peerId === socket.id) return;
      if (socket.id.localeCompare(peerId) <= 0) return;
      if (peers.current.has(peerId)) return;

      try {
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

        await peer.setLocalDescription(offer);
        socket.emit("signal", peerId, {
          type: "offer",
          description: peer.localDescription,
        });
      } catch (error) {
        console.error("Unable to start WebRTC offer:", peerId, error);
      }
    };

    participants.forEach((peerId) => void startOffer(peerId));

    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    const activeIds = new Set(participants);

    for (const [peerId, pc] of peers.current) {
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

  useEffect(() => () => {
    for (const pc of peers.current.values()) pc.close();
    peers.current.clear();
    pendingCandidates.current.clear();
  }, []);

  return { remoteStreams };
}
