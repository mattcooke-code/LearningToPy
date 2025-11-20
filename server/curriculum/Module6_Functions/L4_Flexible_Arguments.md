# 💫 Flexible Arguments: `*args` and `**kwargs`

Sometimes you need a function to accept an **unknown, variable number of arguments**. Python provides two special prefix operators, `*args` and `**kwargs`, to handle this flexibility.

## 1. Positional Arguments (`*args`)

The `*args` syntax allows a function to accept any number of **positional arguments**.

### How it Works

1.  The `*` operator groups all extra positional arguments into a single **tuple**.
2.  By convention, the parameter is named `args`, but you could use any valid variable name (e.g., `*elements`).

```python
def calculate_sum(*numbers):
    """Calculates the sum of any number of numbers passed."""
    total = 0
    # 'numbers' is a tuple, so we can iterate over it
    for num in numbers:
        total += num
    return total

print(calculate_sum(10, 20))        # Output: 30
print(calculate_sum(5, 5, 5, 5, 5)) # Output: 25
print(calculate_sum())              # Output: 0
```

## 2. Keyword Arguments (\*\*kwargs)

The `**kwargs` syntax allows a function to accept any number of keyword arguments.

How it Works
The `**` operator groups all extra keyword arguments into a single dictionary.

By convention, the parameter is named `kwargs`, but you could use any valid variable name (e.g., `**data`).

```python
def print_profile(**user_data):
    """Prints a user profile from arbitrary keyword data."""
    # 'user_data' is a dictionary
    print("--- Profile Details ---")
    for key, value in user_data.items():
        print(f"{key.capitalize()}: {value}")

print_profile(username="coder_x", level=99, verified=True)

# Output:
# --- Profile Details ---
# Username: coder_x
# Level: 99
# Verified: True
```

## 3. Order of Arguments

If you use all three types of arguments in a single function definition, they must appear in this strict order:

1. Standard Positional Arguments (e.g., `def func(a, b, ...`)

2. `*args` (variable positional arguments)

3. `**kwargs` (variable keyword arguments)

Correct Order Example

```python
def combined_handler(required_id, *options, **config):
    print(f"Required ID: {required_id}")
    print(f"Options (Tuple): {options}")
    print(f"Config (Dict): {config}")

combined_handler(
    101,                           # required_id (Standard Positional)
    "log", "debug",                # *options (Positional arguments collected)
    server="us", theme="dark"      # **config (Keyword arguments collected)
)
```
