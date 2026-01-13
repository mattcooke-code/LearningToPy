# ✍️ The Ternary Operator: One-Line Logic

The **Ternary Operator** is Python's way of writing a simple `if/else` block on a single line. It is used almost exclusively for **assigning a value** to a variable based on a condition.

It is called "ternary" because it is one of the few operators in Python that takes three operands (the condition, the value if true, and the value if false).

## 1. Ternary Operator Syntax

The structure is simple but reads backward from a traditional `if/else` statement:

### `value_if_true if condition else value_if_false`

• **`value_if_true`**: The result assigned if the `condition` is `True`.

• **`if condition`**: The check that is performed.

• **`else value_if_false`**: The result assigned if the `condition` is `False`.

## 2. Example: Single-Line Assignment

Imagine you want to set a `status` based on a score.

### Traditional Multi-Line `if/else`

```python
score = 95
if score >= 60:
    status = "Passed"
else:
    status = "Failed"

```

## Ternary Operator Version

```python
score = 95
# Assign "Passed" IF score >= 60 ELSE assign "Failed"
status = "Passed" if score >= 60 else "Failed"

print(status) # Output: Passed
```

## 3. When to Use It

The ternary operator is best used for simple, two-way choices that result in assigning a variable a value.

| Use Case          | Example (Ternary)                                             |
| ----------------- | ------------------------------------------------------------- |
| Simple Flag       | `message = "Admin" if is_admin else "User"`                   |
| Numeric Choice    | `price = base_price * 0.9 if discount_active else base_price` |
| List/String Check | `title = name if name else "Untitled Document"`               |

💡 Keep it Simple: Avoid nesting ternary operators or using them for complex logic. If your logic requires elif, stick to the traditional multi-line if/elif/else structure for better readability.
