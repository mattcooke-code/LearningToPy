# 🚀 Module Project: Simple Log File Processor

This project challenges you to combine reading, writing, and the safe `with open()` context manager to perform a common data task: **processing a log file**.

Your goal is to read raw data from an input log, clean it up, extract useful information, and write the processed results to a new, structured output file.

## The Task

You are given a raw log file named `server_log_raw.txt`. Each line contains a status code and a URL, separated by a pipe (`|`).

**Example Line:** `200|/api/v1/users/5`

You need to perform the following steps:

1.  **Read** the raw log file line by line using the `with open(...)` manager.
2.  **Filter** out any lines that do not have a status code of `200` (meaning, filter out all errors).
3.  **Process** the remaining lines by extracting only the URL path.
4.  **Write** only the clean URL paths (one per line) to a new file called `clean_urls.txt`.

## Project Requirements

- **Safety First:** You **must** use the `with open(...)` context manager for both reading (`'r'`) and writing (`'w'`).
- **Filtering:** Only lines starting with `200` should be processed.
- **Output Format:** Each line in `clean_urls.txt` must contain only the URL path, followed by a newline character (`\n`).

### Hint

When processing a line like `200|/api/v1/users/5\n`:

1.  Use `.strip()` to remove the trailing newline.
2.  Use the `.split('|')` method to separate the status code and the URL path.
3.  Access the second element (index `1`) of the resulting list to get the URL.

## Example Walkthrough

Given this input line in `server_log_raw.txt`:
200|/api/v1/users/5\n

Your code should:

1. **Check**: `line.startswith('200|')` → `True`
2. **Strip**: `"200|/api/v1/users/5"` (removes `\n`)
3. **Split**: `["200", "/api/v1/users/5"]` (splits on `|`)
4. **Extract**: `parts[1]` → `"/api/v1/users/5"`
5. **Write**: `"/api/v1/users/5\n"` to output file

## Expected Output

After processing the provided `server_log_raw.txt`, your `clean_urls.txt` should contain:

/api/v1/profile/data
/products/listing
/checkout/process
