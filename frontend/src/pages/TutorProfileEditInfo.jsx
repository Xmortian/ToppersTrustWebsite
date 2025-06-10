import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Ensure this path is correct

// Icons
import {
    FaSave,
    FaTimes, 
    FaUpload,
    FaSpinner,
    FaInfoCircle,
    FaBookOpen,
    FaGraduationCap
} from 'react-icons/fa';

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

const howDidYouKnowOptions = [ "", "Facebook", "LinkedIn", "Friend/Colleague", "Search Engine (Google, etc.)", "Advertisement", "Who are you", "Other" ];
const genderOptions = ["", "Male", "Female"];
const curriculumOptions = ["", "Bangla Version", "English Version", "English Medium", "Madrasha", "Other"];
const placeOfTutoringOptions = ["", "Student Home", "Tutor Home", "Online"];

const initialFormData = {
    name: "", email: "", additionalNumber: "", gender: "", dateOfBirth: "", religion: "", nationalId: "",
    nationality: "", facebookProfile: "", driveLink: "",
    fathersName: "", fathersNumber: "", mothersName: "", mothersNumber: "", emergencyContact: "",
    location: "", 
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
            setLoading(true);
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) { navigate('/login'); return; }
            setUserId(user.id);

            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('tutor')
                    .select(`
                        id, name, phone, gender, date_of_birth, religion, national_id_number, nationality,
                        facebook_profile_link, drive_link, fathers_name, fathers_contact_number,
                        mothers_name, mothers_contact_number, emergency_contact_number,
                        ssc_school, ssc_grade, hsc_school, hsc_grade, 
                        uni, uni_grade, qualification, uni_curriculum, uni_exam_degree, uni_from_date, 
                        uni_major_group, uni_to_date, uni_id_card_no, uni_year_of_passing, uni_currently_studying,
                        tutoring_method, available_days_text, available_time, address, 
                        preferred_areas, expected_salary, preferred_classes, preferred_subjects,
                        place_of_tutoring, tutoring_style, experience_years, photo, how_did_you_know, user_id
                    `) 
                    .eq('user_id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') throw profileError;

                if (profileData) {
                    const baseEducationFormStructure = JSON.parse(JSON.stringify(initialFormData.education));
                    const populatedEducation = baseEducationFormStructure.map(formSlot => {
                        if (formSlot.level === "Bachelors/Honors") {
                            return { ...formSlot, institute: profileData.uni || "", result: profileData.uni_grade || "", curriculum: profileData.uni_curriculum || "", examDegree: profileData.uni_exam_degree || "", fromDate: profileData.uni_from_date || "", majorGroup: profileData.uni_major_group || "", toDate: profileData.uni_to_date || "", idCardNo: profileData.uni_id_card_no || "", yearOfPassing: profileData.uni_year_of_passing || "", currentInstitute: profileData.uni_currently_studying || false };
                        } else if (formSlot.level === "Higher Secondary") {
                            return { ...formSlot, institute: profileData.hsc_school || "", result: profileData.hsc_grade || "" };
                        } else if (formSlot.level === "Secondary") {
                            return { ...formSlot, institute: profileData.ssc_school || "", result: profileData.ssc_grade || "" };
                        }
                        return formSlot;
                    });
                    const parseAndJoin = (data) => Array.isArray(data) ? data.join(', ') : (data || "");
                    const newFormData = {
                        name: profileData.name || "", email: user.email || "", additionalNumber: profileData.phone || "", gender: profileData.gender || "", dateOfBirth: profileData.date_of_birth || "", religion: profileData.religion || "", nationalId: profileData.national_id_number || "",
                        nationality: profileData.nationality || "", facebookProfile: profileData.facebook_profile_link || "", driveLink: profileData.drive_link || "", fathersName: profileData.fathers_name || "", fathersNumber: profileData.fathers_contact_number || "", mothersName: profileData.mothers_name || "",
                        mothersNumber: profileData.mothers_contact_number || "", emergencyContact: profileData.emergency_contact_number || "", location: profileData.address || "", education: populatedEducation, tutoringMethod: profileData.tutoring_method || "", availableDays: profileData.available_days_text || "",
                        availableTime: profileData.available_time || "", preferredLocations: parseAndJoin(profileData.preferred_areas), expectedSalary: profileData.expected_salary?.toString() || "", preferredClasses: parseAndJoin(profileData.preferred_classes),
                        preferredSubjects: parseAndJoin(profileData.preferred_subjects), placeOfTutoring: profileData.place_of_tutoring || "", tutoringStyle: parseAndJoin(profileData.tutoring_style), totalExperience: profileData.experience_years ? `${profileData.experience_years} years` : "",
                        tutorId: profileData.id || "N/A", profileImageUrl: profileData.photo || null, howDidYouKnow: profileData.how_did_you_know || "",
                    };
                    setFormData(newFormData);
                    if (profileData.photo) {
                        const { data: urlData } = supabase.storage.from(supabaseBucketName).getPublicUrl(profileData.photo); 
                        setProfileImagePreview(urlData?.publicUrl || null); 
                    }
                } else {
                    const defaultFormData = JSON.parse(JSON.stringify(initialFormData));
                    setFormData({ ...defaultFormData, email: user.email, name: user.user_metadata?.full_name || "", tutorId: `NEW-${Date.now().toString().slice(-4)}` });
                }
            } catch (error) {
                setMessage({ type: 'error', text: `Failed to load profile: ${error.message}` });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]); 

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        }
    };

    const handleEducationChange = (index, field, value) => {
        setFormData(prev => {
            const updatedEducation = prev.education.map((edu, i) => (i === index) ? { ...edu, [field]: value } : edu);
            return { ...prev, education: updatedEducation };
        });
    };

    // MODIFIED: New handler for float (decimal) values in the education section
    const handleEducationFloatInputChange = (index, field, value) => {
        // Remove any characters that are not a digit or a decimal point
        let sanitizedValue = value.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point is allowed
        const firstDot = sanitizedValue.indexOf('.');
        if (firstDot !== -1) {
            const beforeDot = sanitizedValue.substring(0, firstDot + 1);
            const afterDot = sanitizedValue.substring(firstDot + 1).replace(/\./g, ''); // Remove any subsequent dots
            sanitizedValue = beforeDot + afterDot;
        }
        
        // Update the state with the cleaned value
        handleEducationChange(index, field, sanitizedValue);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!userId) {
            setMessage({ type: 'error', text: 'User not identified. Cannot save.'});
            return;
        }
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            let imagePathToSave = formData.profileImageUrl; 

            if (profileImageFile) { 
                const fileExt = profileImageFile.name.split('.').pop();
                const newFileName = `${userId}/profile-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from(supabaseBucketName).upload(newFileName, profileImageFile, { cacheControl: '3600', upsert: true });
                if (uploadError) throw uploadError;
                imagePathToSave = newFileName; 
            }

            const experienceYears = formData.totalExperience ? (parseInt(formData.totalExperience.match(/\d+/)?.[0], 10) || null) : null;
            const eduArray = formData.education || [];
            const sscData = eduArray.find(edu => edu.level === "Secondary");
            const hscData = eduArray.find(edu => edu.level === "Higher Secondary");
            const uniData = eduArray.find(edu => edu.level === "Bachelors/Honors");

            const dataForSupabase = {
                user_id: userId, 
                name: formData.name,
                phone: formData.additionalNumber,
                gender: formData.gender,
                date_of_birth: formData.dateOfBirth,
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
                address: formData.location, 
                ssc_school: sscData?.institute,
                ssc_grade: sscData?.result,
                hsc_school: hscData?.institute,
                hsc_grade: hscData?.result,
                uni: uniData?.institute,
                uni_grade: uniData?.result,
                uni_curriculum: uniData?.curriculum,
                uni_exam_degree: uniData?.examDegree,
                uni_from_date: uniData?.fromDate,
                uni_major_group: uniData?.majorGroup,
                uni_to_date: uniData?.toDate,
                uni_id_card_no: uniData?.idCardNo,
                uni_year_of_passing: uniData?.yearOfPassing,
                uni_currently_studying: uniData?.currentInstitute,
                qualification: uniData?.majorGroup,
                tutoring_method: formData.tutoringMethod,
                available_time: formData.availableTime,
                available_days_text: formData.availableDays, 
                preferred_areas: formData.preferredLocations,
                expected_salary: formData.expectedSalary,
                preferred_classes: formData.preferredClasses,
                preferred_subjects: formData.preferredSubjects,
                place_of_tutoring: formData.placeOfTutoring,
                tutoring_style: formData.tutoringStyle,
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
            
            const { data: upsertedData, error: upsertError } = await supabase
                .from('tutor')
                .upsert(dataForSupabase, { onConflict: 'user_id' })
                .select() 
                .single(); 

            if (upsertError) throw upsertError;

            setMessage({ type: 'success', text: 'Updated successfully!' });
            setTimeout(() => navigate('/tutor/profile'), 2000); 

        } catch (error) {
            const errorMessage = error.message || (error.error_description || 'Unknown error');
            setMessage({ type: 'error', text: `Failed to save profile: ${errorMessage}` });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => navigate('/tutor/profile'); 
    const profileImageFallback = "https://placehold.co/200x200/6344cc/FFF?text=" + (formData.name ? formData.name.split(' ').map(n=>n[0]).join('') : "T");

    if (loading) return <div className="flex justify-center items-center min-h-screen text-xl text-gray-100">Loading profile editor...</div>;

    return (
        <div className="w-full min-h-screen bg-slate-800 p-4 sm:p-6 lg:p-8 font-roboto flex flex-col items-center">
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
                                    Upload NID, Birth_Certificate, Student_ID, Or Any Other Verification Papers to Google a Drive and share the link here (ensure link has viewer access). This step is Strongly Recommended for Verification.
                                </p>
                            </div>
                            <InputField label="Father’s Name" name="fathersName" value={formData.fathersName} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
                            <InputField label="Father’s Number" name="fathersNumber" value={formData.fathersNumber} onChange={handleInputChange} type="tel" focusRingColor={focusRingColorClass} />
                            <InputField label="Mother’s Name" name="mothersName" value={formData.mothersName} onChange={handleInputChange} focusRingColor={focusRingColorClass} />
                            <InputField label="Mother’s Number" name="mothersNumber" value={formData.mothersNumber} onChange={handleInputChange} type="tel" focusRingColor={focusRingColorClass} />
                            <div className="sm:col-span-2"><InputField label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} type="tel" focusRingColor={focusRingColorClass} required={true} /></div>
                        </div>
                    </section>
                    <section>
                        <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                            <div className="flex items-center gap-2"><FaGraduationCap /><h2 className="text-lg font-semibold">Educational Information</h2></div>
                        </div>
                        <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 space-y-6 text-sm">
                            {formData.education?.map((edu, index) => {
                                const isSimplifiedView = edu.level === "Secondary" || edu.level === "Higher Secondary"; 
                                return (
                                    <div key={edu.id || `edu-${index}`} className={`p-4 border rounded-lg border-gray-300 shadow-sm bg-gray-50/50`}>
                                        <h4 className="font-semibold text-base text-gray-800 mb-3">{edu.level}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                            <InputField label="Institute" name="institute" value={edu.institute} onChange={(e) => handleEducationChange(index, e.target.name, e.target.value)} focusRingColor={focusRingColorClass} />
                                            {/* MODIFIED: Using the new float input handler for Result/Grade */}
                                            <InputField label="Result/Grade" name="result" value={edu.result} onChange={(e) => handleEducationFloatInputChange(index, e.target.name, e.target.value)} focusRingColor={focusRingColorClass} placeholder="e.g., 4.75" />
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
                    <section>
                        <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                            <div className="flex items-center gap-2"><FaBookOpen /><h2 className="text-lg font-semibold">Tuition Related Information</h2></div>
                        </div>
                        <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div className="sm:col-span-2"><TextAreaField label="Tutoring Method / Approach" name="tutoringMethod" value={formData.tutoringMethod} onChange={handleInputChange} placeholder="Describe your teaching style..." focusRingColor={focusRingColorClass}/></div>
                            <InputField label="Available Days (comma-separated)" name="availableDays" value={formData.availableDays} onChange={handleInputChange} placeholder="e.g., Sat, Mon, Wed" focusRingColor={focusRingColorClass}/>
                            <InputField label="Available Time" name="availableTime" value={formData.availableTime} onChange={handleInputChange} placeholder="e.g., 4 PM - 7 PM" focusRingColor={focusRingColorClass}/>
                            <div>
                                <InputField label="Preferred Locations (comma-separated)" name="preferredLocations" value={formData.preferredLocations} onChange={handleInputChange} placeholder="e.g., Banani, Gulshan, Dhanmondi" focusRingColor={focusRingColorClass} maxLength={60} />
                                <p className="text-xs text-right text-gray-500 mt-1">
                                    {formData.preferredLocations.length} / 60
                                </p>
                            </div>
                            <InputField label="Expected Salary (BDT)" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange} type="number" placeholder="e.g., 10000" min="0" focusRingColor={focusRingColorClass}/>
                            <InputField label="Preferred Classes (comma-separated)" name="preferredClasses" value={formData.preferredClasses} onChange={handleInputChange} placeholder="e.g., Class 8, Class 9, O-Level" focusRingColor={focusRingColorClass}/>
                            <div className="sm:col-span-2"><InputField label="Preferred Subjects (comma-separated)" name="preferredSubjects" value={formData.preferredSubjects} onChange={handleInputChange} placeholder="e.g., Physics, Math, English" focusRingColor={focusRingColorClass}/></div>
                            <SelectField label="Place of Tutoring" name="placeOfTutoring" value={formData.placeOfTutoring} onChange={handleInputChange} options={placeOfTutoringOptions.map(o => ({label: o || '-- Select --', value: o}))} focusRingColor={focusRingColorClass} />
                            <InputField label="Tutoring Style (comma-separated)" name="tutoringStyle" value={formData.tutoringStyle} onChange={handleInputChange} placeholder="e.g., One to One, Group" focusRingColor={focusRingColorClass}/>
                            <InputField label="Total Experience (e.g., 5 years)" name="totalExperience" value={formData.totalExperience} onChange={handleInputChange} placeholder="e.g., 5 years" focusRingColor={focusRingColorClass}/>
                        </div>
                    </section>
                    <section>
                        <div className={`${sectionHeaderColorClass} text-white px-4 py-2 rounded-t-lg flex items-center gap-2`}><FaInfoCircle /><h2 className="text-lg font-semibold">How did you know about us?</h2></div>
                        <div className="border border-t-0 border-gray-300 rounded-b-lg p-4 sm:p-6 text-sm">
                            <SelectField label="How did you find us?" name="howDidYouKnow" value={formData.howDidYouKnow} onChange={handleInputChange} options={howDidYouKnowOptions.map(opt => ({label: opt || "-- Select an Option --", value: opt}))} focusRingColor={focusRingColorClass} />
                        </div>
                    </section>
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