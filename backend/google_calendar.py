
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import os

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CLIENT_SECRET_FILE = "client_secret.json"
TOKEN_FILE = "token.json"

def get_credentials():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        elif not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            creds = flow.run_local_server(port=8080)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
        creds = flow.run_local_server(port=8080)

    with open(TOKEN_FILE, "w") as token:
        token.write(creds.to_json())
    return creds

def create_event(full_text: str, start_datetime: datetime) -> str:
    creds = get_credentials()
    service = build("calendar", "v3", credentials=creds)

    activity_keywords = ["dentist", "meeting", "appointment", "call", "gym", "lunch", "dinner"]
    summary = "Voice2Calendar Event"
    for keyword in activity_keywords:
        if keyword in full_text.lower():
            summary = " ".join([
                word.capitalize() if i == 0 else word
                for i, word in enumerate(full_text.lower().split())
                if keyword in word
            ])
            break

    event = {
        "summary": summary,
        "description": f"Created by Voice2Calendar. Original phrase: {full_text}",
        "start": {
            "dateTime": start_datetime.isoformat(),
            "timeZone": "Europe/Warsaw",
        },
        "end": {
            "dateTime": (start_datetime + timedelta(hours=1)).isoformat(),
            "timeZone": "Europe/Warsaw",
        },
        "reminders": {
            "useDefault": True,
        },
    }

    created_event = service.events().insert(calendarId="primary", body=event).execute()
    return created_event.get("htmlLink", "")

