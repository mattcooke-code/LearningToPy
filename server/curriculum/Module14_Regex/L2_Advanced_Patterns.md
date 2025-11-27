# 🎯 Quantifiers, Character Sets, and Anchors

To match complex structures like phone numbers, URLs, or dates, you need tools to define how many times a character can repeat and what specific characters are allowed. This is done using **Quantifiers**, **Character Sets**, and **Anchors**.

## 1. Quantifiers (How Many?)

Quantifiers control the number of repetitions of the preceding character or group.

| Quantifier | Meaning                           | Example Pattern | Matches                           |
| ---------- | --------------------------------- | --------------- | --------------------------------- |
| `*`        | Zero or more times                | `r"a*b"`        | "b", "ab", "aaab"                 |
| `+`        | One or more times                 | `r"a+b"`        | "ab", "aaab" (but not "b")        |
| `?`        | Zero or one time (Optional)       | `r"colou?r"`    | "color", "colour"                 |
| `{N}`      | Exactly N times                   | `r"\d{4}"`      | "1984" (but not "123" or "12345") |
| `{N,}`     | N or more times                   | `r"\d{3,}"`     | "123", "123456"                   |
| `{N,M}`    | Between N and M times (inclusive) | `r"a{2,4}"`     | "aa", "aaa", "aaaa"               |

```python
import re

text = "Data points: 1, 22, 333, 44444"

# Match one or more digits

pattern = r"\d+"

matches = re.findall(pattern, text)
print(matches) # Output: ['1', '22', '333', '44444']
```

## 2. Character Sets (`[...]`)

A character set, defined by square brackets (`[]`), matches any single character inside the brackets. This is much more precise than using the wildcard `.`

| Set        | Meaning                                              | Example       | Matches                      |
| ---------- | ---------------------------------------------------- | ------------- | ---------------------------- |
| `[aeiou]`  | Matches any single vowel.                            | `r"[aeiou]t"` | "at", "it", "ot"             |
| `[0-5]`    | Matches any digit from 0 through 5.                  | `r"[0-5]"`    | "0", "1", "2", "3", "4", "5" |
| `[a-zA-Z]` | Matches any single lowercase or uppercase letter.    |               |                              |
| `[^abc]`   | Matches any single character that is NOT a, b, or c. | `r"[^0-9]"`   | Any non-digit character      |

```python
# Match a hexadecimal digit (0-9 or A-F/a-f)

pattern = r"[0-9a-fA-F]"
text = "Hex: A3f"
matches = re.findall(pattern, text)
print(matches) # Output: ['A', '3', 'f']
```

## 3. Anchors

Anchors do not match characters; they match a **position** within the string.

| Anchor | Meaning                                                                          | Example      | Description                                     |
| ------ | -------------------------------------------------------------------------------- | ------------ | ----------------------------------------------- |
| `^`    | Matches the start of the string.                                                 | `r"^Hello"`  | Only matches if the string begins with "Hello". |
| `$`    | Matches the end of the string.                                                   | `r"World$"`  | Only matches if the string ends with "World".   |
| `\b`   | Matches an empty string, but only at the start or end of a word (word boundary). | `r"\bcar\b"` | Matches "car" but not "carbide".                |

```python
text1 = "START HERE"
text2 = "Check this"

# Matches text1 because it starts with 'S'

match1 = re.search(r"^S", text1)
print(f"Match 1: {match1.group()}") # Output: S

# Does not match text2 because it doesn't end with 'T'

match2 = re.search(r"T$", text2)
print(f"Match 2: {match2}") # Output: None
```
