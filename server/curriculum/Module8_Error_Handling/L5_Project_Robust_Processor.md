# 🚀 Project: Robust File Data Processor

Apply all your error handling skills to build a robust data processor that can handle various file and data issues gracefully.

## The Challenge

You'll create a program that reads user data from a file, processes it, and generates a report. The real challenge: the input files might be **corrupted, missing, or contain invalid data**.

## Requirements

Your program must:

1. **Read user data** from `users.txt` where each line has format: `name,age,email`
2. **Validate each field** and handle corrupt lines gracefully
3. **Generate a report** with statistics about valid and invalid data
4. **Handle file issues** like missing files, permission errors, etc.
5. **Log all errors** to `error_log.txt` for debugging

## File Format Example

**Valid `users.txt`:**
Alice,30,alice@example.com
Bob,25,bob@email.com
Charlie,35,charlie@test.org

**Corrupt `users.txt` (for testing):**
Alice,30,alice@example.com
Bob,twenty-five,bob@email.com # Invalid age
Charlie,35 # Missing email
Diana,40,diana@example.com
Eve,17,eve@test.org # Under 18

## Validation Rules

- **Name**: Non-empty string
- **Age**: Integer between 18 and 120
- **Email**: Must contain '@' character
- **Line format**: Exactly 3 comma-separated values

## Expected Output

Your program should create `user_report.txt` with:

=== USER DATA PROCESSING REPORT ===
Total lines processed: 5
Successfully processed: 2 users
Failed to process: 3 lines

VALID USERS:

Alice (30): alice@example.com

Diana (40): diana@example.com

ERROR SUMMARY:

• Line 2: Invalid age format 'twenty-five'

• Line 3: Missing email field

• Line 5: Age must be 18 or older, got 17

And `error_log.txt` with detailed error information.

## Implementation Tips

1. Use specific exception handling for different error types
2. Use try/except/else/finally appropriately
3. Raise custom exceptions for validation failures
4. Ensure files are properly closed even when errors occur
5. Provide clear, user-friendly error messages
