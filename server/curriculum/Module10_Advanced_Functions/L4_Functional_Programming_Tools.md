# 🔧 Functional Programming Tools

Python provides several built-in functions that support functional programming paradigms. These tools allow you to work with data in a declarative way, focusing on _what_ to compute rather than _how_ to compute it.

## 1. The `map()` Function

`map()` applies a function to every item in an iterable and returns a map object (iterator).

### Basic Syntax

```python
map(function, iterable)
```

### Examples

```python
# Square all numbers
numbers = [1, 2, 3, 4, 5]
squared = map(lambda x: x ** 2, numbers)
print(list(squared))  # [1, 4, 9, 16, 25]

# Convert strings to uppercase
names = ['alice', 'bob', 'charlie']
upper_names = map(str.upper, names)
print(list(upper_names))  # ['ALICE', 'BOB', 'CHARLIE']

# Multiple iterables
a = [1, 2, 3]
b = [10, 20, 30]
sums = map(lambda x, y: x + y, a, b)
print(list(sums))  # [11, 22, 33]
```

## 2. The `filter()` Function

`filter()` constructs an iterator from elements of an iterable for which a function returns true.

### Basic Syntax

```python
filter(function, iterable)
```

### Examples

```python
# Filter even numbers
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = filter(lambda x: x % 2 == 0, numbers)
print(list(evens))  # [2, 4, 6, 8, 10]

# Filter non-empty strings
words = ['hello', '', 'world', '', 'python']
non_empty = filter(None, words)  # None removes falsy values
print(list(non_empty))  # ['hello', 'world', 'python']

# Filter by custom condition
def is_long_word(word):
    return len(word) > 5

words = ['apple', 'banana', 'cherry', 'date', 'elderberry']
long_words = filter(is_long_word, words)
print(list(long_words))  # ['banana', 'cherry', 'elderberry']
```

## 3. The `reduce()` Function

`reduce()` applies a function cumulatively to the items of an iterable, reducing it to a single value. Requires import from `functools`.

### Basic Syntax

```python
from functools import reduce
reduce(function, iterable[, initializer])
```

### Examples

```python
from functools import reduce

# Sum all numbers
numbers = [1, 2, 3, 4, 5]
total = reduce(lambda x, y: x + y, numbers)
print(total)  # 15

# Find maximum value
max_value = reduce(lambda x, y: x if x > y else y, numbers)
print(max_value)  # 5

# Concatenate strings
words = ['hello', ' ', 'world', '!']
sentence = reduce(lambda x, y: x + y, words)
print(sentence)  # 'hello world!'

# With initial value
product = reduce(lambda x, y: x * y, numbers, 1)
print(product)  # 120
```

## 4. Combining Functional Tools

### Pipeline Processing

```python
from functools import reduce

data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Process: filter even numbers → square them → sum results
result = reduce(
    lambda x, y: x + y,
    map(
        lambda x: x ** 2,
        filter(lambda x: x % 2 == 0, data)
    )
)
print(result)  # 220 (4 + 16 + 36 + 64 + 100)
```

### Data Transformation Pipeline

```python
# Process user data: filter active users → extract names → convert to uppercase
users = [
    {'name': 'alice', 'active': True},
    {'name': 'bob', 'active': False},
    {'name': 'charlie', 'active': True},
    {'name': 'diana', 'active': True}
]

active_names = list(
    map(
        lambda user: user['name'].upper(),
        filter(lambda user: user['active'], users)
    )
)
print(active_names)  # ['ALICE', 'CHARLIE', 'DIANA']
```

## 5. `functools` Module Utilities

`partial()` - Partial Function Application

```python
from functools import partial

# Create a new function with pre-filled arguments
def multiply(x, y):
    return x * y

double = partial(multiply, 2)
triple = partial(multiply, 3)

print(double(5))   # 10
print(triple(5))   # 15

# Useful for configuring functions
def greet(greeting, name):
    return f"{greeting}, {name}!"

say_hello = partial(greet, "Hello")
say_hi = partial(greet, "Hi")

print(say_hello("Alice"))  # Hello, Alice!
print(say_hi("Bob"))       # Hi, Bob!
```

