# 🛑 Controlling the Flow: `break` and `continue`

In both `for` and `while` loops, you often need to alter the loop's natural flow—either by skipping the current item or by exiting the entire loop early. The keywords **`break`** and **`continue`** allow you to do this.

## 1. The `break` Keyword: Stopping Early

The **`break`** keyword is used to **immediately terminate** the loop it is currently running in. Once `break` is executed, the program skips the remaining code in the loop and moves to the first instruction _after_ the loop.

### Common Use Case: Searching

`break` is often used when searching through a list. As soon as the desired item is found, there is no need to check the remaining items, saving processing time.

```python
search_list = ["A", "B", "Target", "C", "D"]

for item in search_list:
    if item == "Target":
        print("Target found! Exiting search.")
        break # Stops the entire 'for' loop immediately
    print(f"Checking item: {item}")

# Output:
# Checking item: A
# Checking item: B
# Target found! Exiting search.
```

## 2. The `continue` Keyword: Skipping an Iteration

The `continue` keyword is used to skip the rest of the code inside the loop for the current iteration only. The loop immediately jumps to the next item or re-evaluates the while condition.

### Common Use Case: Filtering

`continue` is useful for filtering data or skipping items that do not meet a certain condition.

```python
scores = [85, 42, 98, 55, 70] # 50 is failing

for score in scores:
    if score < 60:
        print(f"Score {score} is failing. Skipping evaluation.")
        continue # Skips the rest of the code below for this score

    print(f"Score {score} is passing! Analyzing...")

# Output:
# Score 42 is failing. Skipping evaluation.
# Score 55 is failing. Skipping evaluation.
# Score 85 is passing! Analyzing...
# Score 98 is passing! Analyzing...
# Score 70 is passing! Analyzing...
```

| Keyword    | Action | Effect                                                                                  |
| ---------- | ------ | --------------------------------------------------------------------------------------- |
| `break`    | Exits  | The loop is permanently terminated.                                                     |
| `continue` | Skips  | Only the current iteration is skipped; the loop continues with the next item/condition. |
