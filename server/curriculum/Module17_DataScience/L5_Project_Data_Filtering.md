# 🎯 Project: Data Selection and Filtering

The most fundamental task in data analysis is selecting a subset of your data—either specific columns (variables) or specific rows (observations). In Pandas, this is achieved through simple and powerful indexing operations.

## 1. Column Selection

You can select a single column from a DataFrame, which returns a Pandas Series.

```python
import pandas as pd
data = {'Name': ['A', 'B', 'C'], 'Score': [85, 92, 78]}
df = pd.DataFrame(data)

# Select a single column
names_series = df['Name']
print(names_series)
# Output:
# 0    A
# 1    B
# 2    C
# Name: Name, dtype: object

# Select multiple columns (returns a DataFrame)
subset_df = df[['Name', 'Score']]
print(subset_df)
# Output:
#   Name  Score
# 0    A     85
# 1    B     92
# 2    C     78
```

**Note**: To select multiple columns, you must pass a **list of column names** (double square brackets: `df[['col1', 'col2']]`).

## 2. Boolean Filtering

Boolean filtering, also known as masking, is the primary way to select rows based on a condition. You create a boolean Series (a **mask**) where `True` indicates a row to keep, and `False` indicates a row to discard.

```python
# Create a boolean Series (a mask) where Score is > 80
high_scorers_mask = df['Score'] > 80
print(high_scorers_mask)
# Output:
# 0     True
# 1     True
# 2    False
# Name: Score, dtype: bool

# Apply the mask to the DataFrame
high_scorers_df = df[high_scorers_mask]
print(high_scorers_df)
# Output:
#   Name  Score
# 0    A     85
# 1    B     92
```

### Combining Conditions (Logical Operators)

For more complex filtering, you can combine multiple boolean conditions using Python's logical operators. **Crucially, you must use the symbols `&` (AND), `|` (OR), and `~` (NOT), and wrap each condition in parentheses.**

```python
# Select rows where Score is > 80 AND Name is not 'A'
filtered_df = df[(df['Score'] > 80) & (df['Name'] != 'A')]
print(filtered_df)
# Output:
#   Name  Score
# 1    B     92
```

### Project Task

For the final project in this module, you will demonstrate your ability to load, inspect, and filter a provided dataset. Your task will be to:

1. Load the dataset.

2. Select a specific set of columns.

3. Apply multiple boolean conditions to find a highly specific subset of rows.
