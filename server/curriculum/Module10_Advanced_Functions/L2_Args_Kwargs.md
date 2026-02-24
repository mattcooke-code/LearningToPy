# *️⃣ *args and \*\*kwargs: Flexible Function Arguments

`*args` and `**kwargs` are two of the most powerful features in Python, allowing functions to accept a **variable number of arguments**. They provide flexibility essential for writing generic code, wrapper functions, and decorators.

The key to understanding them lies in the **single asterisk** (`*`) and **double asterisk** (`**`) operators, which serve two distinct but related purposes: **Packing** and **Unpacking**.

:::note
We can think of these principles as operating in the exact same way we would _pack_ or _unpack_ a suitcase:

1. **Packing (The Function Definition):** You have many individual items (arguments) and you want to store them in one suitcase (a Tuple or Dictionary) so they are easy to carry into the function.

2. **Unpacking (The Function Call):** You have a pre-packed suitcase, and you want to "dump it out" so each item lands exactly where it belongs in the function’s parameters.
   :::

| Feature                    | `*args`              | `**kwargs`            |
| -------------------------- | -------------------- | --------------------- |
| **Collects**               | Positional arguments | Keyword arguments     |
| **Packs into**             | Tuple                | Dictionary            |
| **Access inside function** | `args[0]`, `args[1]` | `kwargs['key']`       |
| **Common use**             | Variable inputs      | Configuration options |

## 1. Understanding the Packing Mechanism (Definition)

When you define a function with `*args` or `**kwargs`, the `*` and `**` operators instruct Python to **pack** any extra arguments into a container for internal use.

|                | `*args` (Variable Positional Arguments)                                                                  | `**kwargs` (Variable Keyword Arguments)                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mechanism**  | Collects all extra **_positional arguments_** passed to the function that don't match a fixed parameter. | Collects all extra **_keyword arguments_** passed to the function that don't match a fixed parameter.                                               |
| **Result**     | The collected arguments are packaged into a **tuple**.                                                   | The collected arguments are packaged into a **dictionary**, where the keys are the argument names (strings) and the values are the argument values. |
| **Convention** | The name `args` is standard, but you can use any name after the `*` (e.g., `*elements`).                 | The name `kwargs` is standard, but you can use any name after the `**` (e.g., `**options`).                                                         |

## 2. Basic Syntax and Examples

### Simple `*args` Example (Packing Positional Arguments)

The function below has no fixed parameters, so all positional inputs are packed into the `numbers` tuple.

```python
def calculate_sum(*numbers):
    """Calculates the sum of any number of numbers passed."""
    # Inside the function, 'numbers' IS a tuple: (10, 20) or (5, 5, 5, 5, 5)
    total = 0
    for num in numbers:
        total += num
    return total

print(calculate_sum(10, 20))        # Output: 30
print(calculate_sum(5, 5, 5, 5, 5)) # Output: 25
print(calculate_sum())              # Output: 0
```

:::note
**Why a tuple?**

Tuples are immutable. This ensures that the arguments passed by the user aren't accidentally modified inside the function, preserving the integrity of the original input.

:::

### Simple `**kwargs` Example (Packing Keyword Arguments)

The function packs any keyword arguments into the `user_data` dictionary.

```python
def print_profile(**user_data):
    """Prints a user profile from arbitrary keyword data."""
    # Inside the function, 'user_data' IS a dictionary: {'username': 'coder_x', 'level': 99, ...}
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

:::note
**Why a dictionary?**

Dictionaries store data as key-value pairs, which is perfect for named arguments. The keys are the argument names (as strings), and the values are the argument values. This structure preserves the labels attached to each value, making it easy to access them by name inside the function.
:::

### Combined Usage

Python's interpreter processes arguments sequentially. It first assigns required arguments, then packs remaining positional arguments, and finally packs remaining keyword arguments.

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

## 3. The Strict Order of Arguments

:::warning
When using all argument types together, Python requires them to appear in a strict and mandatory order. This order reflects how the interpreter assigns incoming values:

1. Standard Positional Arguments (e.g., `a, b,`)

2. `*args` (variable positional arguments)

3. Standard Keyword-Only Arguments (Arguments placed after `*args` that **must** be called by name)

4. `**kwargs` (variable keyword arguments)
   :::

```python
# Correct order
def universal_function(a, b, *args, **kwargs):
    print(f"Required: {a}, {b}")
    print(f"Extra args: {args}")
    print(f"Extra kwargs: {kwargs}")

