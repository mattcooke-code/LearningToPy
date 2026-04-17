# 📚 Dictionary Comprehensions

**_Dictionary Comprehensions_** provide a concise way to create dictionaries by transforming _key-value pairs_ from various data sources. They follow the same elegant pattern as list comprehensions but for dictionary creation.

## 1. Basic Syntax

```python
{key_expression: value_expression for item in iterable}

```

This creates a new dictionary by looping through an iterable and, for each item, computing a key and a value.

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

**What's happening here?**

For each number in the list, we create a key-value pair where the number itself is the key, and its square is the value. The comprehension builds the entire dictionary in one clean line.

## 2. Creating Dictionaries from Different Sources

### From Lists with Indices

Sometimes you need both the index and the value. `enumerate()` is perfect for this:

```python
fruits = ['apple', 'banana', 'cherry']
fruit_dict = {i: fruit for i, fruit in enumerate(fruits)}
print(fruit_dict)  # {0: 'apple', 1: 'banana', 2: 'cherry'}
```

**Explanation:** `enumerate()` returns both the index (0, 1, 2) and each fruit. We use the index as the key and the fruit as the value.

### From Two Parallel Lists

When you have separate lists for keys and values, you need a way to pair them up:

```python
keys = ['name', 'age', 'origin']
values = ['Connor MacLeod', 450, 'Scotland']
highlander = {keys[i]: values[i] for i in range(len(keys))}
print(highlander)  # {'name': 'Connor MacLeod', 'age': 450, 'origin': 'Scotland'}
```

**Explanation:** We loop through indices from 0 to the length of the **keys** list. For each index `i`, we fetch `keys[i]` to use as the key and `values[i]` to use as the value.

:::warning
**Lists of different lengths:** When using `range(len(keys))`, if `values` is shorter than `keys`, the code will crash with an `IndexError`. If `keys` is shorter than `values` the additional values will be ignored. A better approach is to use the `zip()` function.
:::

_The `zip()` Function_

Python provides a built-in function called `zip()` specifically to "pair up" elements from two lists into tuples automatically.

```python
# The same result, but cleaner:
keys = ['name', 'age', 'origin']
values = ['Connor MacLeod', 450, 'Scotland']
highlander = {k: v for k, v in zip(keys, values)}
print(highlander)  # {'name': 'Connor MacLeod', 'age': 450, 'origin': 'Scotland'}
```

Using `zip()` is generally preferred because it’s more readable and avoids manual index management.

:::note
**Lists of different lengths:** the `zip()` function will stop at the end of the shortest list, ignoring additional items. Unlike manual indexing, it will **not** crash when lists are of different lengths.
:::

### From List of Tuples

Data often comes as pairs in tuples - dictionary comprehensions handle this naturally:

```python
pairs = [('a', 1), ('b', 2), ('c', 3)]
result = {k: v for k, v in pairs}
print(result)  # {'a': 1, 'b': 2, 'c': 3}
```

**Explanation:** Each tuple in the list contains two elements. We unpack them directly into variables `k` and `v`, using `k` as the **_key_** and `v` as the **_value_**.

## 3. Conditional Dictionary Comprehensions

### Filtering Keys or Values

Just like list comprehensions, you can add an `if` condition at the end to filter which items are included:

```python
# Only include even numbers as keys
numbers = [1, 2, 3, 4, 5, 6]
even_squares = {num: num**2 for num in numbers if num % 2 == 0}
print(even_squares)  # {2: 4, 4: 16, 6: 36}
```

**Explanation:** The `if num % 2 == 0` filter means we only process numbers that are even. Odd numbers are skipped entirely.

### Conditional Value Transformation

You can also transform values conditionally using the ternary operator:

```python
# Apply discount only to high prices
prices = {'apple': 1.5, 'banana': 0.8, 'laptop': 999, 'phone': 699}
discounted = {item: price * 0.9 if price > 100 else price for item, price in prices.items()}
print(discounted)  # {'apple': 1.5, 'banana': 0.8, 'laptop': 899.1, 'phone': 629.1}
```

**Explanation:** For each item, we check if its price is over 100. If so, we apply a 10% discount; otherwise, we keep the original price.

## 4. Key and Value Transformations

### Transforming Both Keys and Values

You're not limited to using the original data as-is - you can transform both keys and values:

```python
# Convert keys to uppercase and double values
data = {'a': 1, 'b': 2, 'c': 3}
transformed = {k.upper(): v * 2 for k, v in data.items()}
print(transformed)  # {'A': 2, 'B': 4, 'C': 6}
```

**Explanation:** We use `.items()` to loop through key-value pairs, then transform each key with `.upper()` and each value by multiplying by 2.

### Creating Dictionaries from String Data

Dictionary comprehensions excel at parsing structured text:

```python
text = "apple:5,banana:3,cherry:8"
items = text.split(',')
inventory = {item.split(':')[0]: int(item.split(':')[1]) for item in items}
print(inventory)  # {'apple': 5, 'banana': 3, 'cherry': 8}
```

