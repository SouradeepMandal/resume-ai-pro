const { GoogleGenerativeAI } = require("@google/generative-ai");
const Resume = require("../models/resume");
const puppeteer = require("puppeteer");
const JobApplication = require("../models/JobApplication");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
      textToAnalyze = resume.extractedText;
    }

    // Call Gemini to score the resume
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { temperature: 0 }
    });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) and senior recruiter.
      I will provide a Resume and a Job Description.
      
      Resume:
      ${textToAnalyze}
      
      Job Description:
      ${jobDescription}
      
      Analyze the resume against the job description and provide a JSON response with exactly the following structure:
      {
        "atsScore": 85, // integer out of 100
        "matchAnalysis": "A brief summary of how well the candidate fits the role.",
        "missingSkills": ["skill 1", "skill 2"],
        "matchingSkills": ["skill 3", "skill 4"],
        "recommendations": ["Actionable tip on what to add/edit in the resume", "Another editing tip"]
      }
      
      CRITICAL RULES for ATS Analysis:
      1. If a skill is explicitly listed in the Resume's 'skills' array or mentioned anywhere in the experience section, YOU MUST count it as a Matching Skill. 
      2. Do NOT list a skill as a Missing Skill if the exact keyword or a very close synonym appears anywhere in the resume text.
      3. For recommendations, DO NOT tell the user to "Upload a full resume" or "Submit a resume". The user has already uploaded one! Instead, provide actionable advice on what they should *write* or *add* to their bullet points (e.g., "Add metrics to your experience section", "Mention specific tools like X and Y").
      4. ONLY list technical skills, tools, frameworks, or domain knowledge in 'missingSkills' and 'matchingSkills'. DO NOT list non-technical requirements like "2-5 years of experience", "Degree", or "Production-grade deployment experience" as skills.
      
      Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", text);
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
 * Predict Interview Probability
 */
const predictInterview = async (req, res) => {
  try {
    const { jobId } = req.body;
    
    const job = await JobApplication.findOne({ _id: jobId, user: req.user.id }).populate('resume');
    if (!job) {
      return res.status(404).json({ message: "Job Application not found" });
    }
    
    if (!job.resume || !job.resume.extractedText) {
      return res.status(400).json({ message: "A parsed resume must be attached to the job to predict interview probability." });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { temperature: 0 }
    });

    const prompt = `
      You are an expert tech recruiter predicting the likelihood of a candidate getting an interview.
      
      Resume:
      ${job.resume.extractedText}
      
      Job Title: ${job.jobTitle}
      Company: ${job.companyName}
      Job Description: ${job.jobDescription}
      
      Analyze the alignment and provide a JSON response:
      {
        "probabilityScore": 75, // integer out of 100
        "reasoning": "Why this score was given.",
        "strengths": ["strength 1"],
        "weaknesses": ["weakness 1"]
      }
      
      Return ONLY valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedData = JSON.parse(text);
    
    job.interviewProbability = parsedData.probabilityScore;
    job.aiNotes = parsedData.reasoning;
    await job.save();

    res.json(parsedData);
  } catch (error) {
    console.error("Error in predictInterview:", error);
    res.status(500).json({ message: "Internal server error during interview prediction" });
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

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { temperature: 0 }
    });

    const prompt = `
      You are an expert ATS Resume Rebuilder.
      Job Description:
      ${jobDescription}
      
      Original Resume Text:
      ${resume.extractedText}
      
      Your task is to REWRITE the resume to maximize the ATS score for this specific job description. 
      CRITICAL RULES:
      1. DO NOT make up or hallucinate any experience, companies, degrees, or titles. Keep all historical facts EXACTLY as they appear in the original resume.
      2. EXACT DATES: NEVER modify, calculate, or format dates. Copy them character-by-character from the original text (e.g. keep "05/2021" exactly as "05/2021"). 
      3. BANNED WORDS: DO NOT start summaries or bullet points with cliché, generic buzzwords like "Results-driven", "Dynamic", "Accomplished", "Passionate", or "Highly motivated". Be direct and professional.
      4. EXTRACT the candidate's actual Name, Email, Phone, and LinkedIn directly from the provided Resume text. DO NOT use placeholders like "Your Name" or "Full Name". You must keep the biodata strictly constant. If a piece of contact info is missing, leave it as an empty string "".
      5. DO NOT hallucinate "years of experience". If the job requires 2-5 years but the original resume does not explicitly show 2-5 years of experience, DO NOT claim the candidate has 2-5 years of experience. You must remain honest about the candidate's duration of experience.
      ${autoIntegrate && missingSkills.length > 0 ? `6. The user has requested to AUTO-INTEGRATE missing skills. You MUST creatively and naturally weave the following missing skills into the experience bullet points: [${missingSkills.join(', ')}]. You MUST integrate EVERY single technical skill from this list. Additionally, you MUST add these exact missing skills directly into the 'skills' array at the end of the JSON.` : "6. DO NOT add skills the candidate does not have. Only highlight existing skills that match the job description."}
      7. DO NOT include unnecessary, strange, or non-standard sectional headings within the bullet points or summary. Keep the content structure clean and strictly adhere to the JSON keys provided.
      9. Contact Information: Use City, State, Zip or City, Country format for location. Format LinkedIn/GitHub as raw URLs or clean text anchors (e.g. linkedin.com/in/...).
      10. Standardization of Section Headers: You must map all sections precisely to the JSON schema provided. Do not invent new headers.
      11. Chronological Block Formatting: Standardize all dates into Month YYYY or MM/YYYY format. Eliminate seasons or project-based durations (e.g. 3 Months).
      12. Linguistic Cleanliness: Every bullet point under work experience MUST start with a high-impact, past or present-tense action verb (e.g., Built, Optimized, Led). Eliminate passive starters like "Responsible for...". Ensure past jobs use past-tense and current jobs use present-tense verbs.
      13. Symbol Stripping: Remove all graphic elements, custom bullet symbols, icons, or unicode noise. Use simple text.
      
      Return the rewritten resume in a structured JSON format so I can render it into a beautiful UI template.
      
      Format MUST BE exactly this JSON structure:
      {
        "personalInfo": {
          "name": "<Extract the exact name of the candidate from the resume text>",
          "email": "<Extract the exact email of the candidate, or empty string>",
          "phone": "<Extract the exact phone of the candidate, or empty string>",
          "location": "<Extract the exact location of the candidate, or empty string>",
          "linkedin": "<Extract the exact linkedin URL of the candidate, or empty string>"
        },
        "summary": "<Write a powerful, ATS-optimized professional summary>",
        "experience": [
          {
            "title": "<Extract actual job title>",
            "company": "<Extract actual company name>",
            "date": "<Extract actual start and end dates>",
            "description": ["<Optimized bullet point 1>", "<Optimized bullet point 2>"]
          }
        ],
        "education": [
          {
            "degree": "<Extract actual degree>",
            "school": "<Extract actual school name>",
            "date": "<Extract actual graduation year>"
          }
        ],
        "projects": [
          {
            "title": "<Extract project title>",
            "date": "<Extract project date or empty string>",
            "description": ["<Project bullet 1>", "<Project bullet 2>"]
          }
        ],
        "skills": ["<Extract actual skill 1>", "<Extract actual skill 2>"]
      }

      Return ONLY valid JSON.
      CRITICAL: You MUST include ALL experience and education from the original resume. DO NOT return empty arrays.
    `;

    const result = await model.generateContent(prompt);
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
      console.error("Failed to parse JSON from Gemini:", text);
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

    const browser = await puppeteer.launch({ headless: true });
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
  predictInterview,
  rebuildResume,
  downloadPdf
};
