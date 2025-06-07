import React, { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import "./styles/App.css";

function App() {
  const [transcript, setTranscript] = useState("");
  const [calendarLink, setCalendarLink] = useState(null);

  const handleTranscription = (data) => {
    setTranscript(data.transcript || "");
    setCalendarLink(data.calendar_event || null);
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <img src="/logo.png" alt="Voice2Calendar logo" className="app-logo" />
        <h1 className="fw-bold">Voice2Calendar</h1>
        <p className="text-muted">Speak your plans — we’ll turn them into calendar events.</p>
      </div>

      <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: "540px" }}>
        <h4 className="mb-3 text-center">🎤 Record & Upload</h4>
        <AudioRecorder onTranscription={handleTranscription} />
      </div>

      {transcript && (
        <div className="card mt-4 mx-auto p-4 shadow-sm" style={{ maxWidth: "540px" }}>
          <h5 className="mb-3">📝 Transcription Result</h5>
          <p><strong>Text:</strong> {transcript}</p>
        </div>
      )}

      {calendarLink && (
        <div className="text-center mt-3">
          <h5>📅 Calendar Event Created</h5>
          <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info">
            Open in Google Calendar
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
