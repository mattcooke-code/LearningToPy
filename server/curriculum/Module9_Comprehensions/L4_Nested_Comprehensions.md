# 🔄 Nested Comprehensions & Advanced Patterns

Nested comprehensions allow you to work with multi-dimensional data structures and create complex transformations in a concise way. However, they require careful consideration for readability.

## 1. Nested List Comprehensions

### Flattening a 2D List

```python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print(flattened)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

```

### Creating a 2D Matrix

```python
# Create a 3x3 matrix with sequential numbers
matrix = [[i * 3 + j + 1 for j in range(3)] for i in range(3)]
print(matrix)  # [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
```

## 2. Nested Dictionary Comprehensions

### Creating a Matrix as Nested Dictionaries

```python
# Create a coordinate system
coordinates = {
    x: {y: f\"({x},{y})\" for y in range(3)}
    for x in range(3)
}
print(coordinates)
# {0: {0: '(0,0)', 1: '(0,1)', 2: '(0,2)'},
#  1: {0: '(1,0)', 1: '(1,1)', 2: '(1,2)'},
#  2: {0: '(2,0)', 1: '(2,1)', 2: '(2,2)'}}
```

### Transforming Nested Data Structures

```python
students_data = {
    'class_a': {'Alice': 85, 'Bob': 92},
    'class_b': {'Charlie': 78, 'Diana': 88}
}

# Add 5 points to all scores
adjusted_scores = {
    class_name: {student: score + 5 for student, score in class_scores.items()}
    for class_name, class_scores in students_data.items()
}
print(adjusted_scores)
# {'class_a': {'Alice': 90, 'Bob': 97}, 'class_b': {'Charlie': 83, 'Diana': 93}}
```

## 3. Set Comprehensions

Set comprehensions work similarly to list comprehensions but create sets (unique elements only).

### Basic Set Comprehension

```python
numbers = [1, 2, 2, 3, 4, 4, 5, 5]
unique_squares = {num ** 2 for num in numbers}
print(unique_squares)  # {1, 4, 9, 16, 25}
```

### Set Operations with Comprehensions

```python
words = ["apple", "banana", "cherry", "date", "elderberry"]
long_unique_words = {word for word in words if len(word) > 5}
print(long_unique_words)  # {'banana', 'cherry', 'elderberry'}
```

## 4. Generator Expressions

Generator expressions are similar to list comprehensions but create generators (memory-efficient iterators).

### Basic Generator Expression

```python
# List comprehension (eager evaluation)
squares_list = [x**2 for x in range(1000000)]  # Creates entire list in memory

# Generator expression (lazy evaluation)
squares_gen = (x**2 for x in range(1000000))   # Creates generator, uses little memory

# Use the generator
for square in squares_gen:
    if square > 100:
        break
    print(square)
```

### Generator with Conditions

```python
even_squares = (x**2 for x in range(100) if x % 2 == 0)
print(list(even_squares))  # Convert to list to see results: [0, 4, 16, 36, ...]
```

## 5. When to Use Comprehensions vs Loops

### Use Comprehensions When:

• The transformation is simple and fits on 1-2 lines

• You're creating a new collection

• Readability is maintained

• Performance matters (comprehensions are often faster)

### Use Traditional Loops When:

•The logic is complex with multiple conditions

• You need to modify existing data structures

• You need side effects (like printing during iteration)

• Readability would suffer with a comprehension

### Example: Complex Logic (Better with Loop)

```python
# ❌ Hard to read comprehension
result = [
    process_item(item)
    for item in data
    if validate_item(item) and
       (item.category in allowed_categories or item.priority > threshold) and
       not item.is_archived
]

# ✅ More readable with loop
result = []
for item in data:
    if not item.is_archived:
        if validate_item(item):
            if (item.category in allowed_categories or item.priority > threshold):
                result.append(process_item(item))
```

## 6. Performance Considerations

### Memory Efficiency

```python
# List comprehension - loads everything into memory
large_list = [x**2 for x in range(1000000)]

# Generator expression - memory efficient
large_generator = (x**2 for x in range(1000000))

# Use generators for large datasets or when you might not need all results
```

### Speed Comparison

```python
import time

data = range(1000000)

# List comprehension
start = time.time()
squares = [x**2 for x in data]
list_time = time.time() - start

# Generator expression
start = time.time()
squares_gen = (x**2 for x in data)
gen_time = time.time() - start

print(f\"List: {list_time:.4f}s, Generator: {gen_time:.4f}s\")
# Generator creation is instant, but consumption takes time
```

## 7. Advanced Patterns

### Dictionary with Conditional Key-Value Pairs

```python
data = [1, 2, 3, 4, 5, 6]
result = {
    f\"even_{x}\": x**2 if x % 2 == 0 else None,
    f\"odd_{x}\": x**3 if x % 2 != 0 else None
    for x in data
}
# Clean up None values
result = {k: v for k, v in result.items() if v is not None}
print(result)
# {'even_2': 4, 'odd_1': 1, 'even_4': 16, 'odd_3': 27, 'even_6': 36, 'odd_5': 125}
```

### Multiple Data Source Combination

```python
names = ['Alice', 'Bob', 'Charlie']
scores = [85, 92, 78]
subjects = ['Math', 'Science', 'English']

student_records = [
    {'name': names[i], 'score': scores[i], 'subject': subjects[i]}
    for i in range(len(names))
]
print(student_records)
# [{'name': 'Alice', 'score': 85, 'subject': 'Math'}, ...]
```

## 8. Best Practices for Readability

### Break Into Multiple Lines

```python
# Hard to read
result = [transform(x) for x in data if condition1(x) and condition2(x) and condition3(x)]

# Better
result = [
    transform(x)
    for x in data
    if condition1(x) and condition2(x) and condition3(x)
]
```

### Use Helper Functions

```python
def should_include(item):
    return (condition1(item) and
            condition2(item) and
            condition3(item))

def transform_item(item):
    return complex_transformation(item)

# Much clearer comprehension
result = [
    transform_item(item)
    for item in data
    if should_include(item)
]
```

### Limit Nesting Depth

```python
# ❌ Too nested - hard to understand
matrix = [[[z for z in range(3)] for y in range(3)] for x in range(3)]

# ✅ Better approach - use helper functions or break into steps
def create_layer(size):
    return [list(range(size)) for _ in range(size)]

matrix = [create_layer(3) for _ in range(3)]
```
