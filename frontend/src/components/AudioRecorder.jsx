import React, { useState, useRef } from "react";
import "../styles/AudioRecorder.css";

function AudioRecorder({ onTranscription }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (onTranscription) {
        onTranscription(data); // ✅ App.js'e sonucu gönder
      }

    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="recorder-container">
      <div className="d-flex justify-content-center gap-2 mb-3">
        {!recording ? (
          <button className="btn btn-success" onClick={startRecording}>
            🎙 Start Recording
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopRecording}>
            🛑 Stop
          </button>
        )}
      </div>

      {audioBlob && (
        <div className="text-center">
          <audio controls className="mb-2 w-100" src={URL.createObjectURL(audioBlob)} />
          <button
            className="btn btn-primary"
            onClick={uploadAudio}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "⬆ Upload & Transcribe"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
