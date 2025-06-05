import os
import uuid
import wave
import json
import ffmpeg
import re
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from vosk import Model, KaldiRecognizer
from dateparser.search import search_dates
import dateparser

app = Flask(__name__)
CORS(app)

model = Model("model/vosk-model-small-en-us-0.15")

ORDINAL_MAP = {
    "first": "1", "second": "2", "third": "3", "fourth": "4", "fifth": "5",
    "sixth": "6", "seventh": "7", "eighth": "8", "ninth": "9", "tenth": "10",
    "eleventh": "11", "twelfth": "12", "thirteenth": "13", "fourteenth": "14",
    "fifteenth": "15", "sixteenth": "16", "seventeenth": "17", "eighteenth": "18",
    "nineteenth": "19", "twentieth": "20", "twenty first": "21", "twenty second": "22",
    "twenty third": "23", "twenty fourth": "24", "twenty fifth": "25",
    "twenty sixth": "26", "twenty seventh": "27", "twenty eighth": "28",
    "twenty ninth": "29", "thirtieth": "30", "thirty first": "31"
}

def replace_ordinal_words(text):
    for phrase, digit in ORDINAL_MAP.items():
        text = re.sub(r'\b' + re.escape(phrase) + r'\b', digit, text)
    return text

def extract_datetime(text):
    cleaned = replace_ordinal_words(text.lower())
    results = search_dates(
        cleaned,
        settings={
            'PREFER_DATES_FROM': 'future',
            'RELATIVE_BASE': datetime.now()
        }
    )

    grouped = []
    used_phrases = set()

    if results:
        for i, (phrase, parsed) in enumerate(results):
            if phrase in used_phrases:
                continue

            if i + 1 < len(results):
                next_phrase, next_parsed = results[i + 1]
                if (
                    "am" in next_phrase or "pm" in next_phrase or re.search(r"\d{1,2}(:\d{2})?\s?(am|pm)", next_phrase)
                ):
                    combined_phrase = f"{phrase} {next_phrase}"
                    combined_result = dateparser.parse(
                        combined_phrase,
                        settings={
                            'PREFER_DATES_FROM': 'future',
                            'RELATIVE_BASE': datetime.now()
                        }
                    )
                    if combined_result:
                        grouped.append({
                            "phrase": combined_phrase,
                            "parsed": combined_result.isoformat()
                        })
                        used_phrases.update([phrase, next_phrase])
                        continue

            grouped.append({
                "phrase": phrase,
                "parsed": parsed.isoformat()
            })
            used_phrases.add(phrase)

    return grouped

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
