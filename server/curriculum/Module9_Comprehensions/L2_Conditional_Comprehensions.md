# 🎯 Conditional List Comprehensions

List comprehensions become even more powerful when you add conditional logic to filter which elements are included or transform elements conditionally.

## 1. Filtering with If Conditions

Add an `if` condition at the end to filter elements:

```python
[expression for item in iterable if condition]
```

### Example: Filter Even Numbers

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [num for num in numbers if num % 2 == 0]
print(evens)  # [2, 4, 6, 8, 10]
```

### Example: Filter Strings by Length

```python
words = ["cat", "elephant", "dog", "butterfly", "ox"]
long_words = [word for word in words if len(word) > 3]
print(long_words)  # ['elephant', 'butterfly']
```

## 2. Conditional Expressions (If-Else)

Use conditional expressions to transform elements differently based on conditions. This follows the same pattern as the **_ternary operator_** you learned in **Module 3:** `true_value if condition else false_value`.

```python
[true_expression if condition else false_expression for item in iterable]
```

### Example: Mark Even/Odd

```python
numbers = [1, 2, 3, 4, 5]
labeled = ["even" if num % 2 == 0 else "odd" for num in numbers]
print(labeled)  # ['odd', 'even', 'odd', 'even', 'odd']
```

### Example: Apply Discount Based on Price

```python
prices = [50, 100, 200, 500]
discounted = [price * 0.9 if price > 100 else price for price in prices]
print(discounted)  # [50, 100, 180.0, 450.0]
```

## 3. Multiple Conditions

You can combine multiple conditions using `and/or`:

### Example: Numbers Divisible by 2 and 3

```python
numbers = range(1, 21)
divisible_by_2_and_3 = [num for num in numbers if num % 2 == 0 and num % 3 == 0]
print(divisible_by_2_and_3)  # [6, 12, 18]
```

### Example: Strings with Specific Characteristics

```python
words = ["apple", "banana", "cherry", "date", "elderberry"]
result = [word for word in words if len(word) > 4 and word.startswith('a')]
print(result)  # ['apple']
```

## 4. Complex Filtering Scenarios

### Example: Valid Email Filtering

```python
emails = [
    "user@example.com",
    "invalid-email",
    "test@domain.org",
    "no-at-sign",
    "valid@test.com"
]

valid_emails = [email for email in emails if '@' in email and '.' in email.split('@')[1]]
print(valid_emails)  # ['user@example.com', 'test@domain.org', 'valid@test.com']
```

### Breaking this down:

- `if '@' in email` checks for the @ symbol
- `and` ensures both conditions must be true
- `email.split('@')[1]` splits the email at @ and takes the domain part
- `'.'` in checks that the domain contains a dot (like .com, .org)

This ensures we only keep emails with both @ and a valid domain format.

### Example: Data Cleaning

```python
data = ["25", "invalid", "42", "17", "corrupted", "100"]
clean_numbers = [int(item) for item in data if item.isdigit()]
print(clean_numbers)  # [25, 42, 17, 100]
```

## 5. Nested Conditions

For more complex logic, you can nest conditional expressions:

### Example: Grade Classification

```python
scores = [85, 92, 78, 60, 45, 95, 30]
grades = [
    "A" if score >= 90 else
    "B" if score >= 80 else
    "C" if score >= 70 else
    "D" if score >= 60 else
    "F"
    for score in scores
]
print(grades)  # ['B', 'A', 'C', 'D', 'F', 'A', 'F']
```

## 6. Performance Considerations

Comprehensions with conditions are generally faster than equivalent loops, but be careful with very complex conditions that hurt readability.

:::tip
If your comprehension becomes hard to read, consider breaking it into multiple lines.
:::

```python
# Hard to read
result = [x**2 if x > 0 else 0 for x in data if x is not None and x != 0]

# More readable
result = [
    x**2 if x > 0 else 0
    for x in data
    if x is not None and x != 0
]
```

## 7. Common Pitfalls

:::note

1. **Order matters**: When using both `if` and `if-else`, remember the `if` filter comes at the end, while the `if-else` expression comes before `for`.

2. **Don't overcomplicate**: If it gets too complex, use a regular loop

3. **Watch for side effects**: Comprehensions should be pure transformations when possible
   :::

### Wrong Order

```python
# ❌ Incorrect - syntax error
result = [x for x in numbers if x > 0 else 0]

# ✅ Correct
result = [x if x > 0 else 0 for x in numbers]
```

:::summary

- **Filtering comprehensions:** `[expr for item in iterable if condition]`- includes only items that satisfy the condition
- **Conditional expressions:** `[true_val if condition else false_val for item in iterable]` - transforms each item based on condition
- **Multiple conditions:** Combine with `and`/`or` in the filter
- **Complex filtering:** Can include multiple logic steps (like email validation)
- **Nested conditions:** Chain `if-else` expressions for multi-level logic
- **Readability:** Break complex comprehensions across multiple lines
- **Order matters:** Filter `if` goes at the end, conditional expression goes before `for`

:::
