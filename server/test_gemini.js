require('dotenv').config({ path: 'C:\\Users\\user\\OneDrive\\Desktop\\Projects\\ResumePro\\resume-ai-pro\\server\\.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const prompt = `
      You are an expert ATS (Applicant Tracking System) and senior recruiter.
      I will provide a Resume and a Job Description.
      
      Resume:
      John Doe
      Experienced Software Engineer
      
      Job Description:
      Software Engineer
      
      Analyze the resume against the job description and provide a JSON response with exactly the following structure:
      {
        "atsScore": 85,
        "matchAnalysis": "A brief summary of how well the candidate fits the role.",
        "missingSkills": ["skill 1", "skill 2"],
        "matchingSkills": ["skill 3", "skill 4"],
        "recommendations": ["Actionable tip on what to add/edit in the resume", "Another editing tip"]
      }
      
      Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    `;
    const result = await model.generateContent(prompt);
    console.log('RAW_TEXT:', result.response.text());
  } catch (e) {
    console.error('ERROR:', e);
  }
}
test();
