# ⚙️ Module Project: The User Data Processor

You are tasked with building a centralized function that handles incoming user data from different parts of your application. This function must be robust enough to handle a required username, an unknown number of metric scores, and arbitrary configuration flags.

## The Goal

Define a single function, `process_user_data`, that encapsulates all logic:

1.  It must accept a **required positional argument** for the user's name (`username`).
2.  It must accept a **variable number of positional arguments** (`*metrics`) representing various performance scores.
3.  It must accept a **variable number of keyword arguments** (`**flags`) representing configuration settings (e.g., `is_admin=True`).
4.  The function must **calculate the total sum** of all `*metrics` and assign it to a result dictionary.
5.  The function must check if the `**flags` dictionary contains the key `'is_admin'` and set a boolean in the result dictionary accordingly.
6.  The function must **return a dictionary** containing the processed data.

This project reinforces defining flexible functions and handling different argument types (`positional`, `*args`, `**kwargs`) inside a single, cohesive unit.
