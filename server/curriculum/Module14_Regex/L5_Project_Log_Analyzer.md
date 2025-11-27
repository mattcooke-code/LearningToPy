# 💻 Project: Log File Analyzer (IP & Date Extractor)

Log files are a primary source of data in software and system administration, but they are typically unstructured text. Regular expressions are the fastest and most reliable way to extract structured information (like IP addresses, dates, and status codes) from these files.

### Project Goal

Your task is to analyze a sample server log file and extract key pieces of information:

1. **IP Address**: The address of the client making the request.

2. **Timestamp**: The date and time of the request.

### Log Format

The sample log file entries follow this general, rigid format:

`[IP_ADDRESS] - - [DD/Month/YYYY:HH:MM:SS] "GET /path HTTP/1.1" 200 ...`

Example Line:

`192.168.1.10 - - [21/Jun/2025:14:30:15] "GET /index.html HTTP/1.1" 200 1024`

### Implementation Steps

1. **Define the IP Pattern**: Create a regex pattern to match and capture the four groups of digits (0-255) separated by dots.

2. **Define the Timestamp Pattern**: Create a regex pattern to match and capture the date/time string enclosed in square brackets.

3. **Combine and Extract**: Create a single, complex pattern to capture both the IP (Group 1) and the full Timestamp (Group 2).

4. **Process and Print**: Iterate through the provided log data and print the extracted IP and Timestamp for each line.

This project uses `re.findall()` on the entire text, which will return a list of tuples, where each tuple contains the IP and Timestamp extracted from one log line.
