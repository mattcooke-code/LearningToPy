# 🚀 Module Project: Simple Log File Processor

This project challenges you to combine reading, writing, and the safe `with open()` context manager to perform a common data task: **processing a log file**.

Your goal is to read raw data from an input log, clean it up, extract useful information, and write the processed results to a new, structured output file.

## The Task

You are given a raw log file named `server_log_raw.txt`. Each line contains a status code and a URL, separated by a pipe (`|`).

**Example Lines:**

`200|/api/v1/users/5`

`404|/missing/page`

`500|/broken/endpoint`

:::note
You need to perform the following steps:

1.  **Read** the raw log file line by line using the `with open(...)` manager.
2.  **Filter** out any lines that do not have a status code of `200` (meaning, filter out all errors).
3.  **Process** the remaining lines by extracting only the URL path.
4.  **Write** only the clean URL paths (one per line) to a new file called `clean_urls.txt`.
    :::

## New Concepts You'll Need

### CONCEPT 1: `str.startswith()`

The `.startswith()` method checks whether a string begins with a specific sequence of characters. It returns `True` or `False`.

```python
# Checking fruit orders
order1 = "FRESH|apples|12"
order2 = "DAMAGED|bananas|5"
order3 = "FRESH|oranges|8"

if order1.startswith("FRESH"):
    print("Good order!")      # This prints

if order2.startswith("FRESH"):
    print("Good order!")      # This does NOT print

# You can check for any prefix:
code = "ERR_connection_timeout"
if code.startswith("ERR_"):
    print("This is an error code")   # This prints
```

### CONCEPT 2: `str.split()`

The `.split(separator)` method breaks a string into a **list of parts** wherever it finds the separator character. This is how you extract individual values from structured text.

```python
# A record with fields separated by commas
record = "Alice,28,Engineer"
parts = record.split(",")
print(parts)        # ['Alice', '28', 'Engineer']
print(parts[0])     # 'Alice'
print(parts[1])     # '28'
print(parts[2])     # 'Engineer'

# Works with any separator:
timestamp = "2024-01-15"
date_parts = timestamp.split("-")
print(date_parts)   # ['2024', '01', '15']
print(date_parts[0])  # '2024' (the year)
```

### Combining `.strip()`, `.split()`, and `.startswith()`

These three methods work together naturally when processing structured text files. Imagine a file of product inventory where each line is formatted as `CATEGORY:product_name`.

```python
wanted_items = []

with open("inventory.txt", "r") as f:
    for line in f:
        if line.startswith("INSTOCK:"):
            fields = line.strip().split(":")
            wanted_items.append(fields[1])

with open("available_products.txt", "w") as f:
    for item in wanted_items:
        f.write(item + "\n")
```

:::tip

### Notice the pattern:

- `startswith()` decides whether to process a line
- `.strip().split()` chains both operations together - first stripping the newline, then splitting into parts
- `fields[1]` extracts the specific field you need - index `0` would be the category, index `1` is the product name
  :::

## Project Requirements

- **Safety First:** You **must** use the `with open(...)` context manager for both reading (`'r'`) and writing (`'w'`).
- **Filtering:** Only lines starting with `200` should be processed.
- **Output Format:** Each line in `clean_urls.txt` must contain only the URL path, followed by a newline character (`\n`).

## Expected Output

After processing `server_log_raw.txt`, your `clean_urls.txt` should contain only the URLs from successful requests — one per line, with no status codes.
