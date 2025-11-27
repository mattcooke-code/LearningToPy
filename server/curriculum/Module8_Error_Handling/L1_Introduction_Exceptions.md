# 🛡️ Introduction to Exceptions

Even the best code can encounter unexpected situations. Python uses **exceptions** to handle errors that occur during program execution.

## 1. Syntax Errors vs. Exceptions

### Syntax Errors

These occur when Python can't understand your code. They must be fixed before the program can run.

```python
# Syntax Error - missing colon
if x == 5    # ❌ Missing colon
    print(x)

# Syntax Error - mismatched parentheses
print("Hello'   # ❌ Mismatched quotes
```

### Exceptions

These occur during execution when Python understands what you wrote, but encounters an error while running it.

```python
# These will cause exceptions at runtime
print(10 / 0)           # ❌ ZeroDivisionError
print("hello" + 5)      # ❌ TypeError
print(int("abc"))       # ❌ ValueError
```

## 2. The Try/Except Block

The `try/except` block lets you "catch" exceptions and handle them gracefully instead of crashing.

### Basic Syntax

```python
try:
    # Code that might cause an exception
    risky_operation()
except:
    # Code to handle the exception
    print("Something went wrong!")
```

### Example: Handling Division by Zero

```python
try:
    result = 10 / 0
    print(f"Result: {result}")
except:
    print("Cannot divide by zero!")

# Output: "Cannot divide by zero!"
# Program continues running instead of crashing
```

## 3. Why Use Error Handling?

1. **Prevent crashes**: Keep your program running even when errors occur

2. **Better user experience**: Show friendly error messages instead of technical tracebacks

3. **Robust code**: Handle edge cases and unexpected inputs gracefully

4. **Debugging**: Log errors for later analysis

## 4. Catching All Exceptions

While `except`: catches everything, it's usually better to catch specific exceptions (we'll cover this in the next lesson).

⚠️ Important: Catching all exceptions can hide bugs! Use it carefully.