# Incorrect orders (syntax errors):
# def wrong1(*args, a, b): pass
# def wrong2(**kwargs, a, b): pass
# def wrong3(a, **kwargs, b): pass
```

Think of the function as an airport security scanner. There is a specific order to how things must pass through:

1. **Personal Items (Standard Positional):** These are the items you hold in your hand. They must go first because they are specifically assigned to you.
2. **The Carry-on (`args`):** This is your main suitcase. It holds a variable amount of "extra" stuff.
3. **Specialty Gear (Keyword-Only):** These are items that require a specific "tag" or label to be accepted.
4. **The Checked Bag (`kwargs`):** This is the final container for everything else that has a specific label (key) attached to it.

Why the order matters: If you put the big "Carry-on" `*args` first, it might "swallow" your personal items, and the scanner (Python) won't know which is which!

## 4. Unpacking Arguments (The Call Site)

Sometimes, you already have your items packed in a container (a List or a Dictionary). Instead of taking them out one by one manually, you can use the `*` and `**` operators to unpack the entire container directly into the function’s parameters.

### Unpacking with `*` (The Travel Kit)

Imagine you have a `travel_kit` list. The order of items in the list matches the order of the drawers in your hotel room.

```python
def organize_dresser(top_drawer, middle_drawer, bottom_drawer):
    print(f"Top: {top_drawer}")
    print(f"Middle: {middle_drawer}")
    print(f"Bottom: {bottom_drawer}")

# Your packed suitcase (List)
travel_kit = ["Sunglasses", "Socks", "T-shirts"]

# Unpacking the suitcase:
# It 'spills' the items into the drawers in the order they appear.
organize_dresser(*travel_kit)

# Output:
# Top: Sunglasses
# Middle: Socks
# Bottom: T-shirts
```

### Unpacking with `**` (The Labeled Pouches)

Now imagine your suitcase contains labeled pouches (a Dictionary). It doesn't matter what order you pull them out of the bag; because they have **_labels_**, Python knows exactly which drawer they belong in.

```python
def pack_backpack(pocket_a, pocket_b):
    print(f"Stored {pocket_a} in the front pocket.")
    print(f"Stored {pocket_b} in the side pocket.")

# Your labeled gear (Dictionary)
gear_bag = {
    "pocket_b": "Water Bottle",
    "pocket_a": "Passport"
}

# Unpacking the labeled bag:
# Even though 'pocket_b' is first in our dictionary,
# Python uses the "Label" (Key) to put it in the correct parameter.
pack_backpack(**gear_bag)

# Output:
# Stored Passport in the front pocket.
# Stored Water Bottle in the side pocket.
```

## 5. Advanced \*args Patterns

### Type Checking with `*args`

Since `*args` packs data into a tuple, you can use tuple methods and loops for validation.

```python
def sum_numbers(*args):
    """Sum numbers with type validation."""
    # The all() function checks if every element in the generator expression is True
    if not all(isinstance(arg, (int, float)) for arg in args):
        raise TypeError("All arguments must be numbers")
    return sum(args)

print(sum_numbers(1, 2, 3))         # 6
print(sum_numbers(1.5, 2.5, 3.5))   # 7.5
# print(sum_numbers(1, '2', 3))     # TypeError
```

### Argument Validation Patterns

```python
def validate_and_process(required, *args, min_args=0, max_args=5):
    """Validate variable arguments before processing."""
    if len(args) < min_args:
        raise ValueError(f"At least {min_args} additional arguments required")
    if len(args) > max_args:
        raise ValueError(f"At most {max_args} additional arguments allowed")

    # Process arguments
    return [required * arg for arg in args]

print(validate_and_process(2, 1, 2, 3, min_args=1))  # [2, 4, 6]
```

:::note

This pattern uses `*args` to create a "flexible gatekeeper."

- **The Catch-All:** `*args` collects any number of items you want to process.
- **The Rules:** We use `len(args)` to check the "weight" of the suitcase against our `min` and `max` limits.
- **The Transformation:** If the limits are met, we use a _List Comprehension_ to apply the `required` multiplier (2) to every item inside the `args` tuple (1, 2, 3).

:::

## 6. Advanced `**kwargs` Patterns

### Dynamic Default Values

`**kwargs` is ideal for handling configuration where many settings have defaults, but a user might override a few.

```python
def configure_settings(**kwargs):
    """Configure with dynamic defaults and validation."""
    defaults = {
        'host': 'localhost',
        'port': 8080,
        'debug': False,
        'timeout': 30
    }

    # Start with a copy of defaults
    config = defaults.copy()

    # Update defaults with provided kwargs (overriding them)
    config.update(kwargs)

    # Validation
    if not 1 <= config['port'] <= 65535:
        raise ValueError("Port must be between 1 and 65535")

    return config

