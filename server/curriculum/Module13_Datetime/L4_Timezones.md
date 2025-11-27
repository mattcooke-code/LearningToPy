# 🌎 Time Zones (`tzinfo`) and Conversion

When working with dates and times, you must account for time zones to ensure accuracy, especially across geographical regions. A `datetime` object can be "naive" (no time zone information) or "aware" (includes time zone information).

## 1. Naive vs. Aware Datetimes

• **Naive**: A `datetime` object created without an associated time zone. Python assumes it's in the local time zone, which can lead to errors when calculating differences across daylight saving time (DST) changes or different regions.

• **Aware**: A `datetime` object that includes time zone information (`tzinfo`). This is required for accurate global time tracking.

## 2. Using the `zoneinfo` Module (Python 3.9+)

Python's standard library now includes the `zoneinfo` module, which handles the IANA time zone database (like `America/New_York`, `Europe/London`).

### A. Creating an Aware Datetime

To create an aware datetime, you first need to get the time zone object and then assign it to the `datetime`.

```python
from datetime import datetime
from zoneinfo import ZoneInfo # Standard library module

# 1. Define the Time Zone

london_tz = ZoneInfo("Europe/London")

# 2. Create a naive datetime object

naive_dt = datetime(2025, 12, 1, 10, 0, 0)

# 3. Attach the time zone (make it aware)

london_dt = naive_dt.replace(tzinfo=london_tz)

print(f"London Time: {london_dt}")

# Output: 2025-12-01 10:00:00+00:00 (London is UTC in December)
```

## 3. Time Zone Conversion (`.astimezone()`)

The main benefit of an aware datetime object is the ability to easily convert it to any other time zone using the `.astimezone()` method.

```python
from datetime import datetime
from zoneinfo import ZoneInfo

# Start with an Aware Datetime (from above example)

london_dt = datetime(2025, 12, 1, 10, 0, 0, tzinfo=ZoneInfo("Europe/London"))

# Target Time Zone (e.g., New York)

ny_tz = ZoneInfo("America/New_York")

# Convert the London time to New York time

new_york_dt = london_dt.astimezone(ny_tz)

# Note: The hour will change to reflect the new time zone offset.

print(f"New York Time: {new_york_dt}")

# Output: 2025-12-01 05:00:00-05:00 (10am London is 5am New York)
```

## 4. UTC (Coordinated Universal Time)

UTC is the global standard time reference, and using it for internal logging and storage is considered best practice. You can easily convert any aware datetime object to UTC before saving it.

```python
# Convert New York time to UTC (the 'Z' in the output represents UTC/Zulu time)

utc_dt = new_york_dt.astimezone(ZoneInfo("UTC"))
print(f"UTC Time: {utc_dt}")

# Output: 2025-12-01 10:00:00+00:00
```
