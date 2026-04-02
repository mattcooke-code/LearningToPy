// FAQ.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  BookOpen,
  Trophy,
  Zap,
  Shield,
  HelpCircle,
} from "lucide-react";
import { BackToTopButton } from "../components/ui";

const FAQ = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        {
          id: "what-is",
          question: "What is Learning To Py?",
          answer:
            "Learning To Py is an interactive Python learning platform that combines structured lessons, hands-on coding exercises, and gamified progression to help you master Python programming. You'll learn by writing real code in your browser with instant feedback.",
        },
        {
          id: "free",
          question: "Is this platform free?",
          answer:
            "Yes! All core curriculum content is completely free. There are no hidden fees or premium tiers. Our mission is to make Python education accessible to everyone.",
        },
        {
          id: "prerequisites",
          question: "Do I need prior programming experience?",
          answer:
            "Not at all! Our curriculum starts from absolute basics. Module 1 assumes no prior programming knowledge and gradually builds up your skills.",
        },
      ],
    },
    {
      id: "progress",
      title: "Progress & Levels",
      icon: <Trophy className="h-5 w-5" />,
      items: [
        {
          id: "level-system",
          question: "How does the level system work?",
          answer:
            "You earn one level for each module you complete (excluding the tutorial module). Complete Module 1 to reach Level 1, Module 2 for Level 2, and so on up to Level 20. Your XP also increases as you complete lessons and exercises.",
        },
        {
          id: "streaks",
          question: "What are streaks and how do they work?",
          answer:
            "Streaks track your daily learning consistency. Complete at least one lesson each day to maintain your streak. Longer streaks earn bonus XP and special badges!",
        },
        {
          id: "xp-earning",
          question: "How do I earn XP?",
          answer:
            "You earn XP from: completing lessons, solving coding exercises, passing quizzes, finishing modules, and maintaining learning streaks. The more you engage with the content, the more XP you earn!",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical",
      icon: <Zap className="h-5 w-5" />,
      items: [
        {
          id: "code-run",
          question: "How does the code execution work?",
          answer:
            "We use Pyodide, which runs Python directly in your browser using WebAssembly. Your code never leaves your computer - it's executed locally for security and speed.",
        },
        {
          id: "browser-support",
          question: "Which browsers are supported?",
          answer:
            "We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox.",
        },
        {
          id: "save-progress",
          question: "Is my progress saved?",
          answer:
            "Yes! Your progress is automatically saved to your account. You can log in from any device and continue where you left off.",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <Shield className="h-5 w-5" />,
      items: [
        {
          id: "reset-password",
          question: "How do I reset my password?",
          answer:
            "Click 'Forgot Password' on the login page. Enter your email address and we'll send you a password reset link. If you don't see the email, check your spam folder.",
        },
        {
          id: "lesson-not-completing",
          question: "A lesson isn't marking as complete. What should I do?",
          answer:
            "First, try refreshing the page. If that doesn't work, complete the lesson again. If you're still having issues, use the 'Report an Issue' button on the lesson page (flag symbol) to let us know, or contact support.",
        },
        {
          id: "bug-report",
          question: "How do I report a bug or error in a lesson?",
          answer:
            "You can report issues directly from any lesson page using the flag/report button. Include as much detail as possible - what you expected vs what happened. For critical issues, email us at hello@learningtopy.com",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Privacy",
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        {
          id: "delete-account",
          question: "How do I delete my account?",
          answer:
            "Please contact us at hello@learningtopy.com with your account details, and we'll assist you with account deletion.",
        },
        {
          id: "privacy",
          question: "How is my data protected?",
          answer:
            "We take privacy seriously. Your data is encrypted, and we never share your personal information with third parties. See our Privacy Policy for full details.",
        },
        {
          id: "leaderboard",
          question: "How does the leaderboard work?",
          answer:
            "The leaderboard ranks users by total XP earned. You can control your privacy settings in your profile - choose to show/hide your username or appear anonymously.",
        },
      ],
    },
  ];

  // Filter FAQ items based on search
  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          {/* Header */}
          <div className="text-center mb-12 px-4">
            <h1 className="text-4xl font-bold text-python-blue dark:text-python-yellow mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-800 dark:text-gray-300 max-w-3xl mx-auto pt-3">
              Find answers to common questions about Learning To Py. Can't find
              what you're looking for? Contact our support team.
            </p>
          </div>

          {/*Search Bar and FAQ  */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              {/* Add max-w-lg mx-auto here to constrain & center on desktop */}
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-python-blue/20 focus:border-python-blue dark:focus:border-python-yellow text-gray-900 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* FAQ Content Area */}
            <div className="p-2 md:p-6">
              <div className="space-y-10">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="last:mb-4">
                    <div className="flex items-center space-x-3 mb-4 px-4">
                      <div className="text-python-blue dark:text-python-yellow">
                        {category.icon}
                      </div>
                      <h2 className="text-xl font-bold text-python-dark dark:text-python-light">
                        {category.title}
                      </h2>
                    </div>

                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="group border-b last:border-0 border-gray-100 dark:border-gray-700/50"
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-python-blue/5 dark:hover:bg-python-yellow/5 transition-colors rounded-xl"
                          >
                            <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-python-blue dark:group-hover:text-python-yellow">
                              {item.question}
                            </span>
                            {openItems[item.id] ? (
                              <ChevronUp className="h-5 w-5 text-python-blue dark:text-python-yellow" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          {openItems[item.id] && (
                            <div className="px-4 pb-5 pt-1">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try a different search term, or contact our support team.
              </p>
            </div>
          )}

          {/* Contact Support CTA */}
          <div className="mt-12 p-6 md:p-10 max-w-4xl mx-auto bg-gradient-to-r from-python-blue to-python-yellow  rounded-2xl text-center">
            <Mail className="h-8 w-8 text-python-dark dark:text-python-yellow mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-900 mb-6">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <Link
              to="/support"
              className="inline-flex items-center px-6 py-3 bg-python-dark hover:bg-python-blue dark:bg-python-yellow dark:hover:bg-python-light text-white dark:text-gray-900 font-semibold rounded-xl transition-all"
            >
              Contact Support
              <Mail className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <BackToTopButton />
    </div>
  );
};

export default FAQ;
