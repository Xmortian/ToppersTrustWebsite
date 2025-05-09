import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import supabase client

// Icons
// Added FaInfoCircle to the import list
import { FaSave, FaTimes, FaUpload, FaSpinner, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

// Options for the dropdown
const howDidYouKnowOptions = [
    "", // Add an empty option for placeholder
    "Facebook",
    "LinkedIn",
    "Friend/Colleague",
    "Search Engine (Google, etc.)",
    "Advertisement",
    "Who are you?", // Removed "Who are you?" as it seemed like a placeholder
];

// Initial state structure (can be empty or fetched)
const initialFormData = {
  name: "",
  contactNumber: "",
  email: "", // Usually not editable, but included for structure
  gender: "",
  linkedinProfile: "",
  facebookProfile: "",
  city: "",
  address: "",
  relationWithStudent: "",
  guardianId: "", // Display only, not editable
  profileImageUrl: null,
  howDidYouKnow: "",
  // Add other fields if they exist in your data model
};

const GuardianProfileEditInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true); // Loading initial data
  const [saving, setSaving] = useState(false); // Saving changes
  const [message, setMessage] = useState({ type: '', text: '' }); // For success/error messages {type: 'success' | 'error'}
  const [profileImageFile, setProfileImageFile] = useState(null); // For new image file
  const [profileImagePreview, setProfileImagePreview] = useState(null); // For previewing new image

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
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) {
      //   // Fetch profile from your 'guardian_profiles' table
      //   // const { data: profileData, error } = await supabase
      //   //   .from('guardian_profiles') // Your table name
      //   //   .select('*')
      //   //   .eq('user_id', user.id)
      //   //   .single();
      //   // if (error) {
      //   //   console.error("Error fetching profile:", error);
      //   //   setMessage({ type: 'error', text: 'Failed to load profile data.' });
      //   // } else if (profileData) {
      //   //   setFormData({ ...initialFormData, ...profileData }); // Populate form
      //   //   setProfileImagePreview(profileData.profileImageUrl); // Set initial preview
      //   // }
      // } else {
      //   // navigate('/'); // Redirect if not logged in
      // }
      // --- End of Supabase fetching block ---

      // Using placeholder data for now:
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const placeholderData = {
          name: "Tania Afroz",
          contactNumber: "+88 01983258907",
          email: "tania123@gmail.com", // Usually fetched, not editable
          gender: "Female",
          linkedinProfile: "",
          facebookProfile: "",
          city: "Dhaka",
          address: "M-6/1, Mirail Bottola, Dhaka-1212",
          relationWithStudent: "Mother",
          guardianId: "11094",
          profileImageUrl: null, // Start with no image or fetch existing
          howDidYouKnow: "Facebook",
      };
      setFormData(placeholderData);
      setProfileImagePreview(placeholderData.profileImageUrl);
      setLoading(false);
    };

    fetchProfile();
  }, [/* navigate */]); // Add navigate if used inside

  // Handle regular input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' }); // Clear message on input change
  };

  // Handle file input change for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setMessage({ type: '', text: '' });
    }
  };

  // Handle saving changes
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // --- TODO: Implement Supabase Update Logic ---
    let uploadedImageUrl = formData.profileImageUrl; // Keep existing if no new file

    // 1. Upload new profile picture if selected
    if (profileImageFile) {
        // Example: Upload to Supabase Storage
        // const fileExt = profileImageFile.name.split('.').pop();
        // const fileName = `${Math.random()}.${fileExt}`; // Or use user ID for filename
        // const filePath = `avatars/${fileName}`;
        // const { error: uploadError } = await supabase.storage
        //   .from('avatars') // Your bucket name
        //   .upload(filePath, profileImageFile);

        // if (uploadError) {
        //   setMessage({ type: 'error', text: `Error uploading image: ${uploadError.message}` });
        //   setSaving(false);
        //   return;
        // }

        // // Get public URL of the uploaded image
        // const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        // uploadedImageUrl = urlData?.publicUrl;
        console.log("Simulating image upload for:", profileImageFile.name);
        // For placeholder, just keep the preview URL (won't persist)
        uploadedImageUrl = profileImagePreview;
    }

    // 2. Prepare data to update (exclude non-editable fields like ID, email)
    const updates = {
      // user_id: fetchedUserId, // Get the user ID from auth state
      name: formData.name,
      contact_number: formData.contactNumber, // Ensure keys match DB columns
      gender: formData.gender,
      linkedin_profile: formData.linkedinProfile,
      facebook_profile: formData.facebookProfile,
      city: formData.city,
      address: formData.address,
      relation_with_student: formData.relationWithStudent,
      profile_image_url: uploadedImageUrl, // Use the potentially updated URL
      how_did_you_know: formData.howDidYouKnow,
      // updated_at: new Date(), // Good practice to have an updated_at timestamp
    };

    // 3. Update the profile table in Supabase
    // const { data: { user } } = await supabase.auth.getUser(); // Re-fetch user if needed
    // if (user) {
    //   const { error: updateError } = await supabase
    //     .from('guardian_profiles') // Your table name
    //     .update(updates)
    //     .eq('user_id', user.id); // Update based on user ID

    //   if (updateError) {
    //     setMessage({ type: 'error', text: `Error saving profile: ${updateError.message}` });
    //   } else {
    //     setMessage({ type: 'success', text: 'Profile updated successfully!' });
    //     setProfileImageFile(null); // Clear the file input state after successful upload
    //     // Optionally navigate back after a delay
    //     setTimeout(() => navigate('/guardian/profile'), 2000);
    //   }
    // } else {
    //   setMessage({ type: 'error', text: 'User not found. Cannot save profile.' });
    // }
    // --- End of Supabase Update Logic ---

    // Placeholder success
    console.log("Saving data:", updates);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    setMessage({ type: 'success', text: 'Profile updated successfully! (Placeholder)' });
    setProfileImageFile(null);
    setTimeout(() => navigate('/guardian/profile'), 2000); // Navigate back to profile view

    setSaving(false);
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/guardian/profile'); // Navigate back to the profile view page
  };

  // Fallback image generator
  const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + (formData.name ? formData.name.split(' ').map(n=>n[0]).join('') : "G");

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading profile...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto flex justify-center items-start">
      <div className="container mx-auto max-w-6xl w-full">
        {/* Form wraps the entire two-column layout */}
        <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Left Sidebar */}
          <aside className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col items-center">
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center mb-6 w-full">
                 <label htmlFor="profilePictureInput" className="cursor-pointer group relative">
                    <img
                        src={profileImagePreview || profileImageFallback} // Show preview or existing/fallback
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
                    accept="image/png, image/jpeg, image/webp" // Specify acceptable file types
                    onChange={handleFileChange}
                    className="hidden" // Hide the default file input
                 />
                 <p className="text-xs text-gray-500 mt-2">Click image to change</p>
                 <p className="text-sm text-gray-600 mt-4">Guardian ID: {formData.guardianId}</p>
              </div>

              {/* Contact Info Preview (Static in Edit Form) */}
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

              {/* Personal Information Section - Now with Inputs */}
              <section>
                <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                   <FaInfoCircle /> {/* Icon imported correctly now */}
                   <h2 className="text-lg font-semibold">Edit Personal Information</h2>
                </div>
                <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`} />
                  </div>
                   {/* Contact Number */}
                   <div>
                    <label htmlFor="contactNumber" className="block text-xs font-medium text-gray-600 mb-1">Contact Number</label>
                    <input type="tel" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`} />
                  </div>
                   {/* Email (Display Only) */}
                   <div>
                    <label htmlFor="email_display" className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input type="email" id="email_display" name="email_display" value={formData.email} readOnly className="w-full p-2 border border-gray-200 bg-gray-100 rounded-md text-sm text-gray-500 cursor-not-allowed" />
                  </div>
                   {/* Gender */}
                   <div>
                     <label htmlFor="gender" className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                     <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                     </select>
                   </div>
                   {/* LinkedIn */}
                   <div>
                     <label htmlFor="linkedinProfile" className="block text-xs font-medium text-gray-600 mb-1">LinkedIn Profile Link</label>
                     <input type="url" id="linkedinProfile" name="linkedinProfile" value={formData.linkedinProfile || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`} />
                   </div>
                   {/* Facebook */}
                   <div>
                     <label htmlFor="facebookProfile" className="block text-xs font-medium text-gray-600 mb-1">Facebook Profile Link</label>
                     <input type="url" id="facebookProfile" name="facebookProfile" value={formData.facebookProfile || ''} onChange={handleInputChange} placeholder="https://facebook.com/..." className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`} />
                   </div>
                   {/* City */}
                   <div>
                     <label htmlFor="city" className="block text-xs font-medium text-gray-600 mb-1">City</label>
                     <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`} />
                   </div>
                   {/* Address */}
                   <div>
                     <label htmlFor="address" className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                     <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`} />
                   </div>
                   {/* Relation with Student */}
                   <div className="sm:col-span-2">
                     <label htmlFor="relationWithStudent" className="block text-xs font-medium text-gray-600 mb-1">Relation with Student</label>
                     <input type="text" id="relationWithStudent" name="relationWithStudent" value={formData.relationWithStudent} onChange={handleInputChange} className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`} />
                   </div>
                </div>
              </section>

              {/* "How did you know about us?" Section - ADDED BACK */}
              <section>
                 <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                   <FaInfoCircle /> {/* Icon imported correctly now */}
                   <h2 className="text-lg font-semibold">How did you know about us?</h2>
                </div>
                 <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
                    <label htmlFor="howDidYouKnow" className="sr-only">How did you know about us?</label> {/* Hidden label for accessibility */}
                    <select
                        id="howDidYouKnow"
                        name="howDidYouKnow"
                        value={formData.howDidYouKnow}
                        onChange={handleInputChange}
                        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 ${focusRingColor} text-sm`}
                    >
                        {howDidYouKnowOptions.map(option => (
                            <option key={option} value={option}>
                                {option || "-- Select an Option --"} {/* Show placeholder text for empty value */}
                            </option>
                        ))}
                    </select>
                </div>
              </section>

              {/* REMOVED Verification Section from Edit page - Usually not editable by user */}
              {/* <section>
                 <div className={`${sectionHeaderColor} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}>
                   <FaCheckCircle />
                   <h2 className="text-lg font-semibold">Verification And Security</h2>
                </div>
                 <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
                    Verification status might be displayed but not edited here
                </div>
              </section> */}


              {/* Save/Cancel Buttons */}
              <div className="flex justify-end gap-4 mt-4 border-t pt-6 border-gray-200">
                  {message.text && (
                      <span className={`text-sm mr-auto ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</span> // Pushed message left
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
                      className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white ${primaryColor} rounded-lg ${hoverColor} focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-1 disabled:opacity-50`}
                  >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {saving ? 'Saving...' : 'Save Changes'}
                  </button>
              </div>

            </div>
          </main>

        </form> {/* Form wraps both columns */}
      </div>
    </div>
  );
};

export default GuardianProfileEditInfo;
