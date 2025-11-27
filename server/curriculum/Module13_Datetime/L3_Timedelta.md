# ⏱️ Date Arithmetic with `timedelta`

While `datetime` objects represent a specific point in time, the `timedelta` object represents a _duration_—a span of time, such as 30 days, 5 hours, or 15 minutes.

`timedelta` is the core tool in Python for performing date arithmetic, allowing you to easily calculate time differences and move dates forward or backward.

## 1. Calculating `timedelta` (Date Difference)

When you subtract one `datetime` object from another, the result is always a `timedelta` object.

```python
from datetime import datetime, timedelta

start_time = datetime(2025, 1, 1, 10, 0, 0)
end_time = datetime(2025, 1, 3, 15, 30, 0)

# Subtracting two datetimes yields a timedelta object

duration = end_time - start_time

print(f"Duration object: {duration}")

# Output: 2 days, 5:30:00

# You can access timedelta components

print(f"Total seconds in duration: {duration.total_seconds()}")

# Output: 199800.0
```

## 2. Creating `timedelta` Objects

You can manually create a `timedelta` object by specifying arguments like `days`, `hours`, `minutes`, `seconds`, etc.

**Syntax**: `timedelta(days=D, hours=H, minutes=M, seconds=S, ...)`

```python
from datetime import timedelta

# A common use case: setting a validity period

expiration_period = timedelta(days=90, hours=12)

print(f"Expiration Period: {expiration_period}")

# Output: 90 days, 12:00:00
```

## 3. Date Arithmetic (Adding and Subtracting)

You can add or subtract a `timedelta` object from a `date` or `datetime` object to calculate a new date/time.

```python
from datetime import datetime, timedelta

# Current time

today = datetime(2025, 10, 21)

# Time intervals

one_week = timedelta(weeks=1)
three_days = timedelta(days=3)

# Addition: Calculate next week

next_week = today + one_week
print(f"Date next week: {next_week.date()}")

# Output: 2025-10-28

# Subtraction: Calculate 3 days ago

three_days_ago = today - three_days
print(f"Date three days ago: {three_days_ago.date()}")

# Output: 2025-10-18
```

This flexibility makes `timedelta` essential for scheduling tasks, calculating deadlines, or determining intervals in time series data.
