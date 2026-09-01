# ResumeAI Pro - Client 🚀

The frontend application for **ResumeAI Pro**, an advanced resume optimization and Applicant Tracking System (ATS) scoring tool built with React and Vite.

## 🛠 Tech Stack & Libraries

This project is built using modern web technologies to ensure a fast, responsive, and aesthetically pleasing user experience:

*   **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) for lightning-fast HMR and building.
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for utility-first, responsive design.
*   **Routing**: [React Router DOM](https://reactrouter.com/) for seamless client-side navigation.
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth, declarative UI animations and transitions.
*   **Authentication**: Google OAuth integration via `@react-oauth/google`.
*   **HTTP Client**: [Axios](https://axios-http.com/) for making requests to the Node.js backend.
*   **Icons**: [React Icons](https://react-icons.github.io/react-icons/) providing a comprehensive icon suite.
*   **PDF Generation**: Utilizes `react-to-print` and `html2pdf.js` for exporting highly optimized resumes directly from the browser.

## 📁 Project Structure

*   `src/components/`: Reusable UI components (buttons, modals, inputs, etc.)
*   `src/context/`: React Context providers for global state management (e.g., `ToastContext` for notifications, Auth contexts).
*   `src/pages/`: Main route views (Home, Dashboard, ATS Scoring, Resume Builder).
*   `src/utils/`: Helper functions, API configuration, and utilities.
*   `src/assets/`: Static assets such as images and global stylesheets.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm (or yarn/pnpm) installed.

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root of the `client` directory and configure the necessary variables (e.g., your Backend API URL and Google Client ID):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

### Running the Application

To start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

The app will typically run at `http://localhost:5173`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
This command bundles React in production mode and optimizes the build for the best performance. You can preview the production build locally using:
```bash
npm run preview
```

## 🧹 Linting

The project is configured with ESLint. To run the linter and ensure code quality:
```bash
npm run lint
```
