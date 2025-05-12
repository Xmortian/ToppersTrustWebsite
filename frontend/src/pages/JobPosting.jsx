import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js';

// Icons
import { IoClose } from "react-icons/io5";
import { FaTimesCircle } from "react-icons/fa";

// --- Dropdown Options ---
const studentCountOptions = Array.from({ length: 10 }, (_, i) => i + 1);
const mediumOptions = ["", "Bangla", "English Version", "English Medium", "Uni Help", "Madrasha Help"];
const classOptions = [ "", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "University", "Special Skills" ];
const paymentOptions = ["", "By month", "Per class"];
const daysOptions = ["", "1 Day/Week", "2 Days/Week", "3 Days/Week", "4 Days/Week", "5 Days/Week", "6 Days/Week", "7 Days/Week"];
const cityOptions = ["", "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur", "Mymensingh"];
const tuitionTypeOptions = ["", "Home Tutoring", "Online Tutoring", "Group Tutoring"];

const subjectOptions = [
    "", "Bangla", "English", "General Mathematics", "Higher Mathematics",
    "Information and Communication Technology (ICT)", "Religion and Moral Education",
    "Bangladesh and Global Studies", "Physical Education and Health", "Career Education",
    "General Science", "Agriculture Studies", "Home Science",
    "Physics", "Chemistry", "Biology", "Human Biology",
    "History", "Geography and Environment", "Civics and Citizenship", "Economics", "English Literature",
    "Art & Design", "Psychology", "Religious Studies",
    "Accounting", "Business Studies", "Finance and Banking", "Commerce",
    "Environmental Management", "Additional Mathematics",
    "French", "Spanish", "German", "Arabic", "Mandarin Chinese",
    "Computer Science", "Design & Technology", "Applied ICT",
];

// UPDATED: More comprehensive list of Dhaka Thanas
const dhakaThanas = [
    "",
    "Adabor", "Ashulia", "Badda", "Bangshal", "Bhashantek", "Bimanbandar", "Chakbazar", 
    "Dakshin Keraniganj", "Dakshinkhan", "Darus Salam", "Demra", "Dhamrai", "Dhanmondi", 
    "Dohar", "Gendaria", "Gulshan", "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul", 
    "Kalabagan", "Kamrangirchar", "Keraniganj Model", "Khilgaon", "Khilkhet", "Kotwali", 
    "Lalbagh", "Mirpur Model", "Mohammadpur", "Motijheel", "Nawabganj", "New Market", 
    "Pallabi", "Paltan", "Ramna", "Rampura", "Sabujbagh", "Savar Model", "Shah Ali", 
    "Shahbagh", "Sher-e-Bangla Nagar", "Shyampur", "Sutrapur", "Tejgaon", 
    "Tejgaon Industrial Area", "Turag", "Uttar Khan", "Uttara East", "Uttara West", 
    "Vatara", "Wari", "Other"
];


