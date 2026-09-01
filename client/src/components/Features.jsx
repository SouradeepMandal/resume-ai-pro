import { FaRobot, FaChartLine, FaFileAlt, FaBriefcase, FaLightbulb, FaUserCheck } from "react-icons/fa";

const features = [
  {
    icon: <FaChartLine size={35} />,
    title: "ATS Score",
    description: "Instantly check how ATS-friendly your resume is."
  },
  {
    icon: <FaRobot size={35} />,
    title: "AI Analysis",
    description: "Get AI-powered suggestions to improve your resume."
  },
  {
    icon: <FaLightbulb size={35} />,
    title: "Skill Gap",
    description: "Find missing technical and soft skills."
  },
  {
    icon: <FaBriefcase size={35} />,
    title: "Job Matching",
    description: "Compare your resume with job descriptions."
  },
  {
    icon: <FaFileAlt size={35} />,
    title: "Resume Optimization",
    description: "Improve formatting and keyword usage."
  },
  {
    icon: <FaUserCheck size={35} />,
    title: "Interview Ready",
    description: "Receive actionable feedback before applying."
  }
];

function Features() {
  return (
    <section className="text-white py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center mb-4">
          Why Choose ResumeAI Pro?
        </h2>

        <p className="text-center text-gray-400 mb-16 text-lg">
          Everything you need to build a recruiter-ready resume.
        </p>

        <div className="grid grid-cols-3 gap-8">

          {features.map((feature, index) => (

            <div
              key={index}
              className="glass-dark rounded-2xl p-8 hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(43,181,160,0.15)] hover:-translate-y-2 transition-all duration-300 group"
            >

              <div className="text-teal-400 mb-5 group-hover:scale-110 group-hover:text-teal-300 transition-all duration-300">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-400">
                {feature.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Features;