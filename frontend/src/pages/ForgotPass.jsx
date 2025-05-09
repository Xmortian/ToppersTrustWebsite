import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../supabase.js'; // Import Supabase client
import { FaSpinner } from 'react-icons/fa'; // Import spinner icon

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [message, setMessage] = useState(""); // State for success/error messages

  // Consistent purple theme from other pages
  const primaryColor = "bg-[#6344cc]";
  const hoverColor = "hover:bg-[#5238a8]";
  const focusRingColor = "focus:ring-[#6344cc]";

  const handleSubmit = async (e) => { // Make the function async
    e.preventDefault();
    setMessage(""); // Clear previous messages
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true); // Start loading indicator

    try {
      // --- Supabase Password Reset Call ---
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // This URL MUST match the route you defined in App.js for the ResetPass component
        // Use your deployed URL in production
        redirectTo: `${window.location.origin}/update-password`,
      });
      // --- End Supabase Call ---

      if (error) {
        console.error("Password reset error:", error);
        // Provide a user-friendly message, don't expose raw error details usually
        setMessage(`Error sending reset link: ${error.message}`);
      } else {
        setMessage("Password reset link sent! Please check your email (including spam folder).");
        setEmail(""); // Clear the input field on success
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    // Main container: full screen, flex centering for the card
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center p-4 font-roboto text-[#000] overflow-x-hidden">
      {/* Background Image - Full screen cover */}
      <img
        className="absolute inset-0 w-full h-full object-cover -z-10"
        alt="Background"
        src="/image-91@2x.png" // Ensure this path is correct and image is in public folder
      />

      {/* Logo - Positioned top-left */}
      <img
        className="absolute top-4 left-4 sm:top-[-0.562rem] sm:left-[-0.875rem] w-24 h-24 sm:w-[10.438rem] sm:h-[10.438rem] object-contain z-20"
        alt="Toppers Trust Logo"
        src="/untitled-design--1-removebgpreview-11@2x.png" // Ensure this path is correct
      />

      {/* TOPPERS TRUST Text - Positioned top-center */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 sm:top-[1.5rem] text-[1.75rem] sm:text-[2.25rem] font-oswald text-[#40919e] z-20 text-center whitespace-nowrap">
        TOPPERS TRUST
      </div>

      {/* Form Card - Centered on the page */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/80 backdrop-blur-md shadow-2xl rounded-xl p-6 sm:p-8 w-full max-w-md z-10 mt-20 sm:mt-28" // Added margin-top to avoid overlap
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-cyan-900 mb-2 text-center">
          Forgot Your Password?
        </h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base text-center">
          Enter your email address below and we'll send you a link to reset it.
        </p>

        {/* Email Input Field */}
        <div className="mb-5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 border ${message.includes("Error") ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${focusRingColor} text-sm sm:text-base`} // Highlight border on error
            placeholder="you@example.com"
            required // HTML5 basic validation
          />
        </div>

        {/* Message Display Area */}
        {message && (
          <p className={`mb-4 text-sm text-center ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}


        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading} // Disable button when loading
          className={`w-full flex items-center justify-center gap-2 ${primaryColor} text-white py-3 rounded-lg ${hoverColor} transition-colors duration-300 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? <FaSpinner className="animate-spin" /> : null} {/* Show spinner */}
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {/* Optional: Link to go back to Login/Sign Up */}
        <div className="mt-6 text-center">
          <Link
            to="/" // Link to your main landing/login page
            className={`text-sm text-[#6344cc] hover:underline font-medium`}
          >
            Remembered your password? Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPass;