const locationData = {
    "Dhaka": dhakaThanas,
    "Chittagong": ["", "Agrabad", "Bakolia", "Bandar", "Bayazid Bostami", "Chandgaon", "Chattogram Kotwali", "Double Mooring", "Halishahar", "Karnaphuli", "Khulshi", "Pahartali", "Panchlaish", "Patenga", "Sitakunda", "Other"],
    "Khulna": ["", "Daulatpur", "Khalishpur", "Khan Jahan Ali", "Khulna Kotwali", "Sonadanga", "Other"],
    "Rajshahi": ["", "Boalia", "Matihar", "Rajpara", "Shah Makhdum", "Other"],
    "Sylhet": ["", "Sylhet Kotwali", "Airport", "Dakshin Surma", "Hazrat Shah Paran", "Jalalabad", "Moglabazar", "Other"],
    "Barisal": ["", "Barishal Kotwali", "Airport", "Bandar", "Kaunia", "Other"],
    "Rangpur": ["", "Rangpur Kotwali", "Gangachhara", "Kaunia", "Pirgachha", "Taraganj", "Other"],
    "Mymensingh": ["", "Mymensingh Kotwali", "Bhaluka", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail", "Phulpur", "Trishal", "Other"],
};

const initialFormState = {
    noOfStudents: '1',
    tutorGenderPref: 'Any',
    salary: '',
    tuitionType: 'Home Tutoring',
    studentGender: '',
    city: 'Dhaka',        
    category: 'English Medium', 
    subjects: [],
    location: '',       // This state field holds the selected Thana/Area
    address: '',        // This state field holds the Full Street Address
    daysPerWeek: '5 Days/Week',
    startingDate: new Date().toISOString().split('T')[0],
    paymentType: 'By month', 
    classCourse: 'Class 8', 
    tutoringTime: '', 
    details: '',
};

// --- Helper Components with React.memo ---
const GenderToggle = React.memo(({ name, label, value, onChange, options }) => {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
            <div className="flex items-center gap-0 rounded-md border border-gray-300 overflow-hidden text-xs sm:text-sm">
                {options.map(option => (
                    <button
                        key={`${name}-${option}`}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`flex-1 py-1.5 sm:py-2 px-2 text-center transition-colors duration-200 focus:outline-none border-r border-gray-300 last:border-r-0
                            ${ value === option
                                ? "bg-[#6344cc] text-white z-10"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
});

const SelectInput = React.memo(({ name, label, value, onChange, options, required = false }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <select id={name} name={name} value={value} onChange={onChange} required={required}
                className="w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#6344cc] focus:border-[#6344cc] text-sm"
            >
                {options.map((option) => ( <option key={`${name}-${option}`} value={option}> {option || `-- Select ${label} --`} </option> ))}
            </select>
        </div>
    );
});

const TextInput = React.memo(({ name, label, value, onChange, placeholder = "", type = "text", required = false }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#6344cc] focus:border-[#6344cc] text-sm"
            />
        </div>
    );
});
// --- End Helper Components ---


const JobPosting = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({...initialFormState});
    const [availableLocations, setAvailableLocations] = useState(locationData[formData.city] || [""]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [subjectToAdd, setSubjectToAdd] = useState("");
    const [subjectError, setSubjectError] = useState("");

    useEffect(() => {
        const cityLocations = locationData[formData.city] || [""];
        setAvailableLocations(cityLocations);
        if (!cityLocations.includes(formData.location)) { 
            setFormData(prev => ({ ...prev, location: "" }));
        }
    }, [formData.city]);


    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    }, [message.text]);

    const handleStudentGenderChange = useCallback((value) => {
        setFormData(prev => ({ ...prev, studentGender: value }));
        if (message.text) setMessage({ type: '', text: '' });
    }, [message.text]);

    const handleTutorGenderChange = useCallback((value) => {
        setFormData(prev => ({ ...prev, tutorGenderPref: value }));
        if (message.text) setMessage({ type: '', text: '' });
    }, [message.text]);

    const addSubject = useCallback(() => {
        setSubjectError("");
        if (subjectToAdd && !formData.subjects.includes(subjectToAdd)) {
            if (formData.subjects.length < 5) {
                setFormData(prev => ({
                    ...prev,
                    subjects: [...prev.subjects, subjectToAdd]
                }));
                setSubjectToAdd(""); 
            } else {
                setSubjectError("You can select up to 5 subjects only.");
            }
        } else if (formData.subjects.includes(subjectToAdd)) {
             setSubjectError(`"${subjectToAdd}" is already selected.`);
        }
    }, [subjectToAdd, formData.subjects]);

    const removeSubject = useCallback((subjectToRemove) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter(subject => subject !== subjectToRemove)
        }));
        setSubjectError(""); 
    }, []);


    const handleCancel = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setSubjectError("");

        // Validation
        if (!formData.city) {
            setMessage({type: 'error', text: "Please select a city."});
            setIsLoading(false); return;
        }
        if (!formData.location) { // formData.location is Thana/Area
            setMessage({type: 'error', text: "Please select a location (Thana/Area)."});
            setIsLoading(false); return;
        }
        if (!formData.address.trim()) { // formData.address is full street address
            setMessage({type: 'error', text: "Please enter the full address."});
            setIsLoading(false); return;
        }
        if (formData.subjects.length === 0) {
            setSubjectError("Please select at least one subject.");
            setIsLoading(false); return;
        }
        if (!formData.studentGender) {
            setMessage({type: 'error', text: "Please select the student's gender."});
            setIsLoading(false); return;
        }
        if (!formData.salary || parseFloat(formData.salary) <=0) {
             setMessage({type: 'error', text: "Please enter a valid salary."});
            setIsLoading(false); return;
        }
        if (!formData.tutoringTime.trim()) { 
            setMessage({type: 'error', text: "Please enter the tutoring time."});
            setIsLoading(false); return;
       }
       if (!formData.tuitionType) { 
            setMessage({ type: 'error', text: "Please select a tuition type." });
            setIsLoading(false); return;
        }


        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            setMessage({ type: 'error', text: 'You must be logged in to post a job. Redirecting to login...' });
            setIsLoading(false);
            setTimeout(() => navigate('/login'), 2000); 
            return;
        }

        let guardianId;
        try {
            const { data: guardianData, error: guardianError } = await supabase
                .from('guardian') 
                .select('id')     
                .eq('user_id', user.id) 
                .single();

            if (guardianError) {
                if (guardianError.code === 'PGRST116') { 
                    throw new Error("No guardian profile found linked to your account. Please ensure your guardian profile is set up.");
                }
                throw guardianError; 
            }
            if (!guardianData) { 
                throw new Error("Guardian profile not found for the current user.");
            }
            
            guardianId = guardianData.id; 
            console.log("Fetched guardianId:", guardianId);

        } catch (error) {
            console.error("Error fetching guardian ID:", error);
            setMessage({ type: 'error', text: `Failed to verify guardian status: ${error.message}` });
            setIsLoading(false);
            return;
        }

        const jobDataToInsert = {
            guardianid: guardianId,
            numberofstudents: parseInt(formData.noOfStudents, 10),
            genderpreference: formData.tutorGenderPref,
            salary: parseFloat(formData.salary),
            tuition_type: formData.tuitionType, 
            studentgender: formData.studentGender,
            location: formData.address, // Full street address from formData.address is saved to 'location' column
            city: formData.city,         // City from formData.city is saved to 'city' column
            area: formData.location,     // Thana/Area (from formData.location dropdown) is saved to 'area' column
            medium: formData.category, 
            subjects: formData.subjects.join(', '), 
            daysperweek: parseInt(formData.daysPerWeek.split(' ')[0], 10), 
            posted_date: new Date().toISOString(), 
            paymentbasis: formData.paymentType, 
            class: formData.classCourse, 
            time: formData.tutoringTime, 
            code: `TUITION-${Date.now().toString().slice(-6)}`, 
        };
        
        // if (formData.details && formData.details.trim() !== "") { 
        //    jobDataToInsert.details = formData.details; 
        // }

        console.log("Submitting to Supabase 'job' table:", jobDataToInsert);

        try {
            const { data, error } = await supabase
                .from('job') 
                .insert([jobDataToInsert])
                .select();

            if (error) {
                throw error;
            }

            console.log("Job posted successfully:", data);
            setMessage({ type: 'success', text: 'Job posted successfully!' });
            setFormData({...initialFormState}); 
            // navigate('/guardian/dashboard/posted-jobs'); 

        } catch (error) {
            console.error("Error posting job to Supabase:", error);
            setMessage({ type: 'error', text: `Failed to post job: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center p-4 sm:p-6 font-roboto">
            <header className="w-full max-w-4xl mb-6 flex justify-center items-center relative">
                <div className="shadow-[0px_4px_20px_rgba(0,0,0,0.15)] rounded-3xl bg-white/80 backdrop-blur-sm py-4 px-16">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 text-center">
                        Hire Tutor
                    </h1>
                </div>
                <button onClick={handleCancel} className="absolute top-1/2 right-0 transform -translate-y-1/2 text-gray-500 hover:text-red-600 text-2xl p-2">
                    <IoClose />
                </button>
            </header>

            <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">

                    {/* Column 1 */}
                    <div className="space-y-5">
                        <SelectInput name="noOfStudents" label="No of Students" value={formData.noOfStudents} onChange={handleInputChange} options={studentCountOptions} required />
                        <GenderToggle name="tutorGenderPref" label="Tutor Gender Preference" value={formData.tutorGenderPref} onChange={handleTutorGenderChange} options={['Male', 'Female', 'Any']} />
                        <TextInput name="salary" label="Salary (BDT)" value={formData.salary} onChange={handleInputChange} placeholder="Enter expected salary" type="number" required />
                        <SelectInput name="tuitionType" label="Tuition Type" value={formData.tuitionType} onChange={handleInputChange} options={tuitionTypeOptions} required />
                        <GenderToggle name="studentGender" label="Student Gender" value={formData.studentGender} onChange={handleStudentGenderChange} options={['Male', 'Female']} />
                    </div>

                    {/* Column 2 */}
                     <div className="space-y-5">
                        <SelectInput name="city" label="Select City" value={formData.city} onChange={handleInputChange} options={cityOptions} required />
                        {/* 'location' in formData here means Thana/Area */}
                        <SelectInput name="location" label="Select Location (Thana/Area)" value={formData.location} onChange={handleInputChange} options={availableLocations} required /> 
                        <SelectInput name="category" label="Category (Medium)" value={formData.category} onChange={handleInputChange} options={mediumOptions} required />

                        <div>
                            <label htmlFor="subjectToAdd" className="block text-xs font-medium text-gray-600 mb-1">Add Subjects (Up to 5)</label>
                            <div className="flex gap-2">
                                <select
                                    id="subjectToAdd"
                                    value={subjectToAdd}
                                    onChange={(e) => { setSubjectToAdd(e.target.value); setSubjectError(""); }}
                                    className="flex-grow p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#6344cc] focus:border-[#6344cc] text-sm"
                                >
                                    {subjectOptions
                                        .filter(option => !formData.subjects.includes(option))
                                        .map((option) => ( 
                                            <option key={`subject-option-${option}`} value={option}>
                                                {option || "-- Select Subject --"}
                                            </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={addSubject}
                                    disabled={!subjectToAdd || formData.subjects.length >= 5}
                                    className="px-3 py-2 bg-[#6344cc] text-white text-sm font-medium rounded-md hover:bg-[#5238a8] disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Add
                                </button>
                            </div>
                            {subjectError && <p className="text-red-500 text-xs mt-1">{subjectError}</p>}
                            {formData.subjects.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5 border p-2 rounded-md min-h-[40px]">
                                    {formData.subjects.map((subject, index) => ( 
                                        <span key={`selected-subject-${subject}-${index}`} className="flex items-center bg-purple-100 text-purple-800 text-xs font-medium pl-2 pr-1 py-0.5 rounded-full h-fit">
                                            {subject}
                                            <button
                                                type="button"
                                                onClick={() => removeSubject(subject)}
                                                className="ml-1.5 text-purple-500 hover:text-purple-700 focus:outline-none"
                                                aria-label={`Remove ${subject}`}
                                            >
                                                <FaTimesCircle size={12}/>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <SelectInput name="classCourse" label="Class/Course" value={formData.classCourse} onChange={handleInputChange} options={classOptions} required />
                    </div>

                    {/* Column 3 */}
                     <div className="space-y-5">
                        {/* 'address' in formData here means Full Street Address */}
                        <TextInput name="address" label="Full Street Address (House, Road, etc.)" value={formData.address} onChange={handleInputChange} placeholder="E.g: Flat:3E, House:12, Road:1" required />
                        <SelectInput name="daysPerWeek" label="Days/Week" value={formData.daysPerWeek} onChange={handleInputChange} options={daysOptions} required />
                        <TextInput name="tutoringTime" label="Tutoring Time (e.g., 5 PM - 7 PM)" value={formData.tutoringTime} onChange={handleInputChange} placeholder="Specify preferred time slot" required />
                        <TextInput name="startingDate" label="Preferred Starting Date" value={formData.startingDate} onChange={handleInputChange} type="date" required />
                        <SelectInput name="paymentType" label="Payment Basis" value={formData.paymentType} onChange={handleInputChange} options={paymentOptions} required />
                         <div>
                            <label htmlFor="details" className="block text-xs font-medium text-gray-600 mb-1">Detailed Requirements (Optional)</label>
                            <textarea
                                id="details"
                                name="details"
                                rows="3" 
                                value={formData.details || ""}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#6344cc] focus:border-[#6344cc] text-sm"
                                placeholder="Any specific needs, timings, tutor qualifications etc."
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center">
                     {message.text && (
                        <p className={`mb-4 text-sm text-center ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                            {message.text}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full sm:w-auto ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#6344cc] hover:bg-[#5238a8]'} text-white px-10 py-3 rounded-lg font-semibold text-base transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#6344cc] focus:ring-offset-2`}
                    >
                        {isLoading ? 'Posting...' : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobPosting;
