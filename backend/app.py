import os
import uuid
import wave
import json
import ffmpeg
import dateparser
import spacy
from flask import Flask, request, jsonify
from flask_cors import CORS
from vosk import Model, KaldiRecognizer

app = Flask(__name__)
CORS(app)

# Load models
model = Model("model/vosk-model-small-en-us-0.15")
nlp = spacy.load("en_core_web_sm")

def extract_datetime(text):
    doc = nlp(text)
    dates = []

    for ent in doc.ents:
        if ent.label_ in ["DATE", "TIME"]:
            parsed = dateparser.parse(ent.text)
            if parsed:
                dates.append({
                    "phrase": ent.text,
                    "parsed": parsed.isoformat()
                })
    return dates

@app.route("/api/hello")
def hello():
    return {"message": "Hello from Flask"}

@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    temp_id = str(uuid.uuid4())
    webm_path = f"temp/{temp_id}.webm"
    wav_path = f"temp/{temp_id}.wav"

    os.makedirs("temp", exist_ok=True)
    audio_file.save(webm_path)

    try:
        ffmpeg.input(webm_path).output(wav_path, ar=16000, ac=1).run(overwrite_output=True)
    except Exception as e:
        return jsonify({"error": "Audio conversion failed", "details": str(e)}), 500

    try:
        wf = wave.open(wav_path, "rb")
        rec = KaldiRecognizer(model, wf.getframerate())
        result_text = ""

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            rec.AcceptWaveform(data)

        final_result = rec.FinalResult()
        result_text = json.loads(final_result).get("text", "")
        wf.close()

        datetime_results = extract_datetime(result_text)

    except Exception as e:
        return jsonify({"error": "Transcription failed", "details": str(e)}), 500
    finally:
        if os.path.exists(webm_path): os.remove(webm_path)
        if os.path.exists(wav_path): os.remove(wav_path)

    return jsonify({
        "transcript": result_text,
        "datetimes": datetime_results
    })

if __name__ == "__main__":
    app.run(debug=True)
