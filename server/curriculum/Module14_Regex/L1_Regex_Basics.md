# 🔎 Introduction to Regex Syntax and `re.search()`

In Python, we often need to find specific pieces of information inside a mountain of text. But what if you aren't looking for a specific word, but a type of thing—like a 3-digit code or a date? **Regex** (_Regualar Expressions_) is a special language used to describe these patterns so Python can find, extract, or fix them instantly.

:::note
Think of **Regex** as a 'Super Find-and-Replace.' While a standard search looks for exact words, Regex lets you search for **_patterns_**. Whether you need to pluck every phone number out of a giant document or check if an email address is formatted correctly, Regex is the tool that does the heavy lifting for you.
:::

Python handles regular expressions through the built-in `re` module.

## 1. The `re` Module

You must import the `re` module before using any regex functions:

```python
import re
```

The core functions in `re` all take a **pattern** (the regex string) and a **text string** (the data to search).

## 2. Basic Matching and Raw Strings

### A. Simple Matching

The simplest pattern matches itself exactly.

```python
import re
text = "The quick brown fox."
pattern = "fox"

# re.search() returns a Match object if successful, None otherwise.

match = re.search(pattern, text)

if match:
    print("Pattern found!")
    print(f"Start index: {match.start()}") # 16
    print(f"End index: {match.end()}") # 19
    print(f"Matched text: {match.group()}") # fox
# .group() returns the actual text that matched the pattern
else:
    print("Pattern not found.")
```

### B. Raw Strings (Crucial for Regex)

In Python, the backslash (`\`) is used to escape characters in regular strings (e.g., `\n` for newline). Since regex heavily uses backslashes for its own special sequences (e.g., `\d` for digit), you must use **raw strings** (prefix the string with `r`) to prevent Python from interpreting the backslashes prematurely.

:::tip
**Always use raw strings for regex patterns**: `pattern = r"Your\Regex\Here"`
:::

## 3. Special Characters

Regex introduces special characters that don't match literally but define a class of characters or a position.

| Character | Meaning                                                 | Raw String Example                   |
| --------- | ------------------------------------------------------- | ------------------------------------ |
| `.`       | Matches any character (except newline).                 | `r"c.t"` matches "cat", "cot", "c!t" |
| `\d`      | Matches any digit (0-9).                                | `r"ID\d\d\d"` matches "ID123"        |
| `\w`      | Matches any word character (alphanumeric + underscore). | `r"\_.\w"` matches "\_A" or "\_1"    |
| `\s`      | Matches any whitespace character (space, tab, newline). | `r"Hello\sWorld"`                    |

:::note
The capitalized versions match the inverse:

• `\D`: Matches any non-digit.

• `\W`: Matches any non-word character.

• `\S`: Matches any non-whitespace character.
:::

## 4. `re.search()` vs. `re.match()`

Both functions look for a match, but their starting points are different:

| Function                   | Description                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `re.search(pattern, text)` | Scans through the entire `text` string looking for the first location where the `pattern` produces a match. |
| `re.match(pattern, text)`  | Only attempts to match the `pattern` at the **beginning** of the `text` string.                             |

```python
text = "The code is ID555"
pattern = r"\d\d\d" # Pattern: three digits

# Search finds the match starting at index 12

search_result = re.search(pattern, text)
print(f"Search Result: {search_result.group()}") # Output: 555

# Match fails because the string does not start with three digits

match_result = re.match(pattern, text)
print(f"Match Result: {match_result}") # Output: None
```

:::tip
When in doubt, use `re.search()`
:::

:::summary

- **Regular expressions** (regex) are patterns for searching and manipulating text
- Import the `re` module to use regex in Python
- **Always use raw strings** (`r"pattern"`) for regex to avoid escaping issues
- `re.search()` scans the **entire string** for a match anywhere
- `re.match()` only checks for a match at the **beginning** of the string
- Special characters: `\d` (digit), `\w` (word char), `\s` (whitespace), `.` (any char)
- Capitalized versions (`\D`, `\W`, `\S`) match the **opposite**
- A successful match returns a **Match object** with methods like `.group()`, `.start()`, `.end()`
- If no match is found, the function returns `None`

:::
