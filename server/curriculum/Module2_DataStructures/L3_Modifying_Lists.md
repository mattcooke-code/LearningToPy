# ✍️ Modifying Your Lists

Lists in Python are **mutable**, meaning they can be changed after they are created. This is a key feature that separates them from other data structures like **Tuples**, which are immutable.

You can modify a list in two primary ways: by changing an existing element, or by adding new elements.

## 1. Changing Elements by Index

You can change the value of an item in a list by referring to its index and assigning a new value using the assignment operator (`=`).

```python
# The Gauntlet currently holds a placeholder 'Empty Slot' at index 0
gauntlet = ["Empty Slot", "Space Stone", "Reality Stone"]

# Let's replace the empty slot with the Power Stone
gauntlet[0] = "Power Stone"

print(gauntlet)
# Output: ['Power Stone', 'Space Stone', 'Reality Stone']
```

## 2. Adding Elements

There are several built-in methods (functions that belong to an object) you can use to add items to a list.

`list.append(item)`
The `append()` method adds a single item to the very end of the list.

```python
stones = ["Power", "Space", "Reality"]
stones.append("Soul")

print(stones)
# Output: ['Power', 'Space', 'Reality', 'Soul']
```

## `list.insert(index, item)`

The `insert()` method is used to add an item at a specific position in the list. The existing items are shifted to the right to make room for the new item.

```python

gauntlet = ["Power", "Space", "Reality", "Soul"]

gauntlet.insert(2, "Mind")

print(gauntlet)
# Output: ['Power', 'Space', 'Mind', 'Reality', 'Soul']
```

## `list.extend(iterable)`

The `extend()` method is used to add all the elements of another list (or any other iterable) to the end of the current list.

```python
current_stones = ["Space", "Power"]
just_acquired = ["Time", "Mind"]

current_stones.extend(just_acquired)

print(current_stones)
# Output: ['Space', 'Power', 'Time', 'Mind']
```

:::tip
If you're adding multiple items, `extend()` is more efficient than repeatedly calling `append()` in a loop. For example: `list.extend([item1, item2, item3])` instead of three separate `append()` calls.
:::

:::note
⚡ **The Plus Operator (+)**: You can also use the `+` operator to combine two lists, but this creates a new list entirely, rather than modifying the original list in place. Use append/insert/extend when you want to change the existing list.
:::

:::summary

- Lists are **mutable** - you can change their contents
- Modify elements directly by index: `list[0] = "new"`
- Use `append()` to add to the end
- Use `insert(index, item)` to add at specific positions
- Use `extend()` to combine lists (modifies original)
- The `+` operator creates a new list

:::
