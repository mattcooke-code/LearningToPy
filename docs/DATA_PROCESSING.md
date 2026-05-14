# Data Processing Record

## LearningToPy — Internal Documentation

## Last updated: [14/05/2026]

### What we collect:

- Username, email, hashed password
- Learning progress (completed lessons, quiz scores, XP, badges, streaks)
- Activity logs (pages visited, actions taken, session duration)
- Anonymised IP addresses (last octet/group removed)
- Device type and browser (from user-agent, not stored separately)

### Why we collect it:

- Account creation and authentication
- Delivering the learning service
- Tracking progress and awarding achievements
- Security monitoring and debugging

### Where it's stored:

- MongoDB Atlas (EU-West region)
- Backups retained for 30 days

### Who has access:

- The site administrator ([learning2py@gmail.com])
- MongoDB Atlas (database provider, SOC 2 certified)

### How long we keep it:

- Account data: until deletion
- Activity logs: 90 days (auto-deleted)
- Admin audit logs: 365 days (auto-deleted)
- IP addresses: never stored in full

### How users control their data:

- Export: GET /api/auth/export-data
- Delete: DELETE /api/auth/delete-account
- Change password: POST /api/auth/change-password
- Privacy settings: PUT /api/auth/privacy
