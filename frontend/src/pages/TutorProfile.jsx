import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import supabase client

// Placeholder Icons
import { FaEdit, FaInfoCircle, FaBookOpen, FaGraduationCap } from 'react-icons/fa'; // Removed FaUserCircle
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

// Placeholder Data - Replace with actual data fetching
const initialTutorData = {
  // Personal Info Section
  name: "Nafisa Nahar",
  email: "nafisa45@gmail.com",
  additionalNumber: "01553984931",
  gender: "Female",
  dateOfBirth: "2001-10-20",
  religion: "Islam",
  nationalId: "011879650",
  nationality: "Bangladeshi",
  facebookProfile: null,
  linkedinProfile: null,
  fathersName: "Kazi Sawkat",
  fathersNumber: "017685990321",
  mothersName: "Tania Afrooz",
  mothersNumber: "01956748392",
  emergencyContact: "01778585432",

  // Educational Info
  education: [
    { level: "Bachelors/Honors", institute: "BRAC University", examDegree: "B.Sc", majorGroup: "CSE", idCardNo: "22201827", result: "CGPA- 3.74", curriculum: "English Version", fromDate: "2022-09-10", toDate: "2026-12-31", yearOfPassing: "2026", currentInstitute: true, },
    { level: "Higher Secondary", institute: "Dhaka College", examDegree: "HSC", majorGroup: "Science", idCardNo: "102041", result: "GPA 5.0", curriculum: "Bangla Version", fromDate: "2019-07-15", toDate: "2022-02-13", yearOfPassing: "2022", currentInstitute: false, },
    { level: "Secondary", institute: "Ideal School And College", examDegree: "SSC", majorGroup: "Science", idCardNo: "102041", result: "GPA 5.0", curriculum: "Bangla Version", fromDate: "2017-01-10", toDate: "2019-05-06", yearOfPassing: "2019", currentInstitute: false, },
  ],

  // Tuition Related Info
  tutoringMethod: "I focus not only on academic excellence, but also on developing essential skills of time management and problem solving. I work closely with students to ensure efficient study plans.",
  availableDays: ["Saturday", "Sunday", "Tuesday", "Thursday"],
  availableTime: "3.30 pm - 8 pm",
  location: "M-62/1, Merul Badda, Dhaka-1212",
  preferredLocations: ["Merul Badda", "Gulshan", "Banasree", "Mohakhali", "Rampura", "Bailey Road"],
  expectedSalary: "5000 - 15000",
  preferredClasses: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"],
  preferredSubjects: ["Physics", "Chemistry", "Biology", "Math", "English", "Arts & Crafts", "Bangla"],
  placeOfTutoring: "Student Home",
  tutoringStyle: ["One to One", "One to Many"],
  totalExperience: "15 years",

  // Top Box Info
  tutorId: "TUT123",
  profileImageUrl: null,
  profileCompletion: 75,
};


