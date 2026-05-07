import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MessageSquare,
  Bug,
  Send,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useNotification, useTheme } from "../context";
import { apiClient } from "../services";
import { getErrorMessage, getSuccessMessage } from "../utils";
import { BackToTopButton } from "../components/ui";

/**
 * Support and feedback page with comprehensive contact form and help resources.
 * This page provides multiple support channels including a detailed contact form with
 * category-specific fields, quick links to help resources, and contextual information
 * for different support needs. Features form validation, success states, and responsive design.
 */

/**
 * Support page component providing comprehensive help and feedback functionality.
 * 
 * This component offers multiple support channels including a detailed contact form with
 * category-specific fields (bug reports include module/lesson numbers), quick links to
 * help resources, and contextual support information. Features form validation, success
 * states with confirmation messaging, error handling with toast notifications, and
 * responsive design. Includes direct contact information and helpful tips for different
 * support scenarios.
 * 
 * @component
 * @returns {JSX.Element} Complete support page with form and resources
 * 
 * @stateManagement
 * - formData: Form data including name, email, category, subject, message
 * - submitting: Loading state during form submission
 * - isSubmitted: Success state for confirmation display
 * 
 * @formFeatures
 * - Dynamic form fields based on category selection
 * - Bug-specific fields for module and lesson numbers
 * - Category selection with dropdown styling
 * - Form validation with required field indicators
 * - Success state with confirmation messaging
 * 
 * @supportCategories
 * - Technical Help: General assistance requests
 * - Course Feedback: Feedback on learning content
 * - Report a Bug: Error reporting with specific fields
 * - Feature Request: Suggestions for improvements
 * - Other: Miscellaneous inquiries
 * 
 * @quickLinks
 * - Direct navigation to curriculum page
 * - Link to FAQ for common questions
 * - Visual icons and descriptions for each resource
 * - Hover effects and transitions
 * 
 * @contactInformation
 * - Direct email contact: hello@learningtopy.com
 * - Response time expectations (24-48 hours)
 * - Contextual tips for different support needs
 * - Bug reporting guidance with specific instructions
 * 
 * @userExperience
 * - Loading states during form submission
 * - Success confirmation with email display
 * - Error handling with toast notifications
 * - Form reset functionality for multiple submissions
 * - Responsive design for mobile and desktop
 * 
 * @visualDesign
 * - Theme-aware styling throughout
 * - Icon integration for visual hierarchy
 * - Color-coded information sections
 * - Gradient backgrounds for CTAs
 * - Consistent spacing and typography
 */
const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "help",
    subject: "",
    message: "",
    moduleNumber: "",
    lessonNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isDarkMode } = useTheme();
  const { showToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiClient.post("/support", {
        name: formData.name,
        email: formData.email,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        moduleNumber: formData.moduleNumber,
        lessonNumber: formData.lessonNumber,
      });

      setIsSubmitted(true);
      const successMessage =
        response.message || getSuccessMessage("send", "message");
      showToast(successMessage, "success");
    } catch (err) {
      // Fixed: using err instead of error
      const errorMessage = getErrorMessage(
        err,
        "Failed to send message. Please try again.",
        "general",
      );
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Message Sent!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thanks for reaching out. We'll get back to you at{" "}
            <strong>{formData.email}</strong> as soon as possible.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: "",
                email: "",
                category: "help",
                subject: "",
                message: "",
                moduleNumber: "",
                lessonNumber: "",
              });
            }}
            className="w-full py-3 bg-python-blue hover:bg-python-dark text-white font-semibold rounded-xl transition-all"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 px-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Support & Feedback
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Have a question, found a bug, or want to suggest an improvement?
              We're here to help you on your Python journey.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 px-2 md:px-0">
            <Link
              to="/curriculum"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-python-blue dark:hover:border-python-yellow transition-all group"
            >
              <BookOpen className="h-8 w-8 text-python-blue dark:text-python-yellow mr-3" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  View Full Curriculum
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  20 modules, 100+ exercises
                </p>
              </div>
            </Link>
            <Link
              to="/faq"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-python-blue dark:hover:border-python-yellow transition-all group"
            >
              <HelpCircle className="h-8 w-8 text-python-blue dark:text-python-yellow mr-3" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Frequently Asked Questions
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Find answers quickly
                </p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 md:px-0">
            {/* Contact Info Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Mail
                    className="mr-2 text-python-blue dark:text-python-yellow"
                    size={18}
                  />
                  Direct Contact
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Email us directly at:
                </p>
                <a
                  href="mailto:hello@learningtopy.com"
                  className="text-python-blue dark:text-python-yellow hover:underline font-mono text-sm"
                >
                  hello@learningtopy.com
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  We typically respond within 24-48 hours.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                <h4 className="text-amber-800 dark:text-amber-400 font-medium mb-2 flex items-center">
                  <Bug className="mr-2" size={18} /> Report a Bug
                </h4>
                <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                  If you found an error in a lesson, please include the Module
                  and Lesson number so we can fix it quickly!
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <h4 className="text-blue-800 dark:text-blue-400 font-medium mb-2 flex items-center">
                  <MessageSquare className="mr-2" size={18} /> Feature
                  Suggestions
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                  Have an idea to make the platform better? We'd love to hear
                  it!
                </p>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-500 italic leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                * This is a learning project. While we strive to respond
                promptly, responses may take 24-48 hours depending on
                availability.
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8 rounded-2xl shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-python-blue dark:focus:border-python-yellow transition-colors text-gray-900 dark:text-white"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-python-blue dark:focus:border-python-yellow transition-colors text-gray-900 dark:text-white"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-python-blue dark:focus:border-python-yellow transition-colors text-gray-900 dark:text-white appearance-none cursor-pointer"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      >
                        <option value="help">Technical Help</option>
                        <option value="feedback">Course Feedback</option>
                        <option value="bug">Report a Bug</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-python-blue dark:focus:border-python-yellow transition-colors text-gray-900 dark:text-white"
                      placeholder="Brief summary"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Bug-specific fields */}
                {formData.category === "bug" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Module Number
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-python-blue dark:focus:border-python-yellow transition-colors text-gray-900 dark:text-white"
                        placeholder="e.g., M3"
                        value={formData.moduleNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            moduleNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lesson Number
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-python-blue dark:focus:border-python-yellow transition-colors text-gray-900 dark:text-white"
                        placeholder="e.g., L3"
                        value={formData.lessonNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lessonNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows="5"
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-python-blue dark:focus:border-python-yellow transition-colors text-gray-900 dark:text-white resize-none"
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-python-blue hover:bg-python-dark dark:bg-python-yellow dark:hover:bg-python-light text-white dark:text-gray-900 font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white dark:border-gray-900 border-t-transparent mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send size={18} className="ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <BackToTopButton />
    </div>
  );
};

export default Support;
