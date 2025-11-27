# 📝 Formatting and Parsing: `strftime` and `strptime`

The raw `datetime` object output is often not suitable for user display or for reading from external data sources. Python provides two reciprocal methods for handling these conversions: `strftime()` and `strptime()`.

## 1. Formatting Dates with `strftime()`

The `strftime()` method (string format time) converts a `datetime` object into a formatted string. It takes a format string as an argument, which is composed of standard characters and special directives (prefixed with a `%`).

**Syntax**: `datetime_object.strftime(format_string)`

### Common Formatting Codes

These codes are crucial for defining your desired date and time format.

| Directive | Meaning                                  | Example |
| --------- | ---------------------------------------- | ------- |
| `%Y`      | Year with century                        | 2025    |
| `%y`      | Year without century                     | 25      |
| `%m`      | Month as a zero-padded number            | 03      |
| `%d`      | Day of the month as a zero-padded number | 05      |
| `%B`      | Full month name                          | March   |
| `%A`      | Full weekday name                        | Monday  |
| `%H`      | Hour (24-hour clock)                     | 14      |
| `%I`      | Hour (12-hour clock)                     | 02      |
| `%M`      | Minute as a zero-padded number           | 30      |
| `%S`      | Second as a zero-padded number           | 05      |
| `%p`      | AM or PM                                 | PM      |

### Example of `strftime()`

```python
from datetime import datetime

meeting_time = datetime(2025, 12, 10, 16, 30)

# Format 1: '10-Dec-2025 04:30 PM'

formatted_str_1 = meeting_time.strftime('%d-%b-%Y %I:%M %p')
print(formatted_str_1)

# Format 2: 'Wednesday, December 10, 2025'

formatted_str_2 = meeting_time.strftime('%A, %B %d, %Y')
print(formatted_str_2)
```

## 2. Parsing Dates with `strptime()`

The `strptime()` method (string parse time) converts a string representation of a date/time into a `datetime` object.

Crucially, the format string used in `strptime()` must **EXACTLY** match the structure of the input string.

**Syntax**: `datetime.strptime(date_string, format_string)`

### Example of `strptime()`

If your input string is `'05/20/2024'`, you must use the format string `'\%m/\%d/\%Y'`.

```python
from datetime import datetime

date_string = "Saturday, May 15, 2027 11:30 AM"

# The format string must match the date_string perfectly

format_pattern = "%A, %B %d, %Y %I:%M %p"

# Parse the string back into a datetime object

dt_object = datetime.strptime(date_string, format_pattern)

print(f"Original String: {date_string}")
print(f"Datetime Object: {dt_object}")
print(f"Year Component: {dt_object.year}")

# Output: Year Component: 2027
```

If the format string contains an extra space, is missing a comma, or uses the wrong directive (e.g., using `%B` for an abbreviated month), `strptime()` will raise a `ValueError`.
