# 🎮 Module 11 Project: RPG Character System

Build a complete RPG character system using everything you've learned about classes, objects, and methods.

## Your Character Class

Create a `Character` class that tracks heroes for a role-playing game. Each character has a name, class (Warrior, Mage, Rogue, or Cleric), level, health, and knows whether they're still alive. A class variable keeps count of all characters created.

### Attributes (per character)

| Attribute     | Details                                        |
| ------------- | ---------------------------------------------- |
| `name`        | Character's name (public)                      |
| `char_class`  | Warrior, Mage, Rogue, or Cleric                |
| `_level`      | Starting level (protected)                     |
| `_health`     | Current HP, starts at `level × 10` (protected) |
| `_max_health` | Maximum HP, starts at `level × 10` (protected) |
| `is_alive`    | `True` until health reaches 0                  |

### Class Variable

- `character_count` — tracks total characters created (shared across all instances)

### Methods

| Method                                | What it does                                                   |
| ------------------------------------- | -------------------------------------------------------------- |
| `get_health()`                        | Returns current `_health`                                      |
| `take_damage(amount)`                 | Reduces health, sets `is_alive = False` at 0 HP, prints status |
| `heal(amount)`                        | Increases health, caps at `_max_health`, prints status         |
| `level_up()`                          | +1 level, +10 max health, full heal, prints message            |
| `is_valid_class(char_class)` (static) | Returns `True` if class is Warrior/Mage/Rogue/Cleric           |

## Example Output

```text
=== Testing Methods ===
Aragorn took 25 damage! Health: 25/50
Aragorn healed 10 HP! Health: 35/50
Aragorn reached level 6!

=== Character Summary ===
Hero: Aragorn (Warrior) - Level 6, Health: 60/60
Wizard: Gandalf (Mage) - Level 3, Health: 30/30
Thief: Bilbo (Rogue) - Level 1, Health: 10/10

Total characters created: 3
```

:::tip

1. **Build incrementally** — get the constructor working, then add methods one at a time
2. **Class variables** use `Character.character_count`, not `self.character_count`
3. **Static methods** need the `@staticmethod` decorator
4. **No overhealing** — check `if self._health > self._max_health` in `heal()`
5. **Print feedback** — each method should confirm the action (damage taken, healing received)
   :::

Good luck, adventurer! ⚔️🛡️
