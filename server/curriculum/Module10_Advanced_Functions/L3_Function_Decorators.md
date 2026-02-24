# 🎀 Function Decorators

**_Decorators_** are like "Gift Wrap" for your functions. They allow you to **modify** or **enhance** a function without changing its internal code. Think of it as putting a protective case on a smartphone: the phone still works the same way inside, but the case adds new features like a kickstand or a card holder.

## 1. The Core Concept: Function Wrapping

At its heart, a decorator is just a function that takes another function, adds some "bonus" logic around it, and hands it back to you.

### The `@` Symbol Syntax

The `@` symbol is just a shortcut.

```python
@my_decorator
def say_hello():
    print("Hello!")
```

:::note
This is exactly the same as saying: `say_hello = my_decorator(say_hello)`
:::

It’s like taking a standard phone and "reassigning" it to be a "Phone + Case."

## 2. A Simple Decorator Example: The "Phone Case"

In this example, `simple_decorator` acts as the case. It defines a `wrapper` (the physical case) that does something before and after the phone (the function) is used.

```python
def simple_decorator(func):
    def wrapper():
        print("Checking battery... (Before)") # Added logic 1
        func()                                # The actual function runs
        print("Locking screen... (After)")    # Added logic 2
    return wrapper # We return the "Phone + Case" combo

@simple_decorator
def make_call():
    print("Connecting call...")

make_call()
```

## 3. Universal Decorators (The Suitcase)

The example above only works for functions with **no arguments**. To make a decorator that fits _any_ function, we bring back the Suitcase (`*args, **kwargs`) from the last lesson.

### Using @wraps

When we wrap a function, it can "forget" its own name (it starts thinking its name is `wrapper`). We use `@wraps` from the `functools` module to keep the original name and documentation intact.

```python
from functools import wraps

def smart_decorator(func):
    @wraps(func) # This keeps the original "label" on the function
    def wrapper(*args, **kwargs):
        print(f"--- Starting {func.__name__} ---")
        result = func(*args, **kwargs) # Unpacking the suitcase
        print(f"--- Finished {func.__name__} ---")
        return result
    return wrapper

@smart_decorator
def add_numbers(a, b):
    """Adds two numbers."""
    return a + b

print(add_numbers(5, 10))

```

## 4. Decorators with Parameters: The "Gift Box"

Sometimes you want the decorator itself to take options, like `@repeat(3)`. This requires a **Triple-Nested Structure**. Think of it like a set of _Russian Matryoshka Dolls_:

1. **The Outer Doll (The Config):** Handles the settings (like how many times to repeat).
2. **The Middle Doll (The Decorator):** Grabs the function you want to wrap.
3. **The Inner Doll (The Wrapper):** The actual logic that runs the function.

```python
def repeat(num_times):
    def decorator_repeat(func): # The actual decorator
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(num_times):
                value = func(*args, **kwargs)
            return value
        return wrapper
    return decorator_repeat

@repeat(num_times=3)
def greet(name):
    print(f"Hello, {name}!")

greet("Beetlejuice") # Prints 3 times
```

## 5. Practical Example: The Execution Timer

This is one of the most common real-world uses for decorators. It "wraps" a function to see how long it takes to run.

```python
import time

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"⏱️ {func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer
def heavy_lifting():
    time.sleep(1.5) # Pretend this is a big calculation
    return "Work complete!"

heavy_lifting()
```

## 6. Stacking Decorators

You can wear a shirt, then a sweater, then a jacket. Functions can do the same! They wrap from the **bottom up**.

```python
@jacket
@sweater
@shirt
def person():
    pass
```

:::note

- The **shirt** wraps the person first.
- The **sweater** wraps the "person in a shirt."
- The **jacket** wraps the whole bundle.
  :::

  :::tip

- Always use `@wraps` to preserve function metadata (name, docstring, etc.).
- Keep decorators simple and focused on one concern (e.g., one for timing, one for logging).
- Document decorator behavior clearly.
  :::

:::summary

- **Decorators** modify or enhance functions without changing their internal code (like adding a case to a phone)
- The `@decorator` syntax is shorthand for: `function = decorator(function)`
- **Structure**: A decorator is a function that takes a function, defines a `wrapper` inside, adds logic before/after, and returns the wrapper
- For **any function**, use `*args, **kwargs` in the wrapper to accept all arguments
- Use `@wraps` from `functools` to preserve the original function's name and docstring
- **Decorators with parameters** need triple nesting: outer for config → middle for function → inner wrapper for logic
- **Stacking decorators** wraps from the bottom up: bottom decorator runs first, top runs last
- **Real-world uses**: logging, timing, access control, caching, rate limiting
- **Common pattern**: `timer` decorator measures execution time without cluttering function logic
- **Key benefit**: Keep core logic clean while adding reusable cross-cutting concerns

:::
