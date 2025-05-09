import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
  // BrowserRouter as Router, // Ensure Router is wrapping App in your index.js or main.js
} from "react-router-dom";

// Page Imports
import LandingPage from "./pages/LandingPage";
import SignUpFrame from "./pages/SignUpFrame";
import TermsAndConditions from "./pages/TermsAndConditions";
import ForgotPass from "./pages/ForgotPass";
import ResetPass from "./pages/ResetPass";
// import CheckEmailPage from "./pages/CheckEmailPage"; // Removed

// Guardian Pages
import Guardian from "./pages/Guardian";
import GuardianProfile from "./pages/GuardianProfile";
import GuardianProfileEditInfo from "./pages/GuardianProfileEditInfo";
const GuardianShortlisted = () => <div className="p-10 text-center text-xl">Guardian Shortlisted Tutors Page (Placeholder)</div>;
const RecommendedTutorDetails = () => {
    // const { tutorId } = useParams(); // For dynamic ID
    return <div className="p-10 text-center text-xl">Recommended Tutor Details Page (Placeholder for individual view)</div>;
};


// Tutor Pages
import Tutor from "./pages/Tutor"; // Main Tutor Dashboard
import TutorProfile from "./pages/TutorProfile";
import TutorProfileEditInfo from "./pages/TutorProfileEditInfo";
// Placeholder components for tutor routes
const TutorAcceptedJobs = () => <div className="p-10 text-center text-xl">Tutor Accepted Jobs Page (Placeholder)</div>;
const TutorEarnings = () => <div className="p-10 text-center text-xl">Tutor Earnings Page (Placeholder)</div>;


// Job & Card Pages
import PostedJob from "./pages/PostedJob"; // List of jobs (e.g., Guardian's previous, or general for Tutors)
import JobCard from "./pages/JobCard";     // Job swiping interface (for Tutors)
import JobPosting from "./pages/JobPosting"; // Form to post a new job

// Tutor Browsing Pages for Guardian
import BrowseTutorsPage from "./pages/BrowseTutorsPage"; // Tinder-style swipe page for tutors
import TutorCardDisplay from "./pages/TutorCard";       // Sequential rejection page (the component in TutorCard.jsx)


