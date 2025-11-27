# 🧮 Module Project: Calculator Builder

## The Challenge

You're building the core engine for a modular calculator system. Instead of one giant calculator function, you'll create a collection of specialized functions that work together. This approach makes your code more organized, testable, and maintainable.

## Project Requirements

Create a Python module with the following functions:

### 1. **Basic Arithmetic Functions**

- `add(a, b)` - Returns the sum of two numbers
- `subtract(a, b)` - Returns the difference between two numbers
- `multiply(a, b)` - Returns the product of two numbers
- `divide(a, b)` - Returns the quotient of two numbers, handles division by zero

### 2. **Advanced Calculation Functions**

- `power(base, exponent)` - Returns base raised to exponent power
- `square_root(number)` - Returns square root, handles negative numbers
- `percentage(part, whole)` - Returns what percentage part is of whole

### 3. **Utility Functions**

- `is_even(number)` - Returns True if number is even, False otherwise
- `is_positive(number)` - Returns True if number is positive, False otherwise
- `validate_number(input_str)` - Converts string to number or returns error

### 4. **Main Calculator Function**

- `calculate(operation, num1, num2=None)` - Main function that routes to appropriate operation

## Step-by-Step Implementation

### Step 1: Basic Arithmetic Functions

Let's start with the fundamental operations:

```python
def add(a, b):
    """Return the sum of two numbers."""
    return a + b

def subtract(a, b):
    """Return the difference between two numbers (a - b)."""
    return a - b

def multiply(a, b):
    """Return the product of two numbers."""
    return a * b

def divide(a, b):
    """
    Return the quotient of two numbers.
    Handles division by zero by returning a helpful message.
    """
    if b == 0:
        return "Error: Cannot divide by zero"
    return a / b
```

## Step 2: Advanced Calculation Functions

Now add more sophisticated operations:

```python
def power(base, exponent):
    """Return base raised to the power of exponent."""
    return base ** exponent

def square_root(number):
    """
    Return the square root of a number.
    Handles negative numbers by returning an error message.
    """
    if number < 0:
        return "Error: Cannot calculate square root of negative number"
    return number ** 0.5

def percentage(part, whole):
    """
    Return what percentage part is of whole.
    Returns 0 if whole is 0 to avoid division by zero.
    """
    if whole == 0:
        return 0
    return (part / whole) * 100
```

## Step 3: Utility Functions

These helper functions make our calculator more robust:

```python
def is_even(number):
    """Return True if number is even, False otherwise."""
    return number % 2 == 0

def is_positive(number):
    """Return True if number is positive, False otherwise."""
    return number > 0

def validate_number(input_str):
    """
    Convert string input to number.
    Returns the number if valid, or an error message if invalid.
    """
    try:
        return float(input_str)
    except ValueError:
        return "Error: Please enter a valid number"
```

## Step 4: Main Calculator Function

This function ties everything together:

```python
def calculate(operation, num1, num2=None):
    """
    Main calculator function that routes to appropriate operation.

    Parameters:
    operation (str): The operation to perform ('add', 'subtract', etc.)
    num1: First number
    num2: Second number (optional for some operations)

    Returns:
    Result of the operation or error message
    """
    # First, validate that num1 is a number
    if isinstance(num1, str):
        num1 = validate_number(num1)
        if isinstance(num1, str):  # Still a string means it's an error message
            return num1

    # Validate num2 if provided
    if num2 is not None and isinstance(num2, str):
        num2 = validate_number(num2)
        if isinstance(num2, str):  # Still a string means it's an error message
            return num2

    # Route to the appropriate operation
    if operation == 'add':
        return add(num1, num2)
    elif operation == 'subtract':
        return subtract(num1, num2)
    elif operation == 'multiply':
        return multiply(num1, num2)
    elif operation == 'divide':
        return divide(num1, num2)
    elif operation == 'power':
        return power(num1, num2)
    elif operation == 'square_root':
        return square_root(num1)
    elif operation == 'percentage':
        return percentage(num1, num2)
    elif operation == 'is_even':
        return is_even(num1)
    elif operation == 'is_positive':
        return is_positive(num1)
    else:
        return "Error: Unknown operation"
```

