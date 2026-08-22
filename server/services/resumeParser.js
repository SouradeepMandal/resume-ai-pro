const fs = require("fs").promises;
const path = require("path");

const mammoth = require("mammoth");


// ==========================================
// Extract text from PDF
// ==========================================

const extractPdfText = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    
    // Using pdf-parse instead of Gemini to save tokens
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    
    return data.text || "";
  } catch (error) {
    console.error("PDF parsing via pdf-parse error:", error);
    throw new Error("Failed to extract text from PDF locally.");
  }
};


// ==========================================
// Extract text from DOCX
// ==========================================

const extractDocxText = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);

    const result = await mammoth.extractRawText({
      buffer,
    });

    return result.value || "";

  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw error;
  }
};


// ==========================================
// Main Resume Parser
// ==========================================

const parseResume = async (file) => {

  if (!file) {
    throw new Error("Resume file is missing.");
  }

  const {
    originalname,
    mimetype,
    path: uploadedPath,
  } = file;

  console.log("==========================================");
  console.log("Parsing resume:", originalname);
  console.log("File type:", mimetype);
  console.log("Original file path:", uploadedPath);
  console.log("==========================================");

  // ==========================================
  // Convert to absolute path
  // ==========================================

  const absolutePath = path.resolve(uploadedPath);

  console.log("Absolute file path:", absolutePath);

  // ==========================================
  // Check physical file
  // ==========================================

  try {
    await fs.access(absolutePath);
  } catch (error) {
    throw new Error(
      "Resume file could not be found."
    );
  }

  // ==========================================
  // PDF
  // ==========================================

  if (mimetype === "application/pdf") {

    const text = await extractPdfText(
      absolutePath
    );

    if (!text.trim()) {
      throw new Error(
        "No readable text found in resume."
      );
    }

    console.log(
      "PDF text extracted successfully."
    );

    return text.trim();
  }

  // ==========================================
  // DOCX
  // ==========================================

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {

    const text = await extractDocxText(
      absolutePath
    );

    if (!text.trim()) {
      throw new Error(
        "No readable text found in resume."
      );
    }

    console.log(
      "DOCX text extracted successfully."
    );

    return text.trim();
  }

  // ==========================================
  // Unsupported file
  // ==========================================

  throw new Error(
    "Unsupported resume file type."
  );
};


// ==========================================
// Export
// ==========================================

module.exports = {
  parseResume,
  extractPdfText,
  extractDocxText,
};