# 🐛 Module 15 Project: Debugging a Calculator Program

You've learned about virtual environments, package management, and debugging with `pdb`. Now it's time to put it all together in a real-world debugging scenario.

## The Scenario

You've inherited a buggy calculator program from a former colleague. The program is supposed to:

1. Welcome the user by name
2. Process a list of numbers
3. Perform addition and division on each number
4. Display the final results

However, the program has **five different bugs**. Your task is to use your debugging skills to find and fix each one.

## The Buggy Code

Here's the complete starter code with all its bugs:

```python
# Buggy Calculator Program
# Run this program and use pdb commands (n, p, c) to find each error

username = "developer"
print(f"Welcome to the Buggy Calculator, {usernme}!")

numbers = [10, 5, 8, 3]
results = []

# Missing colon here!
for i in range(len(numbers))
    # Perform calculations
    a = numbers[i]
    b = 2  # Fixed value for demonstration

    # Addition
    add_result = a - b
    results.append(add_result)

    # Division
    division_result = a / b
    print(f"Processing {a}: {a} / {b} = {division_result}")

print("\nFinal Results:")
for res in results:
print(res)
print("Program complete!")
```

## The Debugging Workflow

Remember the debugging process we learned:

|     |                    |                                             |
| --- | ------------------ | ------------------------------------------- |
| 1.  | **Identify**       | Run the program and see what errors occur   |
| 2.  | **Read the error** | Python tells you exactly what's wrong       |
| 3.  | **Locate**         | Find the line number mentioned in the error |
| 4.  | **Fix**            | Correct the code                            |
| 5.  | **Repeat**         | Test again until all bugs are fixed         |

## Your Tasks

### Task 1: Fix the SyntaxError

**Error:** `SyntaxError: expected ':'`

**Line:** 11

When you first run the program, Python immediately stops. A `for` loop is missing its colon.

**Fix:** Add a colon at the end of the for statement.

---

### Task 2: Fix the NameError

**Error:** `NameError: name 'usernme' is not defined. Did you mean: 'username'?`

**Line:** 5

After fixing the syntax, Python shows a name error. A variable is misspelled.

**Fix:** Correct the variable name in the print statement to match the variable defined above.

---

### Task 3: Fix the ZeroDivisionError

**Potential Error:** `ZeroDivisionError: division by zero`

**Line:** 21

The program could crash when dividing. Add error handling to prevent this.

**Fix:** Add an `if` statement to check if `b != 0` before dividing.

---

### Task 4: Fix the IndentationError

**Error:** `IndentationError: expected an indented block after 'for' statement`

**Line:** 26

The program runs, but the final results don't print correctly.

**Fix:** Indent the `print(res)` line to be inside the for loop.

---

### Task 5: Fix the Logic Error

**Problem:** The numbers are wrong!

**Line:** 17

The program runs without errors, but the results show subtraction instead of addition.

**Fix:** Change the `-` operator to `+` in the add_result calculation.

---

## Expected Output

When all bugs are fixed, your program should produce:

```text
Welcome to the Buggy Calculator, developer!
Processing 10: 10 / 2 = 5.0
Processing 5: 5 / 2 = 2.5
Processing 8: 8 / 2 = 4.0
Processing 3: 3 / 2 = 1.5

Final Results:
12
7
10
5
Program complete!
```

## Success Criteria

Your fixed program should:

| ✓   | Requirement                                            |
| --- | ------------------------------------------------------ |
| 1   | Welcome the user with their correct username           |
| 2   | Process all numbers without crashing                   |
| 3   | Display division results for each number               |
| 4   | Show final results that correctly add each number to 2 |
| 5   | Print all results properly formatted                   |

## Results Breakdown

The calculator adds 2 to each number:

- 10 + 2 = **12**
- 5 + 2 = **7**
- 8 + 2 = **10**
- 3 + 2 = **5**

❌ If you see `8, 3, 6, 1` instead, the logic error (Task 5) hasn't been fixed!

## Debugging Tips

:::tip
**Fix errors in order** - Python stops at the first error

**Read error messages carefully** - They tell you the line number and problem

**Test after each fix** - Make sure each fix works before moving to the next

**Use line numbers** - The error messages reference specific lines

**Check indentation** - Python is strict about spaces

:::

Good luck, debugger! 🐛🔍
