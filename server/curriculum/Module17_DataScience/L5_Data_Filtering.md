# 🎯 Data Selection and Filtering

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

:::note
To select multiple columns, you must pass a **list of column names** (double square brackets: `df[['col1', 'col2']]`).
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

# .iloc[row_position, col_position]
print(df.iloc[0, 1])            # Output: 85 (Row 0, Col 1)

# Slicing with .iloc (First two rows)
print(df.iloc[0:2, :])
```

## 3. Advanced Filtering - Boolean and `isin()`

Filtering allows you to extract rows based on specific criteria.

### A. Boolean Masking

You create a "mask" (a Series of `True/False` values) and apply it to your DataFrame.

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

### B. The `isin()` Method

When you need to filter for multiple specific values (e.g., "Show me students A, C, and E"), using multiple OR (`|`) statements becomes messy. Instead, use `.isin()`.

```python
# Select rows where Name is in a specific list
target_names = ['A', 'C']
filtered_df = df[df['Name'].isin(target_names)]
```

### C. Combining Conditions (Logical Operators)

For complex logic, use bitwise operators.

:::note
**Always** wrap individual conditions in parentheses.
:::

| Operator | Logic   | Example                  |
| -------- | ------- | ------------------------ |
| `&`      | **AND** | `df[(cond1) & (cond2)]`  |
| `\|`     | **OR**  | `df[(cond1) \| (cond2)]` |
| `~`      | **NOT** | `df[~cond1]`             |

:::summary

- **Explicit Indexing:** Use `.loc` for labels and `.iloc` for positions.
- **Boolean Masks:** Use comparison operators (`>`, `<`, `==`) to create filters.
- **The `isin()` Tool:** Use `df['col'].isin([list])` to check for multiple possible matches efficiently.
- **Logical Operators:** Use `&`, `|`, and `~` for multi-step filters, and always use **_parentheses_** around each condition.
- **Avoid `and/or`:** These Python keywords will throw an error when used on Pandas Series; stick to the symbols.

:::
