# 🔎 Introduction to Regex Syntax and `re.search()`

**Regular Expressions** (Regex) are specialized text strings used to describe search patterns. They are indispensable tools for validating data, parsing complex text (like logs or HTML), and performing sophisticated find-and-replace operations.

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
else:
print("Pattern not found.")
```

### B. Raw Strings (Crucial for Regex)

In Python, the backslash (`\`) is used to escape characters in regular strings (e.g., `\n` for newline). Since regex heavily uses backslashes for its own special sequences (e.g., `\d` for digit), you must use **raw strings** (prefix the string with `r`) to prevent Python from interpreting the backslashes prematurely.

**Always use raw strings for regex patterns**: `pattern = r"Your\Regex\Here"`

## 3. Special Characters

Regex introduces special characters that don't match literally but define a class of characters or a position.

| Character | Meaning                                                 | Raw String Example                   |
| --------- | ------------------------------------------------------- | ------------------------------------ |
| `.`       | Matches any character (except newline).                 | `r"c.t"` matches "cat", "cot", "c!t" |
| `\d`      | Matches any digit (0-9).                                | `r"ID\d\d\d"` matches "ID123"        |
| `\w`      | Matches any word character (alphanumeric + underscore). | `r"\_.\w"` matches "\_A" or "\_1"    |
| `\s`      | Matches any whitespace character (space, tab, newline). | `r"Hello\sWorld"`                    |

The capitalized versions match the inverse:

• `\D`: Matches any non-digit.

• `\W`: Matches any non-word character.

• `\S`: Matches any non-whitespace character.

## 4. `re.search()` vs. `re.match()`

Both functions look for a match, but their starting points are different:

• `re.search(pattern, text)`: Scans through the entire `text` string looking for the first location where the `pattern` produces a match.

• `re.match(pattern, text)`: Only attempts to match the `pattern` at the **beginning** of the `text` string.

```python
text = "The code is ID55"
pattern = r"\d\d\d" # Pattern: three digits

# Search finds the match starting at index 12

search_result = re.search(pattern, text)
print(f"Search Result: {search_result.group()}") # Output: 555

# Match fails because the string does not start with three digits

match_result = re.match(pattern, text)
print(f"Match Result: {match_result}") # Output: None
```