function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  // Effect to scroll to top on navigation
  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  // Effect to set document title and meta description
  useEffect(() => {
    let title = "Toppers Trust"; // Default title
    let metaDescription = "Connecting students and tutors effectively."; // Default description

    const pageInfo = new Map([
        ["/", { title: "Toppers Trust - Welcome", description: "Find the best tutors or offer your tutoring services with Toppers Trust." }],
        ["/sign-up-frame", { title: "Sign Up - Toppers Trust", description: "Create your Toppers Trust account as a student, guardian, or tutor." }],
        ["/terms-and-conditions", { title: "Terms & Conditions - Toppers Trust", description: "Read the terms and conditions for using the Toppers Trust platform." }],
        ["/forgot-pass", { title: "Forgot Password - Toppers Trust", description: "Reset your Toppers Trust account password." }],
        ["/update-password", { title: "Reset Password - Toppers Trust", description: "Set a new password for your Toppers Trust account." }],
        // ["/check-email", { title: "Check Your Email - Toppers Trust", description: "Please check your email to confirm your account." }],
        // Guardian Routes
        ["/guardian-dashboard", { title: "Guardian Dashboard - Toppers Trust", description: "Manage your tutoring needs as a guardian on Toppers Trust." }],
        ["/guardian/profile", { title: "My Profile - Guardian - Toppers Trust", description: "View and manage your guardian profile." }],
        ["/guardian/profile/edit", { title: "Edit Profile - Guardian - Toppers Trust", description: "Edit your guardian profile information." }],
        ["/guardian/shortlisted", { title: "Shortlisted Tutors - Toppers Trust", description: "View your shortlisted tutors." }],
        ["/guardian/post-job", { title: "Post a Job - Toppers Trust", description: "Post a new tutoring job requirement." }],
        ["/guardian/previous-jobs", { title: "My Posted Jobs - Toppers Trust", description: "View your history of posted jobs." }],
        // Tutor Routes
        ["/tutor-dashboard", { title: "Tutor Dashboard - Toppers Trust", description: "Manage your tutoring services and profile on Toppers Trust." }],
        ["/tutor/profile", { title: "My Profile - Tutor - Toppers Trust", description: "View and manage your tutor profile." }],
        ["/tutor/profile/edit", { title: "Edit Profile - Tutor - Toppers Trust", description: "Edit your tutor profile information." }],
        ["/tutor/accepted-jobs", { title: "Accepted Jobs - Tutor - Toppers Trust", description: "View your accepted tutoring jobs." }],
        ["/tutor/earnings", { title: "Earnings - Tutor - Toppers Trust", description: "View your tutoring earnings." }],
        // Job & Tutor Browsing Routes
        ["/posted-job", { title: "Job Board - Toppers Trust", description: "Browse available tutoring jobs." }],
        ["/job-card", { title: "Job Opportunities - Toppers Trust", description: "View and interact with job postings." }],
        ["/job-posting", { title: "Create Job Posting - Toppers Trust", description: "Post a new job opportunity on Toppers Trust." }],
        ["/tutor-card", { title: "Select Tutor (Shortlist) - Toppers Trust", description: "Review and select a tutor from your shortlist." }], // Path for sequential rejection
        ["/browse-tutors", { title: "Browse Recommended Tutors - Toppers Trust", description: "Browse and swipe through recommended tutors." }] // Path for Tinder-style swipe
    ]);

    const dynamicRouteMatch = (path) => {
        if (path.startsWith("/recommended-tutor/")) return { title: "Recommended Tutor - Toppers Trust", description: "Details of a recommended tutor." };
        return null;
    }

    const info = pageInfo.get(pathname) || dynamicRouteMatch(pathname);
    if (info) {
        title = info.title;
        metaDescription = info.description;
    }

    if (document.title !== title) { document.title = title; }
    const metaDescriptionTag = document.querySelector('head > meta[name="description"]');
    if (metaDescriptionTag && metaDescriptionTag.content !== metaDescription) { metaDescriptionTag.content = metaDescription; }
    else if (!metaDescriptionTag && metaDescription) {
      const newMetaTag = document.createElement('meta');
      newMetaTag.name = "description";
      newMetaTag.content = metaDescription;
      document.head.appendChild(newMetaTag);
    }
  }, [pathname]);

  return (
    <Routes>
      {/* General Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-up-frame" element={<SignUpFrame />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

      {/* Authentication Routes */}
      <Route path="/forgot-pass" element={<ForgotPass />} />
      <Route path="/update-password" element={<ResetPass />} />

      {/* Guardian Specific Routes */}
      <Route path="/guardian-dashboard" element={<Guardian />} />
      <Route path="/guardian/profile" element={<GuardianProfile />} />
      <Route path="/guardian/profile/edit" element={<GuardianProfileEditInfo />} />
      <Route path="/guardian/shortlisted" element={<GuardianShortlisted />} />
      <Route path="/guardian/post-job" element={<JobPosting />} />
      <Route path="/guardian/previous-jobs" element={<PostedJob />} />
      <Route path="/recommended-tutor/:tutorId" element={<RecommendedTutorDetails />} />


      {/* Tutor Specific Routes */}
      <Route path="/tutor-dashboard" element={<Tutor />} />
      <Route path="/tutor/profile" element={<TutorProfile />} />
      <Route path="/tutor/profile/edit" element={<TutorProfileEditInfo />} />
      <Route path="/tutor/accepted-jobs" element={<TutorAcceptedJobs />} />
      <Route path="/tutor/earnings" element={<TutorEarnings />} />

      {/* General Job & Card Display Routes */}
      <Route path="/posted-job" element={<PostedJob />} /> {/* General job board (e.g. for tutors) */}
      <Route path="/job-card" element={<JobCard />} /> {/* Job swiping interface (for tutors) */}
      <Route path="/job-posting" element={<JobPosting />} /> {/* Form to post a job */}

      {/* Tutor Browsing for Guardians - CORRECTED */}
      <Route path="/tutor-card" element={<TutorCardDisplay />} /> {/* Sequential Rejection UI for "Short List" button */}
      <Route path="/browse-tutors" element={<BrowseTutorsPage />} /> {/* Tinder-style Swipe UI for "Recommended Tutors" links */}

      {/* <Route path="*" element={<div>404 Page Not Found</div>} /> */}
    </Routes>
  );
}
export default App;
