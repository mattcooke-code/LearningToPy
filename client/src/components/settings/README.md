# Settings Components

React components for managing user settings, privacy preferences, and account security in the LearningToPy application.

## Components

### PrivacySettings.jsx

**Purpose:** Privacy settings form controlling leaderboard visibility and anonymity options.

**Props:**

- `user` — Current user object containing `privacySettings`
- `onUpdate` — Callback fired with updated settings after save

**Settings managed:**

- `showOnLeaderboards` — Whether user appears in rankings
- `showAsAnonymous` — Whether to show as anonymous
- `showUsernameOnLeaderboards` — Whether to display username publicly

---

### ChangePassword.jsx

**Purpose:** Secure password change form requiring current password verification.

**Props:** None (self-contained, uses auth context)

**Features:**

- Current password verification
- New password with confirmation
- Passwords must not match validation
- Backend-side password strength enforcement via `validatePassword`
- Uses `authApiClient` for API calls
- Toast notifications via `useNotification`
- Loading state via `LoadingState` component
- Clears form on success

**API:** `POST /api/auth/change-password`

---

### DeleteAccount.jsx

**Purpose:** Multi-step account deletion with confirmation gates.

**Props:** None (self-contained, uses auth context)

**Features:**

- Three-step confirmation flow:
  1. Warning with list of consequences
  2. Type "DELETE MY ACCOUNT" to confirm
  3. Password verification
- Uses `apiClient` for API calls
- Calls `logout()` from AuthContext on successful deletion
- Toast notifications via `useNotification`
- Navigates to `/account-deleted` on success

**API:** `DELETE /api/auth/delete-account`

**Data deleted:**

- User account (including embedded progress, badges, stats, streaks)
- Activity logs
- Flagged content reports
- Admin logs anonymised if applicable

---

### AccountManagement.jsx

**Purpose:** Navigation container that switches between password change and account deletion views within a single card.

**Props:**

- `section` — `'password'` | `'delete'` | `null`
- `onBack` — Callback to return to menu view

**Features:**

- Menu view with two action buttons (Change Password, Delete Account)
- Back navigation button when viewing a sub-section
- Inline rendering — no page navigation required
- Delete button styled with red theme for danger awareness

---

## Component Hierarchy

Profile Page
└── Account Management Card
└── AccountManagement
├── (Menu View — two buttons)
├── ChangePassword
└── DeleteAccount

## Integration

```jsx
import { PrivacySettings } from "../components/settings/PrivacySettings";
import AccountManagement from "../components/settings/AccountManagement";

// In Profile page:
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <LevelProgressCard />
  <PrivacySettings user={user} onUpdate={handlePrivacyUpdate} />
  <AccountManagement
    section={activeSection}
    onBack={() => setActiveSection(null)}
  />
  <LearningStatsCard />
</div>;
```

## Dependencies

- **PrivacySettings:** `getErrorMessage`, `apiClient`, `lucide-react`
- **ChangePassword:** `useNotification`, `LoadingState`, `authApiClient`
- **DeleteAccount:** `useAuth`, `useNotification`, `LoadingState`, `apiClient`
- **AccountManagement:** `ChangePassword`, `DeleteAccount`, `lucide-react`
