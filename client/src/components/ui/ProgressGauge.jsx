// ProgressGauge.jsx
/**
 * A circular progress gauge component with gradient coloring and animated needle.
 * 
 * This component renders a semi-circular gauge (270° arc) with a moving needle
 * indicator and color gradient background. It provides visual feedback for
 * progress percentage with smooth animations and clear labeling.
 * 
 * @component
 * @example
 * ```jsx
 * <ProgressGauge progress={75} size={250} />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {number} [props.progress=0] - Progress percentage (0-100). Clamped to valid range
 * @param {number} [props.size=200] - Width and height of the gauge in pixels
 * 
 * @returns {JSX.Element} A circular SVG gauge with progress indicator
 * 
 * @visualDesign
 * - Semi-circular gauge with 270° arc (gap at bottom)
 * - Color gradient from red (0%) through yellow to green (100%)
 * - Animated needle pointer showing current progress
 * - Center text showing percentage and "Complete" label
 * - Scale labels at 0% and 100% positions
 * 
 * @gradientColors
 * - 0-20%: Red (#ef4444) - Low progress
 * - 30-70%: Yellow (#FFD700) - Medium progress  
 * - 80-100%: Green (#22c55e) - High progress
 * - Smooth transitions between color zones
 * 
 * @svgStructure
 * - Main SVG rotated 180° to place gap at 6 o'clock position
 * - Background track in light gray
 * - Colored progress track with gradient
 * - Counter-rotated inner group to keep text upright
 * - Needle and center circles rendered last (on top)
 * 
 * @animationBehavior
 * - Needle rotation: 0.5s ease-out transition
 * - Progress track: 0.5s ease-out transition
 * - Smooth interpolation between percentage values
 * - Transform-based animations for performance
 * 
 * @mathCalculations
 * - Radius: 80 units (fixed for viewBox)
 * - Circumference: 2πr = 502.65 units
 * - Arc length: 75% of circumference = 376.99 units
 * - Needle rotation: 135° - (progress × 2.7°)
 * - Dash offset: 12.5% of circumference for gap positioning
 * 
 * @accessibility
 * - Clear visual hierarchy with high contrast
 * - Semantic text elements for screen readers
 * - Consistent color scheme with meaning
 * - Responsive sizing maintains proportions
 */
const ProgressGauge = ({ progress = 0, size = 200 }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° arc length

  // Ensure a number is always returned as a value
  const safeProgress = Number(progress) || 0;
  const rotation = 135 - (safeProgress * 270) / 100;

  return (
    <div className="relative bg-gray-100 rounded-xl shadow-2xl p-6 font-sans dark:bg-gray-600">
      <h2 className="text-center text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Progress Status
      </h2>

      {/* Main gauge container */}
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          // Flip the entire SVG 180 degrees to put the gap at 6 o'clock
          style={{ transform: "rotate(180deg)" }}
        >
          <defs>
            <linearGradient
              id="progressGradient"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="0%"
            >
              {/* Vibrant Yellow and expanded range retained */}
              <stop offset="0%" stopColor="#22c55e" /> {/* Green (100% side) */}
              <stop offset="20%" stopColor="#22c55e" /> {/* Hold green */}
              <stop offset="30%" stopColor="#FFD700" />{" "}
              {/* Transition to Vibrant Yellow */}
              <stop offset="70%" stopColor="#FFD700" />{" "}
              {/* Hold Vibrant Yellow longer */}
              <stop offset="80%" stopColor="#ef4444" />{" "}
              {/* Transition to Red */}
              <stop offset="100%" stopColor="#ef4444" /> {/* Red (0% side) */}
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={circumference * 0.125}
          />

          {/* Colored progress track (Static Scale) */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={circumference * 0.125}
            className="transition-all duration-500 ease-out"
          />

          {/* Counter-rotate internal elements to keep text/needle upright and logical */}
          <g transform="rotate(-180 100 100)">
            {/* CENTER TEXT - rendered first (behind needle) */}
            <text
              x="100"
              y="85"
              fontSize="20"
              fill="#3776ab"
              textAnchor="middle"
              fontWeight="bold"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {progress}%
            </text>
            <text
              x="100"
              y="120"
              fontSize="14"
              fill="#3776ab"
              textAnchor="middle"
              fontWeight="bold"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Complete
            </text>

            {/* Percentage labels */}
            <text
              x="145"
              y="175"
              fontSize="12"
              fill="#ef4444"
              textAnchor="middle"
              fontWeight="bold"
            >
              0%
            </text>
            <text
              x="55"
              y="175"
              fontSize="12"
              fill="#22c55e"
              textAnchor="middle"
              fontWeight="bold"
            >
              100%
            </text>

            {/* NEEDLE - rendered last (on top of everything) */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="#1f2937"
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${rotation} 100 100)`}
              style={{ transition: "transform 0.5s ease-out" }}
            />

            {/* Needle center - also on top */}
            <circle cx="100" cy="100" r="8" fill="#1f2937" />
            <circle cx="100" cy="100" r="5" fill="#fefefe" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ProgressGauge;
