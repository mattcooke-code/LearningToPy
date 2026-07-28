# 🚀 Project: Student Grade Analytics System

Build a grade analytics system that processes student data using all the comprehension techniques you've learned in this module.

## The Challenge

You'll process student grade data and generate various analytics reports. This project combines **list comprehensions**, **conditional comprehensions**, **dictionary comprehensions**, and **nested comprehensions** into one practical application.

## Your Tasks

### Task 1: Calculate Averages (List Comprehension)

Create a list of average scores for all students.

**Expected output:** `[88.75, 78.75, 91.5, 87.5, 68.75, 94.25, 87.5, 68.75]`

### Task 2: Honor Roll Students (Conditional Comprehension)

Create a list of student names whose average is 85 or higher.

**Expected output:** `['Mal', 'Wash', 'Kaylee', 'Jayne', 'Simon']`

### Task 3: Student Average Lookup (Dictionary Comprehension)

Create a dictionary mapping each student's name to their average score.

**Expected output:**

```python
{
    'Mal': 88.75,
    'Zoe': 78.75,
    'Wash': 91.5,
    ...
}
```

### Task 4: Performance Report (Dictionary with Helper)

Create a dictionary mapping each student name to their performance category:

- 90+: 'Excellent'
- 80-89: 'Good'
- 70-79: 'Satisfactory'
- Below 70: 'Needs Improvement'

**Expected output:**

```python
{
    'Mal': 'Good',
    'Zoe': 'Satisfactory',
    'Wash': 'Excellent',
    ...
}
```

### Task 5: All Scores Flat List (Nested Comprehension)

Flatten all individual scores from every student into a single list.

**Expected output:** `[85, 92, 88, 90, 78, 82, ...]` (32 scores total)

## 📋 Reference Card

```python
# Sample data with nested structure
data = [
    {'id': 1, 'category': 'A', 'values': [10, 20, 30]},
    {'id': 2, 'category': 'B', 'values': [15, 25, 35]},
    {'id': 3, 'category': 'A', 'values': [5, 10, 15]}
]

# 1. List comprehension — transform each item
averages = [sum(item['values']) / len(item['values']) for item in data]
# [20.0, 25.0, 10.0]

# 2. Conditional comprehension — filter with if
high_scorers = [item['id'] for item in data if sum(item['values']) / len(item['values']) >= 20]
# [1, 2]

# 3. Dictionary comprehension — key: value pairs
score_lookup = {item['id']: sum(item['values']) / len(item['values']) for item in data}
# {1: 20.0, 2: 25.0, 3: 10.0}

# 4. Helper function + dictionary comprehension
def classify(avg):
    if avg >= 20:
        return "High"
    elif avg >= 15:
        return "Middle"
    else:
        return "Low"

classified = {item['id']: classify(sum(item['values']) / len(item['values'])) for item in data}
# {1: 'High', 2: 'High', 3: 'Low'}

# 5. Nested comprehension — flatten a list of lists
flattened = [value for item in data for value in item['values']]
# [10, 20, 30, 15, 25, 35, 5, 10, 15]
```

### Comprehension Cheat Sheet:

| Type        | Pattern                                       | Use When                              |
| ----------- | --------------------------------------------- | ------------------------------------- |
| List        | `[expr for x in seq]`                         | Transforming items into a new list    |
| Conditional | `[expr for x in seq if cond]`                 | Filtering items that meet a condition |
| Dict        | `{k: v for x in seq}`                         | Building key-value mappings           |
| Nested      | `[inner for outer in seq for inner in outer]` | Flattening nested structures          |

:::tip

1. **Start Simple:** Get each task working individually before moving to the next
2. **Test As You Go:** Print your results to verify they match expected outputs
3. **Use Descriptive Names:** `student['scores']` is clearer than `s['s']`
4. **Check Your Brackets:** Lists use `[]`, dicts use `{}` — the wrong bracket type is a common mistake
5. **For Nested Comprehensions:** Read them left-to-right as "for each outer item, for each inner item, collect the result"

:::

Good luck! This project brings together everything you've learned about comprehensions in Module 9.
