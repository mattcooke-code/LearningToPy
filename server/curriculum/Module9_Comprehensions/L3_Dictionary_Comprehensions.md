# 📚 Dictionary Comprehensions

Dictionary comprehensions provide a concise way to create dictionaries by transforming key-value pairs from various data sources. They follow the same elegant pattern as list comprehensions but for dictionary creation.

## 1. Basic Syntax

```python
{key_expression: value_expression for item in iterable}

```

### Traditional Loop vs Dictionary Comprehension

```python
# Traditional approach
numbers = [1, 2, 3, 4, 5]
squared_dict = {}
for num in numbers:
    squared_dict[num] = num ** 2
print(squared_dict)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Dictionary comprehension approach
numbers = [1, 2, 3, 4, 5]
squared_dict = {num: num ** 2 for num in numbers}
print(squared_dict)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
```

## 2. Creating Dictionaries from Different Sources

### From Lists with Indices

```python
fruits = ['apple', 'banana', 'cherry']
fruit_dict = {i: fruit for i, fruit in enumerate(fruits)}
print(fruit_dict)  # {0: 'apple', 1: 'banana', 2: 'cherry'}
```

### From Two Parallel Lists

```python
keys = ['name', 'age', 'city']
values = ['Alice', 30, 'New York']
person = {keys[i]: values[i] for i in range(len(keys))}
print(person)  # {'name': 'Alice', 'age': 30, 'city': 'New York'}
```

### From List of Tuples

```python
pairs = [('a', 1), ('b', 2), ('c', 3)]
result = {k: v for k, v in pairs}
print(result)  # {'a': 1, 'b': 2, 'c': 3}
```

## 3. Conditional Dictionary Comprehensions

### Filtering Keys or Values

```python
# Only include even numbers as keys
numbers = [1, 2, 3, 4, 5, 6]
even_squares = {num: num**2 for num in numbers if num % 2 == 0}
print(even_squares)  # {2: 4, 4: 16, 6: 36}
```

### Conditional Value Transformation

```python
# Apply discount only to high prices
prices = {'apple': 1.5, 'banana': 0.8, 'laptop': 999, 'phone': 699}
discounted = {item: price * 0.9 if price > 100 else price for item, price in prices.items()}
print(discounted)  # {'apple': 1.5, 'banana': 0.8, 'laptop': 899.1, 'phone': 629.1}
```

## 4. Key and Value Transformations

### Transforming Both Keys and Values

```python
# Convert keys to uppercase and double values
data = {'a': 1, 'b': 2, 'c': 3}
transformed = {k.upper(): v * 2 for k, v in data.items()}
print(transformed)  # {'A': 2, 'B': 4, 'C': 6}
```

### Creating Dictionaries from String Data

```python
text = "apple:5,banana:3,cherry:8"
items = text.split(',')
inventory = {item.split(':')[0]: int(item.split(':')[1]) for item in items}
print(inventory)  # {'apple': 5, 'banana': 3, 'cherry': 8}
```

## 5. Dictionary Comprehension with enumerate()

### Creating Index-Based Dictionaries

```python
students = ['Alice', 'Bob', 'Charlie']
student_ids = {index: student for index, student in enumerate(students, start=1001)}
print(student_ids)  # {1001: 'Alice', 1002: 'Bob', 1003: 'Charlie'}
```

## 6. Swapping Keys and Values

### Simple Key-Value Swap

```python
original = {'a': 1, 'b': 2, 'c': 3}
swapped = {v: k for k, v in original.items()}
print(swapped)  # {1: 'a', 2: 'b', 3: 'c'}
```

### Safe Key-Value Swap (Handling Duplicates)

```python
# Using tuple values to handle potential duplicate values
data = {'a': 1, 'b': 2, 'c': 2, 'd': 3}
swapped = {}
for k, v in data.items():
    if v in swapped:
        swapped[v] = (swapped[v], k) if not isinstance(swapped[v], tuple) else swapped[v] + (k,)
    else:
        swapped[v] = k
print(swapped)  # {1: 'a', 2: ('b', 'c'), 3: 'd'}
```

## 7. Real-World Examples

### Config File Processing

```python
config_lines = ["HOST=localhost", "PORT=8080", "DEBUG=True"]
config = {line.split('=')[0]: line.split('=')[1] for line in config_lines}
print(config)  # {'HOST': 'localhost', 'PORT': '8080', 'DEBUG': 'True'}
```

### Data Normalization

```python
user_data = {'Alice': 25, 'Bob': '30', 'Charlie': 35.5, 'Diana': '28'}
normalized = {name: int(float(age)) for name, age in user_data.items()}
print(normalized)  # {'Alice': 25, 'Bob': 30, 'Charlie': 35, 'Diana': 28}
```

### Word Frequency Counter

```python
text = "apple banana apple cherry banana apple"
words = text.split()
frequency = {word: words.count(word) for word in set(words)}
print(frequency)  # {'apple': 3, 'banana': 2, 'cherry': 1}
```

## 8. Best Practices

1. **Keep it readable**: Break complex comprehensions into multiple lines

2. **Use .items()**: Always use `dict.items()` when working with existing dictionaries

3. **Handle duplicates**: Be aware that duplicate keys will be overwritten

4. **Consider alternatives**: For very complex transformations, a regular loop might be clearer

### Multi-line Formatting

```python
# For better readability
complex_dict = {
    key.upper(): value * 2
    for key, value in original_dict.items()
    if value > threshold and key not in exclude_list
}
```

## 9. Common Pitfalls

### ❌ Forgetting .items()

```python
data = {'a': 1, 'b': 2}
# Wrong - iterates over keys only
wrong = {k: v for k in data}  # {'a': 'a', 'b': 'b'}

# Correct - uses .items()
correct = {k: v for k, v in data.items()}  # {'a': 1, 'b': 2}
```

### ❌ Duplicate Keys

```python
# Later keys overwrite earlier ones
data = [('a', 1), ('b', 2), ('a', 3)]
result = {k: v for k, v in data}
print(result)  # {'a': 3, 'b': 2} - 'a' from first tuple is lost!
```
