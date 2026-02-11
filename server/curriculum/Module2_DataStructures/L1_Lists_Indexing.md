# 📦 Lists: The Flexible Array

In Python, a **List** is one of the most useful and versatile built-in data structures. Think of a list as a single, labelled container that holds an ordered collection of other data. Unlike a variable, which holds one value (like `5` or `"Hello"`), a list can hold many values.

## 1. Defining a List

- Lists are created using **square brackets** `[]`, and items are separated by commas.
- Lists can hold different data types (e.g., strings, numbers, booleans) at the same time.

```python
# A list of strings
shopping_list = ["Milk", "Eggs", "Bread", "Cheese"]

# A list of mixed data types
user_data = ["Alice", 25, 5.9, True]

# An empty list
my_new_list = []
```

## 2. Accessing Elements: Indexing

Since lists are ordered, every item has an **index**, which is its position in the list. _Indexing_ is how you grab a single item from the list.

➡️ **Positive Indexing** (Starting from the front)
Indexing always starts at `0` for the first item.

The second item is at index `1`, the third at index `2`, and so on.

```python
colors = ["Red", "Green", "Blue", "Yellow"]
# Index:    0      1        2       3

print(colors[0]) # Output: Red
print(colors[2]) # Output: Blue
```

⬅️ **Negative Indexing** (Starting from the back)
Python also lets you count backward using negative indices.

The last item is at index `-1`.

The second-to-last item is at index `-2`, etc.

```python
scores = [100, 85, 92, 78]
# Index:  -4  -3  -2  -1

print(scores[-1]) # Output: 78 (The last element)
print(scores[-3]) # Output: 85 (The third element from the end)
```

## 3. Index Errors

If you try to access an index that doesn't exist, Python will raise an `IndexError`.

```python
colors = ["Red", "Green", "Blue", "Yellow"]
# Valid indices are 0, 1, 2, and 3.

# This will CRASH your program:
print(colors[10])
```

What the error looks like: `IndexError: list index out of range`

:::tip
If you have a list with 4 items, the highest index is always `3` (Length - 1). If you ever get this error, check if you accidentally used the length of the list as your index.
:::

Always ensure your index is within the valid range!

:::summary

- Lists are ordered collections created with square brackets `[]`
- Use **indexing** (`list[0]`) to access single elements (starts at 0)
- Use **negative indexing** (`list[-1]`) to access from the end
- Watch out for `IndexError` when accessing invalid indices

:::
