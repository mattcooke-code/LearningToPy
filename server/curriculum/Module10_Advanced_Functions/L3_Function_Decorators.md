# 🎀 Function Decorators

Decorators are a powerful Python feature that allows you to **modify** or **enhance functions** without permanently changing their source code. They are essentially functions that take another function as an argument, add some functionality, and return the newly enhanced function. This is a primary example of metaprogramming in Python—code that operates on other code.

## The Core Concept: Function Wrapping

At its heart, a decorator is a standard Python function that performs three key actions:

1. It accepts a function object as an argument (the function to be decorated).

2. It defines an **inner nested function** (the wrapper) that contains the added logic.

3. It returns the wrapper function.

## 1. Basic Decorator Syntax and Mechanism

### The `@` Symbol Syntax

The `@decorator` syntax is Python's elegant "syntactic sugar" for calling a function and reassigning the result.

```python

@decorator
def my_function():
pass
```

This is **exactly equivalent** to the verbose but clearer function assignment:

```python

def my_function():
pass

# my_function is reassigned to the result of calling 'decorator' with my_function as input.

my_function = decorator(my_function)
```

### Simple Decorator Example: Understanding the Flow

This example illustrates the decorator's structure: `simple_decorator` takes `say_hello`, defines the `wrapper` function with the _new logic_, and returns `wrapper`. When `say_hello()` is called later, it's actually calling the returned `wrapper`.

```python

def simple_decorator(func):
def wrapper():
print("Something is happening before the function is called.") # Added logic 1
func() # Executes the original function
print("Something is happening after the function is called.") # Added logic 2
return wrapper # Returns the function with the added logic

@simple_decorator
def say_hello():
print("Hello!")

say_hello()

# Output:

# Something is happening before the function is called.

# Hello!

# Something is happening after the function is called.
```

## 2. Decorators with Arguments

The simple wrapper above only works for functions that take no arguments. To create a decorator that can wrap _any_ function (regardless of its arguments), the inner wrapper must accept positional (`*args`) and keyword (`**kwargs`) arguments.

### Preserving Function Metadata with `@wraps`

When you return the `wrapper` function, the original function's metadata (`__name__`, `__doc__`, etc.) is lost, making debugging harder. The `@wraps` decorator from the `functools` module fixes this by copying the original function's metadata to the wrapper function.

```python

from functools import wraps

def my_decorator(func): # This ensures 'add' retains its original name and documentation.
@wraps(func)
def wrapper(*args, \*\*kwargs):
print(f"Calling {func.**name**}") # Pass all arguments through to the original function
result = func(*args, \*\*kwargs)
print(f"{func.**name**} returned {result}")
return result
return wrapper

@my_decorator
def add(a, b):
"""Add two numbers together."""
return a + b

print(add(2, 3))

# Calling add

# add returned 5

# 5

print(add.**name**) # 'add' (not 'wrapper')
print(add.**doc**) # 'Add two numbers together.'
```

## 3. Decorators with Parameters (The Triple-Nested Structure)

To allow a decorator itself to accept arguments (like `@repeat(num_times=3)`), you need an extra layer of nesting.

The structure is a function that returns a decorator, which in turn returns a wrapper function.

1. **Outer Function** (`repeat(num_times)`): Takes the decorator's parameters (e.g., `num_times`).

2. **Middle Function** (`decorator_repeat(func)`): Takes the function to be decorated (`func`). This is the _actual_ decorator.

3. **Inner Function** (`wrapper_repeat(*args, **kwargs)`): Takes the decorated function's arguments and contains the enhanced logic.

```python

def repeat(num*times):
"""Outer layer: Takes the parameter (num_times) and returns the decorator."""
def decorator_repeat(func):
"""Middle layer: Takes the function to be decorated (greet)."""
@wraps(func)
def wrapper_repeat(\*args, \*\*kwargs):
"""Inner layer: Takes the decorated function's arguments and runs the logic."""
for * in range(num_times):
result = func(\*args, \*\*kwargs)
return result
return wrapper_repeat
return decorator_repeat

@repeat(num_times=3) # Calls repeat(3), which returns decorator_repeat.
def greet(name): # decorator_repeat then wraps greet(name).
print(f"Hello {name}")

greet("Alice")

# Hello Alice

# Hello Alice

# Hello Alice
```

