# 🎭 Lambda Functions: Anonymous One-Liners

A **lambda function** (or anonymous function) is a small, single-expression function that you don't need to formally define using the `def` keyword. They are typically used for short-term operations where a full function definition would be overkill.

## 1. Syntax

Lambda functions are defined using the **`lambda`** keyword. The structure is fixed:

```python
lambda arguments: expression
```

- `lambda`: The keyword used to define the anonymous function.

- `arguments`: One or more arguments, separated by commas (just like a normal function).

- `expression`: A single expression that is evaluated, and its result is automatically returned.

### Simple Lambda Example

```python
# Normal function definition
def add_one(x):
    return x + 1

# Equivalent lambda function
add_one_lambda = lambda x: x + 1

# Calling both functions gives the same result
print(add_one(5))           # Output: 6
print(add_one_lambda(5))    # Output: 6
```

## 2. Key Restrictions

1. Single Expression: A lambda body can only contain one expression. You cannot include multiple statements, loops, or complex `if/else` blocks (though ternary operators are allowed).

2. Anonymous: They don't require a name, but they are often assigned to a variable (as shown above) or passed directly as an argument to another function.

3. Automatic Return: The result of the expression is always automatically returned; you do not use the `return` keyword.

## 3. Practical Use Case: Sorting

The most common use case for lambda functions is passing them as the `key` argument to the built-in `sorted()` function or the list's `.sort()` method. This allows you to define a quick, custom sorting rule.

### Example: Sorting a List of Tuples

Suppose you have a list of user tuples, where each tuple is `(username, score)`. You want to sort by the score (the second element, index 1).

```python
user_scores = [("Alex", 88), ("Ben", 95), ("Chris", 72)]

# Use a lambda function to tell 'sorted' to look at the element at index 1 for comparison
sorted_by_score = sorted(user_scores, key=lambda user: user[1])

print(sorted_by_score)
# Output: [('Chris', 72), ('Alex', 88), ('Ben', 95)]
```
