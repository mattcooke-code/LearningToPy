# 🚀 Project: Building an API Client for User Tasks

This project challenges you to build a small utility that interacts with a fake API to fetch and submit data. You'll practice everything you've learned about GET requests, POST requests, JSON handling, and error checking.

## Project Goal: The Task Reporter

You will create a Python script that performs two key API interactions:

| Task                                 | Description                                            |
| ------------------------------------ | ------------------------------------------------------ |
| **Task 1: Fetch User Tasks (GET)**   | Retrieve and display pending tasks for a specific user |
| **Task 2: Submit a New Task (POST)** | Create a new completed task and handle the response    |

## The API (Simulated)

We'll use the same pattern as our exercises - you'll write the code, but we'll validate the syntax rather than making actual API calls. The API endpoint is `https://jsonplaceholder.typicode.com/todos`.

### Task 1: Fetching Pending Tasks

You need to fetch all tasks for user ID 5 that are **not completed**. The API accepts query parameters to filter results.

**API Details:**

- Endpoint: `/todos`
- Method: `GET`
- Parameters: `userId=5` and `completed=false`

**Expected Response Structure:**

```json
[
  {
    "userId": 5,
    "id": 201,
    "title": "Learn Python APIs",
    "completed": false
  },
  {
    "userId": 5,
    "id": 202,
    "title": "Build a project",
    "completed": false
  }
]
```

## Task 2: Submitting a New Task

You'll submit a new completed task for user 5.

**API Details:**

- Endpoint: `/todos`
- Method: `POST`
- Payload: JSON object with `userId`, `title`, and `completed`

**Example Payload:**

```json
{
  "userId": 5,
  "title": "Complete API Client Project",
  "completed": true
}
```

**Expected Response Structure:**

```json
{
  "userId": 5,
  "title": "Complete API Client Project",
  "completed": true,
  "id": 501
}
```

## Your Tasks

You'll write code that:

1. Imports the required modules (`requests` and `JSONDecodeError`)
2. Makes a **GET** request with query parameters to fetch pending tasks
3. Handles the **JSON response** with proper error checking
4. Prints each task title in a readable format
5. Makes a **POST** request to submit a new task
6. Handles the creation response and prints the new task ID

All with proper `try/except` blocks and status code checking!
