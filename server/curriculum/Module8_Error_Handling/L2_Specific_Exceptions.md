# 🎯 Handling Specific Exceptions

While catching all exceptions can be useful, it's much better practice to catch **specific exception types**. This allows you to handle different errors differently and avoids hiding unexpected bugs.

## 1. Common Built-in Exceptions

Python has many built-in exception types. Here are the most common ones:

| Exception           | When It Occurs                                                                 | Example                   |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| `ValueError`        | When a function receives an argument of the right type but inappropriate value | `int("abc")`              |
| `TypeError`         | When an operation is applied to an object of inappropriate type                | `"hello" + 5`             |
| `ZeroDivisionError` | When dividing by zero                                                          | `10 / 0`                  |
| `FileNotFoundError` | When a file or directory is requested but doesn't exist                        | `open("nonexistent.txt")` |
| `IndexError`        | When a sequence subscript is out of range                                      | `[1,2,3][10]`             |
| `KeyError`          | When a dictionary key is not found                                             | `{"a":1}["b"]`            |

## 2. Catching Specific Exceptions

You can catch specific exceptions by naming them after the `except` keyword:

```python
try:
    number = int(input("Enter a number: "))
    result = 10 / number
    print(f"10 divided by {number} is {result}")
except ValueError:
    print("That's not a valid number!")
except ZeroDivisionError:
    print("You can't divide by zero!")
```

## 3. Multiple Exceptions in One Block

You can catch multiple exception types in a single except block using parentheses:

```python
try:
    # Code that might raise multiple types of errors
    file = open("data.txt", "r")
    content = file.read()
    number = int(content.strip())
except (FileNotFoundError, ValueError) as e:
    print(f"Error: {type(e).__name__} - {e}")
```

## 4. Getting Exception Information

Use `as` to capture the exception object for more detailed error messages:

```python
try:
    num = int("not_a_number")
except ValueError as e:
    print(f"Caught ValueError: {e}")
    # Output: "Caught ValueError: invalid literal for int() with base 10: 'not_a_number'"
```

## 5. Best Practices

1. **Be specific**: Catch only the exceptions you can handle

2. **Order matters**: Put more specific exceptions first

3. **Don't catch everything**: Let unexpected exceptions propagate for debugging

4. **Provide useful messages**: Help users understand what went wrong

### Good vs Bad Practice

```python
# ❌ Too broad - hides unexpected errors
try:
    risky_operation()
except:
    print("Error")

# ✅ Specific and informative
try:
    risky_operation()
except ValueError as e:
    print(f"Invalid value: {e}")
except FileNotFoundError:
    print("File not found. Please check the filename.")
```
