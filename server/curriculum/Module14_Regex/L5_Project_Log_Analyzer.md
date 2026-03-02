# 💻 Project: Log File Analyzer (IP & Date Extractor)

Log files are a primary source of data in software and system administration, but they are typically unstructured text. Regular expressions are the fastest and most reliable way to extract structured information (like IP addresses, dates, and status codes) from these files.

### Project Goal

Your task is to analyze a sample server log file and extract key pieces of information from each entry:

1. **IP Address**: The address of the client making the request.
2. **Timestamp**: The date and time of the request.
3. **HTTP Method**: The HTTP method used (GET, POST, PUT, DELETE, etc.).
4. **Status Code**: The HTTP status code returned (200, 404, 500, etc.).

### Log Format

The sample log file entries follow this general format:

`[IP_ADDRESS] - - [DD/Month/YYYY:HH:MM:SS] "METHOD /path HTTP/1.1" STATUS_CODE ...`

Example Line:

`192.168.1.10 - - [21/Jun/2025:14:30:15] "GET /index.html HTTP/1.1" 200 1024`

### Implementation Steps

**Step 1: Import the `re` module**

**Step 2: Define the log data** (provided in the starter code)

**Step 3: Create individual patterns for testing**

- IP pattern: Four groups of 1-3 digits separated by dots
- Timestamp pattern: Date in [DD/Mon/YYYY:HH:MM:SS] format
- Method pattern: The HTTP verb (GET, POST, etc.)
- Status pattern: Three-digit status code

**Step 4: Create a single combined pattern** with four capturing groups:

- Group 1: IP Address
- Group 2: Timestamp (content inside brackets)
- Group 3: HTTP Method
- Group 4: Status Code

**Step 5: Use `re.findall()`** to extract all matches from the log data

**Step 6: Process and display results** in a formatted table
