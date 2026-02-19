# 🔄 Nested Comprehensions & Advanced Patterns

**_Nested Comprehensions_** are fundamentally a shortcut for dealing with lists inside of lists. Think of it like "Inception" for your code; you’re putting a loop inside another loop, all on one line. They’re super powerful for flattening or transforming big chunks of data, but be careful: if you go too deep, they can get a bit messy to read!

## Understanding the Structure

Just as conditional comprehensions follow the same pattern as the ternary operator, **nested comprehensions follow the same logic as nested loops** - but written in reverse order!

### Nested Loops vs Nested Comprehensions

```python
# Nested loop structure
flattened = []
for row in matrix:          # Outer loop (first)
    for num in row:          # Inner loop (second)
        flattened.append(num)

# Nested comprehension
flattened = [num for row in matrix for num in row]
# Order:          [outer loop]   [inner loop]
```

:::note
The comprehension reads in the same order as the nested loops, but without the colons and indentation. The outer loop comes first, followed by the inner loop(s). This pattern extends to any number of nesting levels.
:::

## Breaking Down the Syntax

```python
[expression
 for outer_item in outer_sequence
 for inner_item in outer_item
 if condition]  # optional filter
```

**Explanation:** Each `for` clause represents another level of nesting. The expression at the front is evaluated for every combination of the loop variables that pass any filter conditions.

## Examples of Increasing Complexity

```python
# Level 1: Simple list
simple = [x for x in range(3)]                    # [0, 1, 2]

# Level 2: Flattening a 2D list
matrix = [[1, 2], [3, 4], [5, 6]]
flattened = [num for row in matrix for num in row]  # [1, 2, 3, 4, 5, 6]

# Level 3: Flattening a 3D list
cube = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
flattened_3d = [z for layer in cube for row in layer for z in row]
# [1, 2, 3, 4, 5, 6, 7, 8]
```

**Explanation:** Notice how each additional level of nesting adds another `for` clause. The order always follows the nesting: outermost first, innermost last.

## 1. Nested List Comprehensions

### Flattening a 2D List

```python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
print(flattened)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

```

**Explanation:** This reads as "_for each row in matrix, for each number in that row, add the number to the new list._" The order of the `for` clauses matters - the **outer** loop comes first, then the **inner** loop.

### Creating a 2D Matrix

```python
# Create a 3x3 matrix with sequential numbers
matrix = [[i * 3 + j + 1 for j in range(3)] for i in range(3)]
print(matrix)  # [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
```

**Explanation:** The outer comprehension `for i in range(3)` creates three rows. For each row, the inner comprehension `for j in range(3)` creates three columns. The expression `i * 3 + j + 1` calculates the value for each cell based on its row (i) and column (j).

## 2. Nested Dictionary Comprehensions

### Creating a Matrix as Nested Dictionaries

```python
# Create a coordinate system
coordinates = {
    x: {y: f"({x},{y})" for y in range(3)}
    for x in range(3)
}
print(coordinates)
# {0: {0: '(0,0)', 1: '(0,1)', 2: '(0,2)'},
#  1: {0: '(1,0)', 1: '(1,1)', 2: '(1,2)'},
#  2: {0: '(2,0)', 1: '(2,1)', 2: '(2,2)'}}
```

**Explanation:** The outer comprehension creates keys 0, 1, 2. For each of these keys, the inner comprehension creates a nested dictionary where the keys are y-coordinates and the values are formatted coordinate strings. This creates a complete coordinate lookup system in just two lines!

### Transforming Nested Data Structures

```python
students_data = {
    'class_a': {'Daphne': 85, 'Fred': 92},
    'class_b': {'Shaggy': 78, 'Velma': 88}
}

# Add 5 points to all scores
adjusted_scores = {
    class_name: {student: score + 5 for student, score in class_scores.items()}
    for class_name, class_scores in students_data.items()
}
print(adjusted_scores)
# {'class_a': {'Daphne': 90, 'Fred': 97}, 'class_b': {'Shaggy': 83, 'Velma': 93}}
```

**Explanation:** We use `.items()` to loop through each class and its student scores. The inner comprehension transforms each student's score by adding 5, while the outer comprehension maintains the class structure. This pattern is extremely useful for processing hierarchical data.

## 3. Set Comprehensions

Set comprehensions work similarly to list comprehensions but create sets (unique elements only). Use curly braces `{}` instead of square brackets `[]`.

### Basic Set Comprehension

```python
numbers = [1, 2, 2, 3, 4, 4, 5, 5]
unique_squares = {num ** 2 for num in numbers}
print(unique_squares)  # {1, 4, 9, 16, 25}
```

**Explanation:** Even though the input list has duplicates, the set comprehension automatically eliminates them. The result contains only unique squared values.

### Set Operations with Comprehensions

