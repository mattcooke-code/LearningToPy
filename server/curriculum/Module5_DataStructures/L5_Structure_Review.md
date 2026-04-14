# 🧭 Data Structure Review: Choosing the Right Tool

You have now learned about Python's four main built-in data structures: **Lists**, **Tuples**, **Dictionaries**, and **Sets**. Knowing the strengths and limitations of each is critical for writing efficient and reliable Python code.

The choice of structure usually comes down to three key factors: **Order**, **Mutability**, and **Uniqueness**.

## 1. Quick Comparison Table

| Structure | Ordered  | Mutable |  Duplicates  |  Access Method  | Primary Use                         |
| :-------: | :------: | :-----: | :----------: | :-------------: | :---------------------------------- |
| **List**  |  ✅ Yes  | ✅ Yes  |    ✅ Yes    |   Index `[0]`   | General sequences, modifiable data  |
| **Tuple** |  ✅ Yes  |  ❌ No  |    ✅ Yes    |   Index `[0]`   | Fixed data, function returns, speed |
| **Dict**  | ✅ Yes\* | ✅ Yes  | ❌ No (keys) |  Key `["key"]`  | Key-value mappings, lookups         |
|  **Set**  |  ❌ No   | ✅ Yes  |    ❌ No     | Membership `in` | Deduplication, set math, membership |

\*Dictionaries preserve insertion order as of Python 3.7+

:::tip
**The Zen of Python:** "There should be one—and preferably only one—obvious way to do it." When choosing a data structure, ask: "What's the most obvious structure for this data?" Usually, the answer aligns with the primary use cases in the table above.
:::

## 2. Choosing the Right Structure

Use the following questions to guide your decision:

### When to use a **List** `[ ]`

• Do you need an ordered collection of items?

• Do you need to **add, remove, or modify** items after creation?

_Example: Items in a shopping cart._

### When to use a **Tuple** `( )`

• Do you need an ordered collection of items?

• Will the collection **never change** after creation (immutable)?

_Examples: RGB color codes, geographical coordinates (latitude, longitude)._

### When to use a **Dictionary** `{ key: value }`

• Do you need to store data as **pairs** (a label/key and its associated value)?

• Do you need to look up a value **quickly** based on its name or ID?

_Examples: User profiles, configuration settings, language translations._

### When to use a **Set** `{ unique_item }`

• Do you need to ensure **every item is unique**?

• Is the order of elements unimportant?

• Do you need to perform mathematical operations like finding common items (intersection)?

_Examples: A collection of unique tags applied to an article, a list of active user IDs._

:::summary

- **Lists**: Ordered, mutable, allows duplicates - general purpose sequences
- **Tuples**: Ordered, immutable, allows duplicates - fixed data
- **Dictionaries**: Key-value pairs, mutable, unique keys - lookups by name
- **Sets**: Unordered, mutable, unique elements - deduplication and set math
- **Choose based on**: Need for order, mutability, uniqueness, and access pattern
- Each structure has specific strengths - use the right tool for the job!

:::
