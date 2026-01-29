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

# A log of active quests for a hero
quest_log = ["Find the Lost Sword", "Defeat the Dragon", "Rescue the Villager"]

# The hero completes the quest at index 1 (Defeat the Dragon)
# We 'pop' it so we can announce the reward
completed_quest = quest_log.pop(1)

print(quest_log)       # Output: ['Find the Lost Sword', 'Rescue the Villager']
print(completed_quest) # Output: 'Defeat the Dragon' (Time to collect your gold!)

# The hero decides to abandon the most recent quest added
abandoned_quest = quest_log.pop() # Removes 'Rescue the villager'
print(quest_log)       # Output: ['Find the Lost Sword']

```

## 3. Removing by Index/Slice: The `del` Keyword

The built-in Python keyword `del` (delete) allows you to remove an element by index, or even a whole slice of elements at once. Unlike `pop()`, `del` does not return the removed value.

You must specify the list and the index/slice.

```python
inventory = ["Apple", "Banana", "Cherry", "Melon"]

# Delete the item at index 2 ('Cherry')
del inventory[2]
print(inventory) # Output: ['Apple', 'Banana', 'Melon']

# Delete a range (slice) of items from index 0 up to 2 (exclusive)
del inventory[0:2]
print(inventory) # Output: ['Melon']
```

| Method     | Criteria                        | Return Value     | Common Use Case                                                     |
| ---------- | ------------------------------- | ---------------- | ------------------------------------------------------------------- |
| `remove()` | Removes by Value                | None             | Deleting an item when you know what it is, but not where it is.     |
| `pop()`    | Removes by Index (or last item) | The Removed Item | Removing an item because you want to use it or move it elsewhere.   |
| `del`      | Removes by Index or Slice       | None             | "Hard delete"—cleanly removing an item or a whole chunk of the list |
