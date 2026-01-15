# 🎮 Module Project: Gaming Platform Access Control

You've been hired to build the login system for a new gaming platform! Different types of users get different access levels based on their account status. Your job is to write the conditional logic that determines what each user can access.

## Your Mission

Write an `if/elif/else` structure that checks a user's `account_type` and `account_age` (how many days they've been a member) to determine their access level and print the appropriate welcome message.

## The Access Rules

Your system needs to handle four types of users:

1. **VIP Members** - If `account_type` is `'VIP'`, they get instant access to everything, regardless of account age

   - Print: `'Welcome VIP! Full access to all games and features.'`

2. **Premium Members (Established)** - If `account_type` is `'Premium'` AND `account_age` is 30 days or more

   - Print: `'Welcome Premium member! Access to premium games unlocked.'`

3. **Premium Members (New)** - If `account_type` is `'Premium'` BUT `account_age` is less than 30 days

   - Print: `'Welcome! Premium features unlock in X days.'` (where X = 30 - account_age)

4. **Free Members** - If `account_type` is `'Free'` (or anything else)
   - Print: `'Welcome! You have access to free games. Upgrade for more!'`

## Test Your Code

Your code should work correctly for all these test scenarios:

- VIP member with 10 days → Full access
- Premium member with 45 days → Premium access
- Premium member with 15 days → "Premium features unlock in 15 days"
- Free member → Free games only

## Tips

- Use `elif` to handle the different Premium member cases
- Remember to check account_type AND account_age together using `and`
- Use subtraction to calculate days remaining: `30 - account_age`
