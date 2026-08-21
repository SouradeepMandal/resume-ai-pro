require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
const prompt = `
      You are an expert ATS Resume Rebuilder.
      Job Description:
      Software Engineer
      
      Original Resume Text:
      John Doe
      Software Engineer
      Email: john@example.com
      
      Your task is to REWRITE the resume to maximize the ATS score for this specific job description. 
      CRITICAL RULES:
      1. DO NOT make up or hallucinate any experience, companies, degrees, or titles. Keep all historical facts EXACTLY as they appear in the original resume.
      2. EXACT DATES: Do NOT change or reformat the dates. (e.g., if it says "05/2021", keep it as "05/2021". If it says "2020", keep it "2020"). Keep chronological history identical.
      3. BANNED WORDS: DO NOT start summaries or bullet points with cliché, generic buzzwords like "Results-driven", "Dynamic", "Accomplished", "Passionate", or "Highly motivated". Be direct and professional.
      4. EXTRACT the candidate's actual Name, Email, Phone, and LinkedIn directly from the provided Resume text. DO NOT use placeholders like "Your Name" or "Full Name". If a piece of contact info is missing, leave it as an empty string "".
      5. Use strong action verbs and highlight quantifiable metrics if they exist.
      6. DO NOT add skills the candidate does not have. Only highlight existing skills that match the job description.
      
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
        "summary": "Professional summary...",
        "experience": [
          {
            "title": "Job Title",
            "company": "Company Name",
            "date": "Start - End",
            "description": ["Bullet 1", "Bullet 2"]
          }
        ],
        "education": [
          {
            "degree": "Degree",
            "school": "School Name",
            "date": "Year"
          }
        ],
        "skills": ["Skill 1", "Skill 2"]
      }

      Return ONLY valid JSON.
`;

model.generateContent(prompt)
  .then(res => console.log('Response:', res.response.text()))
  .catch(err => console.error('Error:', err.message));
