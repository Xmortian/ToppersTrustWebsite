import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js';

// Icons
import { FaEdit, FaInfoCircle, FaBookOpen, FaGraduationCap, FaGoogleDrive } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const emptyTutorData = {
  name: "Loading...",
  email: "...",
  additionalNumber: "",
  gender: "...",
  dateOfBirth: "",
  religion: "",
  nationalId: "",
  nationality: "",
  facebookProfile: null,
  driveLink: null,
  fathersName: "",
  fathersNumber: "",
  mothersName: "",
  mothersNumber: "",
  emergencyContact: "",
  // Individual Education Fields
  sscSchool: "",
  sscGrade: "",
  hscSchool: "",
  hscGrade: "",
  uniSchool: "",         // Corresponds to 'uni' column in DB
  uniGrade: "",          // Corresponds to 'uni_grade' column in DB
  uniCurriculum: "",     // Corresponds to 'uni_curriculum' column in DB
  uniExamDegree: "",     // Corresponds to 'uni_exam_degree' column in DB
  uniFromDate: "",       // Corresponds to 'uni_from_date' column in DB
  uniMajorGroup: "",     // Corresponds to 'uni_major_group' column in DB
  uniToDate: "",         // Corresponds to 'uni_to_date' column in DB
  uniIdCardNo: "",       // Corresponds to 'uni_id_card_no' column in DB
  uniYearOfPassing: "",  // Corresponds to 'uni_year_of_passing' column in DB
  uniCurrentlyStudying: false, // Corresponds to 'uni_currently_studying' column in DB
  // Tuition related
  tutoringMethod: "...",
  availableDays: [], 
  availableTime: "...",
  location: "...",
  preferredLocations: [],
  expectedSalary: "...",
  preferredClasses: [],
  preferredSubjects: [],
  placeOfTutoring: "...",
  tutoringStyle: [],
  totalExperience: "...",
  tutorId: "...",
  profileImageUrl: null,
  profileCompletion: 0,
};

const parseArrayStringFromDB = (value) => {
  if (Array.isArray(value)) { 
    return value;
  }
  if (typeof value === 'string') {
    let sanitizedString = value.trim();
    if (sanitizedString.startsWith('{') && sanitizedString.endsWith('}')) {
      sanitizedString = sanitizedString.slice(1, -1); 
    }
    const arr = sanitizedString.split(',')
      .map(item => item.trim())
      .filter(item => item !== "");
    return arr.length > 0 ? arr : []; 
  }
  return []; 
};


const calculateProfileCompletion = (data) => {
  let completedFields = 0;
  const totalFieldsToConsider = 22; 

  if (data.name && data.name !== "Loading...") completedFields++;
  if (data.email && data.email !== "...") completedFields++;
  if (data.additionalNumber) completedFields++;
  if (data.gender && data.gender !== "...") completedFields++;
  if (data.dateOfBirth) completedFields++;
  if (data.nationalId) completedFields++;
  
  if (data.uniSchool) completedFields++;
  if (data.uniExamDegree) completedFields++;
  if (data.uniGrade) completedFields++;
  if (data.sscSchool) completedFields++;
  if (data.hscSchool) completedFields++;
  
  if (data.tutoringMethod && data.tutoringMethod !== "...") completedFields++;
  if (data.location && data.location !== "...") completedFields++;
  if (data.preferredLocations?.length > 0) completedFields++;
  if (data.expectedSalary && data.expectedSalary !== "...") completedFields++;
  if (data.preferredClasses?.length > 0) completedFields++;
  if (data.preferredSubjects?.length > 0) completedFields++;
  if (data.profileImageUrl) completedFields++;
  if (data.driveLink) completedFields++;
  if (data.totalExperience && data.totalExperience !== "...") completedFields++;
  if (data.facebookProfile) completedFields++;


  return Math.min(100, Math.round((completedFields / totalFieldsToConsider) * 100));
};


