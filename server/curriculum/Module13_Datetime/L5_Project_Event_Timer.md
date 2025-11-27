# ⏱️ Project: Event Timer and Date Validator

This project combines date parsing (`strptime`), date arithmetic (`timedelta`), and error handling (`try-except`) to build a practical date utility.

### Project Goal

Create two functions:

1. An **Event Timer** that calculates and formats the time remaining until a specific future date.

2. A **Date Validator** that safely attempts to parse a date string and informs the user if the format is correct.

### Part 1: The Event Timer (`time_until_event`)

This function needs to calculate the time difference between the current moment and a future event date provided as a string.

### Requirements:

1. The function should accept a date string (`event_date_str`) that is guaranteed to be in the format: `YYYY-MM-DD`.

2. It must use `datetime.strptime()` to convert the string to a `datetime` object.

3. Calculate the difference between the event date and `datetime.now()`.

4. Return the duration as a string showing the number of **Days**, **Hours**, and **Minutes** remaining.

### Part 2: The Date Validator (`is_valid_date_format`)

This function ensures that a given date string matches a specified format pattern.

### Requirements:

1. The function should accept two strings: `date_str` and `format_str`.

2. Use a `try...except ValueError` block around `datetime.strptime()`.

3. If `strptime()` succeeds, return `True`.

4. If `strptime()` fails (meaning the format is wrong or the date is invalid, e.g., "February 30"), catch the `ValueError` and return `False`.
