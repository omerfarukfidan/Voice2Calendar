import React, { useState, useRef } from "react";
import "../styles/AudioRecorder.css";

function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState(""); // ✅ transcript state

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setTranscript(""); // yeni kayıt öncesi transcript sıfırlansın
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
      console.log("Transcription result:", data);
      setTranscript(data.transcript); // ✅ state'e yaz
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
          <p className="mb-2 fw-semibold">🎧 Playback</p>
          <audio controls className="mb-3 w-100" src={URL.createObjectURL(audioBlob)} />
          <button className="btn btn-primary" onClick={uploadAudio} disabled={uploading}>
            {uploading ? "Uploading..." : "⬆ Upload"}
          </button>
        </div>
      )}

      {transcript && (
        <div className="mt-4 transcript-box p-3 rounded bg-light border">
          <h5 className="fw-semibold">📝 Transcript:</h5>
          <p className="text-muted">{transcript}</p>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
