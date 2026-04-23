# 🎮 Module 11 Project: RPG Character System

Build a complete RPG character management system that brings together all the Object-Oriented Programming concepts you've learned in Module 11.

## The Challenge

You'll create a `Character` class for a role-playing game that can:

- Track multiple characters with unique attributes
- Manage health, levels, and character classes
- Handle combat mechanics (damage and healing)
- Level up characters with stat increases
- Validate character classes
- Count total characters created

## Project Overview

Your character system will demonstrate:

|     |                                                               |
| --- | ------------------------------------------------------------- |
| 1.  | **Class definition** with shared data (class variables)       |
| 2.  | **Object instantiation** with unique attributes per character |
| 3.  | **Instance methods** that modify character state              |
| 4.  | **Encapsulation** using protected attributes                  |
| 5.  | **Static methods** for utility functions                      |
| 6.  | **The `__init__` constructor** to initialize character data   |

## Character Specifications

### Attributes

Each character should have:

|                  |                                                    |
| ---------------- | -------------------------------------------------- |
| **Name**         | The character's name (public)                      |
| **Class**        | Their role (Warrior, Mage, Rogue, or Cleric)       |
| **Level**        | Current experience level (protected: `_level`)     |
| **Health**       | Current hit points (protected: `_health`)          |
| **Max Health**   | Maximum possible health (protected: `_max_health`) |
| **Alive Status** | Whether the character is still alive               |

### Class Variable

- **Character Count** - Tracks how many characters have been created total (shared across all characters)

### Methods

Your `Character` class needs these methods:

**1. `get_health()`** - Getter method

- Returns the current health value
- Provides controlled access to protected `_health` attribute

**2. `take_damage(amount)`** - Combat method

- Reduces health by the damage amount
- Sets health to 0 if it would go negative
- Updates `is_alive` to `False` if health reaches 0
- Prints a message showing damage taken and remaining health

**3. `heal(amount)`** - Recovery method

- Increases health by the healing amount
- Caps health at maximum (no overhealing)
- Prints a message showing healing received and current health

**4. `level_up()`** - Progression method

- Increases level by 1
- Increases max health by 10
- Fully restores current health
- Prints a level-up message

**5. `is_valid_class(char_class)` (static method)**

- Checks if a character class is valid
- Valid classes: Warrior, Mage, Rogue, Cleric
- Returns `True` or `False`
- Called on the class itself, not an instance

## Game Mechanics

### Health System

- Starting health = level × 10
- Max health increases by 10 per level
- Level up grants full heal
- Health cannot exceed max health
- Health cannot go below 0

### Character Classes

Your game supports four character classes:

- **Warrior** - Melee combat specialist
- **Mage** - Magical damage dealer
- **Rogue** - Stealth and critical hits
- **Cleric** - Healing and support

## Example Usage

```python
# Create a level 5 warrior (Feel free to use your own names!)
hero = Character('Arthur', 'Warrior', 5)
print(f"{hero.name} has {hero.get_health()} HP")  # 50 HP

# Combat scenario
hero.take_damage(25)  # Takes damage
hero.heal(10)         # Heals some damage
hero.level_up()       # Reaches level 6 with full HP (60)

# Validate character class
if Character.is_valid_class('Ninja'):
    print("Valid class!")
else:
    print("Invalid class!")  # This prints
```

## Expected Output

When you run your complete project, you should see:

```text
=== Testing Methods ===
Arthur took 25 damage! Health: 25/50
Arthur healed 10 HP! Health: 35/50
Arthur reached level 6!

=== Character Summary ===
Hero: Arthur (Warrior) - Level 6, Health: 60/60
Wizard: Zelda (Mage) - Level 3, Health: 30/30
Thief: Robin (Rogue) - Level 1, Health: 10/10

Total characters created: 3
```

## Tips for Success

:::tip

1. **Start with the class definition** - Get the basic structure right first
2. **Test incrementally** - Create a simple character and test each method as you write it
3. **Use `self` correctly** - Remember it refers to the specific character instance
4. **Protected attributes** - Use the underscore (`_health`) to signal internal data
5. **Class variables** - Access with `Character.character_count`, not `self.character_count`
6. **Static methods** - Don't forget the `@staticmethod` decorator
7. **Print feedback** - Methods should confirm actions (damage taken, healing received)
   :::

## What You're Demonstrating

By completing this project, you show mastery of the core pillars of OOP:

- ✅ **State Management:** Using `self` and instance methods to keep character health and levels consistent.
- ✅ **Encapsulation:** Protecting internal data (`_health`) while providing controlled public access.
- ✅ **Shared Logic:** Managing global data with _Class Variables_ and _Static Methods_.
- ✅ **Object Lifecycle:** Mastering the `__init__` constructor to bring characters to life.

Good luck, and may your characters live long and prosper! ⚔️🛡️
