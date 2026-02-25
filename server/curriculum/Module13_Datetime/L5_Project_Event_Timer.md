# ⏱️ Project: Event Timer and Date Validator

This project combines date parsing (`strptime`), date arithmetic (`timedelta`), and error handling (`try-except`) to build a practical date utility.

### Project Goal

Create two functions:

1. An **Event Timer** that calculates and formats the time remaining until a specific future date.

2. A **Date Validator** that safely attempts to parse a date string and informs the user if the format is correct.

### Part 1: The Event Timer (`time_until_event`)

This function needs to calculate the time difference between the current moment and a future event date provided as a string.

```python
def time_until_event(event_date_str):
    """
    Calculates the time remaining until a future event.

    Args:
        event_date_str: Date string in 'YYYY-MM-DD' format

    Returns:
        String showing days, hours, and minutes remaining
    """
    # Your code here
    pass
```

|     | Requirements                                                               |
| --- | -------------------------------------------------------------------------- |
| 1.  | Parse the input string using `strptime()` with format `'%Y-%m-%d'`         |
| 2.  | Get the current date/time with `datetime.now()`                            |
| 3.  | If the event has already passed, return `"Event has already passed!"`      |
| 4.  | Otherwise, extract **days**, **hours**, and **minutes** from the timedelta |
| 5.  | Format the result as: `"X days, Y hours, Z minutes remaining."`            |

### Part 2: The Date Validator (`is_valid_date_format`)

This function ensures that a given date string matches a specified format pattern.

```python
def is_valid_date_format(date_str, format_str):
    """
    Checks if a date string matches a given format.

    Args:
        date_str: The date string to check
        format_str: The expected format (e.g., '%m/%d/%Y')

    Returns:
        True if the string matches the format, False otherwise
    """
    # Your code here
    pass
```

|     | Requirements                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.  | The function should accept two strings: `date_str` and `format_str`.                                                                        |
| 2.  | Use a `try...except` block around `datetime.strptime()`.                                                                                    |
| 3.  | If `strptime()` succeeds, return `True`.                                                                                                    |
| 4.  | If `strptime()` fails (meaning the format is wrong or the date is invalid, e.g., "February 30"), catch the `ValueError` and return `False`. |

:::tip

### Extracting Days, Hours, and Minutes from a `timedelta`

When you subtract two `datetime` objects, you get a `timedelta` object. To extract days, hours, and minutes from this duration, you'll need to perform some arithmetic:

**Get the total duration in seconds (as a float):**

`total_seconds = time_remaining.total_seconds()`

**Calculate days (86400 seconds per day):**

`days = int(total_seconds // (24 * 3600))`

**Get the remaining seconds after removing days:**

`remaining_seconds = total_seconds % (24 * 3600)`

**Calculate hours from the remaining seconds:**

`hours = int(remaining_seconds // 3600)`

**Calculate minutes from what's left after removing hours:**

`minutes = int((remaining_seconds % 3600) // 60)`
:::

:::note
Why this works:

- `//` performs integer division (rounds down)
- `%` gives the remainder after division
- `24 * 3600 = 86400` seconds in a day
- `3600` seconds in an hour

This pattern is standard for breaking down a duration into human-readable components.
:::