const TutorProfile = () => {
  const navigate = useNavigate();
  const [tutorData, setTutorData] = useState(emptyTutorData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const primaryColor = "bg-[#6344cc]";
  const hoverColor = "hover:bg-[#5238a8]";
  const focusRingColor = "focus:ring-[#6344cc]";
  const sectionHeaderColor = "bg-[#6344cc]";

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      console.log("TUTOR PROFILE DISPLAY: fetchProfile called");

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("TUTOR PROFILE DISPLAY: Auth error:", authError);
        setError("Authentication error.");
        setLoading(false);
        navigate('/login');
        return;
      }
      if (!user) {
        console.log("TUTOR PROFILE DISPLAY: No user found, redirecting.");
        navigate('/login');
        return;
      }
      console.log("TUTOR PROFILE DISPLAY: Authenticated user ID:", user.id);

      try {
        // **CRITICAL**: Ensure these column names EXACTLY match your Supabase 'tutor' table schema!
        // REMOVED available_days_text from select
        const { data: profile, error: profileError } = await supabase
          .from('tutor')
          .select(`
            id, name, email, phone, gender, photo, experience_years,
            expected_salary, address, 
            preferred_subjects, preferred_areas, preferred_classes, tutoring_style,
            user_id,
            date_of_birth, religion, national_id_number, nationality, facebook_profile_link,
            drive_link, fathers_name, fathers_contact_number, mothers_name, mothers_contact_number,
            emergency_contact_number, tutoring_method, available_time,
            place_of_tutoring,
            ssc_school, ssc_grade, hsc_school, hsc_grade, uni, uni_grade,
            uni_curriculum, uni_exam_degree, uni_from_date, uni_major_group,
            uni_to_date, uni_id_card_no, uni_year_of_passing, uni_currently_studying
          `) 
          .eq('user_id', user.id)
          .single();

        console.log("TUTOR PROFILE DISPLAY: Supabase raw profileData response:", JSON.stringify(profile, null, 2)); 
        console.log("TUTOR PROFILE DISPLAY: Supabase profileError:", profileError);

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("TUTOR PROFILE DISPLAY: Supabase error (not PGRST116):", profileError);
          setError(profileError.message || "Failed to load profile due to a database error.");
          setTutorData(prev => ({...prev, name: user.email?.split('@')[0] || "User", email: user.email || "N/A", tutorId: "Error"}));
          setLoading(false); 
          return; 
        }
        
        const baseDefaults = JSON.parse(JSON.stringify(emptyTutorData)); 

        if (profile) {
          console.log("TUTOR PROFILE DISPLAY: Profile data found. Raw values from DB:");
          console.log("DB ssc_school:", profile.ssc_school);
          console.log("DB uni (for uniSchool):", profile.uni);
          // ... (other specific logs for education fields if needed for debugging) ...

          let imageUrl = profile.photo || null;
          if (profile.photo && !profile.photo.startsWith('http') && !profile.photo.startsWith('blob:')) {
            const { data: publicUrlData } = supabase.storage.from('photo').getPublicUrl(profile.photo);
            imageUrl = publicUrlData?.publicUrl || profile.photo;
          }

          const fetchedData = {
            ...baseDefaults, 
            name: profile.name || "",
            email: profile.email || user.email || "", 
            additionalNumber: profile.phone || "",
            gender: profile.gender || "",
            dateOfBirth: profile.date_of_birth || "",
            religion: profile.religion || "",
            nationalId: profile.national_id_number || "",
            nationality: profile.nationality || "",
            facebookProfile: profile.facebook_profile_link || null,
            driveLink: profile.drive_link || null,
            fathersName: profile.fathers_name || "",
            fathersNumber: profile.fathers_contact_number || "",
            mothersName: profile.mothers_name || "",
            mothersNumber: profile.mothers_contact_number || "",
            emergencyContact: profile.emergency_contact_number || "",
            tutoringMethod: profile.tutoring_method || "",
            // profile.available_days_text will be undefined as it's not selected.
            // parseArrayStringFromDB(undefined) will correctly return []
            availableDays: parseArrayStringFromDB(profile.available_days_text), 
            availableTime: profile.available_time || "",
            location: profile.address || "",
            preferredLocations: parseArrayStringFromDB(profile.preferred_areas),
            expectedSalary: profile.expected_salary?.toString() || "", 
            preferredClasses: parseArrayStringFromDB(profile.preferred_classes),
            preferredSubjects: parseArrayStringFromDB(profile.preferred_subjects),
            placeOfTutoring: profile.place_of_tutoring || "",
            tutoringStyle: parseArrayStringFromDB(profile.tutoring_style),
            totalExperience: profile.experience_years ? `${profile.experience_years} years` : "N/A",
            tutorId: profile.id?.toString() || "N/A",
            profileImageUrl: imageUrl,
            sscSchool: profile.ssc_school || "",
            sscGrade: profile.ssc_grade || "",
            hscSchool: profile.hsc_school || "",
            hscGrade: profile.hsc_grade || "",
            uniSchool: profile.uni || "", 
            uniGrade: profile.uni_grade || "",
            uniCurriculum: profile.uni_curriculum || "",
            uniExamDegree: profile.uni_exam_degree || "",
            uniFromDate: profile.uni_from_date || "",
            uniMajorGroup: profile.uni_major_group || "",
            uniToDate: profile.uni_to_date || "",
            uniIdCardNo: profile.uni_id_card_no || "",
            uniYearOfPassing: profile.uni_year_of_passing || "",
            uniCurrentlyStudying: profile.uni_currently_studying || false,
          };
          fetchedData.profileCompletion = calculateProfileCompletion(fetchedData);
          console.log("TUTOR PROFILE DISPLAY: Setting tutorData with:", fetchedData);
          setTutorData(fetchedData);
        } else { 
            console.log("TUTOR PROFILE DISPLAY: Profile not found (PGRST116 or profile is null), setting defaults.");
            setError("Profile not found. Please complete your profile information.");
            setTutorData(prev => ({...baseDefaults, name: user.email?.split('@')[0] || "User", email: user.email || "N/A", tutorId: "N/A"}));
        }
      } catch (err) {
        console.error("TUTOR PROFILE DISPLAY: Error in fetchProfile try block:", err);
        setError(err.message || "An unknown error occurred while loading the profile.");
        setTutorData(prev => ({...emptyTutorData, name: user.email?.split('@')[0] || "User", email: user.email || "N/A", tutorId: "Error"})); 
      } finally {
        setLoading(false);
        console.log("TUTOR PROFILE DISPLAY: fetchProfile finished.");
      }
    };
    fetchProfile();
  }, [navigate]);

  const renderProfileLink = (url, platformName) => {
    if (url && url.trim() !== '') {
      const isUrl = url.startsWith('http://') || url.startsWith('https://');
      return <a href={isUrl ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{url}</a>;
    }
    return <span className="text-gray-500 italic">Not Given</span>;
  };

  const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + (tutorData.name && tutorData.name !== "Loading..." ? tutorData.name.split(' ').map(n=>n[0]).join('') : "T");

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading profile...</div>;
  }
  if (error && (!tutorData.name || tutorData.name === "Loading...")) { 
    return <div className="flex flex-col justify-center items-center min-h-screen text-xl text-red-600 p-4 text-center">
        <p>Error: {error}</p>
        <button onClick={() => navigate(-1)} className={`mt-4 px-4 py-2 text-white ${primaryColor} rounded-md ${hoverColor}`}>Go Back</button>
        </div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto flex flex-col items-center">
      {/* Centered Top Box */}
      <div className="w-full max-w-lg mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
          <div className="flex flex-col items-center mb-5">
            <img src={tutorData.profileImageUrl || profileImageFallback} alt="Profile" onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }} className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-gray-200 shadow-md object-cover mb-3" />
            <p className="text-sm text-gray-600">Tutor ID: {tutorData.tutorId}</p>
          </div>
          <div className="mb-5 w-full px-4">
            <label className="text-sm font-medium text-gray-700 block text-center mb-1">Profile Completed: {tutorData.profileCompletion}%</label>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`${primaryColor} h-2.5 rounded-full`} style={{ width: `${tutorData.profileCompletion}%` }}></div>
            </div>
          </div>
          <Link to="/tutor/profile/edit" className={`w-full max-w-xs flex items-center justify-center gap-2 px-4 py-2.5 mb-5 text-sm font-medium text-white ${primaryColor} rounded-lg ${hoverColor} transition-colors duration-200 focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2`}>
            <FaEdit /> Edit Profile
          </Link>
          <div className="w-full space-y-2 text-sm text-gray-700 border-t border-gray-200 pt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <FiMail className="text-gray-500 flex-shrink-0" /> <span className="truncate" title={tutorData.email}>{tutorData.email}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FiMapPin className="text-gray-500 flex-shrink-0" /> <span className="break-words">{tutorData.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content sections */}
      <div className="container mx-auto max-w-4xl w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
          {error && tutorData.name && tutorData.name !== "Loading..." && (
             <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                <span className="font-medium">Notice:</span> {error} Some profile data might be incomplete.
            </div>
          )}

          {/* Personal Information Section */}
          <section>
            <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
              <div className="flex items-center gap-2"><FaInfoCircle /><h2 className="text-lg font-semibold">Personal Information</h2></div>
            </div>
            <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div><strong className="block text-gray-600">Email</strong><span className="text-gray-800 break-all">{tutorData.email}</span></div>
              <div><strong className="block text-gray-600">Phone Number</strong><span className="text-gray-800">{tutorData.additionalNumber || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div><strong className="block text-gray-600">Gender</strong><span className="text-gray-800">{tutorData.gender || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div><strong className="block text-gray-600">Date of Birth</strong><span className="text-gray-800">{tutorData.dateOfBirth || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div><strong className="block text-gray-600">Religion</strong><span className="text-gray-800">{tutorData.religion || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div><strong className="block text-gray-600">National ID</strong><span className="text-gray-800">{tutorData.nationalId || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div className="sm:col-span-2"><strong className="block text-gray-600">Nationality</strong><span className="text-gray-800">{tutorData.nationality || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div><strong className="block text-gray-600">Facebook Profile Link</strong>{renderProfileLink(tutorData.facebookProfile, "Facebook")}</div>
              <div className="sm:col-span-2"><strong className="block text-gray-600">Google Drive Link (Documents)</strong>{renderProfileLink(tutorData.driveLink, "Google Drive")}<p className="text-xs text-gray-500 mt-1">Upload NID, Birth Certificate, and Student ID to a Google Drive folder and share the link here. Ensure the link is accessible.</p></div>
              <div><strong className="block text-gray-600">Father’s Name</strong><span className="text-gray-800">{tutorData.fathersName || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div><strong className="block text-gray-600">Father’s Number</strong><span className="text-gray-800">{tutorData.fathersNumber || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div><strong className="block text-gray-600">Mother’s Name</strong><span className="text-gray-800">{tutorData.mothersName || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div><strong className="block text-gray-600">Mother’s Number</strong><span className="text-gray-800">{tutorData.mothersNumber || <span className="text-gray-500 italic">N/A</span>}</span></div>
              <div className="sm:col-span-2"><strong className="block text-gray-600">Emergency Contact</strong><span className="text-gray-800">{tutorData.emergencyContact || <span className="text-gray-500 italic">N/A</span>}</span></div>
            </div>
          </section>

          {/* Educational Information Section - Displaying individual fields */}
          <section>
              <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                      <FaGraduationCap />
                      <h2 className="text-lg font-semibold">Educational Information</h2>
                  </div>
              </div>
              <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 space-y-6 text-sm">
                  {/* University Details */}
                  {(tutorData.uniSchool || tutorData.uniGrade || tutorData.uniExamDegree) ? (
                      <div className="border-b border-gray-200 pb-4 mb-4">
                          <h4 className="font-semibold text-base text-gray-800 mb-3">University / Bachelors / Honors</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                              <div><strong className="block text-gray-600">Institute</strong><span className="text-gray-800">{tutorData.uniSchool || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">Curriculum</strong><span className="text-gray-800">{tutorData.uniCurriculum || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">Exam/Degree</strong><span className="text-gray-800">{tutorData.uniExamDegree || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">From Date</strong><span className="text-gray-800">{tutorData.uniFromDate || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">Major/Group</strong><span className="text-gray-800">{tutorData.uniMajorGroup || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">To Date</strong><span className="text-gray-800">{tutorData.uniToDate || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">ID Card No</strong><span className="text-gray-800">{tutorData.uniIdCardNo || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">Year of Passing</strong><span className="text-gray-800">{tutorData.uniYearOfPassing || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div className="sm:col-span-2"><strong className="block text-gray-600">Result</strong><span className="text-gray-800">{tutorData.uniGrade || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div className="sm:col-span-2"><strong className="block text-gray-600">Currently Studying Here</strong><span className="text-gray-800">{tutorData.uniCurrentlyStudying ? 'Yes' : 'No'}</span></div>
                          </div>
                      </div>
                  ) : null}

                  {/* Higher Secondary (HSC) Details */}
                  {(tutorData.hscSchool || tutorData.hscGrade) ? (
                      <div className="border-b border-gray-200 pb-4 mb-4">
                          <h4 className="font-semibold text-base text-gray-800 mb-3">Higher Secondary (HSC)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                              <div><strong className="block text-gray-600">Institute</strong><span className="text-gray-800">{tutorData.hscSchool || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">Grade/Result</strong><span className="text-gray-800">{tutorData.hscGrade || <span className="italic text-gray-500">N/A</span>}</span></div>
                          </div>
                      </div>
                  ) : null}

                  {/* Secondary (SSC) Details */}
                  {(tutorData.sscSchool || tutorData.sscGrade) ? (
                      <div> 
                          <h4 className="font-semibold text-base text-gray-800 mb-3">Secondary (SSC)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                              <div><strong className="block text-gray-600">Institute</strong><span className="text-gray-800">{tutorData.sscSchool || <span className="italic text-gray-500">N/A</span>}</span></div>
                              <div><strong className="block text-gray-600">Grade/Result</strong><span className="text-gray-800">{tutorData.sscGrade || <span className="italic text-gray-500">N/A</span>}</span></div>
                          </div>
                      </div>
                  ) : null}

                  {!(tutorData.uniSchool || tutorData.uniGrade || tutorData.uniExamDegree) &&
                   !(tutorData.hscSchool || tutorData.hscGrade) &&
                   !(tutorData.sscSchool || tutorData.sscGrade) && (
                      <p className="text-gray-500 italic">No educational information provided.</p>
                  )}
              </div>
          </section>

          {/* Tuition Related Information Section */}
          <section>
            <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                <div className="flex items-center gap-2"><FaBookOpen /><h2 className="text-lg font-semibold">Tuition Related Information</h2></div>
            </div>
            <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 space-y-3 text-sm">
                <div><strong className="block text-gray-600 mb-1">Tutoring Method</strong><p className="text-gray-800">{tutorData.tutoringMethod || <span className="text-gray-500 italic">N/A</span>}</p></div>
                <div><strong className="block text-gray-600">Available Days</strong><span className="text-gray-800">{tutorData.availableDays?.join(', ') || <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Time</strong><span className="text-gray-800">{tutorData.availableTime || <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Location</strong><span className="text-gray-800">{tutorData.location || <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Preferred Locations</strong><span className="text-gray-800">{tutorData.preferredLocations?.join(', ') || <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Expected Salary</strong><span className="text-gray-800">{tutorData.expectedSalary ? `${tutorData.expectedSalary} BDT` : <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Preferred Classes</strong><span className="text-gray-800">{tutorData.preferredClasses?.join(', ') || <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Preferred Subjects</strong><span className="text-gray-800">{tutorData.preferredSubjects?.join(', ') || <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Place of Tutoring</strong><span className="text-gray-800">{tutorData.placeOfTutoring || <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Tutoring Style</strong><span className="text-gray-800">{tutorData.tutoringStyle?.join(', ') || <span className="text-gray-500 italic">N/A</span>}</span></div>
                <div><strong className="block text-gray-600">Total Experience</strong><span className="text-gray-800">{tutorData.totalExperience}</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
