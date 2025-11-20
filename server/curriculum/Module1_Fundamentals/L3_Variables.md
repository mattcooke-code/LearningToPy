# 📦 Variables: The Labelled Box

In programming, we need a way to store and retrieve data. That's where **variables** come in.

Think of a variable as a **labelled storage box** . The label is the **variable name** (e.g., `user_age`), and the box holds the **value** (e.g., `25`).

## 1. Creating and Assigning

In Python, you create a variable using the **assignment operator**, which is the single equals sign (`=`).

```python
# The value "Alice" is assigned to the variable 'name'
name = "Alice"

# The number 25 is assigned to the variable 'age'
age = 25

# We can reuse a variable name to change its value:
age = 26 # 'age' now holds 26 instead of 25
```

## 2. Python's Naming Rules

Variable names must be descriptive and follow a few simple rules:

They must start with a letter `(a-z, A-Z)` or an underscore `(\_)`.

They cannot start with a number.

They can only contain letters, numbers, and underscores.

They are Case Sensitive (Name and name are treated as two different variables).

## 3. Best Practice: Snake Case

The Python community strongly prefers `snake_case` for variable names, where words are separated by underscores.

## 4. Retrieving a Value

To see what a variable holds, you simply use its name with the `print()` function:

```python
favorite_pet = "dog"
print(favorite_pet) # Output: dog
```

Try It: Assign your favorite food to a variable and print it out!
