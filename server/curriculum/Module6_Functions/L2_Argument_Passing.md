# 🏷️ Argument Passing: Positional and Keyword

When you call a function, Python offers several flexible ways to match the arguments you provide with the parameters the function expects. The two most common are **positional arguments** and **keyword arguments**.

## 1. Positional Arguments

Positional arguments are the simplest and most common method. The arguments are matched to the parameters based on their **position** (order) in the function call.

```python
def configure_user(username, email):
    print(f"User: {username}, Email: {email}")

# The first argument ("Alex") goes to the first parameter (username).
# The second argument ("a@mail.com") goes to the second parameter (email).
configure_user("Alex", "a@mail.com")

# Output:
# User: Alex, Email: a@mail.com
```

Problem: If you swap the positions, the logic breaks, even though the data types are correct: `configure_user("a@mail.com", "Alex")` would incorrectly set the username to the email.

## 2. Keyword Arguments

Keyword arguments allow you to explicitly name which parameter each argument value should be assigned to. This removes the dependency on position.

### Benefits of Keyword Arguments:

     1. Clarity: Code is easier to read and understand.

     2. Order Independence: You can pass the arguments in any order.

```python
def set_settings(theme, font_size):
    print(f"Theme: {theme}, Size: {font_size}")

# Arguments are passed using the parameter name (keyword)
set_settings(font_size=12, theme="dark")

# Output:
# Theme: dark, Size: 12
```

## 3. Mixing Positional and Keyword Arguments

You can mix both types in a single function call, but you must follow one strict rule:

Rule: Positional arguments MUST come before keyword arguments.

```python
def create_product(name, price, stock=1):
    print(f"Product: {name}, Price: {price}, Stock: {stock}")

# Correct: Positional (name) first, then Keyword (stock)
create_product("Widget", 10.99, stock=50)
# Output: Product: Widget, Price: 10.99, Stock: 50

# Incorrect (would raise a SyntaxError):
# create_product(stock=50, "Gadget", 10.99)
```

## 4. Default Arguments

You can assign a default value to a parameter in the function definition. If the caller does not provide an argument for that parameter, the default value is used automatically.

```python
def log_message(message, level="INFO"): # "INFO" is the default
    print(f"[{level}] {message}")

log_message("System started.") # Uses default level="INFO"
log_message("Access denied.", level="ERROR") # Overrides default
```
