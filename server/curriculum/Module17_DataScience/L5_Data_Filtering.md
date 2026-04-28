# 🎯 Data Selection and Filtering

The most fundamental task in data analysis is selecting a subset of your data; either specific columns (variables) or specific rows (observations). In Pandas, this is achieved through simple and powerful indexing operations.

## 1. Column Selection

You can select a single column from a DataFrame, which returns a Pandas Series.

```python
import pandas as pd
data = {'Name': ['A', 'B', 'C'], 'Score': [85, 92, 78]}
df = pd.DataFrame(data)
#
# Select a single column
names_series = df['Name']
print(names_series)
# Output:
# 0    A
# 1    B
# 2    C
# Name: Name, dtype: object
#
# Select multiple columns (returns a DataFrame)
subset_df = df[['Name', 'Score']]
print(subset_df)
# Output:
#   Name  Score
# 0    A     85
# 1    B     92
# 2    C     78
```

:::note

### Why the double brackets?

The outer brackets `df[...]` are the selection tool. The inner brackets `['Name', 'Score']` are a standard Python list. You are essentially passing a list of names into the selector.
:::

## 2. Explicit Selection: `.loc` and `.iloc`

While square brackets are great for columns, Pandas provides two powerful methods for selecting specific rows and columns simultaneously.

- **`.loc` (Label-based):** Selects data using the _names_ of rows or columns.
- **`.iloc` (Integer-based):** Selects data using the _numerical position_ (0, 1, 2...).

```python
# Create a DataFrame with custom index labels
df = pd.DataFrame(data, index=['row1', 'row2', 'row3'])

# .loc[row_label, col_label]
print(df.loc['row1', 'Score'])  # Output: 85
#
# .iloc[row_position, col_position]
print(df.iloc[0, 1])            # Output: 85 (Row 0, Col 1)

```

:::warning

### The Slicing Trap

One major difference between these two is how they handle "slices" (ranges):

- `.iloc` is **Exclusive**: `0:2` gives you positions 0 and 1 (standard Python behavior).
- `.loc` is **Inclusive**: `'row1':'row2'` gives you both row1 and row2.

```python
# iloc is EXCLUSIVE (standard Python)
print(df.iloc[0:2, :])  # Returns rows 0 and 1

# loc is INCLUSIVE (Pandas specific)
print(df.loc['row1':'row2', :]) # Returns BOTH row1 and row2
```

:::

When using `.loc` and `.iloc`, the first part of the slice handles rows and the second part handles columns, separated by a comma. In the first example we selected the specific row and then column: `.loc['row1', 'Score']`. Using a lone colon `:` for the columns tells Pandas to select **all** of the columns.

## 3. Advanced Filtering - Boolean and `isin()`

Filtering allows you to extract rows based on specific criteria.

### A. Boolean Masking

You create a "mask" (a Series of `True/False` values) and apply it to your DataFrame. Think of the mask as a filter that only lets the `True` rows through.

```python
# Create a boolean Series (a mask) where Score is > 80
high_scorers_mask = df['Score'] > 80
print(high_scorers_mask)
# Output:
# 0     True
# 1     True
# 2    False
# Name: Score, dtype: bool
#
# Apply the mask to the DataFrame
high_scorers_df = df[high_scorers_mask]
print(high_scorers_df)
# Output:
#   Name  Score
# 0    A     85
# 1    B     92
```

### B. Combining Conditions (Logical Operators)

For complex logic, use bitwise operators.

| Operator | Logic   | Example                  |
| -------- | ------- | ------------------------ |
| `&`      | **AND** | `df[(cond1) & (cond2)]`  |
| `\|`     | **OR**  | `df[(cond1) \| (cond2)]` |
| `~`      | **NOT** | `df[~cond1]`             |

:::warning

**Rule:** You must wrap individual conditions in parentheses. Pandas uses `&` and `|` instead of `and` and `or` because it performs the comparison on every row simultaneously (element-wise).
:::

```python
# Using & (AND) to filter with multiple conditions
high_scorers_df = df[(df['Score'] > 80) & (df['Score'] <= 95)]
print(high_scorers_df)
# Output:
#   Name  Score
# 0    A     85
# 1    B     92
#
# Using | (OR) to match either condition
# Get employees who scored below 80 OR exactly 92
low_or_perfect = df[(df['Score'] < 80) | (df['Score'] == 92)]
print(low_or_perfect)
# Output:
#   Name  Score
# 1    B     92
# 2    C     78
#
# Using ~ (NOT) to invert a condition
# Get employees who are NOT in the high scorers list
not_high = df[~(df['Score'] > 80)]
print(not_high)
# Output:
#   Name  Score
# 2    C     78
```

### C. The `isin()` Method

Imagine you want to filter for five different names. Using the OR `|` operator would result in a very long, messy line of code:
`df[(df['Name'] == 'A') | (df['Name'] == 'C') | ...]`

Instead, use `.isin()` to check if a value exists within a provided list. It is cleaner, faster, and much easier to read.

```python
# Select employees from specific departments
target_departments = ['Produce', 'Bakery']
filtered_df = df[df['Department'].isin(target_departments)]
print(filtered_df)
```

:::summary

- **Double Brackets:** Use `df[['col1', 'col2']]` to return a DataFrame of multiple columns.
- **`.loc` vs `.iloc`:** Remember that `.loc` includes the last item in a slice, while `.iloc` does not.
- **Boolean Masks:** Use comparison operators to create a filter of `True/False` values.
- **Logical Symbols:** Always use `&` and `|` for combined filters and wrap your conditions in `()` to avoid errors.
- **Simplify Code:** Instead of chaining long strings of logical operators, use `.isin(list)` to keep the code concise.

:::