## Step 5: Demonstration and Testing

Let's test our calculator with various operations:

```python
# Test basic arithmetic
print("Basic Arithmetic:")
print(f"5 + 3 = {calculate('add', 5, 3)}")
print(f"10 - 4 = {calculate('subtract', 10, 4)}")
print(f"6 * 7 = {calculate('multiply', 6, 7)}")
print(f"15 / 3 = {calculate('divide', 15, 3)}")
print(f"8 / 0 = {calculate('divide', 8, 0)}")  # Division by zero

print("\nAdvanced Operations:")
print(f"2 ^ 8 = {calculate('power', 2, 8)}")
print(f"√25 = {calculate('square_root', 25)}")
print(f"√(-4) = {calculate('square_root', -4)}")  # Negative number
print(f"25 is what % of 100? {calculate('percentage', 25, 100)}%")

print("\nUtility Checks:")
print(f"Is 7 even? {calculate('is_even', 7)}")
print(f"Is -5 positive? {calculate('is_positive', -5)}")

print("\nString Input Handling:")
print(f"'10' + '5' = {calculate('add', '10', '5')}")
print(f"'abc' + 5 = {calculate('add', 'abc', 5)}")  # Invalid input
```

## Advanced Features (Bonus)

### Feature 1: Calculation History

```python
# Global variable to store history (use carefully!)
calculation_history = []

def calculate_with_history(operation, num1, num2=None):
    """Enhanced calculate function that keeps history."""
    result = calculate(operation, num1, num2)

    # Create history entry
    if num2 is not None:
        entry = f"{operation}({num1}, {num2}) = {result}"
    else:
        entry = f"{operation}({num1}) = {result}"

    calculation_history.append(entry)
    return result

def show_history():
    """Display the calculation history."""
    if not calculation_history:
        print("No calculations yet!")
        return

    print("\n--- Calculation History ---")
    for i, entry in enumerate(calculation_history, 1):
        print(f"{i}. {entry}")
```

## Feature 2: Batch Operations

```python
def batch_calculate(operations):
    """
    Perform multiple calculations at once.
    operations: List of tuples (operation, num1, num2)
    """
    results = []
    for op in operations:
        if len(op) == 3:
            operation, num1, num2 = op
            result = calculate(operation, num1, num2)
        else:
            operation, num1 = op
            result = calculate(operation, num1)
        results.append(result)
    return results

# Example batch operations
operations = [
    ('add', 5, 3),
    ('multiply', 4, 7),
    ('square_root', 16),
    ('is_even', 9)
]

results = batch_calculate(operations)
print("Batch Results:", results)
```

### Best Practices Demonstrated

1. **Single Responsibility**: Each function does one thing well

2. **Error Handling**: Graceful handling of edge cases

3. **Clear Documentation**: Each function explains what it does

4. **Flexible Input**: Handles both numbers and strings

5. **Modular Design**: Functions can be used independently or together

### Testing Your Implementation

Create comprehensive tests to ensure everything works:

```python
def run_tests():
    """Test all calculator functions."""
    print("Running Calculator Tests...")

    # Test basic arithmetic
    assert calculate('add', 2, 3) == 5
    assert calculate('subtract', 10, 4) == 6
    assert calculate('multiply', 3, 7) == 21
    assert calculate('divide', 15, 3) == 5

    # Test error handling
    assert "Error" in calculate('divide', 5, 0)
    assert "Error" in calculate('square_root', -9)

    # Test utility functions directly
    assert is_even(4) == True
    assert is_even(7) == False
    assert is_positive(5) == True
    assert is_positive(-3) == False

    print("All tests passed! ✅")

# Run the tests
run_tests()
```

### Project Submission

Your completed calculator should:

• ✅ Have all required functions implemented

• ✅ Handle errors gracefully (division by zero, invalid inputs)

• ✅ Work with both numbers and string inputs

• ✅ Include clear documentation for each function

• ✅ Pass all the test cases in the exercise

This modular approach makes your code reusable - you can easily add new operations or modify existing ones without breaking the entire system!
