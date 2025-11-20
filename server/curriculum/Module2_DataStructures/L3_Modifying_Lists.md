# ✍️ Modifying Your Lists

Lists in Python are **mutable**, meaning they can be changed after they are created. This is a key feature that separates them from other data structures like **Tuples**, which are immutable.

You can modify a list in two primary ways: by changing an existing element, or by adding new elements.

## 1. Changing Elements by Index

You can change the value of an item in a list by referring to its index and assigning a new value using the assignment operator (`=`).

```python
shopping_list = ["Milk", "Eggs", "Bread"]
print(shopping_list) # Output: ['Milk', 'Eggs', 'Bread']

# Change the item at index 0 (Milk) to Yogurt
shopping_list[0] = "Yogurt"
print(shopping_list) # Output: ['Yogurt', 'Eggs', 'Bread']
```

## 2. Adding Elements

There are several built-in methods (functions that belong to an object) you can use to add items to a list.

`list.append(item)`
The `append()` method adds a single item to the very end of the list.

```python
tasks = ["Coding", "Debugging"]
tasks.append("Testing")
print(tasks) # Output: ['Coding', 'Debugging', 'Testing']
```

## `list.insert(index, item)`

The `insert()` method is used to add an item at a specific position in the list. The existing items are shifted to the right to make room for the new item.

```python
priorities = ["High", "Medium", "Low"]

# Insert "Critical" at index 0 (the front)
priorities.insert(0, "Critical")
print(priorities) # Output: ['Critical', 'High', 'Medium', 'Low']

# Insert "Optional" at index 3
priorities.insert(3, "Optional")
print(priorities) # Output: ['Critical', 'High', 'Medium', 'Optional', 'Low']
```

## `list.extend(iterable)`

The `extend()` method is used to add all the elements of another list (or any other iterable) to the end of the current list.

```python
list_a = [1, 2, 3]
list_b = [4, 5]
list_a.extend(list_b)
print(list_a) # Output: [1, 2, 3, 4, 5]
```

⚡ The Plus Operator (+): You can also use the `+` operator to combine two lists, but this creates a new list entirely, rather than modifying the original list in place. Use append/insert/extend when you want to change the existing list.