```python
words = ["apple", "banana", "cherry", "date", "elderberry"]
long_unique_words = {word for word in words if len(word) > 5}
print(long_unique_words)  # {'banana', 'cherry', 'elderberry'}
```

**Explanation:** This filters words longer than 5 characters and stores them in a set. Since the words are already unique, the main benefit here is the filtering, not deduplication.

## 4. Generator Expressions

Generator expressions are similar to list comprehensions but create generators (memory-efficient iterators). They use parentheses `()` instead of square brackets `[]`.

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

**Explanation:** The list comprehension creates all 1,000,000 squares immediately, using a significant memory. The generator expression creates a generator object that produces squares on-demand - it only calculates the next value when you ask for it.

### Generator with Conditions

```python
even_squares = (x**2 for x in range(100) if x % 2 == 0)
print(list(even_squares))  # Convert to list to see results: [0, 4, 16, 36, ...]
```

**Explanation:** Like comprehensions, generators can include conditions. Here, we generate squares of even numbers only. Converting to a list with `list()` is useful for small generators when you need all results at once.

## 5. When to Use Comprehensions vs Loops

| Use Comprehensions When:                              | Use Traditional Loops When:                            |
| ----------------------------------------------------- | ------------------------------------------------------ |
| The transformation is simple and fits on 1-2 lines    | The logic is complex with multiple conditions          |
| You're creating a new collection                      | You need to modify existing data structures            |
| Readability is maintained                             | You need side effects (like printing during iteration) |
| Performance matters (comprehensions are often faster) | Readability would suffer with a comprehension          |

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

**Explanation:** While the comprehension version is technically correct, it is difficult to read. The loop version, while longer, makes each condition clear and easy to modify.

## 6. Performance Considerations

### Memory Efficiency

```python
# List comprehension - loads everything into memory
large_list = [x**2 for x in range(1000000)]

# Generator expression - memory efficient
large_generator = (x**2 for x in range(1000000))

# Use generators for large datasets or when you might not need all results
```

**Explanation:** The list comprehension consumes memory for all 1,000,000 values at once. The generator uses almost no memory regardless of size, making it ideal for processing large datasets or infinite sequences.

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

print(f"List: {list_time:.4f}s, Generator: {gen_time:.4f}s")
# Generator creation is instant, but consumption takes time
```

**Explanation:** Creating a generator is virtually instantaneous because it doesn't actually compute anything. The list comprehension does all the work immediately. However, when you actually use the generator's values, the time difference evens out.

## 7. Advanced Patterns

### Dictionary with Conditional Key-Value Pairs

```python
data = [1, 2, 3, 4, 5, 6]
result = {
    f"even_{x}": x**2 if x % 2 == 0 else None,
    f"odd_{x}": x**3 if x % 2 != 0 else None
    for x in data
}
# Clean up None values
result = {k: v for k, v in result.items() if v is not None}
print(result)
# {'even_2': 4, 'odd_1': 1, 'even_4': 16, 'odd_3': 27, 'even_6': 36, 'odd_5': 125}
```

**Explanation:** This creates two potential keys for each number - one for even, one for odd. The ternary operators set the other to None, which we then filter out. This pattern is useful when you need conditional keys based on the data.

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

**Explanation:** When you have parallel lists representing different attributes of the same objects, a comprehension can combine them into structured dictionaries. The index `i` pulls corresponding elements from each list.

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

**Explanation:** Spreading the comprehension across lines makes each component clear: what we're creating, where it comes from, and what conditions we're applying.

### Use Helper Functions

```python
# Helper Function
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
    if should_include(item)  # Using our helper function
]
```

**Explanation:** Moving complex logic to helper functions keeps the comprehension readable while maintaining all the functionality. This also makes the code more testable and reusable.

### Limit Nesting Depth

```python
# ❌ Too nested - hard to understand
matrix = [[[z for z in range(3)] for y in range(3)] for x in range(3)]

# ✅ Better approach - use helper functions or break into steps
def create_layer(size):
    return [list(range(size)) for _ in range(size)]

matrix = [create_layer(3) for _ in range(3)]
```

**Explanation:** When nesting depth exceeds 2-3 levels, readability suffers dramatically. Breaking the logic into steps or using helper functions makes the code self-documenting and easier to debug.

:::summary

- **_Nested list comprehensions_** handle multi-dimensional data: `[item for row in matrix for item in row]`
- **_Nested dictionary comprehensions_** create hierarchical structures: `{k1: {k2: v for k2 in range(3)} for k1 in range(3)}`
- **_Set comprehensions_** create unique collections using `{}`
- **_Generator expressions_** use `()` and provide memory-efficient lazy evaluation
- Use comprehensions for simple transformations creating new collections
- Use loops for complex logic, side effects, or when readability suffers
- Generator expressions excel with large datasets or infinite sequences
- Best practices: break into lines, use helper functions, limit nesting depth
- Performance: list comprehensions are often faster than loops, generators save memory

:::
