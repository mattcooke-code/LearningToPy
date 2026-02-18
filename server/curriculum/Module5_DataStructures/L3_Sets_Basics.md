# 🏷️ Sets: Unique, Unordered Collections

A **Set** is an unordered collection of unique elements. It is one of Python's four main built-in data structures (alongside Lists, Tuples, and Dictionaries).

Sets are primarily used when the presence of an element is important, but its order or frequency is not.

## 1. Defining a Set

Sets are defined using **curly braces** (`{}`) or by casting another iterable (like a list or tuple) with the **`set()` constructor**.

:::note
An empty pair of curly braces `{}` creates an empty **Dictionary**, not an empty Set. To create an empty Set, you must use `set()`.
:::

### Creation Examples

```python
# 1. Using curly braces (only works if you add elements)
valid_tags = {"python", "programming", "backend"}

# 2. Using the set() constructor to create an empty set
empty_set = set()

# 3. Casting a list (duplicates are automatically removed)
mixed_list = [1, 2, 2, 3, 1, 4]
unique_numbers = set(mixed_list)
# unique_numbers is now: {1, 2, 3, 4}
```

:::warning
**Immutable Elements Only:** Set elements must be immutable (hashable). You can't put lists or other sets inside a set because they're mutable. Use tuples instead: `{(1, 2), (3, 4)}` works, but `{[1, 2], [3, 4]}` doesn't.
:::

## 2. The Key Property: Uniqueness

When you create a set from a sequence that contains duplicates, the set will automatically discard them. This is the most common use case for a set: **deduplication**.

```python
user_ids = [101, 205, 101, 310, 205]
unique_ids = set(user_ids)
# unique_ids contains only three items: {101, 205, 310}
```

## 3. Basic Set Operations

Unlike the elements contained within them, sets **_are_** mutable, so you can add and remove elements after creation.

### A. Adding Elements: `.add()`

Use the `.add()` method to introduce a single element. If the element already exists, the set simply ignores the command.

```python
colors = {"red", "green"}
colors.add("blue")
# colors is now: {"red", "green", "blue"}
colors.add("red")
# Set remains unchanged because "red" is a duplicate.
```

### B. Removing Elements: `.remove()` and `.discard()`

`.remove(element)`: Removes the element. If the element is not in the set, it raises a `KeyError`.

`.discard(element)`: Removes the element. If the element is not in the set, it does nothing (no error). Use this for safer deletion.

```python
fruits = {"apple", "banana", "kiwi"}
fruits.discard("banana") # Safe removal
fruits.remove("apple")   # Removal
# fruits is now: {"kiwi"}
```

:::note

- **The Set is Mutable:** You can add or remove items from the collection at any time.
- **The Items are Immutable:** Every individual item you put into a set must be a type that cannot change (like a string, integer, or tuple).
  :::

## 4. Membership Testing

Like lists and tuples, you can efficiently check if an element is present in a set using the `in` operator.

```python
required_permissions = {"read", "write", "execute"}
user_perm = "write"

if user_perm in required_permissions:
    print("Permission granted.")
```

:::tip
**Speed Advantage:** Checking if an item exists using `in` is significantly faster in a **Set** than in a **List**. If your main goal is to constantly check "Is this item in my collection?", a set is your best friend.
:::

:::summary

- Sets store **unique, unordered** elements using `{element}` or `set()`
- **Empty set**: Must use `set()` not `{}` (that's an empty dict)
- **Main use**: Remove duplicates from lists/tuples
- **Add elements**: `.add(element)` (ignores if already exists)
- **Remove elements**: `.remove(element)` (errors if missing) or `.discard(element)` (safe)
- **Membership testing**: Very fast with `in` operator
- Sets are **mutable** but elements must be immutable

:::
