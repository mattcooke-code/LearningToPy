# 🔄 Substitution and Splitting with `re.sub()` and `re.split()`

Regex isn't just for finding patterns; it's also excellent for transforming strings. The `re.sub()` function allows for powerful search-and-replace, and `re.split()` allows you to split a string using complex delimiters.

## 1. Substitution with `re.sub()`

The `re.sub()` function performs a search-and-replace operation based on a regex pattern.

## Syntax: `re.sub(pattern, replacement, string, count=0, flags=0)`

• `pattern`: The regex to search for.

• `replacement`: The string or function to replace the matched pattern with.

• `string`: The text to process.

• `count`: The maximum number of pattern occurrences to replace (0 means all).

### A. Simple Substitution

Replacing all occurrences of whitespace with a single dash (`-`).

```python
import re

text = "apple banana\tcherry" # Contains multiple spaces and a tab

# Pattern: one or more whitespace characters

pattern = r"\s+"

# Replace all matches with a single space

cleaned_text = re.sub(pattern, " ", text)

print(cleaned_text)

# Output: apple banana cherry
```

### B. Substitution using Capturing Groups

You can reference capturing groups from the matched pattern in the replacement string using `\1`, `\2`, etc. This is useful for reordering data.

```python
import re

# Format: Month-Day-Year

date = "11-25-2025"

# Pattern: (\d{2}) is Group 1 (Month), (\d{2}) is Group 2 (Day), (\d{4}) is Group 3 (Year)

pattern = r"(\d{2})-(\d{2})-(\d{4})"

# Replacement: Reorder to Year/Month/Day using \3/\1/\2

replacement = r"\3/\1/\2"

new_date = re.sub(pattern, replacement, date)

print(new_date)

# Output: 2025/11/25#
```

## 2. Splitting with `re.split()`

The standard `str.split()` method only accepts a fixed delimiter (e.g., `","`). `re.split()` allows you to split a string using a regex pattern, meaning you can split based on multiple different delimiters or complex patterns.

**Syntax**: `re.split(pattern, string, maxsplit=0, flags=0)`

```python
import re

log_line = "User:Bob|ID:456|Time:10:30"

# Pattern: Matches either a colon (:) OR a pipe (|)

pattern = r"[:|]"

fields = re.split(pattern, log_line)
print(fields)

# Output: ['User', 'Bob', 'ID', '456', 'Time', '10', '30']
```

In the example above, standard splitting would require multiple steps, but `re.split()` handles both delimiters simultaneously, simplifying the code greatly.
