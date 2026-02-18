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

You can catch multiple exception types in a single `except` block using parentheses:

```python
try:
    with open("config.txt", "r") as file:
        value = int(file.read().strip())
except (FileNotFoundError, ValueError):
    print("Could not load configuration. Using defaults.")
```

## 4. Getting Exception Information

Use the `as` keyword to capture the exception object for more detailed error messages:

```python
try:
    num = int("not_a_number")
except ValueError as e:
    print(f"Caught ValueError: {e}")
    # Output: "Caught ValueError: invalid literal for int() with base 10: 'not_a_number'"
```

:::tip

1. **Catch what you can handle, leave the rest**: Be specific with your exceptions. Unexpected errors are bugs - let them surface so you can fix them.

2. **Order matters**: Put more specific exceptions first

3. **Provide useful messages**: Help users understand what went wrong
   :::

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

:::summary

- Catch **specific exceptions** to handle different errors differently
- Common built-in exceptions: `ValueError`, `TypeError`, `ZeroDivisionError`, `FileNotFoundError`, `IndexError`, `KeyError`
- Use multiple `except` blocks for different error types
- Catch multiple **exceptions** in one block using parentheses: `except (TypeError, ValueError):`
- Use `as e` to capture exception details for informative messages
- Don't catch **all** exceptions indiscriminately - let unexpected ones surface during development

:::
