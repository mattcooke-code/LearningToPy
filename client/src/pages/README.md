# Pages Directory

Contains all top-level page components that define the main routes and views of the application.

## Key Files

### Administrative Pages
- **AdminDashboard.jsx** - Main administrative dashboard with platform statistics, recent users, quick actions, and flagged content monitoring
- **AdminAnalytics.jsx** - Analytics dashboard with user activity tracking, growth metrics, device demographics, and content performance analysis
- **AdminContentPage.jsx** - Content management interface for creating, editing, and organizing lessons and modules
- **AdminUsers.jsx** - User management interface with user account oversight, XP adjustments, and account moderation
- **AdminFlagged.jsx** - Content moderation page for reviewing and managing reported content and user reports
- **AdminSettings.jsx** - Administrative settings page for platform configuration and system preferences

### User-Facing Pages
- **Dashboard.jsx** - Main user dashboard with progress overview and navigation
- **Curriculum.jsx** - Course curriculum display with module and lesson navigation
- **Home.jsx** - Landing page and marketing content
- **Login.jsx** - User authentication page
- **Register.jsx** - User registration page
- **Profile.jsx** - User profile management and settings
- **FAQ.jsx** - Frequently asked questions and help content
- **Support.jsx** - Customer support and contact page

### Learning Pages
- **ModulesPage.jsx** - Main modules listing page
- **ModuleLessonsPage.jsx** - Individual module lesson listing
- **LessonPage.jsx** - Individual lesson content viewer
- **ModuleQuizPage.jsx** - Quiz interface for module assessments
- **TerminalPlayground.jsx** - Interactive Python code playground

### Authentication Pages
- **ForgotPasswordPage.jsx** - Password reset request page
- **ResetPasswordPage.jsx** - Password reset confirmation page

## Administrative Workflow

The admin suite follows a structured workflow for platform management:

1. **Overview** - Start at AdminDashboard for platform statistics and quick actions
2. **Content Management** - Use AdminContentPage to create and organize course materials
3. **User Management** - Access AdminUsers to oversee accounts and adjust user data
4. **Moderation** - Review AdminFlagged for content that needs moderation
5. **Analytics** - Analyze AdminAnalytics for detailed platform metrics and insights
6. **Settings** - Configure AdminSettings for platform-wide preferences

## Dependencies

- **React Router** - For routing and navigation between pages
- **AuthContext** - For authentication state management and admin permissions
- **ThemeContext** - For theme switching functionality
- **Admin Components** - From components/admin for admin-specific UI elements
- **UI Components** - From components/ui for reusable interface elements
- **Services** - From services directory for API calls and data management
- **Hooks** - From hooks directory for custom React hooks and state management