print(configure_settings(port=9000, debug=True))
# {'host': 'localhost', 'port': 9000, 'debug': True, 'timeout': 30}
```

### Keyword Argument Filtering

When writing wrapper functions (like the one below), you often need to accept _all_ keyword arguments but only use a specific subset internally, passing the rest along.

```python
def filtered_configuration(**kwargs):
    """Accept only specific keyword arguments and filter others."""
    allowed_keys = {'color', 'size', 'weight', 'material'}

    # Filter kwargs to only allowed keys using a dictionary comprehension
    filtered = {k: v for k, v in kwargs.items() if k in allowed_keys}

    # Set defaults for missing required keys
    required_defaults = {'color': 'black', 'size': 'medium'}
    for key, default in required_defaults.items():
        if key not in filtered:
            filtered[key] = default

    return filtered

print(filtered_configuration(color='red', size='large', price=100, brand='Nike'))
# {'color': 'red', 'size': 'large'} (price and brand are ignored)
```

## 7. Real-World Use Cases

### API Wrapper (Passing Options Through)

A common use of `*args` and `**kwargs` is creating flexible API or library wrappers. The wrapper accepts arbitrary arguments, handles the ones it needs (like `headers` or `timeout`), and then passes the rest of the arguments through to the underlying function call.

```python
class APIWrapper:
    def __init__(self, base_url):
        self.base_url = base_url

    def request(self, method, endpoint, *args, **kwargs):
        """Make API requests with flexible parameters."""
        url = f"{self.base_url}/{endpoint}"

        # Extract special kwargs needed by the wrapper itself
        headers = kwargs.pop('headers', {})
        timeout = kwargs.pop('timeout', 30)

        print(f"--- API Call ---")
        print(f"{method} {url}")
        print(f"Headers: {headers}")
        print(f"Timeout: {timeout}")
        print(f"Other query params (passed through): {kwargs}")

        return {"status": "success", "data": kwargs}

api = APIWrapper('https://api.example.com')
response = api.request('GET', 'users',
                       page=1, limit=10, # These are packaged into kwargs
                       headers={'Authorization': 'Bearer token'},
                       timeout=60)
```

### Universal Wrapper Function (Decorators)

When creating a decorator, you must ensure the wrapper function can accept the exact same signature as the original function, no matter what it is. Using (`*args`, `**kwargs`) guarantees compatibility.

```python
def universal_logger(func):
    """Log function calls with all arguments."""
    # Wrapper must use *args, **kwargs to accept any input signature
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned: {result}")
        return result
    return wrapper

@universal_logger
def example_function(a, b, c=0):
    return a + b + c

print(example_function(1, 2, c=3))
# Calling example_function with args: (1, 2), kwargs: {'c': 3}
# example_function returned: 6
# 6
```

:::note
We will explore function decorators in detail in the next lesson.
:::

## 8. Best Practices and Pitfalls

### Document Variable Arguments

Always document the arguments you expect to receive inside `*args` and `**kwargs`. Since Python doesn't enforce their types or number, your documentation is the primary source of truth for other developers.

```python
def flexible_function(required, *args, **kwargs):
    """
    A flexible function that processes data.

    Args:
        required: The required primary parameter.
        *args: Additional positional arguments (expected to be integers).
        **kwargs: Additional keyword arguments used for configuration:
            reverse (bool): If True, reverse processing.
            limit (int): Maximum number of items to process.
    """
    reverse = kwargs.get('reverse', False)
    limit = kwargs.get('limit', None)
    # ... implementation
```

### When to Use vs. When to Avoid

| Guideline   | Use `*args` `**kwargs`                                                                                                                                         | Avoid `*args`/`**kwargs`                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Flexibility | "When building generic interfaces (decorators, wrappers, logging functions, GUI components) where the specific arguments of the wrapped function are unknown." | "When the function's purpose is simple and always requires the same arguments (e.g., `calculate_area(width, height)`)." |
| Clarity     | "To accept optional configuration parameters that have sensible defaults (e.g., `api.connect(**options)`)."                                                    | "When the arguments become complex or numerous, making it hard to follow the function call signature."                  |
| Readability | When passing arguments from one function directly to another without modifying them (pass-through).                                                            | In performance-critical inner loops due to the slight overhead of creating the tuple/dictionary objects.                |

These tools make your functions incredibly flexible and are essential for building robust, reusable code!

:::summary

- `*args` collects **extra positional arguments** into a **tuple**
- `**kwargs` collects **extra keyword arguments** into a **dictionary**
- **Packing** happens in function definition: `def func(*args, **kwargs)`
- **Unpacking** happens in function calls: `func(*list, **dict)`
- **Argument order is strict**: positional → `*args` → keyword-only → `**kwargs`
- Use `*args` for variable inputs, `**kwargs` for configuration options
- Common use cases: decorators, wrappers, API clients, logging
- **Best practices**: document expected arguments, use `.get()` for defaults, avoid overuse
- **Pitfalls**: forgetting asterisks, modifying tuples, order confusion
- **Alternatives**: For simple cases, explicit parameters with defaults are clearer

:::