**Explanation:** We split the string by commas to get items like "apple:5". Then for each item, we split by colon to separate the fruit name from its count, using the name as key and converting the count to an integer.

## 5. Dictionary Comprehension with enumerate()

### Creating Index-Based Dictionaries

`enumerate()` can start counting from any number:

```python
students = ['Cheyenne', 'Yuri', 'Branwen']
student_ids = {index: student for index, student in enumerate(students, start=1001)}
print(student_ids)  # {1001: 'Cheyenne', 1002: 'Yuri', 1003: 'Branwen'}
```

**Explanation:** By setting `start=1001`, we create student IDs starting from 1001 instead of the default 0 - perfect for real-world ID systems.

## 6. Swapping Keys and Values

### Simple Key-Value Swap

A common task is inverting a dictionary:

```python
original = {'a': 1, 'b': 2, 'c': 3}
swapped = {v: k for k, v in original.items()}
print(swapped)  # {1: 'a', 2: 'b', 3: 'c'}
```

**Explanation:** We loop through each key-value pair, but swap their positions: the original value becomes the new key, and the original key becomes the new value.

### Safe Key-Value Swap (Handling Duplicates)

When swapping, duplicate values become problematic because keys must be unique:

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

**Explanation:** Since values `2` appears twice (with keys 'b' and 'c'), we store them as a tuple `('b', 'c')` to preserve both original keys.

## 7. Real-World Examples

### Config File Processing

Parsing configuration files is a perfect use case:

```python
config_lines = ["HOST=localhost", "PORT=8080", "DEBUG=True"]
config = {line.split('=')[0]: line.split('=')[1] for line in config_lines}
print(config)  # {'HOST': 'localhost', 'PORT': '8080', 'DEBUG': 'True'}
```

**Explanation:** Each line contains a key-value pair separated by `'='`. We split each line at the equals sign to extract both parts.

### Data Normalization

When data types are inconsistent, normalize them:

```python
user_data = {'Cheyenne': 25, 'Yuri': '30', 'Branwen': 35.5, 'Khufu': '28'}
normalized = {name: int(float(age)) for name, age in user_data.items()}
print(normalized)  # {'Cheyenne': 25, 'Yuri': 30, 'Branwen': 35, 'Khufu': 28}
```

**Explanation:** The original data mixes integers, strings, and floats. We convert everything to integers by first converting to float (handles both strings and numbers) then to int.

### Word Frequency Counter

A classic text analysis example:

```python
text = "apple banana apple cherry banana apple"
words = text.split()
frequency = {word: words.count(word) for word in set(words)}
print(frequency)  # {'apple': 3, 'banana': 2, 'cherry': 1}
```

**Explanation:** We split the text into words, then loop through each unique word (using `set(words)` to avoid duplicates) and count how many times it appears in the original word list.

## 8. Best Practices

:::tip

1. **Keep it readable**: Break complex comprehensions into multiple lines

2. **Use .items()**: Always use `dict.items()` when working with existing dictionaries

3. **Handle duplicates**: Be aware that duplicate keys will be overwritten

4. **Consider alternatives**: For very complex transformations, a regular loop might be clearer
   :::

### Multi-line Formatting

```python
# For better readability
complex_dict = {
    key.upper(): value * 2
    for key, value in original_dict.items()
    if value > threshold and key not in exclude_list
}
```

**Explanation:** Breaking the comprehension into logical parts (transformation, iteration, filtering) makes it much easier to understand at a glance.

## 9. Common Pitfalls

### ❌ Forgetting .items()

A very common mistake is iterating over a dictionary directly:

```python
data = {'a': 1, 'b': 2}
# Wrong - iterates over keys only
wrong = {k: v for k in data}  # {'a': 'a', 'b': 'b'}

# Correct - uses .items()
correct = {k: v for k, v in data.items()}  # {'a': 1, 'b': 2}
```

**Explanation:** Looping directly over a dictionary (`for k in data`) gives only keys. Without `.items()`, there's no way to access the values!

### ❌ Duplicate Keys

Remember that dictionary keys must be unique:

```python
# Later keys overwrite earlier ones
data = [('a', 1), ('b', 2), ('a', 3)]
result = {k: v for k, v in data}
print(result)  # {'a': 3, 'b': 2} - 'a' from first tuple is lost!
```

**Explanation:** When creating a dictionary, if the same key appears multiple times, only the last value is kept. The first value (1) is completely overwritten by the last (3).

:::summary

- **Dictionary comprehensions** create dictionaries concisely: `{key: value for item in iterable}`
- Create dictionaries from lists, tuples, parallel lists, and existing dictionaries
- Add filtering conditions at the end: `{k: v for k, v in data if condition}`
- Use conditional expressions for value transformations: `{k: v if condition else new_v for k, v in data}`
- Transform **both keys and values** using expressions
- Use `.items()` when looping through existing dictionaries to access both keys and values
- Swapping keys and values requires handling duplicate values carefully
- Real-world applications: config parsing, data normalization, frequency counting
- **Watch out for:** forgetting `.items()`, duplicate keys being overwritten, overly complex comprehensions

:::
