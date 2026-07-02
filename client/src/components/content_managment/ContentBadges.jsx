// components/ContentBadges.jsx
import { getDifficultyStyles, getDifficultyLabel } from "../../utils";

/**
 * Renders a difficulty badge with appropriate styling
 * @param {Object} props
 * @param {string} props.difficulty - The difficulty level
 * @returns {JSX.Element} Difficulty badge component
 */
export const DifficultyBadge = ({ difficulty }) => {
  const styles = getDifficultyStyles(difficulty);
  const label = getDifficultyLabel(difficulty);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}
    >
      {label}
    </span>
  );
};
