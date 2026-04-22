# 🔧 Functional Programming Tools

Python provides several built-in functions that support functional programming paradigms. These tools allow you to work with data in a declarative way, focusing on _what_ to compute rather than _how_ to compute it.

### Refresher

- `map(function, data)`: Transforms everything. If you have 10 items in, you get 10 items out.
- `filter(function, data)`: Selects some. If you have 10 items in, you might only get 3 out.

:::note
These tools are "lazy." They don't actually do the work until you ask for the result (like by using `list()` or a loop).
:::

## 1. The `map()` Function

`map()` applies a function to every item in an iterable and returns a map object (iterator).

### Basic Syntax

```python
map(function, iterable)
```

### Examples

```python
# Convert strings to uppercase
names = ['keisha', 'mutya', 'siobhan']
upper_names = map(str.upper, names)
print(list(upper_names))  # ['KEISHA', 'MUTYA', 'SIOBHAN']

```

## 2. The `filter()` Function

`filter()` constructs an iterator from elements of an iterable for which a function returns true.

### Basic Syntax

```python
filter(function, iterable)
```

### Examples

```python
# Filter by custom condition
def is_current_sugababe(name):
    return name in ['Keisha', 'Mutya', 'Siobhan']

names = ['Keisha', 'Heidi', 'Mutya', 'Amelle', 'Siobhan', 'Jade']
sugababes = filter(is_current_sugababe, names)
print(list(sugababes))  # ['Keisha', 'Mutya', 'Siobhan']
```

```python
# Filter by length of song title
track = ['Overload', 'Shape', 'Ugly', 'Stronger', 'Easy', 'Girls']

less_than_five = list(filter(lambda x: len(x) < 5, track))
print(less_than_five)  # ['Ugly', 'Easy']
```

## 3. The `reduce()` Function

Unlike the others, `reduce()` doesn't give you a new list; it squashes your list down into a single value. You must import it from `functools`.

### Basic Syntax

```python
from functools import reduce

numbers = [1, 2, 3, 4]

# How reduce works: ((1 + 2) + 3) + 4
total = reduce(lambda x, y: x + y, numbers)
print(total)  # 10
```

:::note
Think of it as:

- `x` is the "Running Total."
- `y` is the "Next Item" in the list.
  :::

### Example

```python
from functools import reduce

# All members who ever appeared in Sugababes
all_members = ['Siobhan', 'Mutya', 'Keisha', 'Heidi', 'Amelle', 'Jade']

# Define which members are in the current lineup (MKS)
current_members = ['Mutya', 'Keisha', 'Siobhan']

# Reduce the list to only current members
def sugababes_assemble(band, member):
    if member in current_members:
        band.append(member)
    return band

current_lineup = reduce(sugababes_assemble, all_members, [])
print(f"Current Sugababes: {current_lineup}")  # ['Siobhan', 'Mutya', 'Keisha']


```

## 4. Functional Tools

The `functools` module has two other "magic" tools that make your functions more flexible.

### `partial()`: The Pre-filled Form

Imagine you have a form that asks for "City" and "Country." If you know everyone is from "Havana, Cuba," you can pre-fill those parts so the user only has to type their name.

```python
from functools import partial

def greet(greeting, name):
    return f"{greeting}, {name}!"

# Pre-fill the 'greeting' part
say_hello = partial(greet, "Hello")

print(say_hello("Fidel")) # Only need to provide the name now!
```

### `lru_cache()`: The Memory Note

This decorator tells your function: "If you've calculated this result before, write it down and don't do the calculation again." It's a massive speed boost for heavy calculations.

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_math(n):
    # Python remembers the result for 'n' after the first time
    return n * n
```

## 5. Pipelines: Putting it all Together

In the real world, we often "chain" these tools together to process data in a single flow.

**The Task:** Take a list of numbers, keep only the evens, square them, and then find the total.

```python
from functools import reduce

data = [1, 2, 3, 4, 5, 6]

# 1. Filter (Keep evens) -> [2, 4, 6]
# 2. Map (Square them) -> [4, 16, 36]
# 3. Reduce (Sum them) -> 56

result = reduce(lambda x, y: x + y,
            map(lambda x: x**2,
                filter(lambda x: x % 2 == 0, data)))

print(result) # 56
```

## 6. Comparison: Functional vs. Generators

You might notice that a **Generator Expression** often looks cleaner than chaining `map` and `filter`.

- **Functional Style:** `map(lambda x: x*2, filter(lambda x: x > 5, data))`
- **Generator Style:** `(x*2 for x in data if x > 5)`

### Which should you use?

Most Pythonistas prefer **Generators** for simple logic because they are easier to read. Use `map/filter/reduce` when you are working with pre-existing functions or complex data pipelines.

:::summary

- `map`: Use it when you want to change every item (10 in, 10 out).
- `filter`: Use it when you want to discard items (10 in, 5 out).
- `reduce`: Use it when you want to combine items (10 in, 1 out).
- `partial`: Use it to "pre-set" arguments in a function.
- `lru_cache`: Use it to make slow functions lightning fast by "remembering" results.
  :::
