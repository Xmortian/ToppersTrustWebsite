import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import supabase client

// Icons
import { FaSave, FaTimes, FaUpload, FaSpinner, FaInfoCircle, FaBookOpen, FaGraduationCap } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

// Options for dropdowns
const howDidYouKnowOptions = [ "", "Facebook", "LinkedIn", "Friend/Colleague", "Search Engine (Google, etc.)", "Advertisement", "Who are you", "Other" ]; // "Who are you" is present
const genderOptions = ["", "Male", "Female"]; // Updated: Only Male/Female
const curriculumOptions = ["", "Bangla Version", "English Version", "English Medium", "Madrasha", "Other"];
const placeOfTutoringOptions = ["", "Student Home", "Tutor Home", "Online"];
// Note: Tutoring Style, Available Days etc. are now text inputs, so these arrays are not directly used for selects anymore

// Initial state structure - Array fields changed to string for text input
const initialFormData = {
  name: "", email: "", additionalNumber: "", gender: "", dateOfBirth: "", religion: "", nationalId: "",
  nationality: "", facebookProfile: "", linkedinProfile: "", fathersName: "", fathersNumber: "",
  mothersName: "", mothersNumber: "", emergencyContact: "",
  education: [ // Still an array, assuming you might want to edit these properly later
    { id: null, level: "Bachelors/Honors", institute: "", examDegree: "", majorGroup: "", idCardNo: "", result: "", curriculum: "", fromDate: "", toDate: "", yearOfPassing: "", currentInstitute: false },
    { id: null, level: "Higher Secondary", institute: "", examDegree: "", majorGroup: "", idCardNo: "", result: "", curriculum: "", fromDate: "", toDate: "", yearOfPassing: "", currentInstitute: false },
    { id: null, level: "Secondary", institute: "", examDegree: "", majorGroup: "", idCardNo: "", result: "", curriculum: "", fromDate: "", toDate: "", yearOfPassing: "", currentInstitute: false },
  ],
  tutoringMethod: "",
  availableDays: "", // Changed to string
  availableTime: "",
  location: "",
  preferredLocations: "", // Changed to string
  expectedSalary: "",
  preferredClasses: "", // Changed to string
  preferredSubjects: "", // Changed to string
  placeOfTutoring: "",
  tutoringStyle: "", // Changed to string
  totalExperience: "",
  tutorId: "", profileImageUrl: null, howDidYouKnow: "",
};


const TutorProfileEditInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Consistent purple theme
  const primaryColor = "bg-[#6344cc]";
  const hoverColor = "hover:bg-[#5238a8]";
  const focusRingColor = "focus:ring-[#6344cc]";
  const sectionHeaderColor = "bg-[#6344cc]";

  // --- Fetch existing profile data ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage({ type: '', text: '' });
      // --- TODO: Replace with actual Supabase fetching ---
      // Fetch user, then fetch tutor profile data.
      // IMPORTANT: When fetching array data (like preferred_subjects),
      // you might need to convert it to a comma-separated string here
      // to populate the text input fields correctly.
      // Example: `preferredSubjects: profileData.preferred_subjects?.join(', ') || ""`
      // --- End of Supabase fetching block ---

      // Using placeholder data for now:
      await new Promise(resolve => setTimeout(resolve, 500));
       const placeholderData = {
            name: "Nafisa Nahar", email: "nafisa45@gmail.com", additionalNumber: "01553984931", gender: "Female", dateOfBirth: "2001-10-20", religion: "Islam", nationalId: "011879650",
            nationality: "Bangladeshi", facebookProfile: "", linkedinProfile: "", fathersName: "Kazi Sawkat", fathersNumber: "017685990321",
            mothersName: "Tania Afrooz", mothersNumber: "01956748392", emergencyContact: "01778585432",
            education: [ // Keep education structure for potential future enhancement
                { id: 1, level: "Bachelors/Honors", institute: "BRAC University", examDegree: "B.Sc", majorGroup: "CSE", idCardNo: "22201827", result: "CGPA- 3.74", curriculum: "English Version", fromDate: "2022-09-10", toDate: "2026-12-31", yearOfPassing: "2026", currentInstitute: true },
                { id: 2, level: "Higher Secondary", institute: "Dhaka College", examDegree: "HSC", majorGroup: "Science", idCardNo: "102041", result: "GPA 5.0", curriculum: "Bangla Version", fromDate: "2019-07-15", toDate: "2022-02-13", yearOfPassing: "2022", currentInstitute: false },
                { id: 3, level: "Secondary", institute: "Ideal School And College", examDegree: "SSC", majorGroup: "Science", idCardNo: "102041", result: "GPA 5.0", curriculum: "Bangla Version", fromDate: "2017-01-10", toDate: "2019-05-06", yearOfPassing: "2019", currentInstitute: false },
            ],
            // Convert arrays from placeholder to strings for text inputs
            tutoringMethod: "I focus not only on academic excellence, but also on developing essential skills...",
            availableDays: "Saturday, Sunday, Tuesday, Thursday", // Now a string
            availableTime: "3.30 pm - 8 pm",
            location: "M-62/1, Merul Badda, Dhaka-1212",
            preferredLocations: "Merul Badda, Gulshan, Banasree", // Now a string
            expectedSalary: "10000",
            preferredClasses: "Class 8, Class 9, Class 10", // Now a string
            preferredSubjects: "Physics, Chemistry, Math", // Now a string
            placeOfTutoring: "Student Home",
            tutoringStyle: "One to One", // Now a string
            totalExperience: "15 years",
            tutorId: "TUT123", profileImageUrl: null, howDidYouKnow: "Facebook", profileCompletion: 75,
        };
      setFormData(prev => ({ ...prev, ...placeholderData }));
      setProfileImagePreview(placeholderData.profileImageUrl);
      setLoading(false);
    };
    fetchProfile();
  }, [/* navigate */]);

  // Handle regular input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  // Handle file input change for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setProfileImagePreview(reader.result); };
      reader.readAsDataURL(file);
      setMessage({ type: '', text: '' });
    }
  };

   // Handle changes within the education array (Example for first entry)
   const handleEducationChange = (index, field, value) => {
       setFormData(prev => {
           const updatedEducation = prev.education.map((edu, i) => {
               if (i === index) {
                   if (field === 'currentInstitute') {
                       return { ...edu, [field]: !edu.currentInstitute }; // Toggle boolean
                   }
                   return { ...edu, [field]: value };
               }
               return edu;
           });
           // Ensure we don't lose other education entries if they exist
           while (updatedEducation.length < prev.education.length) {
               updatedEducation.push(prev.education[updatedEducation.length]);
           }
           return { ...prev, education: updatedEducation };
       });
       setMessage({ type: '', text: '' });
   };

  // Handle saving changes
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // --- TODO: Implement Supabase Update Logic ---
    // 1. Upload image if profileImageFile exists
    // 2. Prepare 'updates' object mapping formData keys to DB columns
    //    - For fields like 'preferredLocations', 'preferredSubjects' etc.,
    //      you might want to split the string by comma (or another delimiter)
    //      and save it as a text array (text[]) in Supabase if your DB is set up that way.
    //      Example: preferred_locations: formData.preferredLocations.split(',').map(s => s.trim()).filter(s => s)
    // 3. Handle education table updates (more complex)
    // 4. Call supabase update function

    // Placeholder success
    console.log("Saving tutor data:", formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessage({ type: 'success', text: 'Profile updated successfully! (Placeholder)' });
    setProfileImageFile(null);
    setTimeout(() => navigate('/tutor/profile'), 2000);

    setSaving(false);
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/tutor/profile');
  };

  // Fallback image generator
  const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + (formData.name ? formData.name.split(' ').map(n=>n[0]).join('') : "T");

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading profile editor...</div>;
  }

  // Helper for input fields
  const InputField = ({ label, name, value, onChange, type = "text", required = false, placeholder = "", readOnly = false }) => (
      <div>
          <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
          <input
              type={type} id={name} name={name} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} readOnly={readOnly}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300'}`}
          />
      </div>
  );

  // Helper for select fields
  const SelectField = ({ label, name, value, onChange, options, required = false }) => (
      <div>
          <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
          <select
              id={name} name={name} value={value} onChange={onChange} required={required}
              className={`w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 ${focusRingColor} focus:border-[#6344cc] text-sm`}
          >
              {options.map(option => <option key={option} value={option}>{option || "-- Select --"}</option>)}
          </select>
      </div>
  );

  // Helper for textarea
  const TextAreaField = ({ label, name, value, onChange, rows = 3, placeholder = "" }) => (
       <div>
           <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
           <textarea
               id={name} name={name} value={value || ''} onChange={onChange} rows={rows} placeholder={placeholder}
               className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 ${focusRingColor} focus:border-[#6344cc] text-sm`}
           ></textarea>
       </div>
  );


  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto flex flex-col items-center">

      {/* Centered Top Box */}
      <div className="w-full max-w-lg mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            {/* Profile Picture Upload Section */}
            <div className="flex flex-col items-center mb-5 w-full">
                 <label htmlFor="profilePictureInput" className="cursor-pointer group relative">
                    <img src={profileImagePreview || profileImageFallback} alt="Profile Preview" onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
                        className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-gray-200 shadow-md object-cover mb-2 group-hover:opacity-70 transition-opacity"
                    />
                     <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"> <FaUpload className="text-white text-2xl" /> </div>
                 </label>
                 <input type="file" id="profilePictureInput" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="hidden" />
                 <p className="text-xs text-gray-500 mt-2">Click image to change</p>
                 <p className="text-sm text-gray-600 mt-4">Tutor ID: {formData.tutorId || 'N/A'}</p>
            </div>
          </div>
      </div>

      {/* Container for the main form sections */}
      <form onSubmit={handleSave} className="container mx-auto max-w-4xl w-full">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">

            {/* Personal Information Section */}
            <section>
              <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}><FaInfoCircle /><h2 className="text-lg font-semibold">Personal Information</h2></div>
              <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} readOnly={true} />
                  <InputField label="Email" name="email_display" value={formData.email} readOnly={true} />
                  <InputField label="Additional Number" name="additionalNumber" value={formData.additionalNumber} onChange={handleInputChange} type="tel" />
                  {/* Updated Gender Select */}
                  <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={genderOptions} required={true} />
                  <InputField label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} type="date" />
                  <InputField label="Religion" name="religion" value={formData.religion} onChange={handleInputChange} />
                  <InputField label="National ID" name="nationalId" value={formData.nationalId} onChange={handleInputChange} />
                  <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} />
                  <InputField label="Facebook Profile Link" name="facebookProfile" value={formData.facebookProfile} onChange={handleInputChange} type="url" placeholder="https://facebook.com/..." />
                  <InputField label="LinkedIn Profile Link" name="linkedinProfile" value={formData.linkedinProfile} onChange={handleInputChange} type="url" placeholder="https://linkedin.com/in/..." />
                  <InputField label="Father’s Name" name="fathersName" value={formData.fathersName} onChange={handleInputChange} />
                  <InputField label="Father’s Number" name="fathersNumber" value={formData.fathersNumber} onChange={handleInputChange} type="tel" />
                  <InputField label="Mother’s Name" name="mothersName" value={formData.mothersName} onChange={handleInputChange} />
                  <InputField label="Mother’s Number" name="mothersNumber" value={formData.mothersNumber} onChange={handleInputChange} type="tel" />
                  <div className="sm:col-span-2"><InputField label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} type="tel" /></div>
              </div>
            </section>

            {/* Educational Information Section */}
            <section>
                <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2"><FaGraduationCap /><h2 className="text-lg font-semibold">Educational Information</h2></div>
                  {/* TODO: Add button to add new education entry */}
              </div>
              <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 space-y-4 text-sm">
                  {/* Only editing the first entry as an example */}
                  {formData.education?.slice(0, 1).map((edu, index) => (
                      <div key={index} className={`p-3 border rounded border-gray-200`}>
                          <h4 className="font-semibold text-base text-gray-800 mb-2">{edu.level}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                              <InputField label="Institute" name="institute" value={edu.institute} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} />
                              <SelectField label="Curriculum" name="curriculum" value={edu.curriculum} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} options={curriculumOptions} />
                              <InputField label="Exam/Degree" name="examDegree" value={edu.examDegree} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} />
                              <InputField label="From Date" name="fromDate" value={edu.fromDate} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} type="date" />
                              <InputField label="Major/Group" name="majorGroup" value={edu.majorGroup} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} />
                              <InputField label="To Date" name="toDate" value={edu.toDate} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} type="date" />
                              <InputField label="ID Card No" name="idCardNo" value={edu.idCardNo} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} />
                              <InputField label="Year of Passing" name="yearOfPassing" value={edu.yearOfPassing} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} />
                              <InputField label="Result" name="result" value={edu.result} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} />
                              <div className="flex items-center mt-2">
                                <input type="checkbox" id={`edu_current_${index}`} name="currentInstitute" checked={!!edu.currentInstitute} onChange={(e) => handleEducationChange(index, e.target.name, e.target.checked)} className={`h-4 w-4 rounded text-[#6344cc] focus:ring-1 ${focusRingColor}`} />
                                <label htmlFor={`edu_current_${index}`} className="ml-2 block text-xs font-medium text-gray-600">Currently Studying Here</label>
                              </div>
                          </div>
                          {/* TODO: Add button to remove this education entry */}
                      </div>
                  ))}
                   {/* TODO: Add logic/UI to display/edit other education entries */}
              </div>
            </section>

            {/* Tuition Related Information Section - All fields are now text inputs or selects */}
            <section>
                <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2"><FaBookOpen /><h2 className="text-lg font-semibold">Tuition Related Information</h2></div>
              </div>
                <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div className="sm:col-span-2"><TextAreaField label="Tutoring Method / Approach" name="tutoringMethod" value={formData.tutoringMethod} onChange={handleInputChange} placeholder="Describe your teaching style..."/></div>
                  <InputField label="Available Days" name="availableDays" value={formData.availableDays} onChange={handleInputChange} placeholder="e.g., Sat, Mon, Wed"/>
                  <InputField label="Available Time" name="availableTime" value={formData.availableTime} onChange={handleInputChange} placeholder="e.g., 4 PM - 7 PM"/>
                  <InputField label="Your Location (Area)" name="location" value={formData.location} onChange={handleInputChange} />
                  <InputField label="Preferred Locations" name="preferredLocations" value={formData.preferredLocations} onChange={handleInputChange} placeholder="e.g., Banani, Gulshan, Dhanmondi"/>
                  <InputField label="Expected Salary (BDT)" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange} type="number" placeholder="e.g., 10000"/>
                  <InputField label="Preferred Classes" name="preferredClasses" value={formData.preferredClasses} onChange={handleInputChange} placeholder="e.g., Class 8, Class 9, O-Level"/>
                  <div className="sm:col-span-2"><InputField label="Preferred Subjects" name="preferredSubjects" value={formData.preferredSubjects} onChange={handleInputChange} placeholder="e.g., Physics, Math, English"/></div>
                  <SelectField label="Place of Tutoring" name="placeOfTutoring" value={formData.placeOfTutoring} onChange={handleInputChange} options={placeOfTutoringOptions} />
                  <InputField label="Tutoring Style" name="tutoringStyle" value={formData.tutoringStyle} onChange={handleInputChange} placeholder="e.g., One to One, Group"/>
                  <InputField label="Total Experience" name="totalExperience" value={formData.totalExperience} onChange={handleInputChange} placeholder="e.g., 5 years"/>
                </div>
            </section>

             {/* How did you know about us? Section */}
             <section>
                 <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}><FaInfoCircle /><h2 className="text-lg font-semibold">How did you know about us?</h2></div>
                 <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
                    <label htmlFor="howDidYouKnow" className="sr-only">How did you know about us?</label>
                    <select id="howDidYouKnow" name="howDidYouKnow" value={formData.howDidYouKnow} onChange={handleInputChange} className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`}>
                        {howDidYouKnowOptions.map(option => <option key={option} value={option}>{option || "-- Select an Option --"}</option>)}
                    </select>
                </div>
              </section>

            {/* Save/Cancel Buttons */}
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                {message.text && (<span className={`text-sm mr-auto ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</span>)}
                <button type="button" onClick={handleCancel} disabled={saving} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-50"> Cancel </button>
                <button type="submit" disabled={saving} className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white ${primaryColor} rounded-lg ${hoverColor} focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-1 disabled:opacity-50`}>
                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

          </div>
      </form> {/* End of Form */}
    </div>
  );
};

export default TutorProfileEditInfo;
