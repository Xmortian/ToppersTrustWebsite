import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import supabase client

// Placeholder Icons (using react-icons)
import { FaEdit, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'; // Using Feather icons for variety

// Placeholder Data - Replace with actual data fetching
const initialGuardianData = {
  name: "Tania Afroz",
  contactNumber: "+88 01983258907",
  email: "tania123@gmail.com",
  gender: "Female",
  linkedinProfile: null, // or "link"
  facebookProfile: null, // or "link"
  city: "Dhaka",
  address: "M-6/1, Mirail Bottola, Dhaka-1212",
  relationWithStudent: "Mother",
  isVerified: false, // For "Verification And Security"
  guardianId: "11094", // Changed from guardianStudentId
  profileCompletion: 30, // Placeholder percentage
  profileImageUrl: null, // Placeholder image URL - Set to null initially
  // howDidYouKnow: "Facebook", // REMOVED - To be handled in Edit Profile
};


const GuardianProfile = () => {
  const navigate = useNavigate();
  const [guardianData, setGuardianData] = useState(initialGuardianData);
  const [loading, setLoading] = useState(true); // To manage loading state

  // Consistent purple theme
  const primaryColor = "bg-[#6344cc]";
  const hoverColor = "hover:bg-[#5238a8]";
  const focusRingColor = "focus:ring-[#6344cc]";
  const sectionHeaderColor = "bg-[#6344cc]"; // Using consistent purple for headers

  // --- TODO: Implement Data Fetching ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      // Example: Fetch user and profile data from Supabase
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) {
      //   // Fetch profile from your 'profiles' or 'guardians' table based on user.id
      //   // const { data: profileData, error } = await supabase
      //   //   .from('guardian_profiles') // Replace with your actual table name
      //   //   .select('*') // Select specific columns including profileImageUrl etc.
      //   //   .eq('user_id', user.id)
      //   //   .single();
      //   // if (error) {
      //   //   console.error("Error fetching profile:", error);
      //   // } else if (profileData) {
      //   //   // Merge fetched data with initial state to ensure all keys exist
      //   //   setGuardianData(prev => ({ ...prev, ...profileData }));
      //   // }
      // } else {
      //   // navigate('/'); // Redirect if not logged in
      // }

      // Using placeholder data for now:
      // Simulate fetching:
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setGuardianData(initialGuardianData);
      setLoading(false);
    };

    fetchProfile();
  }, [/* navigate */]);

  // Helper function to display profile links or "Not Given"
  const renderProfileLink = (url, platformName) => {
    if (url && url.trim() !== '') {
      const isUrl = url.startsWith('http://') || url.startsWith('https://');
      return <a href={isUrl ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{url}</a>;
    }
    return <span className="text-gray-500 italic">Not Given</span>;
  };

  // Helper to display verification status
  const renderVerificationStatus = (isVerified) => {
    return isVerified ? (
      <span className="flex items-center text-green-600 font-medium">
        <FaCheckCircle className="mr-1.5" /> Verified
      </span>
    ) : (
      <span className="flex items-center text-red-600 font-medium">
        <FaTimesCircle className="mr-1.5" /> Not Verified
      </span>
    );
  };

  // Fallback image generator
  const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + (guardianData.name ? guardianData.name.split(' ').map(n=>n[0]).join('') : "G");


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading profile...</div>;
  }

  return (
    // Main container with a light background, centered content block horizontally
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto flex justify-center items-start">
      {/* Container to control max-width and horizontal centering (via mx-auto) */}
      <div className="container mx-auto max-w-6xl w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Left Sidebar - Positioned top-left within the centered container */}
          <aside className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-6">
                 <img
                    src={guardianData.profileImageUrl || profileImageFallback}
                    alt="Profile"
                    onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-4 border-gray-200 shadow-md object-cover mb-4"
                 />
                 {/* Updated ID Label */}
                <p className="text-sm text-gray-600">Guardian ID: {guardianData.guardianId}</p>
              </div>

              {/* Profile Completion */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700">Profile Completed: {guardianData.profileCompletion}%</label>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-[#6344cc] h-2.5 rounded-full"
                    style={{ width: `${guardianData.profileCompletion}%` }}
                  ></div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <Link
                to="/guardian/profile/edit"
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-6 text-sm font-medium text-white ${primaryColor} rounded-lg ${hoverColor} transition-colors duration-200 focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2`}
              >
                <FaEdit />
                Edit Profile
              </Link>

              {/* Contact Info Preview */}
              <div className="space-y-3 text-sm text-gray-700 border-t border-gray-200 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                  <FiMail className="text-gray-500 flex-shrink-0" />
                  <span className="truncate" title={guardianData.email}>{guardianData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-500 flex-shrink-0" />
                  <span>{guardianData.contactNumber}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FiMapPin className="text-gray-500 mt-1 flex-shrink-0" />
                  <span className="break-words">{guardianData.address}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="w-full lg:flex-1">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">

              {/* Personal Information Section */}
              <section>
                <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                   <FaInfoCircle />
                   <h2 className="text-lg font-semibold">Personal Information</h2>
                </div>
                <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <strong className="block text-gray-600">Name</strong>
                    <span className="text-gray-800">{guardianData.name}</span>
                  </div>
                   <div>
                    <strong className="block text-gray-600">Contact Number</strong>
                    <span className="text-gray-800">{guardianData.contactNumber}</span>
                  </div>
                   <div>
                    <strong className="block text-gray-600">Email</strong>
                    <span className="text-gray-800 break-all">{guardianData.email}</span>
                  </div>
                   <div>
                    <strong className="block text-gray-600">Gender</strong>
                    <span className="text-gray-800">{guardianData.gender || <span className="text-gray-500 italic">Not Given</span>}</span>
                  </div>
                   <div>
                    <strong className="block text-gray-600">LinkedIn Profile Link</strong>
                    {renderProfileLink(guardianData.linkedinProfile, "LinkedIn")}
                  </div>
                   <div>
                    <strong className="block text-gray-600">Facebook Profile Link</strong>
                    {renderProfileLink(guardianData.facebookProfile, "Facebook")}
                  </div>
                   <div>
                    <strong className="block text-gray-600">City</strong>
                    <span className="text-gray-800">{guardianData.city}</span>
                  </div>
                   <div>
                    <strong className="block text-gray-600">Address</strong>
                    <span className="text-gray-800">{guardianData.address}</span>
                  </div>
                   <div className="sm:col-span-2">
                    <strong className="block text-gray-600">Relation with Student</strong>
                    <span className="text-gray-800">{guardianData.relationWithStudent}</span>
                  </div>
                </div>
              </section>

              {/* Verification and Security Section */}
              <section>
                 <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                   <FaCheckCircle />
                   <h2 className="text-lg font-semibold">Verification And Security</h2>
                </div>
                 <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
                   {renderVerificationStatus(guardianData.isVerified)}
                </div>
              </section>

              {/* REMOVED "How did you know about us?" Section */}
              {/* <section>
                 <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                   <FaInfoCircle />
                   <h2 className="text-lg font-semibold">How did you know about us?</h2>
                </div>
                 <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">
                      {guardianData.howDidYouKnow || <span className="text-gray-500 italic">Not Provided</span>}
                    </p>
                    Removed helper text
                </div>
              </section> */}

            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default GuardianProfile;
