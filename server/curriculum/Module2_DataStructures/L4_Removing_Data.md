# 🗑️ Removing Data from Lists

Since lists are mutable, you often need to remove elements. Python offers three primary methods for deletion, and they each handle removal slightly differently based on whether you know the **value** or the **index** of the item you want to delete.

## 1. Removing by Value: `list.remove(value)`

The `remove()` method is used when you know the **value** of the item you want to delete, but not necessarily its position.

- It removes the **first occurrence** of the specified value.
- If the value is not found in the list, it raises a `ValueError`.

```python
shopping_list = ["Milk", "Eggs", "Bread", "Milk", "Cheese"]
shopping_list.remove("Milk")

print(shopping_list) # Output: ['Eggs', 'Bread', 'Milk', 'Cheese']
# Note: Only the first 'Milk' was removed.
```

## 2. Removing by Index: `list.pop(index)`

The `pop()` method removes an item based on its index and, crucially, returns the removed item. This is often used when you need to remove an item and use that item later.

If you call `pop()` without an index, it defaults to removing and returning the last item in the list.

```python

# A level containing a Goomba, a Koopa, and a Fire Flower
level_entities = ["Goomba", "Koopa", "Fire Flower"]

# Mario grabs the item at index 2
power_up = level_entities.pop(2)

print(level_entities) # Output: ['Goomba', 'Koopa']
print(power_up)       # Output: 'Fire Flower' (Mario now has it!)

# Mario defeats the last enemy in the list
defeated_enemy = level_entities.pop()
print(level_entities) # Output: ['Goomba']

```

## 3. Removing by Index/Slice: The `del` Keyword

The built-in Python keyword `del` (delete) allows you to remove an element by index, or even a whole slice of elements at once. Unlike `pop()`, `del` does not return the removed value.

You must specify the list and the index/slice.

```python
inventory = ["Apple", "Banana", "Cherry", "Date"]

# Delete the item at index 2 ('Cherry')
del inventory[2]
print(inventory) # Output: ['Apple', 'Banana', 'Date']

# Delete a range (slice) of items from index 0 up to 2 (exclusive)
del inventory[0:2]
print(inventory) # Output: ['Date']
```

| Method     | Criteria                        | Return Value     | Common Use Case                                                   |
| ---------- | ------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `remove()` | Removes by Value                | None             | Deleting an item where you don't know the index.                  |
| `pop()`    | Removes by Index (or last item) | The Removed Item | Removing an item you need to process or show the user.            |
| `del`      | Removes by Index or Slice       | None             | Deleting an item or range of items when you don't need the value. |
