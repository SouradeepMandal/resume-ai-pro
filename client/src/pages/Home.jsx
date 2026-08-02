import { motion } from "framer-motion";
import heroImage from "../assets/hero.png";
import Features from "../components/Features";
import Stats from "../components/Stats";
import HowItWorks from "../components/HowItWorks";

function Home() {
  return (
    <>
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white pt-24 overflow-hidden">

      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between gap-12">

        {/* LEFT */}

        <div className="flex-1">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm mb-6"
          >
            🚀 Trusted by Developers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl font-extrabold leading-tight"
          >
            Build an
            <span className="text-blue-400"> Interview Winning </span>
            Resume
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-xl text-gray-300 leading-8"
          >
            Upload your resume and let AI analyze your ATS score,
            detect missing skills, optimize content and help you
            become interview ready.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex gap-5"
          >

            <button className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/40">
              Get Started
            </button>

            <button className="px-8 py-4 rounded-xl border border-white/30 hover:bg-white hover:text-black transition-all duration-300">
              Upload Resume
            </button>

          </motion.div>

        </div>

        {/* RIGHT */}

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative flex-1 flex justify-center"
        >

          <div className="absolute w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"></div>

          <img
            src={heroImage}
            alt="AI Resume"
            className="relative w-[520px]"
          />

          {/* Floating Card 1 */}

          <div className="absolute top-10 left-0 bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-xl p-4 shadow-xl">

            <p className="text-sm text-gray-400">
              ATS Score
            </p>

            <h2 className="text-2xl font-bold text-green-400">
              94%
            </h2>

          </div>

          {/* Floating Card 2 */}

          <div className="absolute bottom-12 right-0 bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-xl p-4 shadow-xl">

            <p className="text-sm text-gray-400">
              AI Suggestions
            </p>

            <h2 className="text-2xl font-bold text-blue-400">
              25+
            </h2>

          </div>

        </motion.div>

      </div>

    </section>
    <Features/>
    <HowItWorks/>
    <Stats/>
    </>
  );
}

export default Home;