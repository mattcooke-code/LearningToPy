# 🎣 Capturing Groups and Data Extraction

In real-world data parsing, you often want to find a complex pattern (like a full phone number) but only need to extract a small, specific part of it (like the area code). **Capturing groups**, defined by parentheses `()`, allow you to isolate and extract specific substrings from a match.

## 1. Defining and Accessing Groups

Any part of a regex pattern enclosed in parentheses `()` becomes a capturing group. These groups are numbered starting from 1. Group 0 is always the entire match.

### Syntax: `(pattern1)(pattern2)`

```python
import re

# Goal: Match a full email address, but capture only the username and domain separately.
text = "Contact us at support@company.com or sales@competitor.net"
pattern = r"(\w+)@(\w+\.com)"
# Group 1: (\w+) - The username
# Group 2: (\w+\.com) - The domain (specifically .com)

match = re.search(pattern, text)

if match:
    print(f"Full Match (Group 0): {match.group(0)}")
    print(f"Username (Group 1): {match.group(1)}")
    print(f"Domain (Group 2): {match.group(2)}")
    print(f"All Groups as Tuple: {match.groups()}")

    # You can also access groups by index in a list/tuple structure
    username, domain = match.groups()
    print(f"Extracted: {username} on {domain}")
```

## 2. Using `re.findall()` for Capturing Groups

When `re.findall()` is used with a pattern that contains capturing groups, it does not return the full match. Instead, it returns a list of tuples, where each tuple contains the strings matched by the capturing groups.

If there is only one capturing group, it returns a list of strings (not tuples).

```python
import re

log_data = "ERROR code: 404, WARNING code: 501, INFO code: 200"

# Pattern 1: One Capturing Group (just the code)
pattern1 = r"code: (\d{3})"
matches1 = re.findall(pattern1, log_data)
print(f"Single Group Findall: {matches1}")
# Output: ['404', '501', '200'] (List of strings)

# Pattern 2: Two Capturing Groups (the type and the code)
pattern2 = r"(\w+?) code: (\d{3})"
# Group 1: (\w+?) - The log level (non-greedy match)
# Group 2: (\d{3}) - The code
matches2 = re.findall(pattern2, log_data)
print(f"Multiple Groups Findall: {matches2}")
# Output: [('ERROR', '404'), ('WARNING', '501'), ('INFO', '200')] (List of tuples)
```

## 3. Non-Capturing Groups (`(?:...)`)

Sometimes you need to group parts of a regex for applying quantifiers or alternation (`|`), but you don't need to extract the content. In this case, use a **non-capturing group** by starting the parenthesis with `?:`.

```python
# Match 'Apple' or 'Banana', followed by 'Pie' or 'Muffin'
# If we don't use non-capturing groups, we get the middle part
pattern_bad = r"(Apple|Banana)( Pie| Muffin)"

# If we only want the entire dessert name, use non-capturing groups
pattern_good = r"(?:Apple|Banana)(?: Pie| Muffin)"
# Only Group 0 (the full match) is captured.

text = "I want a Banana Muffin."
match = re.search(pattern_good, text)

# This is less commonly needed than capturing groups, but good practice for pattern clarity.
```
