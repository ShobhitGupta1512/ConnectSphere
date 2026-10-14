import { useCallback, useEffect, useRef, useState } from "react";

export default function useMediaStream() {
  const videoStreamRef = useRef(null);
  const audioTrackRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    if (videoStreamRef.current) return;

    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported in this browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      videoStreamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraOn(true);
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : err.message || "Unable to access the camera."
      );
      setCameraOn(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());

    videoStreamRef.current = null;
    setStream(null);
    setCameraOn(false);
  }, []);

  const startMicrophone = useCallback(async () => {
    if (audioTrackRef.current) return;

    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not supported in this browser.");
      }

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const audioTrack = audioStream.getAudioTracks()[0];

      if (!audioTrack) {
        audioStream.getTracks().forEach((track) => track.stop());
        throw new Error("No microphone track was found.");
      }

      audioTrackRef.current = audioTrack;
      setMicOn(true);
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access."
          : err.message || "Unable to access the microphone."
      );
      setMicOn(false);
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    audioTrackRef.current?.stop();
    audioTrackRef.current = null;
    setMicOn(false);
  }, []);

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