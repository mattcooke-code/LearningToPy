# 🔑 Module Project: The Role Selector

You are building the core access control logic for a community platform. Different users have different permissions and see different messages upon login. This project requires you to define a set of rules and use all the conditional logic you've learned to process a user's data and determine their access level.

## The Goal

Your mission is to write a single, complex `if/elif/else` structure that evaluates three pieces of user data—`role`, `level`, and `is_premium`—to print the appropriate welcome message and access outcome.

## Access Rules to Implement

1.  **ADMIN ACCESS:** If the user's `role` is 'Admin', they gain full access immediately.
2.  **PREMIUM ACCESS:** If the user's `role` is 'Editor' **OR** 'Author' **AND** their `level` is 5 or higher, they get premium access.
3.  **STANDARD ACCESS:** If the user is logged in (i.e., their `role` is **`in`** the `VALID_ROLES` list) **AND** they are **NOT** premium (`is_premium` is `False`), they get standard access.
4.  **GUEST/DENIED:** If none of the above conditions are met, they are given a "Guest" status.

Complete the tasks outlined in the exercise file using nested and combined conditions. Good luck!
