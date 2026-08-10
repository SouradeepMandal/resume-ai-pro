import { useState } from "react";
import { uploadResume } from "../services/resumeService";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setFile(selectedFile);
    setMessage("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await uploadResume(file);

      setMessage(data.message);
      setFile(null);
    } catch (error) {
      console.error("Resume upload failed:", error);

      setError(
        error.response?.data?.message ||
          "Resume upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Upload Resume
        </h2>

        <p className="mb-5 text-sm text-gray-500">
          Upload your resume in PDF or DOCX format.
        </p>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="mb-4 block w-full text-sm text-gray-600"
        />

        {file && (
          <p className="mb-4 text-sm text-gray-700">
            Selected: <span className="font-medium">{file.name}</span>
          </p>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-green-600">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;