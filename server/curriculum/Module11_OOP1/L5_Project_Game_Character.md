# 👾 Project: Building a Simple Game Character Class

In this final project for Module 11, you will apply the fundamental principles of Object-Oriented Programming (OOP) to create a functional `Character` class for a simple text-based game.

This project requires you to use:

1. **Classes and Instantiation** (11.1)

2. The `__init__` **Constructor and Instance Attributes** (11.2)

3. **Instance Methods** for behavior (11.3)

4. The `__str__` **Magic Method** for display (11.4 concept, though we swapped the lesson structure).

### Project Goal

Design a `Character` class that represents a game entity, capable of attacking another character and displaying its current status.

### Character Requirements

Your `Character` class must meet the following criteria:

• **Initialization** (`__init__`): Must accept `name` and `max_health` as parameters.

    ○ It must initialize three instance attributes: `self.name`, `self.max_health`, and `self.current_health` (which starts equal to `max_health`).

• **Behavior (`attack` method)**:

    ○ Must accept two parameters: `self` and `target_character` (another `Character` object).

    ○ The attack deals a fixed amount of damage (e.g., 10 damage).

    ○ It must reduce the `target_character's` `current_health` by the damage amount.

    ○ It should print a message detailing the attack (e.g., "Hero attacks Foe for 10 damage.").

• **Display (`__str__` method**):

    ○ Must return a user-friendly string showing the character's name and current health status (e.g., "Hero [HP: 90/100]").

Follow the instructions in the exercise file to structure your code!
