# 📅 The `datetime` Module and Basic Objects

Python's built-in `datetime` module is the standard library for working with dates and times. It provides powerful and easy-to-use classes for manipulating temporal data.

## 1. Importing the Module

Unlike many parts of Python which are available globally, the `datetime` module must be explicitly imported. There are a few common ways to do this.

```python
# Option 1: Import the whole module
import datetime
# Then use: datetime.datetime.now()

# Option 2: Import just the datetime class (Recommended for our lessons)
from datetime import datetime
# Then use: datetime.now() directly

# Option 3: Import multiple classes at once
from datetime import date, time, datetime
# Then use: date.today(), time(14,30), datetime.now()
```

For the exercises in this module, we'll use **Option 2** `from datetime import datetime` because it keeps our code clean and matches the examples. The `datetime` class contains both date and time information, which is exactly what we need.

:::note
If you use `import datetime` (Option 1), you'll need to write `datetime.datetime.now()` - the extra `datetime.` tells Python to look inside the module. Option 2 saves you from typing that extra prefix every time.
:::

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

You can access individual components (year, month, hour, etc.) as attributes of the object. Python also provides methods to get the day of the week.

```python
from datetime import datetime

dt = datetime(2025, 10, 25, 15, 45)

print(f"Year: {dt.year}")        # 2025
print(f"Month: {dt.month}")       # 10
print(f"Day: {dt.day}")          # 25
print(f"Hour: {dt.hour}")         # 15
print(f"Minute: {dt.minute}")     # 45

# Day of week methods
print(f"Weekday (Monday=0, Sunday=6): {dt.weekday()}")     # 5 (Saturday)
print(f"Weekday (Monday=1, Sunday=7): {dt.isoweekday()}")  # 6 (Saturday)
```

:::note
The `weekday()` method returns Monday as 0 and Sunday as 6, while `isoweekday()` follows the ISO standard with Monday as 1 and Sunday as 7.
:::

:::summary

- The `datetime` module must be **explicitly imported** before use
- Core classes: `date` (date only), `time` (time only), `datetime` (both), and `timedelta` (duration)
- Use `datetime.now()` to get the **_current_** date and time
- Create specific dates with `datetime(year, month, day, hour, minute)`
- Access components using _dot notation_: `object.year`, `object.month`, `object.hour`, etc.
- Use `weekday()` (Monday=0) or `isoweekday()` (Monday=1) to get day of week
- Python handles date components as integers, making them easy to work with

:::
