# 🛠️ Practical Functions Practice

Functions are the workhorses of any Python program. They allow you to encapsulate logic, making your code reusable, testable, and readable. Now that you understand the fundamentals of defining functions, passing arguments, and managing scope, let's apply these concepts to practical, real-world scenarios.

## 1. Data Validation Functions

One of the most critical roles of a function is to act as a **gatekeeper**—validating data before it is processed or stored. By isolating validation logic, you ensure consistent checks across your application.

### Example: Email Format Checker

```python
def is_valid_email(email):
    """
    Check if a string looks like a valid email address.
    Basic validation - checks for @ symbol and domain structure.
    """
    # 1. Must contain an @ symbol
    if '@' not in email:
        return False

    parts = email.split('@')
    # 2. Must be split into exactly two parts (username and domain)
    if len(parts) != 2:
        return False

    username, domain = parts
    # 3. Both parts must not be empty
    if len(username) == 0 or len(domain) == 0:
        return False
    # 4. Domain must contain a dot (e.g., .com, .org)
    if '.' not in domain:
        return False

    return True

# Test the function
print(is_valid_email("user@example.com"))       # True
print(is_valid_email("invalid.email"))          # False
print(is_valid_email("user@com"))               # False
```

:::note

In these practical examples, you’ll see two very common built-in Python functions:

- `len()`: Short for "length." It returns the number of items in an object. If you pass it a string, it counts the characters: `len("Python")` is **6**. If you pass it a list, it counts the elements: `len([10, 20])` is **2**.
- `round(number, ndigits)`: This is used to trim floating-point numbers. For example, `round(3.14159, 2)` gives you 3.14. This is essential when dealing with money or averages where you don't want a "tail" of decimal places.
  :::

### Example: Age Category Classifier

This demonstrates using a function to implement **conditional branching** and return a clean, categorized output.

```python
def classify_age(age):
    """
    Classify a person's age into standard categories.
    """
    if age < 0:
        return "Invalid age"
    elif age < 13:
        return "Child"
    elif age < 20:
        return "Teenager"
    elif age < 65:
        return "Adult"
    else:
        return "Senior"

# Test with different ages
print(classify_age(8))    # Child
print(classify_age(16))   # Teenager
print(classify_age(35))   # Adult
print(classify_age(70))   # Senior
```

## 2. Calculation and Processing Functions

Functions excel at encapsulating **mathematical operations** and complex data transformations. By using **default arguments**, you can make these calculation functions highly flexible.

### Example: Shopping Cart Calculator

This function demonstrates combining multiple mathematical steps (summation, subtraction, multiplication) and using **default arguments** (`tax_rate`, `discount`) to manage common settings.

```python
def calculate_total(items, tax_rate=0.08, discount=0):
    """
    Calculate the total cost of items in a shopping cart.

    Parameters:
    items (list): List of item prices
    tax_rate (float): Tax rate as decimal (default 8%)
    discount (float): Discount amount (default 0)

    Returns:
    float: Final total after discount and tax
    """
    subtotal = sum(items)
    discounted_total = subtotal - discount
    tax_amount = discounted_total * tax_rate
    final_total = discounted_total + tax_amount

    return round(final_total, 2)

# Test the function
prices = [12.99, 5.49, 8.75, 3.25]
total = calculate_total(prices, tax_rate=0.1, discount=5.0)
print(f"Total: ${total}")  # Total: $26.22
```

### Example: Grade Calculator with Multiple Returns

A function can naturally return multiple pieces of related information by separating them with a comma. Python packages these into a **tuple** for the caller to unpack.

```python
def calculate_grade(scores):
    """
    Calculate a student's final grade based on multiple scores.

    Returns both the average (float) and letter grade (str).
    """
    if not scores:  # Check if list is empty
        return 0, "No scores"

    average = sum(scores) / len(scores)

    if average >= 90:
        letter = "A"
    elif average >= 80:
        letter = "B"
    # ... more conditions
    else:
        letter = "F"

    # Returns a tuple: (average, letter)
    return round(average, 2), letter

# Test with different score sets
avg, grade = calculate_grade([85, 92, 78, 96]) # Tuple unpacking
print(f"Average: {avg}, Grade: {grade}")  # Average: 87.75, Grade: B
```

## 3. String Processing Functions

Functions are invaluable for text manipulation and formatting, taking raw string inputs and returning cleanly structured or analyzed outputs.

### Example: Text Formatter

This function shows how to handle **optional arguments** (`middle=""`) to create dynamic string outputs and returns a **dictionary** for structured, easy-to-access results.

