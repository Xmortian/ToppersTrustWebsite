import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import Supabase client

// Placeholder Icons
import { FaUserCircle, FaTachometerAlt, FaSearch, FaSignOutAlt, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';

// Initial state for tutorData, can be empty or have defaults
const initialTutorState = {
  name: "Loading...",
  tutorId: "...", // This will be populated by the 'id' column from your 'tutor' table
  profileImageUrl: "",
};

const Tutor = () => {
  const navigate = useNavigate();
  const [tutorData, setTutorData] = useState(initialTutorState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get the currently authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting user:", userError);
          setError("Failed to identify user. Please log in again.");
          navigate('/'); // Redirect if error fetching user
          return;
        }

        if (!user) {
          navigate('/'); // Redirect if not logged in
          return;
        }

        // 2. Fetch tutor profile from the 'tutor' table
        //    using the authenticated user's ID to match the 'user_id' column.
        const { data: profileData, error: profileError } = await supabase
          .from('tutor') // Correct table name
          .select('id, name, photo') // Correct column names: 'id' for tutorId, 'name', 'photo' for profileImageUrl
          .eq('user_id', user.id) // Assumes 'user_id' in your 'tutor' table links to auth.users.id
          .single(); // Use .single() as 'user_id' should be unique per tutor

        if (profileError) {
          if (profileError.code === 'PGRST116') { // PostgREST error for 'exactly one row' not found
            console.warn("Tutor profile not found for user:", user.id, "in 'tutor' table.");
            setError("Tutor profile not found. Please complete your profile or contact support.");
            // Optionally, redirect to a profile creation page:
            // navigate('/create-tutor-profile');
          } else {
            throw profileError; // Re-throw other errors
          }
        }

        if (profileData) {
          setTutorData({
            name: profileData.name || "N/A",
            tutorId: profileData.id || "N/A", // Use 'id' from your table for tutorId
            profileImageUrl: profileData.photo || "", // Use 'photo' from your table
          });
        } else if (!error) {
            setError("Tutor profile data is incomplete or missing.");
        }

      } catch (fetchError) {
        console.error("Error fetching tutor data:", fetchError);
        setError(`Failed to load dashboard data: ${fetchError.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // ... (rest of your component code: handleSignOut, profileImageFallback, JSX, etc.)
  // The rest of your component (handleSignOut, profileImageFallback, return statement)
  // remains the same as in the previous correct version. I'm omitting it here for brevity
  // but you should include it in your actual file.

  // Placeholder for the rest of the component (ensure this is complete in your file)
  const handleSignOut = async () => {
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      navigate('/');
    } catch (error) {
      console.error("Sign out error:", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  const profileImageFallback = "https://placehold.co/150x200/6344cc/FFF?text=" +
    (tutorData.name && tutorData.name !== "Loading..." ? tutorData.name.split(' ').map(n => n[0]).join('') : "T");

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading Tutor Dashboard...</div>;
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen text-xl text-red-600 p-4 text-center">
            <p>Error: {error}</p>
            {(error.includes("profile not found") || error.includes("incomplete or missing")) && (
                <button
                    onClick={() => navigate('/')} // Or to a profile creation/edit page
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go to Homepage
                </button>
            )}
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-roboto text-[#000] pb-16">
      <header className="bg-gradient-to-r from-[#3a394d] to-[#585673] text-white p-6 shadow-md relative h-[14.875rem] flex items-center">
        <div className="container mx-auto flex justify-between items-center w-full">
          <div className="text-left font-sans flex-1 mr-4">
            <h2 className="text-lg font-semibold mb-1 text-gray-300 opacity-90">Tutor</h2>
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold leading-tight text-white break-words">
              {tutorData.name}
            </h1>
          </div>

          <div className="absolute left-1/2 top-[6rem] transform -translate-x-1/2 z-10 flex-shrink-0">
            <img
              src={tutorData.profileImageUrl || profileImageFallback} // If profileData.photo is just a filename, you might need to prepend your Supabase storage URL
              alt="Tutor Profile"
              onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
              className="w-[10rem] h-[13rem] sm:w-[12rem] sm:h-[16rem] md:w-[14rem] md:h-[18rem] rounded-3xl border-4 border-white shadow-lg object-cover"
            />
          </div>

          <div className="text-right flex-1 ml-4">
            <p className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white break-words">
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

      <section className="relative py-8 px-4 pt-40 sm:pt-44 md:pt-56">
        <div className="container mx-auto flex justify-center items-center gap-8 sm:gap-12 md:gap-16 relative z-10 flex-wrap">
          {[
            { name: "Profile", path: "/tutor/profile", isLink: true, bgColor: "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500" },
            { name: "Dashboard", path: "/tutor-dashboard", isLink: false, bgColor: "bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700" },
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
              <a
                key={button.name}
                href={button.path}
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

export default Tutor;