## 4. Practical Decorator Examples

Practical applications of decorators include tasks that are necessary for many functions across a codebase but are external to the function's core logic.

### Timing Decorator

```python

import time
from functools import wraps

def timer(func):
@wraps(func)
def wrapper(*args, \*\*kwargs):
start_time = time.perf_counter()
result = func(*args, \*\*kwargs)
end_time = time.perf_counter()
print(f"{func.**name**} took {end_time - start_time:.4f} seconds")
return result
return wrapper

@timer
def slow_function():
time.sleep(1)
return "Done"

print(slow_function())

# slow_function took 1.0012 seconds

# Done
```

### Debugging Decorator

```python

def debug(func):
@wraps(func)
def wrapper(*args, \*\*kwargs):
args_repr = [repr(a) for a in args]
kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]
signature = ", ".join(args_repr + kwargs_repr)
print(f"Calling {func.**name**}({signature})")
result = func(*args, \*\*kwargs)
print(f"{func.**name**}() returned {result!r}")
return result
return wrapper

@debug
def make_greeting(name, age=None):
if age is None:
return f"Howdy {name}!"
else:
return f"Whoa {name}! {age} already, you are growing up!"

make_greeting("Alice", age=25)

# Calling make_greeting('Alice', age=25)

# make_greeting() returned 'Whoa Alice! 25 already, you are growing up!'
```

### Cache Decorator (Memoization)

```python

from functools import wraps

def cache(func):
"""Cache decorator that stores function results.""" # This dictionary is local to the outer 'cache' call but is retained in the wrapper's scope (a closure)
stored_results = {}

    @wraps(func)
    def wrapper(*args, **kwargs):
        # Create a key from arguments
        key = str(args) + str(sorted(kwargs.items()))

        if key not in stored_results:
            stored_results[key] = func(*args, **kwargs)
            print(f"Calculating result for {func.__name__}{args}")
        else:
            print(f"Using cached result for {func.__name__}{args}")

        return stored_results[key]
    return wrapper

@cache
def fibonacci(n):
if n < 2:
return n
return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(5))

# Calculating result for fibonacci(1)

# Calculating result for fibonacci(0)

# Calculating result for fibonacci(2)

# Calculating result for fibonacci(3)

# Calculating result for fibonacci(4)

# Calculating result for fibonacci(5)

# 5
```

### Retry Decorator

```python

import time
from functools import wraps

def retry(max_attempts=3, delay=1):
def decorator_retry(func):
@wraps(func)
def wrapper_retry(*args, \*\*kwargs):
attempts = 0
while attempts < max_attempts:
try:
return func(*args, \*\*kwargs)
except Exception as e:
attempts += 1
if attempts == max_attempts:
raise e
print(f"Attempt {attempts} failed: {e}. Retrying in {delay} second(s)...")
time.sleep(delay)
return None
return wrapper_retry
return decorator_retry

@retry(max_attempts=3, delay=2)
def unreliable_operation():
import random
if random.random() < 0.7: # 70% chance of failure
raise ValueError("Temporary failure")
return "Success!"

print(unreliable_operation())
```

## 5. Class-Based Decorators

Decorators can also be implemented using Python classes. This is useful when you need to maintain state across function calls (like counting calls or storing cache), as the class instance itself acts as the storage container.

### Class as Decorator

A class acts as a decorator if it defines the `__init__` method to take the function and the `__call__` method to execute the wrapper logic.

```python

class CountCalls:
def **init**(self, func):
self.func = func
self.num_calls = 0
wraps(func)(self) # Preserve metadata

    def __call__(self, *args, **kwargs):
        self.num_calls += 1
        print(f"Call {self.num_calls} of {self.func.__name__}")
        return self.func(*args, **kwargs)

@CountCalls # Equivalent to: say_hello = CountCalls(say_hello)
def say_hello():
print("Hello!")

say_hello() # Equivalent to: say_hello.**call**()
say_hello()

# Call 1 of say_hello

# Hello!

# Call 2 of say_hello

# Hello!
```

### Class with Parameters as Decorator

