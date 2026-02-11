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

The `continue` keyword is used to skip the rest of the code inside the loop for the current iteration only. The loop immediately jumps to the next item or re-evaluates the `while` condition.

### Common Use Case: Filtering

`continue` is useful for filtering data or skipping items that do not meet a certain condition.

```python
scores = [85, 42, 98, 55, 70]  # 50 is failing

for score in scores:
    if score < 60:
        print("Score", score, "is failing. Skipping evaluation.")
        continue  # Skips the rest of the code below for this score

    print("Score", score, "is passing! Analyzing...")

# Output:
# Score 85 is passing! Analyzing...
# Score 42 is failing. Skipping evaluation.
# Score 98 is passing! Analyzing...
# Score 55 is failing. Skipping evaluation.
# Score 70 is passing! Analyzing...
```

## 3. `break` vs `continue`: Comparison

| Keyword    | Action | Effect                                                                                  |
| ---------- | ------ | --------------------------------------------------------------------------------------- |
| `break`    | Exits  | The loop is permanently terminated.                                                     |
| `continue` | Skips  | Only the current iteration is skipped; the loop continues with the next item/condition. |

:::warning
**Use Sparingly:** Overusing `break` and `continue` can make your code harder to follow. Sometimes it's clearer to structure your conditions differently. Use them when they genuinely simplify the logic, not just to skip writing proper conditions.
:::

## 4. Practical Example: Input Validation Loop

```python
# Keep asking for a valid number between 1 and 10
while True:
    user_input = input("Enter a number between 1 and 10: ")

    # Check if input is a number
    if not user_input.isdigit():
        print("That's not a number. Try again.")
        continue  # Skip to next iteration

    number = int(user_input)

    # Check if number is in valid range
    if number < 1 or number > 10:
        print("Number must be between 1 and 10.")
        continue  # Skip to next iteration

    # If we get here, input is valid
    print("Valid number entered:", number)
    break  # Exit the loop

print("Thank you for entering a valid number.")
# Example output if user enters "abc", then "15", then "7":
# That's not a number. Try again.
# Number must be between 1 and 10.
# Valid number entered: 7
# Thank you for entering a valid number.
```

:::tip
**The `while True:` Pattern:** Using `while True:` with `break` is a common and clean pattern for input validation or menus. The loop runs forever until a specific condition (checked inside) triggers a `break`. This is often clearer than trying to craft the perfect `while` condition.
:::

:::summary

- `break` **exits** the loop immediately (permanently)
- `continue` **skips** current iteration and continues to next
- Use `break` when you find what you're searching for
- Use `continue` to filter/skip unwanted items
- `break` stops all further iterations
- `continue` only skips current iteration's remaining code
- Often used with `while True:` for input validation

:::
