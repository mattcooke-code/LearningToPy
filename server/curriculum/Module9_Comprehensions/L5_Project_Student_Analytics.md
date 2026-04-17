# 🚀 Project: Student Grade Analytics System

Build a comprehensive grade analytics system that processes student data using all the comprehension techniques you've learned in this module.

## The Challenge

You'll process student grade data from multiple classes and generate various analytics reports. This project combines **list comprehensions**, **conditional comprehensions**, **dictionary comprehensions**, and **nested comprehensions** into one practical application.

## Project Overview

You're building an analytics dashboard for a school that needs to:

1. Process raw student data into structured formats
2. Calculate statistics for individual students and classes
3. Identify top performers and students needing help
4. Generate grade distribution reports
5. Transform data for different reporting needs

## Given Data Structure

You'll work with this student database:

```python
students = [
    {'name': 'Mal', 'class': 'Math', 'scores': [85, 92, 88, 90]},
    {'name': 'Zoe', 'class': 'Math', 'scores': [78, 82, 75, 80]},
    {'name': 'Wash', 'class': 'Math', 'scores': [92, 95, 88, 91]},
    {'name': 'Kaylee', 'class': 'Science', 'scores': [88, 85, 90, 87]},
    {'name': 'Inara', 'class': 'Science', 'scores': [72, 68, 70, 65]},
    {'name': 'Jayne', 'class': 'Science', 'scores': [95, 92, 94, 96]},
    {'name': 'Simon', 'class': 'English', 'scores': [88, 90, 85, 87]},
    {'name': 'River', 'class': 'English', 'scores': [65, 70, 68, 72]},
]
```

## Your Tasks

### Task 1: Calculate Averages (List Comprehension)

Create a list of average scores for all students.

**Expected output:** `[88.75, 78.75, 91.5, 87.5, 68.75, 94.25, 87.5, 68.75]`

### Task 2: Honor Roll Students (Conditional Comprehension)

Create a list of student names whose average is 85 or higher.

**Expected output:** `['Mal', 'Wash', 'Kaylee', 'Jayne', 'Simon']`

### Task 3: Class Rosters (Dictionary Comprehension)

Create a dictionary mapping each class to a list of student names in that class.

**Expected output:**

```python
{
    'Math': ['Mal', 'Zoe', 'Wash'],
    'Science': ['Kaylee', 'Inara', 'Jayne'],
    'English': ['Simon', 'River']
}
```

### Task 4: Student Performance Report (Nested Comprehension)

Create a dictionary mapping each student name to their performance category based on average:

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

### Task 5: All Passing Scores (Nested Comprehension)

Extract all individual scores from all students into a single flat list.

**Expected output:** `[85, 92, 88, 90, 78, 82, 75, 80, ...]` (all 32 scores)

## Success Criteria

Your solution should:

- ✅ Use appropriate comprehension types for each task
- ✅ Produce correct outputs matching the expected results
- ✅ Use clear, descriptive variable names
- ✅ Be readable and well-structured
- ✅ Demonstrate understanding of when to use each comprehension type

## Comprehension Type Guide

**Use List Comprehension when:**

- Creating a new list by transforming existing data
- Example: calculating averages, extracting specific fields

**Use Conditional Comprehension when:**

- Filtering data based on conditions
- Example: finding students meeting certain criteria

**Use Dictionary Comprehension when:**

- Creating key-value mappings
- Transforming one dictionary structure into another
- Grouping data

**Use Nested Comprehension when:**

- Working with nested data structures
- Flattening lists
- Creating multi-dimensional structures

## 📋 Reference Card

```python
# Collection of items with nested structure
data = [
    {'id': 1, 'category': 'A', 'values': [10, 20, 30]},
    {'id': 2, 'category': 'B', 'values': [15, 25, 35]},
    {'id': 3, 'category': 'A', 'values': [5, 10, 15]}
]

# 1. Average of nested values
averages = [sum(i['values']) / len(i['values']) for i in data]
# [20.0, 25.0, 10.0]

# 2. Filter based on condition
filtered = [i['id'] for i in data if sum(i['values']) / len(i['values']) >= 15]
# [1, 2]

# 3. Group by category
grouped = {
    cat: [i['id'] for i in data if i['category'] == cat]
    for cat in set(i['category'] for i in data)
}
# {'A': [1, 3], 'B': [2]}

# 4. Transform with helper
def classify(avg):
   if val >= 20:
    return "High"
   elif val >= 15:
    return "Middle"
   else:
    return "Low"

classified = {i['id']: classify(sum(i['values']) / len(i['values'])) for i in data}
# {1: 'High', 2: 'High', 3: 'Low'}

# 5. Flatten nested lists
flattened = [val for i in data for val in i['values']]
# [10, 20, 30, 15, 25, 35, 5, 10, 15]
```

:::tip

1. **Start Simple**: Get each task working individually before moving to the next
2. **Test As You Go**: Print your results to verify they match expected outputs
3. **Use Descriptive Names**: `student['scores']` is clearer than `s['s']`
4. **Check Your Output Type**: List `[]`, Dict `{}`, or Set `{}`?
5. **Break Down Complex Tasks**: For nested comprehensions, think about the outer loop first, then the inner loop
   :::

Good luck! This project brings together Inararything you've learned about comprehensions in Module 9.