`lru_cache()` - Memoization Decorator

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Much faster due to caching
print(fibonacci(50))  # 12586269025
```

## 6. Generator Expressions vs Map/Filter

### Performance Comparison

```python
import time

data = list(range(1000000))

# Generator expression (memory efficient)
start = time.time()
result1 = sum(x * 2 for x in data if x % 2 == 0)
time1 = time.time() - start

# Map/filter combination
start = time.time()
result2 = sum(map(lambda x: x * 2, filter(lambda x: x % 2 == 0, data)))
time2 = time.time() - start

print(f"Generator: {time1:.4f}s, Map/Filter: {time2:.4f}s")
# Both are efficient, but generators are often more readable
```

## 7. Real-World Applications

### Data Processing Pipeline

```python
from functools import reduce

# Process sales data: filter valid sales → calculate totals → aggregate
sales_data = [
    {'amount': 100, 'valid': True},
    {'amount': 200, 'valid': False},
    {'amount': 150, 'valid': True},
    {'amount': 300, 'valid': True},
    {'amount': 50, 'valid': False}
]

total_sales = reduce(
    lambda total, sale: total + sale['amount'],
    filter(lambda sale: sale['valid'], sales_data),
    0  # initial value
)
print(f"Total valid sales: ${total_sales}")  # Total valid sales: $550
```

### Text Processing

```python
text = "Functional programming is a programming paradigm that treats computation as the evaluation of mathematical functions"

# Process: split → filter short words → count characters
words = text.split()
long_words = filter(lambda word: len(word) > 5, words)
character_count = reduce(lambda count, word: count + len(word), long_words, 0)

print(f"Character count in long words: {character_count}")
```

### Configuration Processing

```python
config_lines = [
    "HOST=localhost",
    "PORT=8080",
    "DEBUG=True",
    "# This is a comment",
    "TIMEOUT=30"
]

# Process: filter non-comments → split key-value pairs → create dict
config = dict(
    map(
        lambda line: tuple(line.split('=')),
        filter(lambda line: not line.startswith('#'), config_lines)
    )
)
print(config)
# {'HOST': 'localhost', 'PORT': '8080', 'DEBUG': 'True', 'TIMEOUT': '30'}
```

## 8. Best Practices

### When to Use Functional Tools:

1. `map()` - When you need to transform every element the same way

2. `filter()` - When you need to select elements based on a condition

3. `reduce()` - When you need to aggregate elements into a single value

4. Generator expressions - Often more readable than `map()`/`filter()`

### Readability Comparison:

```python
# Functional style
result = reduce(lambda x, y: x + y,
               map(lambda x: x ** 2,
                   filter(lambda x: x % 2 == 0, numbers)))

# Generator expression (often clearer)
result = sum(x ** 2 for x in numbers if x % 2 == 0)
```

### Performance Tips:

• Generator expressions are memory efficient for large datasets

• `lru_cache` can dramatically speed up recursive functions

• `partial` is great for creating specialized functions

• Lazy evaluation (map/filter objects) saves memory

## 9. Common Pitfalls

### Map/Filter Return Iterators

```python
numbers = [1, 2, 3, 4]

# ❌ This doesn't work as expected
squared = map(lambda x: x ** 2, numbers)
print(squared)  # <map object at 0x...>

# ✅ Convert to list when needed
squared = list(map(lambda x: x ** 2, numbers))
print(squared)  # [1, 4, 9, 16]
```

### Reduce Requires Import

```python
# ❌ This will fail
# total = reduce(lambda x, y: x + y, [1, 2, 3])

# ✅ Import first
from functools import reduce
total = reduce(lambda x, y: x + y, [1, 2, 3])
```

Functional programming tools make your code more declarative and often more concise. Use them when they improve readability and maintainability!
