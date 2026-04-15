import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_leave_details(raw_request: str):
    prompt = f"""
You are an intelligent HR leave request parser.

The employee may:
- Make grammar mistakes
- Use broken English
- Misspell words
- Use informal text
- Write dates in any format

Examples of possible date formats:
- 1 jan 2026
- jan 1
- 01/01/2026
- tomorrow
- next monday
- from 4th april to 7th april
- 5 may
- 12-06-26

Your job is to understand the meaning and convert everything into structured data.

Rules:
1. Fix spelling and grammar mentally before extracting.
2. Infer leave type:
   - Sick -> illness, fever, headache, not feeling well, hospital, etc.
   - Casual -> personal work, function, family event, trip, etc.
   - Annual -> vacation, holiday, travel, long leave, etc.
3. Convert all dates into YYYY-MM-DD format.
4. If the year is missing, assume the current year is 2026.
5. If only one day is mentioned, use the same date for start_date and end_date.
6. Reason should be short and clean.
7. Return ONLY valid JSON. No explanation. No markdown.

Return exactly this format:
{{
    "employee_name": "string",
    "leave_type": "Sick" | "Casual" | "Annual",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "reason": "string"
}}

Employee Leave Request:
{raw_request}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an HR leave request extraction engine. "
                    "You must understand messy English, spelling mistakes, "
                    "and informal date formats. Return only valid JSON."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON returned from LLM: {content}")