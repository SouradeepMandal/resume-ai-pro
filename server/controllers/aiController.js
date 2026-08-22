const { GoogleGenerativeAI } = require("@google/generative-ai");
const Resume = require("../models/Resume");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

// API Key Rotation Logic
const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5
].filter(Boolean); // Keep only defined keys

let currentKeyIndex = 0;

function getGenAI() {
  if (apiKeys.length === 0) {
    throw new Error("No Gemini API keys configured in environment variables.");
  }
  const key = apiKeys[currentKeyIndex];
  // Round-robin to the next key
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return new GoogleGenerativeAI(key);
}

// Helper to handle rate limits and dynamically rotate keys
async function generateContentWithRetry(prompt, maxRetries = apiKeys.length || 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.5-flash-lite",
        generationConfig: { temperature: 0, responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      lastError = error;
      if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
        console.warn(`API Rate limit hit. Retrying with next key... (Attempt ${i + 1} of ${maxRetries})`);
        await new Promise(res => setTimeout(res, 1500)); // Small delay
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// Helper to truncate text to save massive token usage
const truncateText = (text, maxLength = 8000) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

/**
 * Score Resume against a Job Description
 */
const scoreATS = async (req, res) => {
  console.log("scoreATS called with body:", req.body);
  try {
    const { resumeId, jobDescription, customText } = req.body;
    
    if ((!resumeId && !customText) || !jobDescription) {
      console.log("Missing fields in scoreATS");
      return res.status(400).json({ message: "Resume ID or custom text and Job Description are required." });
    }

    let textToAnalyze = customText;
    let resume = null;

    if (!customText) {
      resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      if (!resume.extractedText) {
        return res.status(400).json({ message: "Resume text not extracted yet. Please re-upload your resume." });
      }

      // 100% Deterministic: If the user re-analyzes the exact same JD, return the cached result
      if (resume.targetJobDescription && resume.targetJobDescription.trim() === jobDescription.trim() && resume.atsFeedback) {
        console.log("Returning cached ATS analysis for identical Job Description.");
        return res.json(resume.atsFeedback);
      }

      textToAnalyze = resume.extractedText;
    }

    // Truncate to save tokens and prevent huge payloads causing 429s
    const safeText = truncateText(textToAnalyze, 8000);
    const safeJd = truncateText(jobDescription, 5000);

    const prompt = `
      You are an expert ATS (Applicant Tracking System) Analyzer.
      Your task is to exhaustively compare the Resume against the Job Description (JD).
      Resume: ${safeText}
      JD: ${safeJd}
      
      Return ONLY a valid JSON object (no markdown, no backticks) with EXACTLY this structure:
      {
        "atsScore": 85,
        "matchAnalysis": "Brief summary",
        "missingSkills": ["skill1"],
        "matchingSkills": ["skill2"],
        "recommendations": ["Actionable tip"]
      }
      
      RULES FOR SKILL EXTRACTION (EXTREMELY CRITICAL):
      1. Perform an EXHAUSTIVE, line-by-line keyword extraction of the JD. Do not miss ANY technical skill, tool, framework, or core competency mentioned.
      2. Strictly compare the extracted JD skills against the Resume.
      3. Skills found in the Resume MUST be placed in "matchingSkills".
      4. Skills found in the JD but missing from the Resume MUST be placed in "missingSkills". Leave nothing out.
      5. Do NOT list missingSkills if they exist anywhere in the resume text.
      6. Recommendations must be actionable resume edits.
    `;
    const result = await generateContentWithRetry(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini in scoreATS. Raw output:", text);
      return res.status(500).json({ message: "Failed to analyze resume. AI returned invalid format." });
    }

    // Save to resume only if we pulled it from the DB
    if (!customText && resume) {
      resume.targetJobDescription = jobDescription;
      resume.atsScore = parsedData.atsScore;
      resume.atsFeedback = parsedData;
      await resume.save();
    }

    res.json(parsedData);
  } catch (error) {
    console.error("Error in scoreATS:", error);
    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(429).json({ message: "Gemini API Rate Limit Exceeded. Please wait 1 minute before trying again." });
    }
    res.status(500).json({ message: "Error scoring resume. Please try again." });
  }
};



/**
 * Rebuild Resume based on ATS Feedback
 */
const rebuildResume = async (req, res) => {
  try {
    const { resumeId, jobDescription, autoIntegrate, missingSkills = [] } = req.body;
    
    if (!resumeId) {
      return res.status(400).json({ message: "Resume ID is required." });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (!resume.extractedText) {
      return res.status(400).json({ message: "Resume text not extracted yet." });
    }

    const safeText = truncateText(resume.extractedText, 8000);
    const safeJd = truncateText(jobDescription, 5000);

    const prompt = `
      You are an expert ATS Resume Rebuilder.
      JD: ${safeJd}
      Original Resume: ${safeText}
      
      Your task is to REWRITE the resume to maximize the ATS score.
      RULES:
      1. EXTREMELY CRITICAL: You MUST copy ALL dates and timestamps EXACTLY as they appear for their respective items in the original resume. If a date is missing for an item (e.g. an internship or project), leave the "date" field EMPTY or use exactly what was written (e.g. "2 months", "Ongoing"). DO NOT guess, DO NOT swap dates between sections, and DO NOT copy dates from one section to another.
      2. No buzzwords.
      3. Extract Name, Email, Phone, Location, LinkedIn to personalInfo.
      4. MUST have: summary, experience, education, skills.
      5. Optional: certifications, projects, languages, hobbies, achievements, publications, references.
      6. Use standard headers.
      7. Use action verbs for bullets.
      8. Use exact keywords from JD.
      ${autoIntegrate && missingSkills.length > 0 ? `9. EXTREMELY CRITICAL: You MUST include the following skills EXACTLY as written into the "skills" array, and you MUST weave them organically into the "experience" or "projects" descriptions: [${missingSkills.join(', ')}]. Failure to include these exact skills is unacceptable.` : "9. Do not add fake skills."}
      
      Return ONLY a valid JSON object (no markdown, no backticks) with EXACTLY this structure:
      {
        "personalInfo": {"name":"","email":"","phone":"","location":"","linkedin":""},
        "summary": "2-4 lines",
        "experience": [{"title":"","company":"","date":"","description":["bullet 1"]}],
        "education": [{"degree":"","school":"","date":""}],
        "skills": ["Skill 1"],
        "projects": [{"title":"","date":"","description":["bullet"]}],
        "certifications": ["Cert 1"],
        "languages": ["Lang 1"],
        "hobbies": ["Hobby 1"],
        "achievements": ["Achievement 1"],
        "publications": ["Publication 1"],
        "references": ["Reference 1"]
      }
      CRITICAL: Include ALL original experience/education. Fit on one page.
    `;

    const result = await generateContentWithRetry(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(text);
      
      // Manually force append missing skills to ensure the AI didn't miss any
      if (autoIntegrate && missingSkills.length > 0) {
        if (!parsedData.skills) parsedData.skills = [];
        missingSkills.forEach(skill => {
          if (!parsedData.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
            parsedData.skills.push(skill);
          }
        });
      }
    } catch (e) {
      console.error("Failed to parse JSON from Gemini in rebuildResume. Raw output:", text);
      return res.status(500).json({ message: "Failed to rewrite resume. AI returned invalid format." });
    }

    res.json(parsedData);
  } catch (error) {
    console.error("Error in rebuildResume:", error);
    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(429).json({ message: "Gemini API Rate Limit Exceeded. Please wait 1 minute before trying again." });
    }
    res.status(500).json({ message: "Internal server error during resume rebuild" });
  }
};

/**
 * @desc Generate PDF from HTML
 * @route POST /api/ai/download-pdf
 */
const downloadPdf = async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).json({ message: "HTML content is required" });
    }

    const browser = await puppeteer.launch({ 
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: "networkidle0" });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" }
    });
    
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=rebuilt-resume.pdf",
      "Content-Length": pdfBuffer.length
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

module.exports = {
  scoreATS,
  rebuildResume,
  downloadPdf
};
