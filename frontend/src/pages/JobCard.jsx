import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { supabase } from '../supabase.js'; // Import Supabase client

// Icons
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaBook, FaMapMarkerAlt, FaCreditCard, FaHome, FaUserGraduate, FaVenusMars, FaTimes, FaCheck } from 'react-icons/fa';
import { IoClose, IoCheckmark } from "react-icons/io5";

// --- Placeholder Data ---
const initialDb = [
  { id: 101, title: "Need Physics Tutor for Class 12 Student", code: "0003", daysPerWeek: "4 Days/Week", noOfStudents: "1", salary: "10000", subjects: ["Physics", "Higher Mathematics"], location: "Dhanmondi, Dhaka", paymentBasis: "Monthly", postedDate: "2025-04-15", tuitionType: "Home Tutoring", studentGender: "Male", preferredTutor: "Any", tutoringTime: "5 PM - 7 PM", logoUrl: "/previewremovebgpreview-1@2x.png" },
  { id: 102, title: "Math Tutor for Class 8 Urgently", code: "0001", daysPerWeek: "3 Days/Week", noOfStudents: "1", salary: "5000", subjects: ["Mathematics", "Physics"], location: "Banasree, Dhaka", paymentBasis: "Monthly", postedDate: "2025-05-01", tuitionType: "Online Tutoring", studentGender: "Female", preferredTutor: "Female", tutoringTime: "6 PM - 8 PM", logoUrl: "/previewremovebgpreview-1@2x.png" },
  { id: 103, title: "A-Level Chemistry Tutor Required", code: "0002", daysPerWeek: "5 Days/Week", noOfStudents: "1", salary: "12000", subjects: ["Chemistry (A-Level)"], location: "Gulshan, Dhaka", paymentBasis: "Monthly", postedDate: "2025-04-20", tuitionType: "Home Tutoring", studentGender: "Male", preferredTutor: "Male", tutoringTime: "4 PM - 6 PM", logoUrl: "/previewremovebgpreview-1@2x.png" },
];

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { const options = { year: 'numeric', month: 'short', day: 'numeric' }; return new Date(dateString).toLocaleDateString('en-US', options); }
    catch (e) { return dateString; }
};

