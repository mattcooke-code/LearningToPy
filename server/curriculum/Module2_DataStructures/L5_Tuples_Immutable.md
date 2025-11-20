# 🔒 Tuples: The Immutable List

While **Lists** are the general-purpose, mutable workhorse of Python, **Tuples** offer a structure for collections of data that should _not_ change. They are lists with a strict "no modifications allowed" policy.

## 1. Defining a Tuple

Tuples are created using **parentheses** `()`, and items are separated by commas.

- Technically, the **comma** is what defines a tuple, not the parentheses. The parentheses just make them easier to read.
- Tuples, like lists, are **ordered** and can hold mixed data types.

```python
# The standard way to define a tuple
coordinates = (10.0, 20.0, 5.0)

# A tuple containing different data types
user_info = ("Mark", 35, True)

# Defining a tuple with a single item (requires the comma!)
single_item_tuple = (5,)
```

## 2. Accessing Elements

Because tuples are ordered, you access elements exactly the same way you do with lists: using indexing and slicing.

```python
planets = ("Mars", "Jupiter", "Saturn")
# Index:    0       1         2

print(planets[1])    # Output: Jupiter
print(planets[-1])   # Output: Saturn
print(planets[0:2])  # Output: ('Mars', 'Jupiter')
```

## 3. Immutability: The Key Difference

The most important property of a tuple is that it is immutable—you cannot change its contents after creation.

If you try to use methods like `append()`, `remove()`, or assign a new value to an index, Python will raise a `TypeError`.

```python
settings = ('max_users', 50)

# ❌ This will cause a TypeError!
# settings[1] = 100

# ✅ Workaround: Reassigning the entire variable is allowed,
# but it creates a brand new tuple in memory.
settings = ('max_users', 100)
```

## 4. When to Use Tuples

Tuples should be used instead of lists in a few common scenarios:

Fixed Data: For data that inherently should not change, such as RGB color codes, geographical coordinates, or days of the week.

Performance: Tuples are generally slightly faster to process than lists.

Safety: They prevent accidental modification of critical data.

Dictionary Keys: Unlike lists, tuples can be used as keys in dictionaries because of their immutability (you will learn more about this in Module 5).
