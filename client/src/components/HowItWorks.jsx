import {
  FaUpload,
  FaRobot,
  FaChartBar,
  FaCheckCircle
} from "react-icons/fa";

const steps = [
  {
    icon: <FaUpload size={32} />,
    title: "Upload Resume",
    description: "Upload your resume in PDF or DOCX format."
  },
  {
    icon: <FaRobot size={32} />,
    title: "AI Analysis",
    description: "Our AI scans your resume against ATS standards."
  },
  {
    icon: <FaChartBar size={32} />,
    title: "Get Detailed Report",
    description: "Receive ATS score, skill gaps and AI suggestions."
  },
  {
    icon: <FaCheckCircle size={32} />,
    title: "Become Interview Ready",
    description: "Apply with confidence using the improved resume."
  }
];

function HowItWorks() {
  return (
    <section className="bg-black text-white py-24">

      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center">
          How It Works
        </h2>

        <p className="text-center text-gray-400 mt-4 mb-20">
          Improve your resume in just four simple steps.
        </p>

        <div className="grid grid-cols-4 gap-8">

          {steps.map((step, index) => (

            <div
              key={index}
              className="text-center"
            >

              <div className="mx-auto w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-6">
                {step.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                {step.title}
              </h3>

              <p className="text-gray-400">
                {step.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;