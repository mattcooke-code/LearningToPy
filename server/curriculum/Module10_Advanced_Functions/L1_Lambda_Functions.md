# λ Lambda Functions: From Basics to Advanced

Lambda functions (anonymous functions) are small, single-expression functions defined without a formal `def` statement. They are perfect for short, simple operations where a full function definition would be overkill, particularly when you need a function only as an argument to another function.

The term **"anonymous"** means they do not need to be explicitly named (though they are often immediately assigned to a variable).

## 1. Lambda Syntax and Basics

### Basic Syntax

```python
lambda arguments: expression
```

**Mechanism**: Python creates a function object, binds the listed arguments to it, and sets the result of the `expression` as the function's automatic `return` value. The return keyword is **never used** in a lambda.

### Simple Lambda Examples

```python
# Normal function definition
def add_one(x):
    return x + 1

# Equivalent lambda function
add_one_lambda = lambda x: x + 1

# Calling both functions gives the same result
print(add_one(5))           # Output: 6
print(add_one_lambda(5))    # Output: 6

# Multiple arguments
add = lambda a, b: a + b
print(add(3, 7))  # Output: 10

# No arguments
greet = lambda: "Hello, World!"
print(greet())    # Output: Hello, World!
```

:::note

### Key Restrictions

1. **Single Expression**: A lambda body can only contain **one expression**. This is the most crucial limitation; it means you cannot use statements like `if/else` (except as a ternary operator), `for` loops, assignment (`=`), or `return`.

2. **Automatic Return**: The result of the single expression is **automatically returned** (no `return` keyword is necessary or allowed).

3. **Anonymous**: They don't require a name but are often assigned to variables, though their primary purpose is as a "throwaway" function passed directly to another function.
   :::

## 2. Practical Use Cases (Higher-Order Functions)

The power of lambda functions comes from their use with **higher-order functions**—functions that take other functions as arguments (like `sorted`, `map`, and `filter`). Lambdas provide a clean, one-line way to define the required behavior _in place_.

### Sorting with Lambdas

Lambdas are most commonly used with the built-in `sorted()` function (or the `.sort()` method) by providing a concise custom function for the `key` argument. The lambda tells Python exactly _what_ to sort by.

```python
# Sorting a list of tuples by different elements
user_scores = [("Feyja", 88), ("Odin", 95), ("Týr", 72)]

# Sort by score (second element)
sorted_by_score = sorted(user_scores, key=lambda user: user[1])
print(sorted_by_score)  # [('Týr', 72), ('Feyja', 88), ('Odin', 95)]

# Sort by name length
sorted_by_name_length = sorted(user_scores, key=lambda user: len(user[0]))
print(sorted_by_name_length)  # [('Týr', 72), ('Odin', 95), ('Freyja', 88)]

```

### Data Transformation (`map` and `filter`)

Lambdas are excellent for quick, simple transformations using functional tools like `map` (to apply a function to every item) and `filter` (to select items based on a condition).

:::warning
`map()` and `filter()` return **iterator objects**, not lists. To see the results or store them for later use, you need to convert them to lists using `list()`:
:::

```python
numbers = [1, 2, 3, 4, 5]

# Square all numbers using map
squared = list(map(lambda x: x ** 2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

# Filter even numbers
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4]
```

## 3. Conditional Logic in Lambdas

Since a lambda can only contain an expression, conditional logic must be implemented using a **ternary operator**: `value_if_true if condition else value_if_false`.

```python
# Categorize numbers as "even" or "odd"
categorize = lambda x: "even" if x % 2 == 0 else "odd"
print(categorize(4))  # Output: "even"
print(categorize(7))  # Output: "odd"

# Multiple conditions
grade = lambda score: "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "F"
print(grade(85))  # B
print(grade(92))  # A
```

## 4. Advanced Lambda Patterns

### Returning Lambdas from Functions (Closures)

A lambda function can be dynamically created and returned by a regular function. When this happens, the lambda **remembers** the values from the surrounding scope—a concept known as a **closure**.

```python
def create_multiplier(factor):
    # The returned lambda 'remembers' the value of 'factor'
    return lambda x: x * factor

double = create_multiplier(2)
triple = create_multiplier(3)

print(double(5))  # 10 (Uses the captured factor=2)
print(triple(5))  # 15 (Uses the captured factor=3)
```

### Complex Sorting Patterns (Multiple Keys)

When sorting dictionaries or objects, you can combine keys. Using a lambda allows you to easily transform a value for sorting, such as using the negative sign (`-`) to simulate descending order without setting `reverse=True`.

```python
students = [
    {'name': 'Amara', 'grade': 85, 'age': 20},
    {'name': 'Arjun', 'grade': 92, 'age': 19},
    {'name': 'Mei-Ling', 'grade': 78, 'age': 21}
]

# Sort by grade descending (using -s['grade']), then by age ascending (s['age'])
sorted_students = sorted(students,
                         key=lambda s: (-s['grade'], s['age']))

print([s['name'] for s in sorted_students])  # ['Arjun', 'Amara', 'Mei-Ling']
```

