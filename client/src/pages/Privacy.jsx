import { useEffect, useState } from "react";
import { BackToTopButton, MarkdownRenderer } from "../components/ui";

/**
 * Privacy Policy page that renders the privacy.md content.
 * Fetches the markdown file from the public directory and displays it
 * using the existing MarkdownRenderer component.
 *
 * @component
 * @returns {JSX.Element} Privacy policy page with rendered markdown content
 */
const Privacy = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await fetch("/privacy.md");
        if (!response.ok) {
          throw new Error("Failed to load privacy policy");
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error("Error loading privacy policy:", err);
        setError("Unable to load the privacy policy. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading privacy policy...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            You can also contact us at{" "}
            <a
              href="mailto:learning2py@gmail.com"
              className="text-python-blue dark:text-python-yellow underline"
            >
              learning2py@gmail.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 sm:p-10">
          <MarkdownRenderer content={content} />
        </div>
      </div>
      <BackToTopButton />
    </div>
  );
};

export default Privacy;
