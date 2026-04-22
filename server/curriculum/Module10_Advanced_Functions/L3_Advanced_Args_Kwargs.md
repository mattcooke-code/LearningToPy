# *️⃣ Advanced *args and \*\*kwargs

In the previous lesson, we covered the core mechanics of `*args` and `**kwargs` — how packing and unpacking work, the rules around argument ordering, and how to use the `*` and `**` operators at the call site. Now we're going to put those tools to work. This lesson moves from _understanding_ the syntax to _applying_ it: validating inputs, building flexible configuration systems, and seeing how `*args` and `**kwargs` power some of the most common patterns in real Python codebases.

## 1. Advanced \*args Patterns

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
# print(sum_numbers(1, '2', 3))     # TypeError: All arguments must be numbers
```

### Argument Validation Patterns

Using `*args` with keyword-only arguments allows you to create highly controlled yet flexible interfaces.

```python
def validate_and_process(multiplier, *values, min_count=1, max_count=5):
    """Validate variable arguments before processing."""
    if len(values) < min_count:
        raise ValueError(f"At least {min_count} additional arguments required")
    if len(values) > max_count:
        raise ValueError(f"At most {max_count} additional arguments allowed")

    # Process arguments
    return [multiplier * val for val in values]

print(validate_and_process(2, 1, 2, 3, min_count=2))  # [2, 4, 6]
```

:::note

This pattern uses `*values` to create a "flexible gatekeeper."

- **The Catch-All:** `*values` collects any number of items you want to process.
- **The Rules:** We use `len(values)` to check the "weight" of the suitcase against our `min` and `max` limits.
- **The Transformation:** If the limits are met, we use a _List Comprehension_ to apply the `required` multiplier (2) to every item inside the `values` tuple (1, 2, 3): `validate_and_process(2, 1, 2, 3,...)`.
- **Notice:** The function defines `min_count=1` as a sensible default, but we override it to `min_count=2` at the call site — demonstrating that keyword-only arguments after `*args` can always be customised by the caller.

:::

## 2. Advanced `**kwargs` Patterns

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

print(filtered_configuration(color='red', size='large', price=100, brand='Zorg Industries'))
# {'color': 'red', 'size': 'large'} (price and brand are ignored)
```

## 3. Real-World Use Cases

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
This may look unfamiliar if you haven't encountered decorators before — and that's completely fine. The key thing to notice here is _why_ `*args` and `**kwargs` are used: the wrapper function has no idea what signature `func` will have, so accepting everything is the only way to guarantee compatibility. We'll build decorators from scratch in the next lesson, and this pattern will make a lot more sense in context.
:::

## 4. Best Practices and Pitfalls

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

| Guideline       | Use `*args`/`**kwargs`                                                                                                             | Avoid `*args`/`**kwargs`                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Flexibility** | You're building something generic — a decorator, a wrapper, a logger — and you don't know in advance what arguments it'll receive. | Your function always does the same job with the same inputs (like `calculate_area(width, height)`). Explicit is better. |
| **Clarity**     | You want optional configuration with sensible defaults (e.g., `api.connect(**options)`).                                           | The argument list is getting complex or long — at that point, a dedicated config object or dataclass is cleaner.        |
| **Readability** | You're passing arguments straight through from one function to another without touching them.                                      | You're in a performance-critical loop — creating tuples and dicts on every call adds small but real overhead.           |

These tools make your functions incredibly flexible and are essential for building robust, reusable code!

:::summary

- **Type checking** with `*args`: use `all()` + `isinstance()` to validate inputs before processing
- **Argument validation**: keyword-only arguments after `*args` (like `min_args`, `max_args`) act as configurable rules for the caller
- **Dynamic defaults** with `**kwargs`: start from a `defaults` dict and use `.update(kwargs)` to let callers override selectively
- **Keyword filtering**: use a set of `allowed_keys` and a dict comprehension to accept everything but only act on what you expect
- **Always document** what you expect inside `*args` and `**kwargs` — Python won't enforce it, so your docstring is the contract
- **Use `.get()` for safe access**: `kwargs.get('key', default)` avoids `KeyError` when an optional kwarg isn't passed
- **Decorators and wrappers** rely on `(*args, **kwargs)` to stay compatible with any function signature — more on this next lesson
- **When to avoid**: if your function has a fixed, well-known signature, explicit parameters are always clearer

:::
