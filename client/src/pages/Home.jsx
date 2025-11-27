// Home.jsx
import { Link } from "react-router-dom";
import {
  Rocket,
  Trophy,
  Layers,
  Target,
  Users,
  Zap,
  Code2,
  Sparkles,
  Award,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { useAuth, useTheme } from "../context";
import { BackToTopButton } from "../components/ui";

const Home = () => {
  const { themeColor } = useTheme();
  const { isAuthenticated } = useAuth();

  const ctaLink = isAuthenticated ? "/dashboard" : "/register";
  const ctaLabel = isAuthenticated
    ? "Go to Dashboard"
    : "Start Learning for Free";

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-python-blue opacity-10 blur-3xl rounded-full" />
          <div className="absolute top-1/3 -left-24 w-80 h-80 bg-python-yellow opacity-20 blur-3xl rounded-full" />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Zap size={16} />
                <span>Learn Python the smart, gamified way</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                Master Python,{" "}
                <span className="text-python-blue">level up</span> your career
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Interactive lessons, competitive leaderboards, and real rewards.
                Learn by doing, stay motivated with XP and badges, and
                accelerate your path to becoming a Python pro.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={ctaLink}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ backgroundColor: themeColor }}
                >
                  {ctaLabel}
                </Link>
                <Link
                  to="/modules"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-python-blue border border-python-blue hover:bg-blue-50 transition"
                >
                  Explore Curriculum
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-500">Current Streak</p>
                    <p className="text-3xl font-bold text-slate-900">7 days</p>
                  </div>
                  <div className="bg-green-100 text-green-600 px-4 py-2 rounded-full flex items-center space-x-2 font-semibold">
                    <Trophy size={18} />
                    <span>Top 10%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { title: "XP Earned", value: "1,240", icon: Zap },
                    { title: "Badges", value: "6", icon: Award },
                    { title: "Modules", value: "12", icon: Layers },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="bg-slate-100 rounded-2xl p-4 text-center border border-slate-200"
                    >
                      <item.icon
                        size={20}
                        className="text-python-blue mx-auto mb-2"
                      />
                      <p className="text-sm text-slate-600">{item.title}</p>
                      <p className="text-xl font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-300">
                      Leaderboard Snapshot
                    </p>
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                      Competitive Mode
                    </span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: "CodeCrusader", xp: "2,140", position: 1 },
                      { name: "PyNinja", xp: "1,780", position: 2 },
                      { name: "You", xp: "1,240", position: 8 },
                    ].map((player) => (
                      <div
                        key={player.name}
                        className={`flex items-center justify-between bg-slate-800/60 px-4 py-3 rounded-xl ${
                          player.name === "You"
                            ? "border border-python-yellow/40"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold">
                            #{player.position}
                          </div>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <span className="text-python-yellow font-semibold">
                          {player.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                  <BackToTopButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Gamification & Feature Highlights */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Gamified learning that keeps you engaged
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Every lesson is a challenge. Every challenge earns rewards. Track
              your progress, compete with peers, and celebrate achievements as
              you level up your Python skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Trophy,
                title: "Leaderboards",
                description:
                  "Compete with the community, climb ranks, and stay motivated with friendly competition.",
              },
              {
                icon: TrendingUp,
                title: "Points & XP",
                description:
                  "Earn experience for every challenge you solve and watch your stats grow.",
              },
              {
                icon: Award,
                title: "Badges & Achievements",
                description:
                  "Unlock milestone badges as you master topics and complete streaks.",
              },
              {
                icon: ShieldCheck,
                title: "Mastery Paths",
                description:
                  "Track your progress through structured learning paths from beginner to advanced.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition"
              >
                <feature.icon size={28} className="text-python-blue mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Methodology */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Learn by doing with hands-on challenges
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our interactive platform is designed to help you absorb concepts
                faster through practice. Build real skills with coding
                exercises, receive instant insights, and follow curated paths
                that guide you from fundamentals to advanced topics.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Code2,
                    title: "Interactive Coding Environment",
                    description:
                      "Write and run Python code directly in your browser with no setup required.",
                  },
                  {
                    icon: Sparkles,
                    title: "Real-Time Feedback",
                    description:
                      "Learn from immediate hints, test results, and smart error explanations.",
                  },
                  {
                    icon: Target,
                    title: "Structured Learning Paths",
                    description:
                      "Follow focused modules crafted by instructors to build competence step-by-step.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start space-x-4">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <item.icon size={20} className="text-python-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-python-yellow blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-python-blue blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">
                  Instant feedback in action
                </h3>
                <div className="bg-slate-800/70 rounded-2xl p-6 border border-slate-700 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-semibold">
                        PY
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">
                          Lesson 3 · Basic Operations
                        </p>
                        <p className="font-semibold text-white">
                          Output Preview
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                      Passed tests
                    </span>
                  </div>

                  <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-slate-100">
                    <p className="text-xs uppercase text-slate-500 mb-3">
                      Console
                    </p>
                    <pre className="whitespace-pre-wrap">
                      {`>>> total = 3 * 4 + 2
>>> print(total)
14
✅ Looks great! Remember: Python follows PEMDAS order of operations.`}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-slate-300">
                  {[
                    "Live unit tests",
                    "Hints & explanations",
                    "Concept references",
                    "AI-assisted debugging",
                  ].map((item) => (
                    <div
                      key={item}
                      className="bg-slate-800/70 rounded-xl p-4 border border-slate-700"
                    >
                      <p className="text-sm font-medium text-white">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Break free from boring tutorials
              </h2>
              <p className="text-lg text-slate-200 leading-relaxed mb-8">
                Traditional textbooks and video lectures make it hard to stay
                engaged. Our platform turns learning into a game, keeping you
                inspired and accountable every step of the way.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Textbooks feel stale?",
                    description:
                      "We make it interactive with real coding challenges.",
                  },
                  {
                    title: "Hard to stay motivated?",
                    description:
                      "Earn XP, badges, and compete on leaderboards.",
                  },
                  {
                    title: "Unsure what to learn next?",
                    description:
                      "Structured paths guide you from beginner to advanced topics.",
                  },
                  {
                    title: "Studying alone?",
                    description:
                      "Join a community of learners who are on the same journey.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700"
                  >
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">
                Here’s our winning formula
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                We combine battle-tested learning science with compelling game
                mechanics to keep you growing week after week.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Users,
                    title: "Supportive community",
                    description:
                      "Connect with peers, share solutions, and celebrate wins together.",
                  },
                  {
                    icon: Rocket,
                    title: "Career-focused skills",
                    description:
                      "Build projects and practice hands-on problems that employers value.",
                  },
                  {
                    icon: Layers,
                    title: "Layered mastery",
                    description:
                      "Reinforce concepts with progressively challenging tasks and reviews.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start space-x-4">
                    <div className="shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <item.icon size={22} className="text-python-blue" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps stand between you and your next career
              milestone. Dive in and start transforming your learning journey
              today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Choose your module",
                description:
                  "Pick a curated learning path aligned to your goals, from fundamentals to data structures.",
              },
              {
                step: "02",
                title: "Complete interactive challenges",
                description:
                  "Practice with hands-on coding, quizzes, and projects that cement your understanding.",
              },
              {
                step: "03",
                title: "Earn badges & level up",
                description:
                  "Gain XP, unlock badges, and track your streak as you push toward mastery.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition relative overflow-hidden"
              >
                <div className="absolute top-6 right-6 text-4xl font-bold text-slate-100">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-6">
                  <Link
                    to={
                      index === 0
                        ? "/modules"
                        : isAuthenticated
                        ? "/dashboard"
                        : "/register"
                    }
                    className="text-python-blue font-semibold hover:underline inline-flex items-center space-x-2"
                  >
                    <span>Learn more</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology / Curriculum Highlights */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Curriculum designed for real-world impact
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Follow a proven roadmap covering core computer science concepts
              and modern Python applications. Build projects that make your
              portfolio stand out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Python Fundamentals",
                description:
                  "Variables, data types, control flow, functions, modules, testing, and best practices.",
              },
              {
                title: "Data Structures & Algorithms",
                description:
                  "Lists, dictionaries, sets, recursion, sorting, searching, and complexity analysis.",
              },
              {
                title: "Automation & Real Projects",
                description:
                  "File handling, APIs, web scraping, automation scripts, and capstone challenges.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-slate-900 text-white rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to={ctaLink}
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              style={{ backgroundColor: themeColor }}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Ready to start your Python journey? Join thousands of learners
            leveling up with interactive challenges, real-time feedback, and
            tangible rewards.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