const JobCard = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeFeedback, setSwipeFeedback] = useState(null);
    const [appliedJobId, setAppliedJobId] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const childRefs = useMemo(() => Array(initialDb.length).fill(0).map(i => React.createRef()), [initialDb.length]);
    const jobsStateRef = useRef(jobs);
    useEffect(() => { jobsStateRef.current = jobs; }, [jobs]);

    // --- Fetch Jobs Data ---
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true); setError(null);
            // --- TODO: Implement actual Supabase fetching ---
            await new Promise(resolve => setTimeout(resolve, 500));
            setJobs(initialDb);
            setLoading(false);
        };
        fetchJobs();
    }, []);

    // Check Auth Status Function
    const checkAuth = async () => {
        // It's often better to get the session which includes the user
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Error getting session:", error);
            return null;
        }
        console.log("User check via getSession:", session?.user ?? null); // Debug log
        return session?.user ?? null; // Return user object or null
    };

    // Handle swipe completion
    const swiped = async (direction, jobId, jobTitle) => {
        // Reset visual feedback immediately for next potential swipe
        setSwipeFeedback(null);
        setAppliedJobId(null);

        const user = await checkAuth(); // Check if user is logged in

        if (!user) {
            setShowLoginPrompt(true); // Show login prompt
            console.log("Swipe prevented: User not logged in.");

            // --- IMPORTANT: Restore card visually if swipe fails auth ---
            // Find the ref for the swiped card
            const originalIndex = initialDb.findIndex(job => job.id === jobId);
            const targetRef = childRefs[originalIndex];
            if (targetRef && targetRef.current) {
                // Use the restore method from react-tinder-card
                targetRef.current.restoreCard();
                console.log(`Card ${jobId} restored.`);
            }
            return; // Stop further processing
        }

        // --- User is logged in, proceed with swipe ---
        console.log(`Swiped ${direction} on job: ${jobTitle} (ID: ${jobId})`);
        setSwipeFeedback(direction); // Trigger screen flash
        setTimeout(() => setSwipeFeedback(null), 700);

        // --- TODO: Implement API call based on swipe direction ---
        if (direction === 'right') {
            console.log(`API Call: Apply for job ${jobId}`);
            setAppliedJobId(jobId); // Show "Applied" text
            setTimeout(() => setAppliedJobId(null), 1500); // Hide after 1.5 seconds
            // Example: await applyToJobAPI(jobId, user.id);
        } else if (direction === 'left') {
            console.log(`API Call: Decline job ${jobId}`);
            // Example: await declineJobAPI(jobId, user.id);
        }

        // Remove card from state ONLY if user is logged in and action is processed
        // Delay slightly to allow visual feedback
        setTimeout(() => {
             setJobs(currentJobs => currentJobs.filter(job => job.id !== jobId));
        }, 300);
    };

    // Handle card leaving screen
    const outOfFrame = (jobId, jobTitle) => {
        // This might still be called even if we restore the card,
        // so we don't necessarily remove the job from state here anymore.
        // Removal is handled in swiped() after auth check.
        console.log(`${jobTitle} (ID: ${jobId}) left the screen boundary!`);
    };

     // Programmatic swipe (via buttons)
     const swipe = async (dir) => {
        // Check auth first, same as direct swipe
        const user = await checkAuth();
        if (!user) {
            setShowLoginPrompt(true);
            console.log("Button swipe prevented: User not logged in.");
            return;
        }

        // --- User is logged in, proceed ---
        const currentJobs = jobsStateRef.current;
        if (currentJobs.length > 0) {
            const cardIndex = currentJobs.length - 1;
            const topmostJob = currentJobs[cardIndex];
            const originalIndex = initialDb.findIndex(job => job.id === topmostJob.id);
            const targetRef = childRefs[originalIndex];
            if (targetRef && targetRef.current) {
                 await targetRef.current.swipe(dir); // Swipe the card!
                 // The swiped() callback will handle the rest (API call, state removal)
            }
        }
    };

    // Close login prompt and navigate
    const handleLoginRedirect = () => {
        setShowLoginPrompt(false);
        navigate('/'); // Navigate to landing/login page
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen text-xl bg-gray-200">Loading...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-xl text-red-600 bg-gray-200">Error: {error}</div>;

    return (
        // Main container with lighter background
        <div className={`w-full min-h-screen bg-gray-200 flex flex-col justify-center items-center p-4 overflow-hidden transition-colors duration-500
            ${swipeFeedback === 'left' ? 'bg-red-300/30' : ''}
            ${swipeFeedback === 'right' ? 'bg-green-300/30' : ''}
        `}>

            {/* Login Prompt Modal/Overlay */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Login Required</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            You need to be logged in to apply for or decline jobs.
                        </p>
                        <button
                            onClick={handleLoginRedirect}
                            className="w-full bg-[#6344cc] text-white py-2 px-4 rounded-md hover:bg-[#5238a8] transition-colors"
                        >
                            Go to Login / Sign Up
                        </button>
                         <button
                            onClick={() => setShowLoginPrompt(false)}
                            className="mt-2 text-xs text-gray-500 hover:underline"
                         >
                             Dismiss
                         </button>
                    </div>
                </div>
            )}


            {/* Card Stack Area - Wider */}
            <div className="w-full max-w-md h-[75vh] sm:h-[70vh] relative mb-4">
                {jobs.map((job, index) => (
                    <TinderCard
                        // Find ref based on original index from initialDb
                        ref={childRefs[initialDb.findIndex(j => j.id === job.id)]}
                        className='absolute inset-0 cursor-grab'
                        key={job.id}
                        onSwipe={(dir) => swiped(dir, job.id, job.title)}
                        onCardLeftScreen={() => outOfFrame(job.id, job.title)}
                        preventSwipe={['up', 'down']}
                        swipeRequirementType="position"
                        swipeThreshold={100}
                    >
                        {/* Card Content - Darker Background */}
                        <div className="relative bg-gradient-to-br from-[#3a394d] to-[#2c2b38] text-white h-full w-full rounded-2xl shadow-xl p-5 flex flex-col overflow-y-auto">
                            {/* Top Section */}
                            <div className="mb-3 text-center">
                                <h2 className="text-xl sm:text-2xl font-semibold mb-2 leading-tight">{job.title}</h2>
                                <div className="flex justify-between items-center text-xs text-gray-300 px-2">
                                    <span>Code : {job.code}</span>
                                    <span>Posted : {formatDate(job.postedDate)}</span>
                                </div>
                            </div>

                            {/* Details Section 1 (Above Logo) */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-2 px-1">
                                <DetailItem icon={<FaHome />} label="Tuition Type" value={job.tuitionType} />
                                <DetailItem icon={<FaVenusMars />} label="Student Gender" value={job.studentGender} />
                                <DetailItem icon={<FaUserGraduate />} label="Preferred Tutor" value={job.preferredTutor} />
                                <DetailItem icon={<FaCalendarAlt />} label="Tutoring Time" value={job.tutoringTime} />
                            </div>

                             {/* Middle Section - Logo */}
                             <div className="flex justify-center items-center py-2 my-1">
                                <img
                                    src={job.logoUrl || "/previewremovebgpreview-1@2x.png"}
                                    alt="Logo"
                                    className="h-20 w-auto object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                             </div>

                            {/* Details Section 2 (Below Logo) */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2 mb-3 px-1">
                                <DetailItem icon={<FaCalendarAlt />} label="Days/Week" value={job.daysPerWeek} />
                                <DetailItem icon={<FaUsers />} label="No. of Students" value={job.noOfStudents} />
                                <DetailItem icon={<FaMoneyBillWave />} label="Salary" value={job.salary ? `BDT ${job.salary}` : 'N/A'} />
                                <DetailItem icon={<FaBook />} label="Subjects" value={Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects} />
                                <DetailItem icon={<FaMapMarkerAlt />} label="Location" value={job.location} />
                                <DetailItem icon={<FaCreditCard />} label="Payment Basis" value={job.paymentBasis} />
                            </div>

                            {/* Bottom Section - Swipe instructions */}
                            <div className="text-center text-xs text-gray-300 border-t border-gray-600 pt-3 mt-auto flex justify-between items-center px-2">
                                <span>← Swipe Left to Decline</span>
                                <span>Right Swipe to Apply →</span>
                            </div>

                             {/* Applied Overlay */}
                             {appliedJobId === job.id && (
                                 <div className="absolute inset-0 bg-green-500 bg-opacity-70 flex items-center justify-center rounded-2xl pointer-events-none">
                                     <span className="text-white text-3xl font-bold border-4 border-white rounded px-4 py-2">APPLIED</span>
                                 </div>
                             )}
                        </div>
                    </TinderCard>
                ))}
                 {/* Message when no more cards */}
                 {jobs.length === 0 && !loading && (
                     <div className="absolute inset-0 flex justify-center items-center text-center text-gray-500 text-xl p-4 bg-gray-800/60 rounded-2xl">
                        No more jobs available right now.
                     </div>
                 )}
            </div>

            {/* Accept/Decline Buttons - Below the stack */}
            {jobs.length > 0 && (
                 <div className="flex justify-between w-full max-w-xs sm:max-w-sm mt-8 sm:mt-10">
                     {/* Decline Button */}
                     <div className="flex flex-col items-center">
                         <button
                            onClick={() => swipe('left')}
                            className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-200/20 rounded-full border-2 border-red-500/70 text-red-500 hover:bg-red-500/30 active:bg-red-500/40 transition-colors shadow-lg"
                            aria-label="Decline"
                         >
                            <IoClose size={30} className="opacity-90"/>
                         </button>
                         <span className="mt-2 text-sm font-semibold text-red-600">DECLINE</span>
                     </div>

                     {/* Accept Button */}
                     <div className="flex flex-col items-center">
                         <button
                            onClick={() => swipe('right')}
                            className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-200/20 rounded-full border-2 border-green-500/70 text-green-500 hover:bg-green-500/30 active:bg-green-500/40 transition-colors shadow-lg"
                            aria-label="Accept"
                         >
                              <IoCheckmark size={30} className="opacity-90"/>
                         </button>
                          <span className="mt-2 text-sm font-semibold text-green-600">ACCEPT</span>
                     </div>
                 </div>
            )}

        </div>
    );
};

// Helper component for displaying details with icons
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-1.5">
        <span className="text-gray-300 mt-0.5 flex-shrink-0 text-xs">{icon}</span>
        <div>
            <span className="block text-[11px] text-gray-300 leading-tight">{label}</span>
            <strong className="text-gray-50 text-sm leading-tight">{value || 'N/A'}</strong>
        </div>
    </div>
);


export default JobCard;
