import { useState } from "react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa"; // Added FaSpinner
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../supabase.js'; // Ensure Supabase client is imported

const LandingPage = () => {
  // State for role selection
  const [role, setRole] = useState(null); // "tutor" means user wants a tutor (is a Guardian), "teacher" means user wants to teach (is a Teacher)
  // State for input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Added back isLoading and signInError states
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState("");

  // Hook for navigation
  const navigate = useNavigate();

  // Define the purple color consistent with other pages
  const primaryColor = "bg-[#6344cc]"; // Main purple
  const hoverColor = "hover:bg-[#5238a8]"; // Darker purple for hover
  const focusRingColor = "focus:ring-[#6344cc]"; // Purple for focus rings

  // Handles the sign-in button click WITH Supabase AND Role Check
  const handleSignIn = async () => { // Added async keyword back
    // Basic validation
    if (!role) {
      setSignInError("Please select your role.");
      return;
    }
    if (!email || !password) {
      setSignInError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setSignInError(""); // Clear previous errors

    try {
      // --- Actual Supabase Sign-In ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      // --- End Supabase Sign-In ---

      if (error) {
        // Handle specific errors if needed (e.g., "Invalid login credentials")
        setSignInError(error.message);
        setIsLoading(false);
        return;
      }

      // Successful sign-in - NOW CHECK ROLE
      if (data.user) {
        console.log("Successfully signed in:", data.user);

        // Get the role stored during sign-up from metadata
        const storedUserRole = data.user.user_metadata?.user_role; // e.g., 'guardian' or 'teacher'

        // Determine the expected role based on the button clicked
        // 'tutor' button means the user is trying to log in as a Guardian
        // 'teacher' button means the user is trying to log in as a Teacher
        const expectedRole = role === "tutor" ? "guardian" : "teacher";

        // Check if the selected role matches the stored role
        if (storedUserRole === expectedRole) {
          // Roles match - navigate to the correct dashboard
          if (expectedRole === "guardian") {
            navigate("/guardian-dashboard");
          } else if (expectedRole === "teacher") {
            navigate("/tutor-dashboard"); // Ensure this route exists and points to the Tutor component
          } else {
            // Fallback if role is something unexpected
             console.warn("User has unexpected role:", storedUserRole);
             navigate("/"); // Navigate to default page
          }
        } else {
          // Roles DO NOT match
          setSignInError(`Incorrect role selected. This account is registered as a ${storedUserRole || 'user'}. Please select the correct role.`);
          // Sign the user out again because the role selection was wrong
          await supabase.auth.signOut();
        }
      } else {
        // Fallback if no user data despite no error
        setSignInError("Sign in failed. Please try again.");
      }
    } catch (error) {
      setSignInError("An unexpected error occurred. Please try again.");
      console.error("Sign in catch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#fafafa] overflow-hidden">
      {/* Background Image */}
      <img src="/image-8@2x.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />

      {/* Logo */}
      <div className="absolute top-4 left-4 z-10"> <img src="/untitled-design--1-removebgpreview-1@2x.png" alt="Logo" className="w-24 h-24 object-contain" /> </div>

      {/* Toppers Trust Text */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 text-4xl sm:text-5xl md:text-7xl font-bold text-cyan-800 px-2"> Toppers Trust </div>

      {/* Job Board link */}
      <Link to="/job-card" className="absolute top-6 right-4 sm:right-6 text-base sm:text-lg font-medium z-20 text-black hover:underline cursor-pointer"> Job Board </Link>

      {/* Centered Login Card */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        <div className="bg-white/80 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-xs sm:max-w-md text-center backdrop-blur-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-cyan-900 mb-1">Welcome!</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">Sign in to continue</p>

          {/* Role Select Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
            {[
              { type: "tutor", label: "I Want a Tutor", subtext: "Guardian" },
              { type: "teacher", label: "I Want to Teach", subtext: "Teacher" },
            ].map((roleOption) => (
              <div key={roleOption.type} className="flex flex-col items-center">
                <button
                  onClick={() => { setRole(roleOption.type); setSignInError(""); /* Clear error on role change */ }}
                  className={`w-full sm:w-auto relative px-4 py-2.5 rounded-full flex items-center justify-center gap-2 text-white text-sm sm:text-base font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2 ${ role === roleOption.type ? `${primaryColor}` : `bg-purple-400 hover:bg-purple-500` }`}
                >
                  {roleOption.label}
                  {role === roleOption.type && ( <FaCheckCircle className="text-green-300 text-lg ml-1 sm:ml-2" /> )}
                </button>
                <span className="mt-1 text-xs text-gray-600">{roleOption.subtext}</span>
              </div>
            ))}
          </div>

          {/* Login Form */}
          <div className="flex flex-col gap-4 mb-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`p-3 rounded-lg border ${signInError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 ${focusRingColor} text-sm sm:text-base`} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`p-3 rounded-lg border ${signInError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 ${focusRingColor} text-sm sm:text-base`} />
          </div>

          {/* Sign In Error Message Display */}
           {signInError && ( <p className="text-red-500 text-xs sm:text-sm mb-3">{signInError}</p> )}

          {/* Sign In Button */}
          <button onClick={handleSignIn} disabled={isLoading || !role} className={`w-full flex items-center justify-center gap-2 ${primaryColor} text-white py-3 rounded-lg ${hoverColor} transition-colors duration-300 mb-4 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2 ${(isLoading || !role) ? "opacity-70 cursor-not-allowed" : ""}`}>
            {isLoading ? <FaSpinner className="animate-spin" /> : null}
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
          {!role && ( <div className="text-xs text-gray-500 mb-4 -mt-3"> Please select a role above to enable Sign In. </div> )}

          {/* Sign Up / Forgot Password Links */}
          <div className="text-xs sm:text-sm text-gray-700">
            <Link to="/sign-up-frame" className={`mr-1 sm:mr-2 hover:underline cursor-pointer text-[#6344cc] font-medium`}> Sign up </Link> |
            <Link to="/forgot-pass" className={`ml-1 sm:ml-2 text-[#6344cc] font-medium cursor-pointer hover:underline`}> Forgot Password? </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
