from icalendar import Calendar
from datetime import datetime, timedelta
from dateutil import parser  # Add to reqs if needed: python-dateutil==2.8.2

def parse_ical(ical_content: str) -> list[str]:
    cal = Calendar.from_ical(ical_content.encode())
    events = []
    for component in cal.walk():
        if component.name == "VEVENT":
            start = parser.parse(component.get('dtstart').dt)
            end = parser.parse(component.get('dtend').dt)
            events.append((start.date(), end.date()))

    # Find free dates: Gaps >1 day between events (mock logic for MVP)
    free_dates = []
    sorted_events = sorted(events)
    current = datetime.now().date()
    for start, end in sorted_events:
        if start - current > timedelta(days=1):
            free_dates.extend([str(current + timedelta(days=i)) for i in range(1, (start - current).days)])
        current = end + timedelta(days=1)
    return free_dates[:10]  # Limit for MVP