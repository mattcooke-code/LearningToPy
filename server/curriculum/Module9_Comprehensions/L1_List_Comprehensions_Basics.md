# ⚡ List Comprehensions Basics

**_List Comprehensions_** provide a concise way to create lists in Python. They transform one list (or any iterable) into another list by applying an operation to each element.

## 1. Basic Syntax

```python
[expression for item in iterable]
```

### Traditional Loop vs List Comprehension

```python
# Traditional approach
numbers = [1, 2, 3, 4, 5]
squared = []
for num in numbers:
    squared.append(num ** 2)
print(squared)  # [1, 4, 9, 16, 25]

# List comprehension approach
numbers = [1, 2, 3, 4, 5]
squared = [num ** 2 for num in numbers]
print(squared)  # [1, 4, 9, 16, 25]
```

## 2. Common Transformation Patterns

### String Operations

```python
names = ["tionne", "lisa", "rozonda"]
capitalized = [name.title() for name in names]
print(capitalized)  # ['Tionne', 'Lisa', 'Rozonda']
```

### Mathematical Operations

```python
prices = [100, 200, 300]
discounted = [price * 0.9 for price in prices]
print(discounted)  # [90.0, 180.0, 270.0]
```

### Type Conversions

```python
strings = ["1", "2", "3"]
numbers = [int(s) for s in strings]
print(numbers)  # [1, 2, 3]
```

## 3. Working with Different Data Sources

### From Strings

```python
word = "hello"
letters = [char.upper() for char in word]
print(letters)  # ['H', 'E', 'L', 'L', 'O']
```

### From Ranges

```python
squares = [x**2 for x in range(1, 6)]
print(squares)  # [1, 4, 9, 16, 25]
```

### From Tuples

```python
coordinates = [(1, 2), (3, 4), (5, 6)]
x_coords = [x for x, y in coordinates]
print(x_coords)  # [1, 3, 5]
```

## 4. Benefits of List Comprehensions

1. **Concise**: Less code than equivalent loops

2. **Readable**: Expresses intent clearly (when used appropriately)

3. **Fast**: Often faster than equivalent loop implementations

4. **Pythonic**: Considered good Python style

## 5. When to Use List Comprehensions

| Good for:                                      | Avoid when:                                           |
| ---------------------------------------------- | ----------------------------------------------------- |
| ✅ Simple transformations and filtering        | ❌ The logic becomes complex or hard to read          |
| ✅ Creating new lists from existing iterables  | ❌ You need multiple statements in the transformation |
| ✅ Operations that fit comfortably on one line | ❌ You're modifying existing data (use loops instead) |

## 6. Memory Considerations

:::note
List comprehensions create the entire list in memory at once. For very large datasets, consider **generator expressions** (covered in advanced modules).
:::

```python
# Creates entire list in memory
large_list = [x**2 for x in range(1000000)]

# More memory efficient (generator)
large_generator = (x**2 for x in range(1000000))
```

:::summary

- **List comprehensions** provide a concise syntax: `[expression for item in iterable]`
- They _transform_ one iterable into a new list by applying an expression to each element
- Common uses: mathematical operations, string transformations, type conversions
- Work with any iterable: lists, strings, ranges, tuples
- Benefits: concise, readable, fast, and **Pythonic**
- Use when logic is simple and fits on one line; avoid when complex
- Creates **entire list in memory** - for large data, consider _generator expressions_

:::
