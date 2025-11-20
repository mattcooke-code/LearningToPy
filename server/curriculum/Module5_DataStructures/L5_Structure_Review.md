# 🧭 Data Structure Review: Choosing the Right Tool

You have now learned about Python's four main built-in data structures: **Lists**, **Tuples**, **Dictionaries**, and **Sets**. Knowing the strengths and limitations of each is critical for writing efficient and reliable Python code.

The choice of structure usually comes down to three key factors: **Order**, **Mutability**, and **Uniqueness**.

## 1. Quick Comparison Table

| Structure  | Order (Sequence)  | Mutable (Changeable)  |       Duplicates Allowed        |   Access Method   | Primary Use Case                                                  |
| :--------: | :---------------: | :-------------------: | :-----------------------------: | :---------------: | :---------------------------------------------------------------- |
| **List**   | ✅ Yes (Indexed)  | ✅ Yes                |       ✅ Yes                    |  Index `[0]`      | General purpose, sequences that need modification.                |
| **Tuple**  | ✅ Yes (Indexed)  | ❌ No (Immutable)     |       ✅ Yes                    |  Index `[0]`      | Fixed data, function return values, faster processing.            |
| **Dict**   | ✅ Yes (Keyed)    | ✅ Yes                |   ❌ No (Keys must be unique)   | Key `["key"]`     | Key-value mapping, lookups by identifier.                         |
| **Set**    | ❌ No             | ✅ Yes                | ❌ No (Elements must be unique) | Membership `in`   | Deduplication, membership testing, set math (union/intersection). |

## 2. Choosing the Right Structure

Use the following questions to guide your decision:

### When to use a **List** `[ ]`

- Do you need an ordered collection of items?
- Do you need to **add, remove, or modify** items after creation?
- _Example: A queue of pending tasks, a shopping cart._

### When to use a **Tuple** `( )`

- Do you need an ordered collection of items?
- Will the collection **never change** after creation (immutable)?
- _Example: RGB color codes, geographical coordinates (latitude, longitude)._

### When to use a **Dictionary** `{ key: value }`

- Do you need to store data as **pairs** (a label/key and its associated value)?
- Do you need to look up a value **quickly** based on its name or ID?
- _Example: User profiles, configuration settings, language translations._

### When to use a **Set** `{ unique_item }`

- Do you need to ensure **every item is unique**?
- Is the order of elements unimportant?
- Do you need to perform mathematical operations like finding common items (intersection)?
- _Example: A collection of unique tags applied to an article, a list of active user IDs._
