# 🚀 Raising Exceptions

Sometimes you need to **raise** (trigger) exceptions yourself when you detect invalid conditions in your code. This allows you to enforce rules and communicate problems clearly.

## 1. The Raise Statement

Use the `raise` statement to trigger an exception intentionally:

### Basic Syntax

```python
raise ExceptionType("Error message")
```

### Example: Input Validation

```python
def calculate_square_root(number):
    if number < 0:
        raise ValueError("Cannot calculate square root of negative number")
    return number ** 0.5

# Usage
try:
    result = calculate_square_root(-4)
except ValueError as e:
    print(f"Error: {e}")  # Output: "Error: Cannot calculate square root of negative number"
```

## 2. Choosing the Right Exception Type

Use built-in exception types that match the error condition:

| Situation                        | Appropriate Exception |
| -------------------------------- | --------------------- |
| Invalid value passed to function | `ValueError`          |
| Wrong type of argument           | `TypeError`           |
| Invalid operation on data        | `RuntimeError`        |
| Feature not implemented          | `NotImplementedError` |

### Example: Type Checking

```python
def greet_user(name):
    if not isinstance(name, str):
        raise TypeError("Name must be a string")
    return f"Hello, {name}!"

# This will raise TypeError
greet_user(123)
```

## 3. Creating Custom Error Messages

Provide clear, helpful error messages that explain what went wrong:

```python
def process_age(age):
    if not isinstance(age, int):
        raise TypeError(f"Age must be an integer, got {type(age).__name__}")
    if age < 0:
        raise ValueError(f"Age cannot be negative, got {age}")
    if age > 150:
        raise ValueError(f"Age seems unrealistic: {age}")

    return f"Your age is {age}"

# Test different cases
try:
    process_age(-5)
except (TypeError, ValueError) as e:
    print(f"Validation error: {e}")
```

## 4. Re-raising Exceptions

Sometimes you want to log an error but still let the exception **propagate** up to a higher level where it can be handled appropriately. This is called **re-raising**.

Use `raise` without any arguments inside an `except` block to re-raise the current exception:

```python
def read_config_file(filename):
    try:
        with open(filename, 'r') as file:
            return file.read()
    except FileNotFoundError:
        print(f"Config file {filename} not found")
        raise  # Re-raise the same exception

# Usage
try:
    config = read_config_file("missing_config.txt")
except FileNotFoundError:
    print("Could not load configuration")
```

:::note
**Why re-raise?**

This pattern is useful when:

- You want to log errors locally but let the calling code decide how to respond
- You're building a library and want to preserve the exception for the user
- You need to perform cleanup but still indicate that something went wrong
  :::

## 5. Custom Exception Classes

For more specific error types, you can create custom exception classes:

```python
class InsufficientFundsError(Exception):
    """Raised when there aren't enough funds for a transaction"""
    pass

class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(
                f"Insufficient funds: ${self.balance} available, but ${amount} requested"
            )
        self.balance -= amount
        return self.balance

# Usage
account = BankAccount(100)
try:
    account.withdraw(200)
except InsufficientFundsError as e:
    print(f"Transaction failed: {e}")
```

:::note
You will learn more about classes in Module 11.
:::

## 6. Best Practices for Raising Exceptions

:::tip

1. **Be specific**: Use the most appropriate exception type

2. **Clear messages**: Explain what went wrong and how to fix it

3. **Fail fast**: Raise exceptions as soon as you detect invalid state

4. **Document exceptions**: Use docstrings to document what exceptions your functions raise
   :::

### Good Example

```python
def divide_numbers(a, b):
    """
    Divide two numbers.

    Args:
        a: numerator
        b: denominator

    Returns:
        The result of a divided by b

    Raises:
        TypeError: If either argument is not a number
        ZeroDivisionError: If denominator is zero
    """
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("Both arguments must be numbers")
    if b == 0:
        raise ZeroDivisionError("Cannot divide by zero")

    return a / b
```

:::summary

- Use `raise` to trigger exceptions intentionally when detecting invalid conditions
- Choose appropriate **built-in** exceptions (`ValueError`, `TypeError`, etc.) for common situations
- Provide clear, helpful error messages that explain what went wrong
- Re-raise exceptions with `raise` alone when you need to log errors but let them propagate
- Create custom exception classes for specific error types
- **Fail fast** - validate inputs and raise exceptions as soon as you detect problems
- Document exceptions in docstrings so users know what to expect

:::
