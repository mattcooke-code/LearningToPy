# ✍️ Defining and Calling Functions

A **Function** is a block of organized, reusable code that is used to perform a single, related action. Functions allow you to break your program into smaller, manageable chunks, making code easier to read, test, and debug.

## 1. Defining a Function: The `def` Keyword

In Python, you define a function using the **`def`** keyword, followed by the function name, parentheses `()`, and a colon `:`.

### Syntax

```python
def function_name(parameter1, parameter2):
    """
    Optional: This is a docstring, used to explain what the function does.
    """
    # Code block that runs when the function is called
    print("Function is running!")
    return result # Optional: returns a value
```

### Example: A Simple Greeting

```python
def greet():
    """Prints a simple welcome message."""
    print("Welcome to Python!")

# The code inside the function does not run until it is called.
```

## 2. Calling a Function

To execute the code inside a function, you must call it by using the function's name followed by parentheses.

```python
greet() # Calls the function defined above

# Output:
# Welcome to Python!
```

## 3. Parameters and Arguments

Functions become truly useful when they can accept input.

• **Parameter**: The name used in the function definition to represent the data it expects to receive (e.g., name in the definition below).

• **Argument**: The actual value passed to the function when it is called (e.g., "Alice" in the call below).

```python
# 'name' is the parameter
def personalized_greeting(name):
    print(f"Hello, {name}! How are you?")

# "Alice" is the argument
personalized_greeting("Alice")

# "Bob" is a different argument
personalized_greeting("Bob")

# Output:
# Hello, Alice! How are you?
# Hello, Bob! How are you?
```

:::note
Functions can accept multiple parameters, separated by commas.
:::

## 4. The `return` Statement

Most functions are designed to calculate a result and send it back to the part of the program that called it. This is done using the `return` statement.

If a function doesn't explicitly use `return`, it implicitly returns the special Python value `None`.

```python
def calculate_area(length, width):
    area = length * width
    return area # Sends the calculated value back

# The result is assigned to a variable
room_area = calculate_area(5, 10)
print(f"The area is: {room_area}") # Output: The area is: 50
```

:::summary

- Functions are defined using the `def` keyword followed by `name()` and a colon `:`
- Execute a function's code by _calling_ it using its name and parentheses (e.g., `my_function()`).
- Use **parameters** as placeholders in the definition and **arguments** to pass real data during the call.
- The `return` statement sends a result back to the caller; otherwise, the function returns `None` by default.

:::
