// ProgressGauge.jsx

const ProgressGauge = ({ progress, size = 200 }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° arc length

  // CORRECTED Needle Rotation Logic: 0% = 135° (right), 100% = -135° (left)
  const rotation = 135 - (progress * 270) / 100;

  return (
    <div className="relative bg-white rounded-xl shadow-2xl p-6 font-sans">
      <h2 className="text-center text-xl font-semibold mb-4 text-gray-800">
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
