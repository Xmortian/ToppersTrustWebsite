import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import Supabase client

// Icons
import { FaEdit, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

// Initial state for guardianData, will be overwritten by fetched data
const initialGuardianDataOnLoad = {
  name: "Loading...",
  contactNumber: "...",
  email: "...",
  facebookProfile: null,
  city: "...",
  address: "...",
  relationWithStudent: "...",
  isVerified: false,
  guardianId: "...",
  profileCompletion: 0, 
  profileImageUrl: null,
};


const GuardianProfile = () => {
  const navigate = useNavigate();
  const [guardianData, setGuardianData] = useState(initialGuardianDataOnLoad);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  const primaryColor = "bg-[#6344cc]";
  const hoverColor = "hover:bg-[#5238a8]";
  const focusRingColor = "focus:ring-[#6344cc]";
  const sectionHeaderColor = "bg-[#6344cc]";

  // Calculate profile completion (basic example)
  const calculateProfileCompletion = (data) => {
    let completedFields = 0;
    // Adjusted totalConsideredFields since gender is removed
    const totalConsideredFields = 7; // name, contact, email, city, address, relation, photo
    if (data.name && data.name !== "Loading...") completedFields++;
    if (data.contactNumber && data.contactNumber !== "...") completedFields++;
    if (data.email && data.email !== "...") completedFields++;
    // if (data.gender && data.gender !== "...") completedFields++; // Removed gender check
    if (data.city && data.city !== "...") completedFields++;
    if (data.address && data.address !== "...") completedFields++;
    if (data.relationWithStudent && data.relationWithStudent !== "...") completedFields++;
    if (data.profileImageUrl) completedFields++;
    
    return Math.min(100, Math.round((completedFields / totalConsideredFields) * 100));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null); 

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Error fetching user or no user logged in:", authError);
        navigate('/'); 
        return;
      }

      try {
        const { data: profileData, error: profileFetchError } = await supabase
          .from('guardian') 
          .select(`
            id, 
            name, 
            phone, 
            email, 
            
            facebook_profile_link, 
            
            city, 
            address, 
            relation_with_student, 
            verified_yn,
            photo,
            drivelink 
          `) 
          .eq('user_id', user.id)
          .single();

        if (profileFetchError) {
          if (profileFetchError.code === 'PGRST116') { 
            console.warn("Guardian profile not found for user:", user.id);
            setError("Guardian profile not found. You might need to complete your registration or contact support.");
            setGuardianData(prev => ({
              ...initialGuardianDataOnLoad,
              name: user.email?.split('@')[0] || "Guardian",
              email: user.email || "N/A",
              guardianId: "New User",
              profileCompletion: calculateProfileCompletion({ email: user.email }), // Recalculate with available data
            }));
          } else {
            throw profileFetchError; 
          }
        } else if (profileData) {
          let imageUrl = profileData.photo || null;
          if (profileData.photo && !profileData.photo.startsWith('http')) {
            const { data: publicUrlData } = supabase.storage.from('profile-pics').getPublicUrl(profileData.photo);
            imageUrl = publicUrlData?.publicUrl || profileData.photo; 
          }

          const newGuardianData = {
            name: profileData.name || user.email?.split('@')[0] || "Guardian",
            contactNumber: profileData.phone || "N/A",
            email: profileData.email || user.email || "N/A",
            // gender: profileData.gender || "N/A", // REMOVED GENDER MAPPING
            linkedinProfile: profileData.linkedin_profile_link || null,
            facebookProfile: profileData.facebook_profile_link || null,
            city: profileData.city || "N/A",
            address: profileData.address || "N/A", 
            relationWithStudent: profileData.relation_with_student || "N/A",
            isVerified: profileData.verified_yn || false,
            guardianId: profileData.id?.toString() || "N/A", 
            profileImageUrl: imageUrl,
          };
          newGuardianData.profileCompletion = calculateProfileCompletion(newGuardianData);
          setGuardianData(newGuardianData);
        } else {
            setError("Guardian profile data could not be loaded.");
             setGuardianData(prev => ({
              ...initialGuardianDataOnLoad,
              name: user.email?.split('@')[0] || "Guardian",
              email: user.email || "N/A",
              guardianId: "N/A",
              profileCompletion: calculateProfileCompletion({ email: user.email }),
            }));
        }
      } catch (error) {
        console.error("Error fetching guardian profile details:", error);
        setError(`Failed to load profile: ${error.message}`);
         setGuardianData(prev => ({ 
            ...initialGuardianDataOnLoad,
            name: user.email?.split('@')[0] || "Guardian",
            email: user.email || "N/A",
            guardianId: "Error",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
    }
  };

  const renderProfileLink = (url, platformName) => {
    if (url && url.trim() !== '') {
      const isUrl = url.startsWith('http://') || url.startsWith('https://');
      return <a href={isUrl ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{url}</a>;
    }
    return <span className="text-gray-500 italic">Not Given</span>;
  };

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

  const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + 
    (guardianData.name && guardianData.name !== "Loading..." ? guardianData.name.split(' ').map(n=>n[0]).join('') : "G");

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading Guardian Profile...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto flex justify-center items-start">
      <div className="container mx-auto max-w-6xl w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
              <div className="flex flex-col items-center mb-6">
                   <img
                     src={guardianData.profileImageUrl || profileImageFallback}
                     alt="Profile"
                     onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
                     className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-4 border-gray-200 shadow-md object-cover mb-4"
                   />
                <p className="text-sm text-gray-600">Guardian ID: {guardianData.guardianId}</p>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700">Profile Completed: {guardianData.profileCompletion}%</label>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-[#6344cc] h-2.5 rounded-full"
                    style={{ width: `${guardianData.profileCompletion}%` }}
                  ></div>
                </div>
              </div>

              <Link
                to="/guardian/profile/edit" 
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-6 text-sm font-medium text-white ${primaryColor} rounded-lg ${hoverColor} transition-colors duration-200 focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2`}
              >
                <FaEdit />
                Edit Profile
              </Link>

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
                <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-6 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                >
                    <FaSignOutAlt /> Sign Out
                </button>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="w-full lg:flex-1">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
              {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  <span className="font-medium">Error:</span> {error}
                </div>
              )}
              
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
                   {/* Gender field removed from display */}
                   {/* <div>
                    <strong className="block text-gray-600">Gender</strong>
                    <span className="text-gray-800">{guardianData.gender || <span className="text-gray-500 italic">Not Given</span>}</span>
                  </div> */}
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
                    <span className="text-gray-800">{guardianData.city || <span className="text-gray-500 italic">Not Given</span>}</span>
                  </div>
                   <div>
                    <strong className="block text-gray-600">Address</strong>
                    <span className="text-gray-800">{guardianData.address || <span className="text-gray-500 italic">Not Given</span>}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <strong className="block text-gray-600">Relation with Student</strong>
                    <span className="text-gray-800">{guardianData.relationWithStudent || <span className="text-gray-500 italic">Not Given</span>}</span>
                  </div>
                </div>
              </section>

              <section>
                   <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                     <FaCheckCircle />
                     <h2 className="text-lg font-semibold">Verification And Security</h2>
                 </div>
                   <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
                     {renderVerificationStatus(guardianData.isVerified)}
                 </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default GuardianProfile;
