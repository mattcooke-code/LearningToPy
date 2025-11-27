# 📅 The `datetime` Module and Basic Objects

Python's built-in `datetime` module is the standard library for working with dates and times. It provides powerful and easy-to-use classes for manipulating temporal data.

## 1. Importing the Module

Unlike many parts of Python which are available globally, the `datetime` module must be explicitly imported.

```python
import datetime
# OR
from datetime import date, time, datetime # Recommended for clarity
```

## 2. The Core Objects

The `datetime` module contains several core classes, each representing a different concept of time:

| Object      | Description                                                        | Example                          |
| ----------- | ------------------------------------------------------------------ | -------------------------------- |
| `date`      | A date (year, month, day) without time.                            | `date(2025, 12, 31)`             |
| `time`      | A time (hour, minute, second, microsecond) without date.           | `time(14, 30, 0)`                |
| `datetime`  | A combination of `date` and `time`.                                | `datetime(2025, 12, 31, 14, 30)` |
| `timedelta` | A duration or difference between two `datetime` or `date` objects. | (Covered in Lesson 13.3)         |

## 3. Creating `datetime` Objects

### A. Current Date and Time (`.now()`)

To get the current date and time, use the `datetime.now()` class method.

```python
from datetime import datetime

# Get the current local date and time

current_dt = datetime.now()
print(f"Current Datetime: {current_dt}")

# Output example: 2025-11-20 10:45:30.123456
```

### B. Specific Date and Time

You can manually create `date`, `time`, or `datetime` objects by passing integers for year, month, day, hour, etc.

```python
from datetime import date, time, datetime

# Create a specific date

release_date = date(2026, 3, 15)
print(f"Date: {release_date}")

# Create a specific time

meeting_time = time(9, 0, 0) # 9:00:00 AM
print(f"Time: {meeting_time}")

# Create a combined datetime object

specific_moment = datetime(2027, 1, 1, 0, 0, 0) # Midnight Jan 1st, 2027
print(f"Datetime: {specific_moment}")
```

## 4. Accessing Components

You can access individual components (year, month, hour, etc.) as attributes of the object.

```python
from datetime import datetime

dt = datetime(2025, 10, 25, 15, 45)

print(f"Year: {dt.year}") # 2025
print(f"Month: {dt.month}") # 10
print(f"Day of Week (Monday=0): {dt.weekday()}") # 5 (Saturday)
print(f"Hour: {dt.hour}") # 15
print(f"Minute: {dt.minute}") # 45
```
