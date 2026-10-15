
import { useCallback, useEffect, useRef, useState } from "react";

export default function useMediaStream() {
  const videoStreamRef = useRef(null);
  const audioTrackRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [error, setError] = useState("");

  const refreshStream = useCallback(() => {
    const tracks = [
      ...(videoStreamRef.current?.getVideoTracks() || []),
      ...(audioTrackRef.current?.readyState === "live"
        ? [audioTrackRef.current]
        : []),
    ];

    setStream(tracks.length ? new MediaStream(tracks) : null);
  }, []);

  const startCamera = useCallback(async () => {
    if (videoStreamRef.current) return;

    try {
      setError("");

      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      videoStreamRef.current = media;
      setCameraOn(true);
      refreshStream();
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : err.message || "Unable to access the camera."
      );
      setCameraOn(false);
    }
  }, [refreshStream]);

  const stopCamera = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
    setCameraOn(false);
    refreshStream();
  }, [refreshStream]);

  const startMicrophone = useCallback(async () => {
    if (audioTrackRef.current?.readyState === "live") return;

    try {
      setError("");

      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const track = media.getAudioTracks()[0];

      if (!track) {
        media.getTracks().forEach((item) => item.stop());
        throw new Error("No microphone track was found.");
      }

      audioTrackRef.current = track;
      setMicOn(true);
      refreshStream();
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access."
          : err.message || "Unable to access the microphone."
      );
      setMicOn(false);
    }
  }, [refreshStream]);

  const stopMicrophone = useCallback(() => {
    audioTrackRef.current?.stop();
    audioTrackRef.current = null;
    setMicOn(false);
    refreshStream();
  }, [refreshStream]);

  useEffect(() => {
    return () => {
      videoStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioTrackRef.current?.stop();
    };
  }, []);

  return {
    stream,
    cameraOn,
    micOn,
    error,
    startCamera,
    stopCamera,
    startMicrophone,
    stopMicrophone,
  };
}
