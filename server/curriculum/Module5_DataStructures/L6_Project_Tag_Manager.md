# 🏷️ Module Project: Inventory and Tag Manager

You are building a simplified inventory management system for an online store. Your system needs to track product details using **Dictionaries** and manage a unique, required list of categories/tags using **Sets**.

## The Goal

Your mission is to process the `inventory` dictionary to achieve three key objectives:

1.  **Identify Low Stock:** Iterate through the inventory and flag any product with a stock level under 10.
2.  **Check for Missing Tags:** For each product, determine which tags from the `REQUIRED_TAGS` set are missing from the product's individual tag set. (Use the **Difference** operation).
3.  **Consolidate All Tags:** Generate a single, comprehensive set containing every unique tag used across the entire inventory. (Use the **Union** operation).

This project requires careful iteration using `.items()` and effective use of the Set difference and union operators.

## Project Setup

You are provided with the `inventory` dictionary and the `REQUIRED_TAGS` set. All analysis must be done inside a single `for` loop.
