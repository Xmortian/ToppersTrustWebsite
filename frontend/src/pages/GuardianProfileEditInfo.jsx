import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { supabase } from '../supabase.js'; // Import your Supabase client
import { FaSave, FaTimes, FaUpload, FaSpinner, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';


// --- HELPER COMPONENTS (defined outside GuardianProfileEditInfo) ---
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
    <select id={name} name={name} value={value || ''} onChange={onChange} required={required} {...props}
            className={`w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 ${focusRingColor} focus:border-[#6344cc] text-sm`}>
      {options.map((optionObj, index) => <option key={optionObj.value || `opt-${index}`} value={optionObj.value}>{optionObj.label}</option>)}
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


const howDidYouKnowOptions = [
    {label: "-- Select an Option --", value: ""},
    {label: "Facebook", value: "Facebook"},
    {label: "LinkedIn", value: "LinkedIn"},
    {label: "Friend/Colleague", value: "Friend/Colleague"},
    {label: "Search Engine (Google, etc.)", value: "Search Engine (Google, etc.)"},
    {label: "Advertisement", value: "Advertisement"},
    {label: "Who are you?", value: "Who are you?"},
    {label: "Other", value: "Other"}
];
const genderOptions = [ 
    {label: "-- Select Student Gender --", value: ""}, 
    {label: "Male", value: "Male"}, 
    {label: "Female", value: "Female"}
];


const initialFormData = {
  name: "",
  contactNumber: "",
  email: "",
  gender: "", 
  facebookProfile: "",
  city: "",
  address: "",
  relationWithStudent: "",
  guardianId: "",
  profileImageUrl: null, // This will store the path from DB or null
  howDidYouKnow: "",
  driveLink: "", 
};

const calculateProfileCompletion = (data) => {
  let completedFields = 0;
  const totalFieldsToConsider = 10; 

  if (data.name && data.name !== "Loading...") completedFields++;
  if (data.contactNumber && data.contactNumber !== "...") completedFields++;
  if (data.email && data.email !== "...") completedFields++;
  if (data.gender) completedFields++;
  if (data.city) completedFields++;
  if (data.address) completedFields++;
  if (data.relationWithStudent) completedFields++;
  if (data.profileImageUrl) completedFields++; 
  if (data.driveLink) completedFields++;
  if (data.howDidYouKnow) completedFields++;
  
  return Math.min(100, Math.round((completedFields / totalFieldsToConsider) * 100));
};


const parseArrayString = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    let sanitizedString = value.trim();
    if (sanitizedString.startsWith('{') && sanitizedString.endsWith('}')) {
      sanitizedString = sanitizedString.slice(1, -1);
    }
    const arr = sanitizedString.split(',').map(item => item.trim()).filter(item => item !== "");
    if (arr.length === 1 && arr[0] === "") return null; // Return null if only empty string after split
    return arr.length > 0 ? arr : null; // Return null for empty arrays
  }
  return null; 
};

const GuardianProfileEditInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormData)));
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

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage({ type: '', text: '' });
      console.log("GUARDIAN EDIT: fetchProfile called");

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("GUARDIAN EDIT: Auth error or no user:", authError);
        setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
        setLoading(false);
        navigate('/login');
        return;
      }
      
      console.log("GUARDIAN EDIT: Authenticated user ID:", user.id, "User email:", user.email);
      setUserId(user.id);

      try {
        console.log("GUARDIAN EDIT: Attempting to fetch profile for user ID:", user.id);
        const { data: profileData, error: profileFetchError } = await supabase
          .from('guardian') 
          .select(`
            id, name, phone, email, gender, facebook_profile_link, 
            city, address, relation_with_student, photo,
            how_did_you_know, drive_link 
          `) 
          .eq('user_id', user.id)
          .single();

        console.log("GUARDIAN EDIT: Supabase raw profileData response:", profileData);
        console.log("GUARDIAN EDIT: Supabase profileError:", profileFetchError);

        if (profileFetchError && profileFetchError.code !== 'PGRST116') { 
          console.error("GUARDIAN EDIT: Supabase error (not PGRST116):", profileFetchError);
          throw profileFetchError;
        }
        
        const baseFormForDefaults = JSON.parse(JSON.stringify(initialFormData));

        if (profileData) {
          console.log("GUARDIAN EDIT: Profile data found, populating form.");
          
          const newFormData = {
            ...baseFormForDefaults,
            name: profileData.name || "",
            contactNumber: profileData.phone || "",
            email: profileData.email || user.email || "",
            gender: profileData.gender || "", 
            facebookProfile: profileData.facebook_profile_link || "",
            city: profileData.city || "",
            address: profileData.address || "",
            relationWithStudent: profileData.relation_with_student || "",
            guardianId: profileData.id?.toString() || "",
            profileImageUrl: profileData.photo || null, // This stores the path from DB
            howDidYouKnow: profileData.how_did_you_know || "",
            driveLink: profileData.drive_link || "",
          };
          setFormData(newFormData);

          if (profileData.photo) {
            if (!profileData.photo.startsWith('http')) { 
                const { data: urlData } = supabase.storage.from('photo').getPublicUrl(profileData.photo);
                console.log("GUARDIAN EDIT: Fetched image public URL for path:", urlData?.publicUrl);
                setProfileImagePreview(urlData?.publicUrl || profileData.photo); 
            } else { 
                setProfileImagePreview(profileData.photo); 
            }
          } else {
            setProfileImagePreview(null);
          }
        } else {
          console.log("GUARDIAN EDIT: No profile data returned from Supabase. Initializing form with defaults and user email.");
          setFormData({ ...baseFormForDefaults, email: user.email, guardianId: "" }); 
          setProfileImagePreview(null);
        }
      } catch (error) {
        console.error("GUARDIAN EDIT: Error during fetchProfile try block:", error);
        setMessage({ type: 'error', text: `Failed to load profile: ${error.message}` });
      } finally {
        setLoading(false);
        console.log("GUARDIAN EDIT: fetchProfile finished");
      }
    };
    fetchProfile();
  }, [navigate]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 0.5 * 1024 * 1024) { 
        setMessage({ type: 'error', text: 'Image size should be less than 512KB.' });
        setProfileImageFile(null); 
        e.target.value = null; 
        return;
      }
      setProfileImageFile(file); 
      setProfileImagePreview(URL.createObjectURL(file)); 
      setMessage({ type: '', text: '' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) {
        setMessage({ type: 'error', text: 'User not identified. Cannot save.'});
        return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    // This holds the path of the image to be saved in the DB.
    // It starts as the existing image path (or null if no image).
    // If a new image is uploaded, this will be updated to the new image's path.
    let dbImagePath = formData.profileImageUrl; 

    try {
      if (profileImageFile) { 
        const fileExt = profileImageFile.name.split('.').pop();
        const newFileName = `${userId}/guardian-profile-${Date.now()}.${fileExt}`;
        
        // If there was an old image (stored as a path, not a full URL), attempt to remove it.
        if (formData.profileImageUrl && !formData.profileImageUrl.startsWith('http')) {
            console.log("GUARDIAN EDIT: Attempting to remove old image from storage:", formData.profileImageUrl);
            await supabase.storage.from('photo').remove([formData.profileImageUrl]);
        }

        console.log("GUARDIAN EDIT: Uploading new image to 'photo' bucket as:", newFileName);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photo') 
          .upload(newFileName, profileImageFile, {
            cacheControl: '3600',
            upsert: true, 
          });

        if (uploadError) {
            console.error("GUARDIAN EDIT: Supabase storage upload error:", uploadError);
            if (uploadError.message.toLowerCase().includes("bucket not found")) {
                throw new Error("Storage bucket 'photo' not found. Please ensure it exists in your Supabase project.");
            }
            throw uploadError; 
        }
        dbImagePath = uploadData.path; // Update to the new path for DB saving
        console.log("GUARDIAN EDIT: New image uploaded, path for DB:", dbImagePath);
      }

      const updates = {
        name: formData.name || null,
        phone: formData.contactNumber || null,
        gender: formData.gender || null, 
        facebook_profile_link: formData.facebookProfile || null,
        city: formData.city || null,
        address: formData.address || null,
        relation_with_student: formData.relationWithStudent || null,
        photo: dbImagePath, // Use the determined image path (new or existing)
        how_did_you_know: formData.howDidYouKnow || null,
        drive_link: formData.driveLink || null,
      };
      
      // Remove fields that shouldn't be directly updated or are identifiers
      delete updates.user_id; 
      delete updates.id; 
      delete updates.email;

      console.log("GUARDIAN EDIT: Final 'updates' object being sent:", JSON.stringify(updates, null, 2));
      console.log("GUARDIAN EDIT: Current auth.uid() for RLS check should be:", supabase.auth.session()?.user?.id || "No session/user");

      const { data: updatedData, error: updateError } = await supabase
        .from('guardian')
        .update(updates)
        .eq('user_id', userId) 
        .select() 
        .single(); 

      if (updateError) {
        console.error("GUARDIAN EDIT: Supabase DB update error:", updateError);
        throw updateError; // This will be caught by the outer catch
      }
      console.log("GUARDIAN EDIT: Supabase DB update successful, updatedData:", updatedData);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfileImageFile(null); // Clear the file input state

      // After successful save, update formData and preview with the definitive data from DB
      if (updatedData) {
          setFormData(prev => ({...prev, profileImageUrl: updatedData.photo})); // Ensure profileImageUrl reflects the saved path
          if (updatedData.photo && !updatedData.photo.startsWith('http')) {
              const { data: urlData } = supabase.storage.from('photo').getPublicUrl(updatedData.photo);
              setProfileImagePreview(urlData?.publicUrl);
          } else if (updatedData.photo) { 
              setProfileImagePreview(updatedData.photo);
          } else {
              setProfileImagePreview(null); 
          }
      }
      setTimeout(() => navigate('/guardian/profile'), 2000);

    } catch (error) {
      console.error("GUARDIAN EDIT: Error in handleSave:", error);
      setMessage({ type: 'error', text: `Failed to save profile: ${error.message || 'Unknown error'}` });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => navigate('/guardian/profile');
  // Define profileImageFallback inside the component so it can access formData
  const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + 
    (formData.name && formData.name !== "Loading..." ? formData.name.split(' ').map(n=>n[0]).join('') : "G");

  if (loading) return <div className="flex justify-center items-center min-h-screen text-xl">Loading profile editor...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto flex justify-center items-start">
      <div className="container mx-auto max-w-6xl w-full">
        <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col items-center">
              <div className="flex flex-col items-center mb-6 w-full">
                <label htmlFor="profilePictureInput" className="cursor-pointer group relative">
                  <img
                    src={profileImagePreview || profileImageFallback}
                    alt="Profile Preview"
                    onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-4 border-gray-200 shadow-md object-cover mb-2 group-hover:opacity-70 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaUpload className="text-white text-2xl" />
                  </div>
                </label>
                <input
                  type="file"
                  id="profilePictureInput"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">Click image to change (Max 512KB)</p>
                <p className="text-sm text-gray-600 mt-4">Guardian ID: {formData.guardianId || 'N/A'}</p>
              </div>

              <div className="w-full space-y-3 text-sm text-gray-700 border-t border-gray-200 pt-4 mt-auto">
                <h3 className="text-sm font-semibold text-gray-500 text-center mb-2">Contact Info</h3>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <FiMail className="text-gray-500 flex-shrink-0" />
                  <span className="truncate" title={formData.email}>{formData.email}</span>
                  <span className="text-xs text-gray-400 ml-auto">(Cannot change)</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <FiPhone className="text-gray-500 flex-shrink-0" />
                  <span>{formData.contactNumber}</span>
                </div>
                <div className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                  <FiMapPin className="text-gray-500 mt-1 flex-shrink-0" />
                  <span className="break-words">{formData.address}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="w-full lg:flex-1">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
              <section>
                <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                  <FaInfoCircle />
                  <h2 className="text-lg font-semibold">Edit Personal Information</h2>
                </div>
                <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} required focusRingColor={focusRingColorClass} />
                  <InputField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} type="tel" required focusRingColor={focusRingColorClass} />
                  <SelectField label="Student Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={genderOptions} focusRingColor={focusRingColorClass} />
                  
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
                  <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
                  <InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
                  <div className="sm:col-span-2">
                    <InputField label="Relation with Student" name="relationWithStudent" value={formData.relationWithStudent} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
                  </div>
                </div>
              </section>

              <section>
                   <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                     <FaInfoCircle />
                     <h2 className="text-lg font-semibold">How did you know about us?</h2>
                 </div>
                   <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
                     <SelectField
                        label="How did you find us?"
                        name="howDidYouKnow"
                        value={formData.howDidYouKnow}
                        onChange={handleInputChange}
                        options={howDidYouKnowOptions}
                        focusRingColor={focusRingColorClass}
                     />
                 </div>
              </section>

              <div className="flex justify-end gap-4 mt-4 border-t pt-6 border-gray-200">
                {message.text && (
                  <span className={`text-sm mr-auto ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</span>
                )}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white ${primaryColorClass} rounded-lg ${hoverColorClass} focus:outline-none focus:ring-2 ${focusRingColorClass} focus:ring-offset-1 disabled:opacity-50`}
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </main>
        </form>
      </div>
    </div>
  );
};

export default GuardianProfileEditInfo;