## 5. Lambda in Functional Composition

**Functional Composition** treats functions like building blocks. You can combine several small Lambda functions to create a larger, more powerful workflow. Think of lambdas like Lego bricks that can be snapped together to build more complex functions.

### Function Pipelines

Lambdas can be chained together to form a simple data processing pipeline, where the output of one lambda becomes the input of the next.

```python
# Create a pipeline of transformations
double = lambda x: x * 2
add_ten = lambda x: x + 10
# Defines a function that first doubles x, then adds ten to the result.
process_number = lambda x: add_ten(double(x))
print(process_number(5))  # 20
```

### Currying with Lambdas

**Currying** transforms a function that takes multiple arguments into a sequence of functions, each taking a single argument. Lambdas are a concise way to demonstrate this concept in Python.

```python
# Currying: returns a function (lambda b) that waits for the second argument
curried_add = lambda a: lambda b: a + b
add_five = curried_add(5)
print(add_five(3))  # 8 (5 + 3)
print(add_five(10)) # 15 (5 + 10)
```

This is helpful when you need to _pre-load_ a function with data you may need later.

## 6. Real-World Applications

### Event Handlers (GUIs)

In graphical user interface (GUI) programming, lambdas are frequently used to define simple actions that occur when a button is clicked or an event is triggered. They are perfect for this role because the action is often short and only used once.

```python
# Simulated button click handler
def create_button(click_handler):
    print(f"Button created with handler: {click_handler}")
    return click_handler

# Lambda as concise event handler
button = create_button(lambda: print("Button clicked!"))
button()  # Button clicked!
```

### Using a "Dictionary of Actions"

You can store Lambdas inside a dictionary to create a shortcut menu. This lets your program decide which bit of code to run based on a word or a user's choice, making your code much more flexible.

```python
operations = {
    'add': lambda x, y: x + y,
    'multiply': lambda x, y: x * y,
    'power': lambda x, y: x ** y
}

# Dynamic operation selection
def calculate(operation, a, b):
    # Retrieve the appropriate lambda function and execute it
    return operations[operation](a, b)

print(calculate('add', 5, 3))       # 8
print(calculate('power', 2, 3))     # 8
```

## 7. Lambda vs Regular Functions

| Feature  | Lambda Function                                                        | Regular Function (def)                                  |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| Syntax   | `lambda args: expression`                                              | `def name(args): return ...`                            |
| Body     | Must be a single expression                                            | Can contain multiple statements and complex logic       |
| Return   | Automatic return of expression result                                  | Requires explicit return keyword                        |
| Name     | Anonymous (no formal name)                                             | Always requires a name                                  |
| Best Use | Arguments to higher-order functions (key, map); simple throwaway logic | Complex logic, reusable code, documentation, type hints |

## 8. Limitations and Best Practices

### Limitations:

- **Single expression only** - this means you cannot use `if/else` statements, `for/while` loops, or complex multi-line logic.
- No **docstrings** or **type hints**, making complex lambdas hard to maintain.
- Hard to debug, as they appear as `<lambda>` in tracebacks.

:::tip

1. Keep them short - one line if possible

2. Use meaningful variable names in the expression

3. Prefer comprehensions for simple transformations

4. Use regular functions for complex logic

5. Document with comments if the logic isn't obvious
   :::

### Readability Comparison:

```python
# ❌ Hard to read
result = list(map(lambda x: x**2 if x % 2 == 0 else x**3,
                 filter(lambda x: x > 0 and x < 10, data)))

# ✅ More readable with helper functions or list comprehensions
positive_small = [x for x in data if 0 < x < 10]
result = [x**2 if x % 2 == 0 else x**3 for x in positive_small]
```

## 9. Performance Considerations

While lambdas are technically slightly slower to create at runtime than pre-defined functions, this difference is **negligible** for nearly all real-world applications. The primary consideration for using lambdas should always be **code clarity** and **conciseness**, not performance.

:::summary

- **Lambda functions** are anonymous, single-expression functions defined with `lambda arguments: expression`
- They **automatically return** the result of the expression (no `return` keyword needed)
- **Key restriction**: Only one expression allowed - no statements, loops, or assignments
- **Primary use**: Short, throwaway functions passed to higher-order functions like `sorted()`, `map()`, and `filter()`
- **Conditional logic** requires ternary operator: `value_if_true if condition else value_if_false`
- **Advanced patterns**: Returning lambdas (closures), currying, and function pipelines
- **Common applications**: Sorting with custom keys, event handlers, configuration-driven behavior
- **Best practices**: Keep them short (one line), use meaningful variable names, use comprehensions for complex logic
- **Lambdas vs regular functions**: Use lambdas for simple operations; use `def` for complex logic, reusability, or when documentation is needed
- **Readability matters**: If a lambda makes code harder to understand, use a regular function instead

:::
