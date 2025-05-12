import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import Supabase client

// Placeholder Icons
import { FaSignOutAlt } from 'react-icons/fa';

// Initial state for guardianData, will be overwritten by fetched data
const initialGuardianData = {
  name: "Loading...",
  guardianId: "...",
  profileImageUrl: "", // Default or placeholder image
};

// Static recommended tutors data for now
const recommendedTutorsData = [
  { id: 1, name: "Moutmayen Nafis", imageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-2@2x.png" },
  { id: 2, name: "Tahsin Sayed", imageUrl: "/image-15@2x.png" },
  { id: 3, name: "Taskia Maisha", imageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-7@2x.png" },
  { id: 4, name: "Nafisa Nahar", imageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-1@2x.png" },
  { id: 5, name: "Taskia Maisha", imageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-5@2x.png" },
];


const Guardian = () => {
  const navigate = useNavigate();
  const [guardianData, setGuardianData] = useState(initialGuardianData);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // For sign-out and fetch errors

  useEffect(() => {
    const fetchGuardianData = async () => {
      setLoading(true);
      setError(null); // Clear previous fetch errors

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Error fetching user or no user logged in:', authError);
        navigate('/'); // Redirect to login if no user or auth error
        return;
      }

      try {
        // Assuming your table is 'guardian' and linked by 'user_id'
        // Adjust 'guardian' and column names if they are different in your schema.
        const { data: profile, error: profileFetchError } = await supabase
          .from('guardian') // YOUR GUARDIAN TABLE NAME
          .select('id, name, photo') // Select columns: 'id' for guardianId, 'name', 'photo' for profile image
          .eq('user_id', user.id)
          .single();

        if (profileFetchError) {
          // PGRST116: " esattamente una fila" (exactly one row) not found
          if (profileFetchError.code === 'PGRST116') {
            console.warn('Guardian profile not found for user:', user.id);
            // Set to default or guide to profile creation
            setGuardianData({
              name: user.email.split('@')[0], // Fallback name
              guardianId: "New User",
              profileImageUrl: "",
            });
            setError("Guardian profile not found. Please complete your profile.");
            // navigate('/guardian/profile/edit'); // Optionally redirect to edit page
          } else {
            throw profileFetchError; // Re-throw other errors
          }
        } else if (profile) {
          let imageUrl = profile.photo || "";
          if (profile.photo && !profile.photo.startsWith('http')) {
            // Assuming 'profile-pics' or a similar bucket for guardian photos
            const { data: publicUrlData } = supabase.storage.from('profile-pics').getPublicUrl(profile.photo);
            imageUrl = publicUrlData?.publicUrl || profile.photo; // Fallback to raw path if URL construction fails
          }
          setGuardianData({
            name: profile.name || user.email.split('@')[0],
            guardianId: profile.id?.toString() || "N/A", // Use 'id' column for guardianId
            profileImageUrl: imageUrl,
          });
        }
      } catch (fetchError) {
        console.error('Error fetching guardian profile:', fetchError);
        setError(`Failed to load dashboard data: ${fetchError.message}`);
        // Fallback to some default data or show error prominently
        setGuardianData({
            name: user.email?.split('@')[0] || "User",
            guardianId: "Error",
            profileImageUrl: "",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGuardianData();
  }, [navigate]);

  const handleSignOut = async () => {
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      setError(`Sign out failed: ${error.message}`);
      alert(`Sign out failed: ${error.message}`);
    }
  };

  const profileImageFallback = "https://placehold.co/150x200/6344cc/FFF?text=" + 
    (guardianData.name && guardianData.name !== "Loading..." ? guardianData.name.split(' ').map(n=>n[0]).join('') : "G");
  
  const tutorImageFallback = () => `https://placehold.co/80x80/e0e0e0/7f7f7f?text=Photo`;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading Guardian Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-roboto text-[#000] pb-24">
      {/* Header Section */}
      <header className="bg-[#3b394d] text-white p-6 shadow-md relative h-[14.875rem] flex items-center">
        <div className="container mx-auto flex justify-between items-center w-full">
          <div className="text-left text-[#e2c4c4]">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight">
              {guardianData.name.split(' ')[0]} <br />
              {guardianData.name.split(' ').slice(1).join(' ')}
            </h1>
          </div>
          <div className="absolute left-1/2 top-[5.5rem] transform -translate-x-1/2 z-10">
              <img
              src={guardianData.profileImageUrl || profileImageFallback}
              alt="Guardian Profile"
              onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
              className="w-[9rem] h-[12rem] sm:w-[10rem] sm:h-[14rem] md:w-[12rem] md:h-[16rem] rounded-[60px] border-4 border-white shadow-lg object-cover"
            />
          </div>
          <div className="text-right">
            <p className="text-base sm:text-lg text-gray-300 mb-1">Guardian ID</p>
            <p className="text-5xl sm:text-6xl md:text-7xl font-semibold">{guardianData.guardianId}</p>
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
      <section className="relative py-8 px-4 pt-40 sm:pt-44 md:pt-52">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 relative z-10">
          {[
            { name: "Profile", path: "/guardian/profile", bgColor: "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500" },
            { name: "Short List", path: "/tutor-card", bgColor: "bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600" },
            { name: "Post Job", path: "/guardian/post-job", bgColor: "bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700" },
            { name: "Previous Jobs", path: "/guardian/previous-jobs", bgColor: "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500" },
          ].map((button) => (
            <Link
              key={button.name}
              to={button.path}
              className={`p-10 md:p-12 min-h-[10rem] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center text-gray-800 font-semibold text-xl md:text-2xl ${button.bgColor}`}
            >
              <span>{button.name}</span>
            </Link>
          ))}
        </div>
      </section>

        {/* Error display for fetch error */}
        {error && !error.toLowerCase().includes("sign out") && (
            <div className="container mx-auto text-center py-4">
                <p className="text-red-500">{error}</p>
            </div>
        )}

      {/* Recommended Tutors Section */}
      <section className="pt-8 pb-12 px-4 mt-16 md:mt-24 lg:mt-32">
        <div className="container mx-auto">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Recommended Tutors</h3>
          {/* Display sign-out error specifically if it occurred (already handled by general error display above if needed) */}
          {error && error.toLowerCase().includes("sign out") && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-5">
            {recommendedTutorsData.map((tutor) => (
              <Link
                key={tutor.id}
                to="/browse-tutors" // You might want to link to a specific tutor's profile: `/tutor/${tutor.id}`
                className="block bg-white p-1.5 rounded-md shadow hover:shadow-md transition-transform transform hover:scale-105 text-center group"
              >
                <img
                  src={tutor.imageUrl || tutorImageFallback()}
                  alt={tutor.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = tutorImageFallback(); }}
                  className="w-full h-16 sm:h-20 object-cover rounded-sm mb-1.5 mx-auto"
                />
                <h4 className="text-[10px] sm:text-xs font-medium text-gray-600 group-hover:text-blue-600 truncate px-1">{tutor.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Guardian;