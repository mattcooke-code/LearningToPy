# 🚀 Project: Simple API Client for Public Data

This project challenges you to build a small, functional command-line utility that uses the `requests` library to interact with a public API. This client will have two primary functions: fetching filtered data and submitting new data.

You will use the **JSONPlaceholder API** (`https://jsonplaceholder.typicode.com`)—a free fake API for testing and prototyping—to simulate real-world data fetching and submission.

## Project Goal: The User Activity Reporter

You will create a Python script, `user_reporter.py`, that performs two key API interactions:

1.  **Task 1: Fetch and Report User Tasks (GET):** Retrieve all pending tasks (`/todos`) for a specific user ID, and print a formatted summary of the unfinished tasks.
2.  **Task 2: Simulate Task Completion (POST):** Simulate creating a new, completed task and confirm the server accepted it.

## Task 1: Fetching Unfinished To-Do Items

1.  **API Endpoint:** `/todos`
2.  **User ID:** You should filter the results for `userId` 8.
3.  **Completion Status:** You should filter the results for `completed` status `False`.
4.  **Steps:**
    - Define the base URL and a Python dictionary to hold the two query parameters (`userId` and `completed`).
    - Make the **GET** request.
    - Verify the status code is **200**.
    - Convert the response using `.json()` into a list of dictionaries (`tasks`).
    - Print a header, then iterate through the list and print the `title` of each pending task.

## Task 2: Submitting a New Completed Task

1.  **API Endpoint:** `/todos` (The same endpoint handles POST for creating new items).
2.  **Payload:** Create a dictionary containing a new task submission (e.g., `userId: 8`, `title: 'Project Submission'`, `completed: True`).
3.  **Steps:**
    - Make a **POST** request, passing the task dictionary to the `json` argument.
    - Verify the status code is **201 (Created)**.
    - If successful, print a confirmation message and the `id` of the newly created task (which you extract from the server's JSON response).

---

### Key Concepts to Apply

- **HTTP Methods:** `requests.get()` and `requests.post()`
- **Query Parameters:** Using the `params=` argument for filtering.
- **JSON Handling:** Using `response.json()` and dictionary indexing.
- **Control Flow:** Using `if/else` for status code checking and a `for` loop for iteration.

This project should be contained entirely within a single Python file.
