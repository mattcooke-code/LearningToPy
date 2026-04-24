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

### 📖 Regex Reference Guide

Use this table as a quick reminder of the building blocks you'll need for the Log Analyzer:

| Component            | Regex Syntax | Purpose in this Project                                                           |
| -------------------- | ------------ | --------------------------------------------------------------------------------- |
| **Digits**           | `\d`         | To match numbers in IP addresses and status codes.                                |
| **Quantifier**       | `{n,m}`      | To specify a range, like `\d{1,3}` for IP octets.                                 |
| **Literal Dot**      | `\.`         | To match the actual `.` between IP numbers (must be escaped).                     |
| **Non-Greedy**       | `.*?`        | To capture everything _inside_ a set of brackets or quotes without over-matching. |
| **Alternation**      | `\|`         | To allow for multiple options, like `GET\|POST\|PUT`.                             |
| **Boundaries**       | `\b`         | To ensure you match a standalone 3-digit status code.                             |
| **Escaped Brackets** | `\[ and \]`  | To match the literal square brackets surrounding the timestamp.                   |

### 🛠️ Strategic Approach

To solve this challenge, you’ll want to break the complex log entry down into smaller, manageable patterns before combining them:

1. **Isolate the Components:** Start by writing individual patterns for the IP address and the status code. Test these first to ensure they match correctly.
2. **Handle Special Characters:** Log files use a lot of brackets `[]` and quotes `""`. Remember to _escape_ your brackets `\[ \]` so Python treats them as literal characters.
3. **Use "Lazy" Matching:** For the timestamp, use a non-greedy match `.*?` inside the brackets to ensure you capture only what's inside.
4. **The Master Pattern:** Finally, combine your individual patterns using `.*?` between them. This tells Python to "find the IP, skip some text, find the date, skip some text," and so on, until the full line is parsed.
