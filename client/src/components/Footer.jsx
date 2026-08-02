function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-gray-400">
      <div className="max-w-7xl mx-auto px-8 py-12">

        <div className="grid md:grid-cols-4 gap-8">

          <div>
            <h2 className="text-2xl font-bold text-white">
              ResumeAI <span className="text-sky-400">Pro</span>
            </h2>

            <p className="mt-4">
              AI-powered resume optimization platform that helps job seekers
              land more interviews.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Product
            </h3>

            <ul className="space-y-2">
              <li>ATS Checker</li>
              <li>Resume Builder</li>
              <li>AI Suggestions</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Company
            </h3>

            <ul className="space-y-2">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Follow
            </h3>

            <ul className="space-y-2">
              <li>LinkedIn</li>
              <li>GitHub</li>
              <li>Twitter</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center">
          © 2026 ResumeAI Pro. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;