```python
def format_name(first, last, middle=""):
    """
    Format a person's name in different styles.
    """
    if middle:
        full_name = f"{first} {middle} {last}"
        formal_name = f"{last}, {first} {middle}"

    else:
        full_name = f"{first} {last}"
        formal_name = f"{last}, {first}"

    return {
        'full': full_name,
        'formal': formal_name,
        'initials': f"{first[0]}.{last[0]}".upper()
    }

# Test name formatting
name_info = format_name("John", "Doe", "Michael")
print(name_info['full'])    # John Michael Doe
print(name_info['formal'])  # Doe, John Michael
```

### Example: Password Strength Checker

This demonstrates analyzing a string by iterating over its characters and using built-in string methods (`isupper()`, `isdigit()`) to calculate a score.

```python
def check_password_strength(password):
    """
    Check if a password meets basic strength requirements.
    """
    if len(password) < 8:
        return "Weak: Password too short"

    # Use generator expressions with any() for quick checks
    has_upper = any(char.isupper() for char in password)
    has_lower = any(char.islower() for char in password)
    has_digit = any(char.isdigit() for char in password)

    score = 0
    if has_upper:
        score += 1
    if has_lower:
        score += 1
    if has_digit:
        score += 1
    if len(password) >= 12: # Extra point for length
        score += 1

    if score >= 3:
        return "Strong password"
    # ... more conditions
    else:
        return "Weak password"

# Test password strength
print(check_password_strength("Password1"))  # Strong password
```

## 4. Scope Practice: Counter Function (Closures)

This advanced pattern, known as a **closure**, demonstrates how an inner function can **remember and access** variables from its enclosing scope (the outer function), even after the outer function has finished execution. The `nonlocal` keyword is essential here to tell the interpreter to modify the `count` variable in the enclosing scope, rather than creating a new local variable.

```python
def create_counter():
    """
    Create a counter function that remembers its count.
    Demonstrates function scope and closures.
    """
    count = 0  # This variable is in the outer function's scope

    def counter():
        nonlocal count  # Allows us to modify the outer variable
        count += 1
        return count

    return counter

# Create two independent counters
# Each counter_a and counter_b holds its OWN separate 'count' variable
counter_a = create_counter()
counter_b = create_counter()

print(counter_a())  # 1
print(counter_a())  # 2
print(counter_b())  # 1 (independent count)
print(counter_a())  # 3
```

## 5. Best Practices for Function Design

### Use Descriptive Names

Function names should be clear and descriptive of what they **do** (usually using a verb). Parameter names should be clear about what they **represent**.

```python
# Good
def calculate_monthly_payment(principal, annual_rate, years):
    pass

# Avoid
def calc(pr, rt, yr):
    pass
```

### Keep Functions Focused

A function should generally perform one, well-defined task. If a function's name includes "and," it's often doing too much.

```python
# Good - each function does one thing
def validate_user_input(data):
    # Only validation logic
    pass

def process_user_data(data):
    # Only processing logic
    pass

# Avoid - function does too much
def handle_user_stuff(data):
    # Validation, processing, saving, etc.
    pass
```

### Use Default Arguments Wisely

Use default arguments for parameters that often have a common, safe value. This reduces complexity for the caller.

```python
def connect_to_database(host, port=5432, timeout=30, retries=3):
    """
    Connect to database with sensible defaults.
    """
    # Implementation here
    pass

# Call with only required argument
connect_to_database("localhost")

# Call with some custom settings
connect_to_database("db.example.com", timeout=60)
```

## 6. Debugging Functions

When a function returns an unexpected result, use these simple techniques to trace its execution flow and internal state:

1. **Check return values**: Make sure you're returning what you think you are

2. **Test with simple inputs**: Isolate the problem by calling the function with the most basic possible arguments.

3. **Use `print` statements**: Temporarily add print statements inside the function to log input values, intermediate results, and conditional branches that were taken.

```python
def debug_example(x, y):
    print(f"Inputs: x={x}, y={y}")  # Debug print: See what values the function received

    result = x * y
    print(f"Intermediate result: {result}")  # Debug print: Check the first calculation

    final = result + 10
    print(f"Final result: {final}")  # Debug print: Check the last calculation

    return final
```

:::summary

- **Gatekeeping:** Use functions to validate data (like emails or ages) before your program processes it.
- **Flexibility:** Default arguments (like `tax_rate=0.08`) allow your functions to handle common cases automatically while remaining customizable.
- **Multiple Returns:** You can return more than one value by separating them with commas (e.g., `return avg, grade`).
- **Encapsulation:** Keep functions focused on _one task_. If a function name needs the word "and," it should probably be two separate functions.
- **Debugging:** Use `print()` statements inside your function to track how data changes at each step before the final return.

:::

Now you're ready to practice building practical functions! The exercises will challenge you to create useful functions for various real-world scenarios.
