# 📈 Module Project: The Data Processor

You are tasked with building a script to simulate a crucial part of a financial system: processing a list of transaction requests while adhering to a strict **daily budget limit**.

This project requires you to master all iteration techniques from this module:

1.  **`for` Loop:** To iterate over a fixed list of pending transactions.
2.  **`while` Loop Logic:** To track the progress against a fixed budget (`daily_budget`) and stop processing when the budget is depleted.
3.  **`continue`:** To filter out transactions that are invalid (e.g., zero or negative amounts).
4.  **`break`:** To exit the loop immediately if the daily budget is exceeded by the next transaction.

## The Goal

Your mission is to process the `pending_transactions` list, adding valid transaction amounts to the `total_processed_amount` variable, but only as long as that total remains under the `daily_budget`.

You must clearly print the outcome of each transaction: processed, skipped, or stopped due to budget limits.

## Project Setup

You are provided with a list of transactions and a defined daily budget. You must use the `for` loop to iterate over the list and a **conditional check** within the loop to manage the `daily_budget` via `break`.
