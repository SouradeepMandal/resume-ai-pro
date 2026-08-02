import { FaUsers, FaFileAlt, FaStar } from "react-icons/fa";

function Stats() {
  return (
    <section className="bg-slate-950 text-white py-24">

      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center mb-16">
          Trusted by Thousands
        </h2>

        <div className="grid grid-cols-3 gap-8">

          <div className="bg-slate-900 rounded-2xl p-10 text-center border border-slate-700">

            <FaFileAlt
              className="mx-auto text-blue-400 mb-6"
              size={40}
            />

            <h3 className="text-5xl font-bold">
              10K+
            </h3>

            <p className="text-gray-400 mt-4">
              Resumes Analyzed
            </p>

          </div>

          <div className="bg-slate-900 rounded-2xl p-10 text-center border border-slate-700">

            <FaUsers
              className="mx-auto text-green-400 mb-6"
              size={40}
            />

            <h3 className="text-5xl font-bold">
              95%
            </h3>

            <p className="text-gray-400 mt-4">
              ATS Improvement
            </p>

          </div>

          <div className="bg-slate-900 rounded-2xl p-10 text-center border border-slate-700">

            <FaStar
              className="mx-auto text-yellow-400 mb-6"
              size={40}
            />

            <h3 className="text-5xl font-bold">
              4.9★
            </h3>

            <p className="text-gray-400 mt-4">
              User Rating
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Stats;