```python

class Timer: # Outer layer: takes decorator parameters (print_result)
def **init**(self, print_result=True):
self.print_result = print_result

    # Middle layer: takes the function to be decorated (func)
    def __call__(self, func):
        @wraps(func)
        # Inner layer: the actual wrapper logic
        def wrapper(*args, **kwargs):
            import time
            start = time.perf_counter()
            result = func(*args, **kwargs)
            end = time.perf_counter()

            print(f"{func.__name__} executed in {end - start:.4f}s")
            if self.print_result:
                print(f"Result: {result}")
            return result
        return wrapper

@Timer(print_result=True) # Calls Timer(True), which returns a Timer instance. That instance then calls **call**(calculate_sum) to get the wrapper.
def calculate_sum(n):
return sum(range(n))

calculate_sum(1000000)
```

## 6. Stacking Multiple Decorators

When multiple decorators are applied to a single function, they are executed from the **bottom up** (closest to the function definition first), wrapping outwards.

```python

def decorator1(func):
@wraps(func)
def wrapper(*args, \*\*kwargs):
print("Decorator 1 - Before")
result = func(*args, \*\*kwargs)
print("Decorator 1 - After")
return result
return wrapper

def decorator2(func):
@wraps(func)
def wrapper(*args, \*\*kwargs):
print("Decorator 2 - Before")
result = func(*args, \*\*kwargs)
print("Decorator 2 - After")
return result
return wrapper

# Execution Order:

# example = decorator1(decorator2(example))

# When example() is called, decorator1's wrapper runs first.

@decorator1
@decorator2
def example():
print("Original function")

example()

# Decorator 1 - Before <-- Runs first

# Decorator 2 - Before <-- Runs second

# Original function

# Decorator 2 - After <-- Runs third

# Decorator 1 - After <-- Runs last
```

## 7. Real-World Use Cases

Decorators are heavily used in frameworks like Flask and Django for tasks like URL routing (`@app.route('/')`), security, and view modification.

### Authentication Decorator

```python

def require_auth(role="user"):
def decorator(func):
@wraps(func)
def wrapper(\*args, \*\*kwargs): # In real application, this would check actual authentication
user_role = kwargs.get('user_role', 'guest')

            if user_role == 'admin' or (role == 'user' and user_role in ['user', 'admin']):
                return func(*args, **kwargs)
            else:
                raise PermissionError(f"Access denied. Required role: {role}")
        return wrapper
    return decorator

@require_auth(role="admin")
def delete_user(user_id, user_role=None):
return f"User {user_id} deleted"

# This would work

print(delete_user(123, user_role="admin"))

# This would raise PermissionError

# print(delete_user(123, user_role="user"))
```

### Rate Limiting Decorator

```python

import time
from functools import wraps

def rate_limit(max_calls, period):
"""Limit function calls to max_calls per period seconds."""
def decorator(func):
calls = []

        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            # Remove calls outside the current period
            calls[:] = [call_time for call_time in calls if now - call_time < period]

            if len(calls) >= max_calls:
                raise Exception(f"Rate limit exceeded. Maximum {max_calls} calls per {period} seconds.")

            calls.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(max_calls=3, period=10)
def api_call():
return "API response"

# First 3 calls will work, 4th will raise exception

for i in range(4):
try:
print(api_call())
except Exception as e:
print(f"Error: {e}")
```

## 8. Best Practices

1. Always use `@wraps` to preserve function metadata (name, docstring, etc.).

2. Keep decorators **simple and focused** on one concern (e.g., one for timing, one for logging).

3. Document decorator behavior clearly.

4. Consider performance when using complex decorators.

5. Test decorated functions thoroughly.

### Good vs Bad Practice

```python

# ❌ Bad - no metadata preservation

def bad_decorator(func):
def wrapper(*args, \*\*kwargs):
return func(*args, \*\*kwargs)
return wrapper

# ✅ Good - preserves metadata

from functools import wraps
def good_decorator(func):
@wraps(func)
def wrapper(*args, \*\*kwargs):
return func(*args, \*\*kwargs)
return wrapper
```

Decorators are incredibly powerful for cross-cutting concerns like logging, timing, authentication, and caching. Use them to keep your code **DRY** (Don't Repeat Yourself) and focused on business logic.
