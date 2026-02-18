# 🌍 Module Project: World Explorer Research Tool

You are building a research tool to audit and analyze global geographic data. Your system uses **Dictionaries** to store detailed country profiles and **Sets** to manage unique geographic characteristics.

## The Goal

Your mission is to process the `world_data` dictionary to achieve three key objectives:

1. **Flag Small Populations:** Iterate through the database and identify any country with a population of less than 10 million (useful for targeted research).
2. **Audit Data Completion:** Every country record should include three mandatory categories: `capital`, `continent`, and `river`. You must determine which of these are missing from each country's specific data using the **Difference** operation.
3. **Map Global Features:** Create a master "Atlas" list that contains every unique geographic feature found across all country records using the **Union** operation.

:::note
This project reinforces how to navigate "Nested Data" (a dictionary containing sets) and how to use Set logic to audit data for missing values.
:::

## Project Setup

You are provided with a `world_data` dictionary containing population counts and current feature tags. You are also given the `REQUIRED_TAGS` set.

### Requirements:

- You must use `.items()` to access both the country names and their data.
- The stock check, tag audit, and master list update must all happen inside a single `for` loop.
- The final Master List should only be printed once, after the loop has completed its work.
