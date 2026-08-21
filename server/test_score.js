require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
const textToAnalyze = JSON.stringify({
  personalInfo: { name: 'John Doe' },
  experience: [{ title: 'Engineer', company: 'Tech', date: '2020', description: ['Built apps']}],
  education: [],
  skills: []
});
const jobDescription = 'Software Engineer';
const prompt = `
      You are an expert ATS (Applicant Tracking System) and senior recruiter.
      I will provide a Resume and a Job Description.
      
      Resume:
      ${textToAnalyze}
      
      Job Description:
      ${jobDescription}
      
      Analyze the resume against the job description and provide a JSON response with exactly the following structure:
      {
        "atsScore": 85,
        "matchAnalysis": "A brief summary of how well the candidate fits the role.",
        "missingSkills": ["skill 1", "skill 2"],
        "matchingSkills": ["skill 3", "skill 4"],
        "recommendations": ["Actionable tip on what to add/edit in the resume", "Another editing tip"]
      }
      
      CRITICAL: For recommendations, DO NOT tell the user to "Upload a full resume" or "Submit a resume". The user has already uploaded one! Instead, provide actionable advice on what they should *write* or *add* to their bullet points.
      
      Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json. DO NOT INCLUDE JAVASCRIPT COMMENTS LIKE // IN THE OUTPUT.
`;

model.generateContent(prompt)
  .then(res => {
    let text = res.response.text();
    console.log('Raw text:', text);
    // basic cleanup
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    // try removing any comments if the AI ignored instructions
    text = text.replace(/\/\/.*$/gm, '');
    console.log('Clean text:', text);
    console.log('Parsed:', JSON.parse(text));
  })
  .catch(err => console.error('Error:', err));
