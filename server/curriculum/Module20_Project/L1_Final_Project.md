# 🏆 Module 20: Final Capstone Project

Congratulations! You've reached the end of your Python journey. Now it's time to showcase everything you've learned by building a project of your own design.

## Project Philosophy

This is your chance to build something **you** care about. The best way to solidify your learning is to create a project that excites you. Whether you want to analyze data, build a game, scrape a website, or create a useful tool - the choice is yours!

## Core Requirements

Your project must demonstrate proficiency in the following areas. You have creative freedom in **how** you implement them:

### Required Elements

| #   | Element                         | Description                                                              | Example                                                         |
| --- | ------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 1   | **Function with Return**        | At least one function that takes parameters and returns a value          | `def calculate_average(scores): return sum(scores)/len(scores)` |
| 2   | **Data Structure**              | Use of lists, dictionaries, or custom objects to store and organize data | A list of songs, dictionary of user profiles, etc.              |
| 3   | **Data Manipulation**           | Modify your data structure (add, remove, update, slice, sort)            | Adding a new song, filtering results, sorting by rating         |
| 4   | **Conditional Logic**           | Use of `if/elif/else` to make decisions in your code                     | Checking user input, validating data, handling different cases  |
| 5   | **Iteration**                   | Use of `for` or `while` loops to process data                            | Looping through a list of items, repeated operations            |
| 6   | **Error Handling**              | `try/except` blocks to gracefully handle potential errors                | File not found, invalid input, API failures                     |
| 7   | **Object-Oriented Programming** | At least one class with inheritance                                      | A base class and at least one child class that extends it       |
| 8   | **External Interaction**        | Interact with something outside your script (syntax validation only)     | API request, database query, file I/O, web scraping             |

:::note
You can and should use other areas of the course to complete your project. Feel free to use all of the skills you have picked up along the way. The above are minimum requirements only.
:::

## Suggested Project Ideas

Here are some ideas to spark your creativity. Feel free to modify these or come up with your own!

### 🎵 Music Library Manager

A program to manage your digital music collection. Track songs, albums, artists, and create playlists.

**How it meets requirements:**

- **Class:** `Song` class with attributes like title, artist, album, duration, rating
- **Inheritance:** `Playlist` class inherits from `SongCollection` base class
- **Data Structure:** List of Song objects, dictionary mapping genres to songs
- **Data Manipulation:** Add/remove songs, sort by artist/rating, filter by genre
- **Functions:** `calculate_average_rating()`, `find_songs_by_artist()`
- **External:** Load/save to a JSON file, fetch album art from an API

### 📚 Personal Library Tracker

Track books you own, have read, or want to read. Include ratings and notes.

**How it meets requirements:**

- **Class:** `Book` class with title, author, pages, status, rating
- **Inheritance:** `EBook` and `PhysicalBook` classes inherit from `Book`
- **Data Structure:** List of books, dictionary of books by author
- **Data Manipulation:** Mark books as read, add reviews, filter by status
- **Functions:** `calculate_reading_progress()`, `get_unread_books()`
- **External:** Fetch book details from Google Books API, save to database

### 🎮 RPG Character Builder

Create a character generator for tabletop RPGs with stats, inventory, and leveling.

**How it meets requirements:**

- **Class:** `Character` class with name, class, level, stats, inventory
- **Inheritance:** `Warrior`, `Mage`, `Rogue` classes inherit from `Character`
- **Data Structure:** Inventory list, dictionary of equipped items
- **Data Manipulation:** Add items, level up, modify stats based on equipment
- **Functions:** `calculate_damage()`, `validate_character_sheet()`
- **External:** Save characters to file, fetch random names from API

### 📊 Personal Expense Tracker

Track your spending, categorize expenses, and generate reports.

**How it meets requirements:**

- **Class:** `Expense` class with date, amount, category, description
- **Inheritance:** `RecurringExpense` class inherits from `Expense`
- **Data Structure:** List of Expense objects, dictionary of category totals
- **Data Manipulation:** Add/remove expenses, filter by date/category, sort by amount
- **Functions:** `calculate_monthly_total()`, `get_spending_by_category()`
- **External:** Save to CSV/JSON, fetch currency exchange rates from API

### 🏋️ Workout Tracker

Log your workouts, track progress, and plan future sessions.

**How it meets requirements:**

- **Class:** `Workout` class with date, type, duration, exercises
- **Inheritance:** `StrengthWorkout` and `CardioWorkout` inherit from `Workout`
- **Data Structure:** List of workouts, dictionary of personal records
- **Data Manipulation:** Add workouts, calculate volume, track PRs
- **Functions:** `calculate_total_volume()`, `get_workout_history()`
- **External:** Save to database, fetch exercise database from API

### 🎬 Movie Watchlist

Track movies you want to watch and those you've already seen.

**How it meets requirements:**

- **Class:** `Movie` class with title, year, director, watched status, rating
- **Inheritance:** `Documentary` class inherits from `Movie` with topic attribute
- **Data Structure:** Watchlist list, watched list, dictionary by genre
- **Data Manipulation:** Mark as watched, add ratings, filter by year/director
- **Functions:** `get_recommendations()`, `calculate_average_rating()`
- **External:** Fetch movie details from OMDb API, save to JSON

### 🍳 Recipe Manager

Store, organize, and search your favorite recipes.

**How it meets requirements:**

- **Class:** `Recipe` class with name, ingredients, instructions, prep time
- **Inheritance:** `DessertRecipe` class inherits from `Recipe` with extra attributes
- **Data Structure:** List of recipes, dictionary of recipes by cuisine
- **Data Manipulation:** Add recipes, scale ingredients, search by ingredient
- **Functions:** `scale_recipe()`, `find_recipes_by_ingredient()`
- **External:** Save to database, fetch random recipes from API

### 💼 Contact Manager

Manage your professional and personal contacts.

**How it meets requirements:**

- **Class:** `Contact` class with name, email, phone, company
- **Inheritance:** `BusinessContact` class inherits from `Contact` with job title
- **Data Structure:** List of contacts, dictionary by company
- **Data Manipulation:** Add/remove contacts, search by name/company
- **Functions:** `validate_email()`, `find_duplicates()`
- **External:** Save to database, import/export CSV

## Evaluation Criteria

Your project will be evaluated on:

| Criteria          | Weight | Description                                          |
| ----------------- | ------ | ---------------------------------------------------- |
| **Functionality** | 30%    | Does it work? Does it meet all requirements?         |
| **Code Quality**  | 25%    | Is the code well-organized, commented, and readable? |
| **Requirements**  | 25%    | Have all 8 required elements been implemented?       |
| **Creativity**    | 20%    | Did you make it your own? Is there a personal touch? |

## Getting Started

1. Choose a project idea that excites you
2. Sketch out your class structure and data flow
3. Start small - get one feature working at a time
4. Test each piece before moving on
5. Ask for help when you get stuck!

**Remember:** The best project is one you'll enjoy building. Happy coding! 🚀
