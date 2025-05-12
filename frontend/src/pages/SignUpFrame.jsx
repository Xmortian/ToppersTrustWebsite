import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { supabase } from '../supabase.js'; // Import your Supabase client
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

const SignUpFrame = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", phone: "", city: "", password: "", gender: "",
    email: "", location: "", confirmPassword: "", role: "",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [signUpMessage, setSignUpMessage] = useState("");

  const primaryColor = "bg-[#6344cc]";
  const hoverColor = "hover:bg-[#5238a8]";
  const focusRingColor = "focus:ring-[#6344cc]";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (formErrors[name]) { setFormErrors(prevErrors => ({ ...prevErrors, [name]: null })); }
    setSignUpMessage("");
  };

  const handleGenderChange = (selectedGender) => {
    setFormData((prevData) => ({ ...prevData, gender: selectedGender }));
    if (formErrors.gender) { setFormErrors(prevErrors => ({ ...prevErrors, gender: null })); }
    setSignUpMessage("");
  };

  const handleRoleChange = (selectedRole) => {
    setFormData((prevData) => ({ ...prevData, role: selectedRole }));
    if (formErrors.role) { setFormErrors(prevErrors => ({ ...prevErrors, role: null })); }
    setSignUpMessage("");
  };

  const onSignInTextClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onTermsOfUseClick = useCallback(() => {
    window.open("/terms-and-conditions", "_blank");
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.gender) errors.gender = "Please select a gender";
    if (!formData.role) errors.role = "Please select your role (Guardian or Teacher)";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (formData.confirmPassword !== formData.password) errors.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) errors.terms = "You must agree to the terms and conditions";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpMessage("");
    if (!validateForm()) {
      console.log("Form validation failed:", formErrors);
      return;
    }

    setIsLoading(true);

    try {
      const userMetaData = {
        full_name: formData.name,
        phone: formData.phone,
        city: formData.city,
        user_role: formData.role,
      };

      const { data, error: signUpAuthError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: userMetaData },
      });

      if (signUpAuthError) {
        setSignUpMessage(`Error: ${signUpAuthError.message}`);
        setFormErrors(prev => ({ ...prev, submit: signUpAuthError.message }));
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const userId = data.user.id;
        let profileCreationError = null;

        // Base data for profile insertion, common to both tutor and guardian
        const baseProfileData = {
          user_id: userId,
          name: formData.name,
          email: formData.email, // Storing email in profile table can be convenient
          phone: formData.phone,
          city: formData.city,
          // 'address' in your guardian table seems to be the detailed address
          // 'location' in form is mapped to 'address' in DB
          address: formData.location || null,
        };

        if (formData.role === 'teacher') {
          // For tutor, include gender. Add other tutor-specific initial fields if any.
          const tutorProfileData = {
            ...baseProfileData,
            gender: formData.gender,
            // Initialize other tutor-specific fields as null or default
            // e.g., education_details: [], photo: null, etc.
          };
          console.log("Creating tutor profile with data:", tutorProfileData);
          const { error: tutorInsertError } = await supabase
            .from('tutor') // Ensure 'tutor' is your correct table name
            .insert([tutorProfileData]);
          if (tutorInsertError) profileCreationError = tutorInsertError;

        } else if (formData.role === 'guardian') {
          // For guardian, check if 'gender' column exists.
          // If not, exclude it. If yes, include it.
          // Based on screenshots, 'gender' is not visible in the guardian table.
          const guardianProfileData = {
            ...baseProfileData,
            // gender: formData.gender, // <<<< ADD THIS BACK IF 'gender' COLUMN EXISTS IN 'guardian' TABLE
            // Initialize other guardian-specific fields as null or default
            // e.g., photo: null, fulladdress: null, area: null, nid_bid: null etc.
          };
          console.log("Creating guardian profile with data:", guardianProfileData);
          const { error: guardianInsertError } = await supabase
            .from('guardian') // Ensure 'guardian' is your correct table name
            .insert([guardianProfileData]);
          if (guardianInsertError) profileCreationError = guardianInsertError;
        }

        if (profileCreationError) {
          console.error(`Error creating ${formData.role} profile:`, profileCreationError);
          setSignUpMessage(
            `Account created, but there was an issue setting up your ${formData.role} profile: ${profileCreationError.message}. Please try editing your profile later or contact support.`
          );
          // Consider deleting the auth user if profile creation is critical and fails:
          // try {
          //   const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
          //   if (deleteError) console.error("Failed to delete auth user after profile creation error:", deleteError);
          // } catch (adminError) {
          //   console.error("Error calling admin deleteUser:", adminError);
          // }
        }

        const requiresConfirmation = !data.session; 
        if (requiresConfirmation) {
          setSignUpMessage("Sign up successful! Please check your email to verify your account before signing in.");
        } else {
          setSignUpMessage("Sign up successful! Redirecting to login...");
        }
        setTimeout(() => {
          navigate("/"); 
        }, 5000);

      } else {
        setSignUpMessage("Sign up process initiated. If you don't receive a confirmation email, please try again or contact support.");
        setTimeout(() => { navigate("/"); }, 4000);
      }
    } catch (error) {
      setSignUpMessage("An unexpected error occurred during sign up.");
      setFormErrors(prev => ({ ...prev, submit: "An unexpected error occurred." }));
      console.error("Sign up catch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const GenderToggle = ({ name, label, value, onChange, options }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="flex items-center gap-0 rounded-md border border-gray-300 overflow-hidden text-xs sm:text-sm">
        {options.map(option => (
          <button key={option} type="button" onClick={() => onChange(option)}
            className={`flex-1 py-1.5 sm:py-2 px-2 text-center transition-colors duration-200 focus:outline-none border-r border-gray-300 last:border-r-0 ${value === option ? "bg-[#6344cc] text-white z-10" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
          > {option} </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 font-roboto text-[#000] overflow-x-hidden">
      <img className="absolute inset-0 w-full h-full object-cover -z-10" alt="Background" src="/image-9@2x.png" />
      <img className="absolute top-4 left-4 sm:top-[-0.562rem] sm:left-[-0.875rem] w-24 h-24 sm:w-[10.438rem] sm:h-[10.438rem] object-contain z-20" alt="Toppers Trust Logo" src="/untitled-design--1-removebgpreview-1@2x.png" />
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 sm:top-[2rem] text-[1.75rem] sm:text-[2.25rem] font-oswald text-[#40919e] z-20 text-center whitespace-nowrap"> TOPPERS TRUST </div>

      <form onSubmit={handleSignUp} className="relative bg-white/80 backdrop-blur-md shadow-2xl rounded-xl sm:rounded-3xl p-6 sm:p-8 md:p-10 w-full max-w-xl md:max-w-3xl z-10 mt-24 sm:mt-32 md:mt-40">
        <h2 className="text-xl sm:text-2xl font-semibold text-cyan-900 mb-6 text-center"> Create Your Account </h2>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
          {[ { type: "guardian", label: "I Want a Tutor", subtext: "Guardian" }, { type: "teacher", label: "I Want to Teach", subtext: "Teacher" } ]
          .map((roleOption) => (
            <div key={roleOption.type} className="flex flex-col items-center">
              <button type="button" onClick={() => handleRoleChange(roleOption.type)} className={`w-full sm:w-auto relative px-4 py-2.5 rounded-full flex items-center justify-center gap-2 text-white text-sm sm:text-base font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2 ${ formData.role === roleOption.type ? `${primaryColor}` : `bg-purple-400 hover:bg-purple-500` }`}>
                {roleOption.label}
                {formData.role === roleOption.type && ( <FaCheckCircle className="text-green-300 text-lg ml-1 sm:ml-2" /> )}
              </button>
              <span className="mt-1 text-xs text-gray-600">{roleOption.subtext}</span>
            </div>
          ))}
        </div>
        {formErrors.role && <p className="text-red-500 text-xs mt-1 text-center mb-4">{formErrors.role}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-5">
          <div> <label htmlFor="name" className="block text-[0.875rem] sm:text-[1rem] mb-1 text-left">Name</label> <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6344cc] focus:border-transparent outline-none" placeholder="Enter your name" required /> {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>} </div>
          <div> <label className="block text-[0.875rem] sm:text-[1rem] mb-1 text-left">Gender</label> <GenderToggle name="gender" label="" value={formData.gender} onChange={handleGenderChange} options={['Male', 'Female']} /> {formErrors.gender && <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>} </div>
          <div> <label htmlFor="phone" className="block text-[0.875rem] sm:text-[1rem] mb-1 text-left">Phone</label> <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6344cc] focus:border-transparent outline-none" placeholder="Enter your phone number" required /> {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>} </div>
          <div> <label htmlFor="email" className="block text-[0.875rem] sm:text-[1rem] mb-1 text-left">Email</label> <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6344cc] focus:border-transparent outline-none" placeholder="Enter your email" required /> {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>} </div>
          <div> <label htmlFor="city" className="block text-[0.875rem] sm:text-[1rem] mb-1 text-left">City</label> <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6344cc] focus:border-transparent outline-none" placeholder="Enter your city" /> </div>
          <div> <label htmlFor="location" className="block text-[0.875rem] sm:text-[1rem] mb-1 text-left">Location</label> <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6344cc] focus:border-transparent outline-none" placeholder="E.g., Street address, Area" /> </div>
          <div> <label htmlFor="password" className="block text-[0.875rem] sm:text-[1rem] mb-1 text-left">Password</label> <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6344cc] focus:border-transparent outline-none" placeholder="Enter your password (min. 6)" required /> {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>} </div>
          <div> <label htmlFor="confirmPassword" className="block text-[0.875rem] sm:text-[1rem] mb-1 text-left">Confirm Password</label> <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6344cc] focus:border-transparent outline-none" placeholder="Confirm your password" required /> {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>} </div>
        </div>

        <div className="mt-5 flex items-center text-left">
          <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => { setAgreedToTerms(e.target.checked); if (formErrors.terms) setFormErrors(prev => ({ ...prev, terms: null })); }} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6344cc] border-gray-400 rounded focus:ring-[#6344cc]" />
          <label htmlFor="terms" className="ml-2 text-[0.65rem] sm:text-[0.75rem] font-light text-gray-700"> I agree to the{" "} <span onClick={onTermsOfUseClick} className="underline text-[#1368a4] cursor-pointer hover:text-[#6344cc]"> Terms of Use and Privacy Policy </span> </label>
        </div>
        {formErrors.terms && <p className="text-red-500 text-xs mt-1 text-left">{formErrors.terms}</p>}

        {signUpMessage && ( <p className={`mt-4 text-sm text-center ${signUpMessage.includes("Error") || signUpMessage.includes("An unexpected") || signUpMessage.includes("issue") ? "text-red-600" : "text-green-600"}`}> {signUpMessage} </p> )}
        {formErrors.submit && !signUpMessage && ( <p className="mt-4 text-sm text-center text-red-600">{formErrors.submit}</p> )}

        <div className="mt-6 text-center md:col-span-2">
          <button type="submit" disabled={isLoading || !agreedToTerms} className={`w-full sm:w-auto rounded-full ${primaryColor} text-white px-8 sm:px-10 py-2.5 sm:py-3 font-medium text-[0.875rem] sm:text-[1rem] ${hoverColor} transition-colors duration-300 focus:outline-none focus:ring-2 ${focusRingColor} focus:ring-offset-2 ${(isLoading || !agreedToTerms) ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>

        <div className="mt-4 sm:mt-5 text-center text-[0.75rem] sm:text-[0.875rem] font-light text-gray-600 md:col-span-2"> Already have an account?{" "} <Link to="/" className="underline text-[#1368a4] cursor-pointer hover:text-[#6344cc]"> Sign In </Link> </div>
      </form>
    </div>
  );
};

export default SignUpFrame;
