# 📦 Lists: The Flexible Array

In Python, a **List** is one of the most useful and versatile built-in data structures. Think of a list as a single, labeled container that holds an ordered collection of other data. Unlike a variable, which holds one value (like `5` or `"Hello"`), a list can hold many values.

## 1. Defining a List

Lists are created using **square brackets** `[]`, and items are separated by commas.

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
Indexing always starts at 0 for the first item.

The second item is at index 1, the third at index 2, and so on.

```python

colors = ["Red", "Green", "Blue", "Yellow"]
# Index:    0      1        2       3

print(colors[0]) # Output: Red
print(colors[2]) # Output: Blue
```

⬅️ **Negative Indexing** (Starting from the back)
Python also lets you count backward using negative indices.

The last item is at index -1.

The second-to-last item is at index -2, etc.

```python

scores = [100, 85, 92, 78]
# Index:  -4  -3  -2  -1

print(scores[-1]) # Output: 78 (The last element)
print(scores[-3]) # Output: 85 (The third element from the end)
```

## 3. Index Errors

If you try to access an index that doesn't exist (e.g., index 10 in a 4-item list), Python will raise an `IndexError`. Always ensure your index is within the valid range!
