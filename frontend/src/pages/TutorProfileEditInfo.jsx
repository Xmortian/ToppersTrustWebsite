import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Ensure this path is correct

// Icons
import {
  FaSave,
  FaTimes, // Not used in JSX, but kept for potential future use
  FaUpload,
  FaSpinner,
  FaInfoCircle,
  FaBookOpen,
  FaGraduationCap
} from 'react-icons/fa';

// --- HELPER COMPONENTS (defined outside TutorProfileEditInfo) ---
const InputField = ({ label, name, value, onChange, type = "text", required = false, placeholder = "", readOnly = false, focusRingColor = "focus:ring-[#6344cc]", ...props }) => (
  <div>
    <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
    <input type={type} id={name} name={name} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} readOnly={readOnly} {...props}
           className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300'}`} />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false, focusRingColor = "focus:ring-[#6344cc]", ...props }) => (
  <div>
    <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
    <select id={name} name={name} value={value} onChange={onChange} required={required} {...props}
            className={`w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 ${focusRingColor} focus:border-[#6344cc] text-sm`}>
      {options.map(optionObj => <option key={optionObj.value} value={optionObj.value}>{optionObj.label}</option>)}
    </select>
  </div>
);

const TextAreaField = ({ label, name, value, onChange, rows = 3, placeholder = "", focusRingColor = "focus:ring-[#6344cc]", ...props }) => (
  <div>
    <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <textarea id={name} name={name} value={value || ''} onChange={onChange} rows={rows} placeholder={placeholder} {...props}
              className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 ${focusRingColor} focus:border-[#6344cc] text-sm`}></textarea>
  </div>
);
// --- END OF HELPER COMPONENT DEFINITIONS ---

const howDidYouKnowOptions = [ "", "Facebook", "LinkedIn", "Friend/Colleague", "Search Engine (Google, etc.)", "Advertisement", "Who are you", "Other" ];
const genderOptions = ["", "Male", "Female"];
const curriculumOptions = ["", "Bangla Version", "English Version", "English Medium", "Madrasha", "Other"];
const placeOfTutoringOptions = ["", "Student Home", "Tutor Home", "Online"];

const initialFormData = {
  name: "", email: "", additionalNumber: "", gender: "", dateOfBirth: "", religion: "", nationalId: "",
  nationality: "", facebookProfile: "", driveLink: "",
  fathersName: "", fathersNumber: "", mothersName: "", mothersNumber: "", emergencyContact: "",
  location: "", // This will be used for "Current Address" and maps to the 'address' DB column
  education: [
    { id: 1, level: "Bachelors/Honors", institute: "", examDegree: "", majorGroup: "", idCardNo: "", result: "", curriculum: "", fromDate: "", toDate: "", yearOfPassing: "", currentInstitute: false },
    { id: 2, level: "Higher Secondary", institute: "", examDegree: "", majorGroup: "", idCardNo: "", result: "", curriculum: "", fromDate: "", toDate: "", yearOfPassing: "", currentInstitute: false },
    { id: 3, level: "Secondary", institute: "", examDegree: "", majorGroup: "", idCardNo: "", result: "", curriculum: "", fromDate: "", toDate: "", yearOfPassing: "", currentInstitute: false },
  ],
  tutoringMethod: "",
  availableDays: "", 
  availableTime: "",
  preferredLocations: "", 
  expectedSalary: "",
  preferredClasses: "",
  preferredSubjects: "",
  placeOfTutoring: "",
  tutoringStyle: "",
  totalExperience: "", 
  tutorId: "", profileImageUrl: null, howDidYouKnow: "",
};

const TutorProfileEditInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(initialFormData)));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [userId, setUserId] = useState(null);

  const primaryColorClass = "bg-[#6344cc]";
  const hoverColorClass = "hover:bg-[#5238a8]";
  const focusRingColorClass = "focus:ring-[#6344cc]";
  const sectionHeaderColorClass = "bg-[#6344cc]";
  const supabaseBucketName = 'photo'; 

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("fetchProfile called");
      setLoading(true);
      setMessage({ type: '', text: '' });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error or no user:", authError);
        setMessage({ type: 'error', text: 'Authentication required. Please log in again.' });
        setLoading(false);
        navigate('/login'); 
        return;
      }
      
      console.log("Authenticated user ID:", user.id, "User email:", user.email);
      setUserId(user.id);

      try {
        console.log("Attempting to fetch profile for user ID:", user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('tutor')
          .select(`
            id, name, phone, gender, date_of_birth, religion, national_id_number, nationality,
            facebook_profile_link, drive_link, fathers_name, fathers_contact_number,
            mothers_name, mothers_contact_number, emergency_contact_number,
            ssc_school, ssc_grade, hsc_school, hsc_grade, uni, uni_grade,
            education_details, 
            tutoring_method, available_days_text, available_time, address, 
            preferred_areas, expected_salary, preferred_classes, preferred_subjects,
            place_of_tutoring, tutoring_style, experience_years, photo, how_did_you_know, user_id
          `) 
          .eq('user_id', user.id)
          .single();

        console.log("Supabase profileData response:", profileData);
        console.log("Supabase profileError:", profileError);

        if (profileError && profileError.code !== 'PGRST116') { 
          throw profileError;
        }

        if (profileData) {
          console.log("Profile data found, populating form:", profileData);
          
          const baseEducationFormStructure = JSON.parse(JSON.stringify(initialFormData.education));
          const fetchedEduDetailsJson = Array.isArray(profileData.education_details) ? profileData.education_details : [];

          const populatedEducation = baseEducationFormStructure.map(formSlot => {
            let dbInstitute = "";
            let dbResult = "";
            let specificLevelDetails = null;

            if (formSlot.level === "Bachelors/Honors") {
              dbInstitute = profileData.uni || "";
              dbResult = profileData.uni_grade || "";
              specificLevelDetails = fetchedEduDetailsJson.find(d => d.level === "Bachelors/Honors" || d.level === "Bachelors" || d.level === "Honors");
            } else if (formSlot.level === "Higher Secondary") {
              dbInstitute = profileData.hsc_school || "";
              dbResult = profileData.hsc_grade || "";
              specificLevelDetails = fetchedEduDetailsJson.find(d => d.level === "Higher Secondary");
            } else if (formSlot.level === "Secondary") {
              dbInstitute = profileData.ssc_school || "";
              dbResult = profileData.ssc_grade || "";
              specificLevelDetails = fetchedEduDetailsJson.find(d => d.level === "Secondary");
            }
            
            return {
                ...formSlot, 
                ...(specificLevelDetails || {}), 
                institute: dbInstitute || (specificLevelDetails?.institute || formSlot.institute), 
                result: dbResult || (specificLevelDetails?.result || formSlot.result), 
                id: formSlot.id 
            };
          });

          const newFormData = {
            name: profileData.name || "",
            email: user.email || "", 
            additionalNumber: profileData.phone || "", 
            gender: profileData.gender || "",
            dateOfBirth: profileData.date_of_birth || "",
            religion: profileData.religion || "",
            nationalId: profileData.national_id_number || "",
            nationality: profileData.nationality || "",
            facebookProfile: profileData.facebook_profile_link || "",
            driveLink: profileData.drive_link || "",
            fathersName: profileData.fathers_name || "",
            fathersNumber: profileData.fathers_contact_number || "",
            mothersName: profileData.mothers_name || "",
            mothersNumber: profileData.mothers_contact_number || "",
            emergencyContact: profileData.emergency_contact_number || "",
            location: profileData.address || "", // Maps to 'address' column in DB
            education: populatedEducation, 
            tutoringMethod: profileData.tutoring_method || "",
            availableDays: profileData.available_days_text || "", 
            availableTime: profileData.available_time || "",
            preferredLocations: Array.isArray(profileData.preferred_areas) ? profileData.preferred_areas.join(', ') : (profileData.preferred_areas || ""),
            expectedSalary: profileData.expected_salary?.toString() || "",
            preferredClasses: Array.isArray(profileData.preferred_classes) ? profileData.preferred_classes.join(', ') : (profileData.preferred_classes || ""),
            preferredSubjects: Array.isArray(profileData.preferred_subjects) ? profileData.preferred_subjects.join(', ') : (profileData.preferred_subjects || ""),
            placeOfTutoring: profileData.place_of_tutoring || "",
            tutoringStyle: Array.isArray(profileData.tutoring_style) ? profileData.tutoring_style.join(', ') : (profileData.tutoring_style || ""),
            totalExperience: profileData.experience_years ? `${profileData.experience_years} years` : "",
            tutorId: profileData.id || "N/A",
            profileImageUrl: profileData.photo || null, 
            howDidYouKnow: profileData.how_did_you_know || "",
          };
          setFormData(newFormData);

          if (profileData.photo) {
            if (!profileData.photo.startsWith('http')) { 
              const { data: urlData } = supabase.storage.from(supabaseBucketName).getPublicUrl(profileData.photo); 
              setProfileImagePreview(urlData?.publicUrl || profileData.photo); 
            } else {
              setProfileImagePreview(profileData.photo); 
            }
          } else {
            setProfileImagePreview(null);
          }
        } else {
          console.log("No profile data found for this user. Initializing form with defaults and user email.");
          const defaultFormData = JSON.parse(JSON.stringify(initialFormData));
          setFormData({ 
            ...defaultFormData, 
            email: user.email, 
            tutorId: `NEW-${Date.now().toString().slice(-4)}`
          });
          setProfileImagePreview(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({ type: 'error', text: `Failed to load profile: ${error.message}` });
      } finally {
        setLoading(false);
        console.log("fetchProfile finished");
      }
    };
    fetchProfile();
  }, [navigate]); 

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setMessage({ type: '', text: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 512 * 1024) { 
        setMessage({ type: 'error', text: 'Image size should be less than 512KB.' });
        return;
      }
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
      setMessage({ type: '', text: '' });
    }
  };

  const handleEducationChange = (index, field, value) => {
    setFormData(prev => {
      const updatedEducation = prev.education.map((edu, i) => {
        if (i === index) {
          return { ...edu, [field]: value };
        }
        return edu;
      });
      return { ...prev, education: updatedEducation };
    });
    setMessage({ type: '', text: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) {
        setMessage({ type: 'error', text: 'User not identified. Cannot save.'});
        return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    console.log("Saving data for user ID:", userId, "Form Data:", formData);

    try {
      let imagePathToSave = formData.profileImageUrl; 

      if (profileImageFile) { 
        const fileExt = profileImageFile.name.split('.').pop();
        const newFileName = `${userId}/profile-${Date.now()}.${fileExt}`;

        if (formData.profileImageUrl && !formData.profileImageUrl.startsWith('http')) {
            console.log("Attempting to remove old image:", formData.profileImageUrl);
            await supabase.storage.from(supabaseBucketName).remove([formData.profileImageUrl]); 
        }

        console.log("Uploading new image:", newFileName);
        const { error: uploadError } = await supabase.storage
          .from(supabaseBucketName) 
          .upload(newFileName, profileImageFile, {
            cacheControl: '3600',
            upsert: true, 
          });
        if (uploadError) throw uploadError;
        imagePathToSave = newFileName; 
        console.log("New image uploaded, path:", imagePathToSave);
      }

      const stringToArray = (str) => str ? str.split(',').map(s => s.trim()).filter(s => s) : null;
      const experienceYears = formData.totalExperience ? (parseInt(formData.totalExperience.match(/\d+/)?.[0]) || null) : null;

      const eduArray = formData.education || [];
      const sscData = eduArray.find(edu => edu.level === "Secondary");
      const hscData = eduArray.find(edu => edu.level === "Higher Secondary");
      const uniData = eduArray.find(edu => edu.level === "Bachelors/Honors");

      const dataForSupabase = {
        user_id: userId, 
        name: formData.name,
        phone: formData.additionalNumber,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth || null,
        religion: formData.religion,
        national_id_number: formData.nationalId,
        nationality: formData.nationality,
        facebook_profile_link: formData.facebookProfile,
        drive_link: formData.driveLink,
        fathers_name: formData.fathersName,
        fathers_contact_number: formData.fathersNumber,
        mothers_name: formData.mothersName,
        mothers_contact_number: formData.mothersNumber,
        emergency_contact_number: formData.emergencyContact,
        address: formData.location, // formData.location maps to 'address' DB column
        
        ssc_school: sscData?.institute || null,
        ssc_grade: sscData?.result || null,
        hsc_school: hscData?.institute || null,
        hsc_grade: hscData?.result || null,
        uni: uniData?.institute || null,
        uni_grade: uniData?.result || null,

        education_details: formData.education.filter(edu => edu.institute && edu.level), 
        
        tutoring_method: formData.tutoringMethod,
        available_time: formData.availableTime,
        available_days_text: formData.availableDays || null, 
        preferred_areas: stringToArray(formData.preferredLocations),
        expected_salary: formData.expectedSalary ? parseFloat(formData.expectedSalary) : null,
        preferred_classes: stringToArray(formData.preferredClasses),
        preferred_subjects: stringToArray(formData.preferredSubjects),
        place_of_tutoring: formData.placeOfTutoring,
        tutoring_style: stringToArray(formData.tutoringStyle),
        experience_years: experienceYears,
        photo: imagePathToSave, 
        how_did_you_know: formData.howDidYouKnow,
      };
      
      if (formData.tutorId && formData.tutorId !== "N/A" && !String(formData.tutorId).startsWith("NEW-")) {
        dataForSupabase.id = formData.tutorId; 
      }

      Object.keys(dataForSupabase).forEach(key => {
        if (dataForSupabase[key] === "") {
          dataForSupabase[key] = null;
        }
      });

      console.log("Submitting data to Supabase for upsert:", dataForSupabase);
      
      const { data: upsertedData, error: upsertError } = await supabase
        .from('tutor')
        .upsert(dataForSupabase, { 
            onConflict: 'user_id', 
         })
        .select() 
        .single(); 

      if (upsertError) {
        console.error("Supabase upsert error:", upsertError);
        throw upsertError;
      }
      console.log("Supabase upsert successful, data:", upsertedData);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfileImageFile(null); 

      if (upsertedData) {
          setFormData(prev => ({
            ...prev, 
            profileImageUrl: upsertedData.photo,
            tutorId: upsertedData.id 
          })); 
          if (upsertedData.photo && !upsertedData.photo.startsWith('http')) {
              const { data: urlData } = supabase.storage.from(supabaseBucketName).getPublicUrl(upsertedData.photo);
              setProfileImagePreview(urlData?.publicUrl);
          } else if (upsertedData.photo) {
              setProfileImagePreview(upsertedData.photo);
          }
      }

      setTimeout(() => navigate('/tutor/profile'), 2000); 

    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage = error.message || (error.error_description || 'Unknown error');
      setMessage({ type: 'error', text: `Failed to save profile: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/tutor/profile'); 
  const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + (formData.name ? formData.name.split(' ').map(n=>n[0]).join('') : "T");

  if (loading) return <div className="flex justify-center items-center min-h-screen text-xl">Loading profile editor...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto flex flex-col items-center">
      <div className="w-full max-w-lg mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
          <div className="flex flex-col items-center mb-5 w-full">
            <label htmlFor="profilePictureInput" className="cursor-pointer group relative">
              <img src={profileImagePreview || profileImageFallback} alt="Profile Preview" onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
                   className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-gray-200 shadow-md object-cover mb-2 group-hover:opacity-70 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <FaUpload className="text-white text-2xl" />
              </div>
            </label>
            <input type="file" id="profilePictureInput" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="hidden" />
            <p className="text-xs text-gray-500 mt-2">Click image to change (Max 512KB)</p> 
            <p className="text-sm text-gray-600 mt-4">Tutor ID: {formData.tutorId || 'N/A'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="container mx-auto max-w-4xl w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
          {/* Personal Information Section */}
          <section>
            <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}><FaInfoCircle /><h2 className="text-lg font-semibold">Personal Information</h2></div>
            <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} readOnly={true} focusRingColor={focusRingColorClass} />
              <InputField label="Email" name="email_display" value={formData.email} readOnly={true} focusRingColor={focusRingColorClass} />
              <InputField label="Additional Number" name="additionalNumber" value={formData.additionalNumber} onChange={handleInputChange} type="tel" focusRingColor={focusRingColorClass} />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={genderOptions.map(o => ({label: o || '-- Select --', value: o}))} required={true} focusRingColor={focusRingColorClass} />
              <InputField label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} type="date" focusRingColor={focusRingColorClass} />
              <InputField label="Religion" name="religion" value={formData.religion} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
              <InputField label="National ID" name="nationalId" value={formData.nationalId} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
              <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
              
              {/* Moved and Relabeled Address Field */}
              <div className="sm:col-span-2">
                <InputField label="Current Address" name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter your full current address" focusRingColor={focusRingColorClass} />
              </div>

              <div className="sm:col-span-1">
                <InputField label="Facebook Profile Link" name="facebookProfile" value={formData.facebookProfile} onChange={handleInputChange} type="url" placeholder="https://facebook.com/..." focusRingColor={focusRingColorClass} />
                <p className="text-xs text-gray-500 mt-1">Optional. Helps with verification.</p>
              </div>

              <div className="sm:col-span-1">
                  <InputField label="Google Drive Link (Documents)" name="driveLink" value={formData.driveLink} onChange={handleInputChange} type="url" placeholder="https://drive.google.com/..." focusRingColor={focusRingColorClass} />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload NID, birth certificate, Student ID, etc., to Google Drive and share the link here (ensure link has viewer access). Optional, but helps with verification.
                  </p>
              </div>
              
              <InputField label="Father’s Name" name="fathersName" value={formData.fathersName} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
              <InputField label="Father’s Number" name="fathersNumber" value={formData.fathersNumber} onChange={handleInputChange} type="tel" focusRingColor={focusRingColorClass} />
              <InputField label="Mother’s Name" name="mothersName" value={formData.mothersName} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
              <InputField label="Mother’s Number" name="mothersNumber" value={formData.mothersNumber} onChange={handleInputChange} type="tel" focusRingColor={focusRingColorClass} />
              <div className="sm:col-span-2"><InputField label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} type="tel" focusRingColor={focusRingColorClass} /></div>
            </div>
          </section>

          {/* Educational Information Section */}
          <section>
            <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
              <div className="flex items-center gap-2"><FaGraduationCap /><h2 className="text-lg font-semibold">Educational Information</h2></div>
            </div>
            <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 space-y-6 text-sm">
              {formData.education?.map((edu, index) => {
                const isSSC = edu.level === "Secondary";
                const isHSC = edu.level === "Higher Secondary";
                const isSimplifiedView = isSSC || isHSC; 

                return (
                  <div key={edu.id || `edu-${index}`} className={`p-4 border rounded-lg border-gray-300 shadow-sm bg-gray-50/50`}>
                    <h4 className="font-semibold text-base text-gray-800 mb-3">{edu.level}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <InputField label="Institute" name="institute" value={edu.institute} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} focusRingColor={focusRingColorClass} />
                      <InputField label="Result/Grade" name="result" value={edu.result} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} focusRingColor={focusRingColorClass} />

                      {!isSimplifiedView && (
                        <>
                          <SelectField label="Curriculum" name="curriculum" value={edu.curriculum} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} options={curriculumOptions.map(o => ({label: o || '-- Select --', value: o}))} focusRingColor={focusRingColorClass} />
                          <InputField label="Exam/Degree" name="examDegree" value={edu.examDegree} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} focusRingColor={focusRingColorClass} />
                          <InputField label="From Date" name="fromDate" value={edu.fromDate} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} type="date" focusRingColor={focusRingColorClass} />
                          <InputField label="Major/Group" name="majorGroup" value={edu.majorGroup} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} focusRingColor={focusRingColorClass} />
                          <InputField label="To Date" name="toDate" value={edu.toDate} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} type="date" focusRingColor={focusRingColorClass} />
                          <InputField label="ID Card No (If applicable)" name="idCardNo" value={edu.idCardNo} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} focusRingColor={focusRingColorClass} />
                          <InputField label="Year of Passing" name="yearOfPassing" value={edu.yearOfPassing} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} focusRingColor={focusRingColorClass} />
                          <div className="flex items-center mt-2 sm:col-span-2">
                            <input type="checkbox" id={`edu_current_${index}`} name="currentInstitute" checked={!!edu.currentInstitute} onChange={(e) => handleEducationChange(index, "currentInstitute", e.target.checked)} className={`h-4 w-4 rounded text-[#6344cc] focus:ring-1 ${focusRingColorClass}`} />
                            <label htmlFor={`edu_current_${index}`} className="ml-2 block text-xs font-medium text-gray-600">Currently Studying Here</label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tuition Related Information Section */}
          <section>
            <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                <div className="flex items-center gap-2"><FaBookOpen /><h2 className="text-lg font-semibold">Tuition Related Information</h2></div>
            </div>
            <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="sm:col-span-2"><TextAreaField label="Tutoring Method / Approach" name="tutoringMethod" value={formData.tutoringMethod} onChange={handleInputChange} placeholder="Describe your teaching style..." focusRingColor={focusRingColorClass}/></div>
                <InputField label="Available Days (comma-separated)" name="availableDays" value={formData.availableDays} onChange={handleInputChange} placeholder="e.g., Sat, Mon, Wed" focusRingColor={focusRingColorClass}/>
                <InputField label="Available Time" name="availableTime" value={formData.availableTime} onChange={handleInputChange} placeholder="e.g., 4 PM - 7 PM" focusRingColor={focusRingColorClass}/>
                {/* <InputField label="Your Location (Area)" name="location" value={formData.location} onChange={handleInputChange} focusRingColor={focusRingColorClass} />  MOVED to Personal Info as "Current Address" */}
                <InputField label="Preferred Locations (comma-separated)" name="preferredLocations" value={formData.preferredLocations} onChange={handleInputChange} placeholder="e.g., Banani, Gulshan, Dhanmondi" focusRingColor={focusRingColorClass}/>
                <InputField label="Expected Salary (BDT)" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange} type="number" placeholder="e.g., 10000" min="0" focusRingColor={focusRingColorClass}/>
                <InputField label="Preferred Classes (comma-separated)" name="preferredClasses" value={formData.preferredClasses} onChange={handleInputChange} placeholder="e.g., Class 8, Class 9, O-Level" focusRingColor={focusRingColorClass}/>
                <div className="sm:col-span-2"><InputField label="Preferred Subjects (comma-separated)" name="preferredSubjects" value={formData.preferredSubjects} onChange={handleInputChange} placeholder="e.g., Physics, Math, English" focusRingColor={focusRingColorClass}/></div>
                <SelectField label="Place of Tutoring" name="placeOfTutoring" value={formData.placeOfTutoring} onChange={handleInputChange} options={placeOfTutoringOptions.map(o => ({label: o || '-- Select --', value: o}))} focusRingColor={focusRingColorClass} />
                <InputField label="Tutoring Style (comma-separated)" name="tutoringStyle" value={formData.tutoringStyle} onChange={handleInputChange} placeholder="e.g., One to One, Group" focusRingColor={focusRingColorClass}/>
                <InputField label="Total Experience (e.g., 5 years)" name="totalExperience" value={formData.totalExperience} onChange={handleInputChange} placeholder="e.g., 5 years" focusRingColor={focusRingColorClass}/>
            </div>
          </section>

          {/* How did you know about us? Section */}
          <section>
            <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}><FaInfoCircle /><h2 className="text-lg font-semibold">How did you know about us?</h2></div>
            <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
              <SelectField label="How did you find us?" name="howDidYouKnow" value={formData.howDidYouKnow} onChange={handleInputChange} options={howDidYouKnowOptions.map(opt => ({label: opt || "-- Select an Option --", value: opt}))} focusRingColor={focusRingColorClass} />
            </div>
          </section>

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
            {message.text && (<span className={`text-sm mr-auto ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</span>)}
            <button type="button" onClick={handleCancel} disabled={saving} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-50"> Cancel </button>
            <button type="submit" disabled={saving} className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white ${primaryColorClass} rounded-lg ${hoverColorClass} focus:outline-none focus:ring-2 ${focusRingColorClass} focus:ring-offset-1 disabled:opacity-50`}>
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TutorProfileEditInfo;