const TutorProfile = () => {
  const navigate = useNavigate();
  const [tutorData, setTutorData] = useState(initialTutorData);
  const [loading, setLoading] = useState(true);

  // Consistent purple theme (like Guardian Profile)
  const primaryColor = "bg-[#6344cc]";
  const hoverColor = "hover:bg-[#5238a8]";
  const focusRingColor = "focus:ring-[#6344cc]";
  // Section header color matching Guardian Profile Edit
  const sectionHeaderColor = "bg-[#6344cc]"; // Changed from teal to purple

  // --- TODO: Implement Data Fetching ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      // ... (Supabase fetching logic placeholder) ...
      await new Promise(resolve => setTimeout(resolve, 500));
      setTutorData(initialTutorData);
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

   // Fallback image generator (using primary color)
  const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + (tutorData.name ? tutorData.name.split(' ').map(n=>n[0]).join('') : "T");


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading profile...</div>;
  }

  return (
    // Main container: light background, padding, centers content horizontally
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto flex flex-col items-center">

      {/* Centered Top Box (Previously Sidebar Content) */}
      <div className="w-full max-w-lg mb-8"> {/* Control width of the top box */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-5">
                <img
                  src={tutorData.profileImageUrl || profileImageFallback}
                  alt="Profile"
                  onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-gray-200 shadow-md object-cover mb-3" // Slightly smaller
                />
              <p className="text-sm text-gray-600">Tutor ID: {tutorData.tutorId}</p>
            </div>

            {/* Profile Completion */}
            <div className="mb-5 w-full px-4">
              <label className="text-sm font-medium text-gray-700 block text-center mb-1">Profile Completed: {tutorData.profileCompletion}%</label>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`${primaryColor} h-2.5 rounded-full`} // Use primary purple
                  style={{ width: `${tutorData.profileCompletion}%` }}
                ></div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <Link
              to="/tutor/profile/edit" // Link to the tutor edit page route
              className={`w-full max-w-xs flex items-center justify-center gap-2 px-4 py-2.5 mb-5 text-sm font-medium text-white ${primaryColor} rounded-lg ${hoverColor} transition-colors duration-200 focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2`}
            >
              <FaEdit />
              Edit Profile
            </Link>

            {/* Contact Info Preview */}
            <div className="w-full space-y-2 text-sm text-gray-700 border-t border-gray-200 pt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <FiMail className="text-gray-500 flex-shrink-0" />
                <span className="truncate" title={tutorData.email}>{tutorData.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <FiMapPin className="text-gray-500 flex-shrink-0" />
                <span className="break-words">{tutorData.location}</span>
              </div>
            </div>
          </div>
      </div>

      {/* Container for the main content sections below the top box */}
      <div className="container mx-auto max-w-4xl w-full">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">

            {/* Personal Information Section */}
            <section>
              <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                      <FaInfoCircle />
                      <h2 className="text-lg font-semibold">Personal Information</h2>
                  </div>
              </div>
              <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  {/* Displaying data based on Figma screenshot */}
                  <div><strong className="block text-gray-600">Email</strong><span className="text-gray-800 break-all">{tutorData.email}</span></div>
                  <div><strong className="block text-gray-600">Additional Number</strong><span className="text-gray-800">{tutorData.additionalNumber || <span className="text-gray-500 italic">N/A</span>}</span></div>
                  <div><strong className="block text-gray-600">Gender</strong><span className="text-gray-800">{tutorData.gender}</span></div>
                  <div><strong className="block text-gray-600">Date of Birth</strong><span className="text-gray-800">{tutorData.dateOfBirth}</span></div>
                  <div><strong className="block text-gray-600">Religion</strong><span className="text-gray-800">{tutorData.religion}</span></div>
                  <div><strong className="block text-gray-600">National ID</strong><span className="text-gray-800">{tutorData.nationalId}</span></div>
                  <div className="sm:col-span-2"><strong className="block text-gray-600">Nationality</strong><span className="text-gray-800">{tutorData.nationality}</span></div>
                  <div><strong className="block text-gray-600">Facebook Profile Link</strong>{renderProfileLink(tutorData.facebookProfile, "Facebook")}</div>
                  <div><strong className="block text-gray-600">LinkedIn Profile Link</strong>{renderProfileLink(tutorData.linkedinProfile, "LinkedIn")}</div>
                  <div><strong className="block text-gray-600">Father’s Name</strong><span className="text-gray-800">{tutorData.fathersName}</span></div>
                  <div><strong className="block text-gray-600">Father’s Number</strong><span className="text-gray-800">{tutorData.fathersNumber}</span></div>
                  <div><strong className="block text-gray-600">Mother’s Name</strong><span className="text-gray-800">{tutorData.mothersName}</span></div>
                  <div><strong className="block text-gray-600">Mother’s Number</strong><span className="text-gray-800">{tutorData.mothersNumber}</span></div>
                  <div className="sm:col-span-2"><strong className="block text-gray-600">Emergency Contact</strong><span className="text-gray-800">{tutorData.emergencyContact}</span></div>
              </div>
            </section>

            {/* Educational Information Section */}
            <section>
                <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                      <FaGraduationCap />
                      <h2 className="text-lg font-semibold">Educational Information</h2>
                  </div>
              </div>
              <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 space-y-4 text-sm">
                  {tutorData.education?.map((edu, index) => (
                      <div key={index} className={` ${index > 0 ? 'border-t border-gray-200 pt-4' : ''}`}>
                          <h4 className="font-semibold text-base text-gray-800 mb-2">{edu.level}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                              <div><strong className="block text-gray-600">Institute</strong><span className="text-gray-800">{edu.institute}</span></div>
                              <div><strong className="block text-gray-600">Curriculum</strong><span className="text-gray-800">{edu.curriculum}</span></div>
                              <div><strong className="block text-gray-600">Exam/Degree</strong><span className="text-gray-800">{edu.examDegree}</span></div>
                              <div><strong className="block text-gray-600">From Date</strong><span className="text-gray-800">{edu.fromDate}</span></div>
                              <div><strong className="block text-gray-600">Major/Group</strong><span className="text-gray-800">{edu.majorGroup}</span></div>
                              <div><strong className="block text-gray-600">To Date</strong><span className="text-gray-800">{edu.toDate}</span></div>
                              <div><strong className="block text-gray-600">ID Card No</strong><span className="text-gray-800">{edu.idCardNo}</span></div>
                              <div><strong className="block text-gray-600">Year of Passing</strong><span className="text-gray-800">{edu.yearOfPassing}</span></div>
                              <div><strong className="block text-gray-600">Result</strong><span className="text-gray-800">{edu.result}</span></div>
                              <div><strong className="block text-gray-600">Current Institute</strong><span className="text-gray-800">{edu.currentInstitute ? 'Yes' : 'No'}</span></div>
                          </div>
                      </div>
                  ))}
              </div>
            </section>

            {/* Tuition Related Information Section */}
            <section>
                <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                      <FaBookOpen />
                      <h2 className="text-lg font-semibold">Tuition Related Information</h2>
                  </div>
              </div>
                <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 space-y-3 text-sm">
                  <div><strong className="block text-gray-600 mb-1">Tutoring Method</strong><p className="text-gray-800">{tutorData.tutoringMethod}</p></div>
                  <div><strong className="block text-gray-600">Available Days</strong><span className="text-gray-800">{tutorData.availableDays?.join(', ')}</span></div>
                  <div><strong className="block text-gray-600">Time</strong><span className="text-gray-800">{tutorData.availableTime}</span></div>
                  <div><strong className="block text-gray-600">Location</strong><span className="text-gray-800">{tutorData.location}</span></div>
                  <div><strong className="block text-gray-600">Preferred Locations</strong><span className="text-gray-800">{tutorData.preferredLocations?.join(', ')}</span></div>
                  <div><strong className="block text-gray-600">Expected Salary</strong><span className="text-gray-800">{tutorData.expectedSalary} BDT</span></div>
                  <div><strong className="block text-gray-600">Preferred Classes</strong><span className="text-gray-800">{tutorData.preferredClasses?.join(', ')}</span></div>
                  <div><strong className="block text-gray-600">Preferred Subjects</strong><span className="text-gray-800">{tutorData.preferredSubjects?.join(', ')}</span></div>
                  <div><strong className="block text-gray-600">Place of Tutoring</strong><span className="text-gray-800">{tutorData.placeOfTutoring}</span></div>
                  <div><strong className="block text-gray-600">Tutoring Style</strong><span className="text-gray-800">{tutorData.tutoringStyle?.join(', ')}</span></div>
                  <div><strong className="block text-gray-600">Total Experience</strong><span className="text-gray-800">{tutorData.totalExperience}</span></div>
                </div>
            </section>

          </div>
      </div>

    </div>
  );
};

export default TutorProfile;
