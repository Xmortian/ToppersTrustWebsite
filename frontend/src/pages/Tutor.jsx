import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import Supabase client

// Placeholder Icons
import { FaUserCircle, FaTachometerAlt, FaSearch, FaSignOutAlt, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';

// Placeholder Data - Replace with actual data fetching later
const initialTutorData = {
  name: "Moutmayen Nafis", // From Figma
  tutorId: "123456",    // From Figma
  profileImageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-7@2x.png", // From raw code provided
  // Add other relevant tutor info if needed
};


const Tutor = () => { // Component name kept as Tutor
  const navigate = useNavigate();
  const [tutorData, setTutorData] = useState(initialTutorData);
  const [loading, setLoading] = useState(true); // Example loading state
  const [error, setError] = useState(null); // State for errors

  // --- TODO: Fetch Tutor Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        // Example: Fetch tutor profile
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) {
        //   navigate('/'); // Redirect if not logged in
        //   return;
        // }
        // const { data: profileData, error: profileError } = await supabase
        //   .from('tutor_profiles') // Your tutor profile table
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .single();

        // if (profileError) throw profileError;

        // if (profileData) {
        //   setTutorData(prev => ({ ...prev, ...profileData }));
        // } else {
        //   // Handle case where profile doesn't exist? Maybe redirect to profile creation?
        //   console.warn("Tutor profile not found for user:", user.id);
        // }

        // Using placeholder data for now:
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        setTutorData(initialTutorData);

      } catch (fetchError) {
         console.error("Error fetching tutor data:", fetchError);
         setError("Failed to load dashboard data.");
      } finally {
          setLoading(false);
      }
    };

    fetchData();
  }, [navigate]); // Added navigate as dependency

  // Implement Sign Out function
  const handleSignOut = async () => {
      setError(null); // Clear previous errors
      try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          navigate('/'); // Redirect to landing page after successful sign out
      } catch (error) {
          console.error("Sign out error:", error);
          setError("Failed to sign out. Please try again.");
          // Optionally display this error to the user
      }
  };

  // Placeholder image if actual profile image fails to load
  const profileImageFallback = "https://placehold.co/150x200/6344cc/FFF?text=" + (tutorData.name ? tutorData.name.split(' ').map(n=>n[0]).join('') : "T");

  if (loading) {
      return <div className="flex justify-center items-center min-h-screen text-xl">Loading Tutor Dashboard...</div>;
  }
   if (error) {
       return <div className="flex justify-center items-center min-h-screen text-xl text-red-600">Error: {error}</div>;
   }


  return (
    // Main container ensuring minimum screen height and background color
    <div className="min-h-screen bg-gray-100 font-roboto text-[#000] pb-16">

      {/* Header Section - Styled like the Figma design */}
      <header className="bg-gradient-to-r from-[#3a394d] to-[#585673] text-white p-6 shadow-md relative h-[14.875rem] flex items-center">
        <div className="container mx-auto flex justify-between items-center w-full">
          {/* Left Side: Tutor Name */}
          <div className="text-left font-sans flex-1 mr-4"> {/* Added flex-1 mr-4 */}
             <h2 className="text-lg font-semibold mb-1 text-gray-300 opacity-90">Tutor</h2> {/* Slightly brighter subtext */}
             {/* Increased font size, changed color to white */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold leading-tight text-white break-words"> {/* Increased size, changed color */}
              {tutorData.name}
            </h1>
          </div>

          {/* Center: Profile Image */}
          {/* Added shrink-0 to prevent image from shrinking */}
          <div className="absolute left-1/2 top-[6rem] transform -translate-x-1/2 z-10 flex-shrink-0">
             <img
              src={tutorData.profileImageUrl || profileImageFallback}
              alt="Tutor Profile"
              onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
              className="w-[10rem] h-[13rem] sm:w-[12rem] sm:h-[16rem] md:w-[14rem] md:h-[18rem] rounded-3xl border-4 border-white shadow-lg object-cover"
            />
          </div>

          {/* Right Side: Tutor ID & Sign Out */}
           {/* Added flex-1 ml-4 */}
          <div className="text-right flex-1 ml-4">
             {/* Increased font size, changed color to white */}
            <p className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white break-words"> {/* Increased size, changed color */}
                Tutor ID : {tutorData.tutorId}
            </p>
            <button
              onClick={handleSignOut}
              className="mt-3 text-sm text-gray-300 hover:text-white transition-colors flex items-center ml-auto"
            >
              <FaSignOutAlt className="mr-1" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Buttons Section */}
      <section className="relative py-8 px-4 pt-40 sm:pt-44 md:pt-56">

        {/* Container for the 3 cards */}
        <div className="container mx-auto flex justify-center items-center gap-8 sm:gap-12 md:gap-16 relative z-10 flex-wrap">
          {[
            // Profile Link
            { name: "Profile", path: "/tutor/profile", isLink: true, bgColor: "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500" },
            // Dashboard Link (<a> tag for reload behavior)
            { name: "Dashboard", path: "/tutor-dashboard", isLink: false, bgColor: "bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700" },
            // Job Board Link - Updated path
            { name: "Job Board", path: "/job-card", isLink: true, bgColor: "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500" },
          ].map((button) => (
             button.isLink ? (
                <Link
                  key={button.name}
                  to={button.path}
                  className={`w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center text-center text-gray-800 font-semibold text-xl md:text-2xl ${button.bgColor}`}
                >
                  <span>{button.name}</span>
                </Link>
             ) : (
                 // Use <a> tag for Dashboard to trigger reload
                 <a
                    key={button.name}
                    href={button.path} // Standard href causes page reload
                    className={`w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center text-center text-gray-800 font-semibold text-xl md:text-2xl ${button.bgColor}`}
                 >
                    <span>{button.name}</span>
                 </a>
             )
          ))}
        </div>
      </section>

    </div>
  );
};

export default Tutor; // Exporting as Tutor
