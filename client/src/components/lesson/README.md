# Lesson Components

Core learning engine components that provide interactive Python lessons with Pyodide integration, progress tracking, and comprehensive feedback systems.

## Overview

The lesson components form the heart of the Learning To Py platform, delivering interactive coding experiences through client-side Python execution using Pyodide WebAssembly. These components handle everything from code editing and execution to progress evaluation and navigation flow.

## Key Components

### TerminalComponent
**Purpose**: Interactive Python terminal using Pyodide for client-side execution
**Key Features**:
- Full REPL experience with command history
- Mock library injection for browser-incompatible modules
- Keyboard shortcuts (Ctrl+L clear, Ctrl+D download)
- Syntax highlighting and error handling
- Session management and export functionality

**Pyodide Integration**:
- Uses `usePython` hook for WASM environment access
- Handles loading/ready states of Python engine
- Code execution through `runCode()` method
- Mock library system for requests and other network-dependent modules

### CodeEditor
**Purpose**: Advanced code editor with Pyodide execution integration
**Key Features**:
- CodeMirror-based editor with Python language support
- Run-to-line functionality for step-by-step debugging
- Syntax checking and validation
- Quick run button with immediate feedback
- Theme switching and responsive design

**Pyodide Integration**:
- Syntax validation through `checkSyntax()` method
- Code execution via `runCode()` with timeout handling
- Loading state management for WASM environment
- Error handling for syntax and execution issues

### ExerciseComponent
**Purpose**: Complete coding exercise environment with dual validation
**Key Features**:
- Dual validation (client-side Pyodide + server-side)
- Real-time feedback and progress tracking
- Hint system with XP impact tracking
- Review mode for unlimited practice
- File setup support for multi-file exercises

**Correctness Evaluation**:
- `validateWithPyodide()` for immediate local validation
- Server submission for final validation and XP awards
- Attempt tracking and analytics
- Comprehensive feedback system with explanations

### QuizComponent
**Purpose**: Interactive quiz system for lesson and module assessments
**Key Features**:
- Real-time answer validation
- Progressive hint system
- XP rewards with toast notifications
- Visual feedback through color coding
- Attempt tracking and adaptive feedback

**Progress Evaluation**:
- Individual question validation for lesson quizzes
- Batch submission for module quizzes
- Server-side validation ensures accuracy
- Completion detection through utility functions
- Callback system for progress tracking

### LessonNavigation
**Purpose**: Navigation flow management with completion logic
**Key Features**:
- Conditional rendering based on completion states
- Module quiz access management
- Progress indicators and visual feedback
- Responsive design with mobile support

**Inter-Component Logic**:
- Receives `lessonFullyCompleted` from parent components
- Checks `module.quizCompleted` for module-wide progress
- Determines appropriate navigation options
- Integrates with overall learning flow

### Supporting Components

#### CodeBlock
- Static code display with syntax highlighting
- Copy functionality with visual feedback
- Theme-aware styling
- Multi-language support

#### LessonContent
- Content renderer with Markdown support
- Integration point for exercises and quizzes
- Theory lesson completion handling
- Visual completion indicators

#### LessonHeader
- Lesson metadata display
- Review mode toggle
- Reporting functionality
- Responsive layout design

## Pyodide Integration Architecture

### WASM Environment Management
```javascript
const { runCode, isReady, isLoading, checkSyntax } = usePython();
```

### Code Execution Flow
1. **Validation**: Syntax checking before execution
2. **Preamble Injection**: Mock libraries for browser compatibility
3. **Execution**: Code runs in isolated Pyodide environment
4. **Result Processing**: stdout, stderr, and output handling
5. **Feedback**: User-friendly error messages and success indicators

### Mock Library System
- `MOCKED_LIBRARIES` object defines browser-incompatible modules
- Automatic detection of imported modules
- Preamble building for seamless integration
- User warnings about simulated functionality

## Progress Evaluation System

### Dual Validation Approach
1. **Client-side**: Immediate feedback through Pyodide
2. **Server-side**: Final validation with XP awards and progress tracking

### Feedback Tiers
- **First attempt**: Generic retry message
- **Second attempt**: Detailed explanation or correct answer
- **Correct**: Server feedback with XP rewards

### Completion Detection
- Lesson completion through individual component tracking
- Module completion through quiz results
- Progress callbacks for parent component integration

## State Management Patterns

### Component States
- **Terminal**: `input`, `output`, `history`, `isExecuting`
- **Editor**: `isRunning`, `quickResult`, `hoveredLineField`
- **Exercise**: `userCode`, `testResults`, `attemptNumber`, `showHints`
- **Quiz**: `answers`, `results`, `attempts`, `serverFeedback`

### Shared Context
- `usePython`: Pyodide environment access
- `useTheme`: Theme management and styling
- `useNotification`: Toast notifications for feedback

## Error Handling Strategies

### Pyodide Errors
- Loading failure states with retry options
- Execution errors with detailed messages
- Syntax validation before execution
- Graceful degradation when unavailable

### Network Errors
- API submission error handling
- Retry mechanisms for failed requests
- User-friendly error messages
- Fallback functionality

## Responsive Design Considerations

### Mobile Optimization
- Touch-friendly interfaces
- Adaptive layouts for different screen sizes
- Flexible button sizing and spacing
- Mobile-first approach

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast themes
- Focus management

## Usage Examples

### Basic Terminal Usage
```javascript
<TerminalComponent
  initialCode="print('Hello, Python!')"
  height="300px"
  onCodeExecute={(result) => console.log(result)}
/>
```

### Exercise Integration
```javascript
<ExerciseComponent
  exercise={exerciseData}
  onCodeSubmit={(code, result) => handleSubmission(code, result)}
  lessonId={lessonId}
  isReviewMode={false}
/>
```

### Quiz Implementation
```javascript
<QuizComponent
  quizArray={quizQuestions}
  lessonId={lessonId}
  onQuizComplete={(completed) => handleQuizComplete(completed)}
  isModuleQuiz={false}
/>
```

## Performance Optimizations

### Code Execution
- Timeout handling for long-running code
- Efficient result processing
- Memory management for large outputs
- Debounced user interactions

### Component Rendering
- Memoized expensive operations
- Conditional rendering for large datasets
- Optimized re-render cycles
- Lazy loading where appropriate

## Testing Considerations

### Unit Testing
- Component state testing
- Mock Pyodide environment
- API response simulation
- User interaction testing

### Integration Testing
- End-to-end lesson flow
- Pyodide integration testing
- Progress tracking validation
- Error scenario testing

## Future Enhancements

### Planned Features
- Enhanced debugging capabilities
- Multi-file project support
- Collaborative coding features
- Advanced analytics integration

### Technical Improvements
- Performance optimizations
- Enhanced error reporting
- Better mobile experience
- Improved accessibility

## Dependencies

### Core Dependencies
- React (hooks, context)
- Pyodide (Python execution)
- CodeMirror (code editing)
- Lucide React (icons)

### Internal Dependencies
- `usePython` hook for Pyodide access
- `useTheme` for styling
- `useNotification` for feedback
- Utility functions for validation

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- WebAssembly support
- ES6+ JavaScript
- Modern CSS features
- Clipboard API for copy functionality

## Security Considerations

### Code Execution
- Sandboxed Pyodide environment
- No file system access
- Network restrictions
- Resource limitations

### Data Handling
- No sensitive data in code execution
- Sanitized user inputs
- Secure API communications
- Privacy-conscious design
