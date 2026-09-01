# ResumeAI Pro - Server 🚀

The backend application for **ResumeAI Pro**, an advanced resume optimization and Applicant Tracking System (ATS) scoring tool. Built with Node.js, Express, and MongoDB, this server powers the AI analysis, resume extraction, and PDF generation processes.

## 🛠 Tech Stack & Libraries

This project leverages a robust ecosystem of backend libraries:

*   **Framework**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) for building scalable RESTful APIs.
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) for data modeling and interaction.
*   **AI Integration**: `@google/generative-ai` to interface with the Gemini API (`gemini-3.5-flash-lite`) for all AI-driven resume scoring and rebuilding.
*   **Document Processing**:
    *   `pdf-parse`: Extracts raw text from uploaded PDF resumes.
    *   `mammoth`: Extracts raw text from uploaded DOCX resumes.
*   **PDF Generation**: `puppeteer-core` & `@sparticuz/chromium` for serverless-friendly, headless HTML-to-PDF rendering.
*   **Authentication & Security**:
    *   `jsonwebtoken` (JWT) for secure, stateless user sessions.
    *   `bcryptjs` for hashing user passwords.
    *   `google-auth-library` for Google OAuth validation.
    *   `cors` to handle Cross-Origin Resource Sharing.
*   **File Uploads**: `multer` middleware for handling multipart/form-data.

## 📁 Project Structure

*   `controllers/`: Core business logic (e.g., `aiController.js` for Gemini API calls, `authController.js`, `resumeController.js`).
*   `models/`: Mongoose schemas defining database collections.
*   `routes/`: API endpoint definitions mapped to controllers.
*   `middleware/`: Custom Express middlewares (authentication verification, file upload handling).
*   `uploads/`: Temporary local directory for storing processed resumes.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and MongoDB (local or Atlas) installed.

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root of the `server` directory and configure the necessary variables:
   ```env
   # Server Port
   PORT=5000

   # MongoDB Connection String
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/resumeai

   # JWT Secret for Authentication
   JWT_SECRET=your_super_secret_key

   # Google Auth
   GOOGLE_CLIENT_ID=your_google_client_id

   # Gemini API Keys (Supports up to 5 keys for automatic rotation / rate-limit bypassing)
   GEMINI_API_KEY=your_first_gemini_api_key
   GEMINI_API_KEY_2=your_second_gemini_api_key
   GEMINI_API_KEY_3=your_third_gemini_api_key
   ```

### Running the Application

To start the development server with auto-reloading (via Nodemon):
```bash
npm run dev
```

To start the server in production mode:
```bash
npm start
```

The server will typically run at `http://localhost:5000`.

## ⚙️ Key Mechanisms

### AI API Key Rotation
To prevent service disruptions from hitting Gemini API rate limits (HTTP 429), the backend implements an **API Key Rotation** logic. It iterates through an array of provided `GEMINI_API_KEY`s sequentially. If a quota is exceeded, the server automatically catches the error and retries the prompt using the next available API key in the `.env` file.

### Serverless PDF Generation
The `/api/ai/download-pdf` endpoint uses `@sparticuz/chromium`, a specialized Chromium build optimized for serverless environments (like AWS Lambda or Vercel). It ingests raw HTML templates sent by the client, renders them in a headless environment, and returns the binary PDF buffer.
