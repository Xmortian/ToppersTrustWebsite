import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { supabase } from '../supabase.js'; // Import Supabase client

// Icons
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaBook, FaMapMarkerAlt, FaCreditCard, FaHome, FaUserGraduate, FaVenusMars, FaTimes, FaCheck, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';
import { IoClose, IoCheckmark } from "react-icons/io5";

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { const options = { year: 'numeric', month: 'short', day: 'numeric' }; return new Date(dateString).toLocaleDateString('en-US', options); }
    catch (e) { return dateString; }
};

// Helper to parse subjects string
const parseSubjects = (subjectsString) => {
    if (!subjectsString) return [];
    return subjectsString.split(',').map(s => s.trim()).filter(s => s);
}

// Helper function to format days per week
const formatDaysPerWeek = (days) => {
    if (!days) return 'N/A';
    return `${days} Days/Week`;
};


const JobCard = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeFeedback, setSwipeFeedback] = useState(null);
    const [appliedJobId, setAppliedJobId] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0); 

    const childRefs = useMemo(() =>
        Array(jobs.length)
          .fill(0)
          .map((i) => React.createRef()),
        [jobs.length] 
    );

    useEffect(() => {
        if (jobs.length > 0) {
            setCurrentIndex(jobs.length - 1);
        } else {
            setCurrentIndex(0); 
        }
    }, [jobs]);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);
            setJobs([]); 

            try {
                // Fetches 'city' and 'area' along with other fields
                const { data, error: fetchError } = await supabase
                    .from('job')
                    .select(`
                        id, time, daysperweek, salary, subjects, medium, class,
                        studentgender, genderpreference, paymentbasis, numberofstudents,
                        posted_date, location, code, tuition_type,
                        city, area 
                    `)
                    .order('posted_date', { ascending: false });

                if (fetchError) {
                    throw fetchError;
                }

                const mappedJobs = data.map(job => {
                    const mediumText = job.medium || 'N/A Medium';
                    const classText = job.class || 'N/A Class';
                    const daysFormatted = formatDaysPerWeek(job.daysperweek); 
                    
                    let titleLocationText = 'N/A Location';
                    if (job.area && job.city) {
                        titleLocationText = `${job.area}, ${job.city}`;
                    } else if (job.city) {
                        titleLocationText = job.city;
                    } else if (job.area) {
                        titleLocationText = job.area;
                    } else if (job.location) { 
                        const parts = job.location.split(',');
                        if (parts.length >=2) {
                            titleLocationText = parts.slice(-2).join(',').trim();
                        } else {
                            titleLocationText = job.location.trim();
                        }
                    }

                    let displayLocation;
                    if (job.area && job.city) {
                        displayLocation = `${job.area}, ${job.city}`;
                    } else if (job.city) { 
                        displayLocation = job.city;
                    } else if (job.area) { 
                        displayLocation = job.area;
                    } else { 
                        displayLocation = job.location || 'Not Specified'; 
                    }

                    return {
                        id: job.id,
                        title: `${mediumText} tutor for ${classText} student - ${daysFormatted} at ${titleLocationText}`,
                        code: job.code || `JOB-${job.id}`,
                        daysPerWeek: daysFormatted,
                        noOfStudents: job.numberofstudents ? `${job.numberofstudents}` : '1',
                        salary: job.salary ? `${job.salary}` : 'Negotiable',
                        subjects: parseSubjects(job.subjects),
                        location: displayLocation, 
                        fullAddressFromDB: job.location, 
                        paymentBasis: job.paymentbasis || 'Monthly',
                        postedDate: job.posted_date,
                        tuitionType: job.tuition_type || 'Not Specified',
                        studentGender: job.studentgender || 'Any',
                        preferredTutor: job.genderpreference || 'Any',
                        tutoringTime: job.time || 'Not Specified',
                        medium: job.medium || 'N/A',
                        class: job.class || 'N/A',
                        logoUrl: "/previewremovebgpreview-1@2x.png" 
                    };
                });

                console.log("Fetched and mapped jobs:", mappedJobs);
                setJobs(mappedJobs);

            } catch (err) {
                console.error("Error fetching jobs:", err);
                setError(err.message || 'Failed to fetch jobs.');
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const checkAuth = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Error getting session:", error);
            return null;
        }
        console.log("User check via getSession:", session?.user ?? null);
        return session?.user ?? null;
    };

    const swiped = async (direction, jobId, jobTitle, index) => {
        console.log(`Swiped ${direction} on job: ${jobTitle} (ID: ${jobId}) at index: ${index}`);
        setSwipeFeedback(direction); 
        setTimeout(() => setSwipeFeedback(null), 700); 

        setCurrentIndex(index - 1);

        const user = await checkAuth(); 

        if (!user) {
            console.log("User not logged in after swipe.");
            const targetRef = childRefs[index];
            if (targetRef && targetRef.current) {
                console.log(`Restoring card ${jobId} due to missing user.`);
                targetRef.current.restoreCard();
            }
            setCurrentIndex(index);
            setShowLoginPrompt(true);
            return;
        }

        try {
            if (direction === 'right') {
                console.log(`API Call: Apply for job ${jobId} by user ${user.id}`);
                setAppliedJobId(jobId); 
                await new Promise(resolve => setTimeout(resolve, 300));
                console.log(`Simulated Apply API call finished for job ${jobId}`);

            } else if (direction === 'left') {
                console.log(`API Call: Decline job ${jobId} by user ${user.id}`);
                await new Promise(resolve => setTimeout(resolve, 300));
                 console.log(`Simulated Decline API call finished for job ${jobId}`);
            }
        } catch (apiError) {
             console.error(`API Error processing swipe for job ${jobId}:`, apiError);
             const targetRef = childRefs[index];
             if (targetRef && targetRef.current) {
                 console.log(`Restoring card ${jobId} due to API error.`);
                 targetRef.current.restoreCard();
             }
             setCurrentIndex(index);
        } finally {
             setTimeout(() => setAppliedJobId(null), 500);
        }
    };

    const outOfFrame = (jobId, jobTitle, index) => {
        console.log(`${jobTitle} (ID: ${jobId}) left screen boundary at index ${index}`);
    };

    const swipe = async (dir) => {
        const user = await checkAuth();
        if (!user) {
            setShowLoginPrompt(true);
            console.log("Button swipe prevented: User not logged in.");
            return;
        }

        if (currentIndex >= 0 && currentIndex < jobs.length) {
            const targetRef = childRefs[currentIndex];
            if (targetRef && targetRef.current) {
                console.log(`Programmatically swiping ${dir} on index ${currentIndex}`);
                await targetRef.current.swipe(dir);
            } else {
                 console.log("Could not swipe: Ref not found for index", currentIndex);
            }
        } else {
            console.log("Could not swipe: No cards left or index out of bounds.", currentIndex, jobs.length);
        }
    };

    const handleLoginRedirect = () => {
        setShowLoginPrompt(false);
        navigate('/'); 
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen text-xl bg-gray-200">Loading Jobs...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-xl text-red-600 bg-gray-200">Error: {error}</div>;

    return (
        <div className={`w-full min-h-screen bg-gray-200 flex flex-col justify-center items-center p-4 overflow-hidden transition-colors duration-500
            ${swipeFeedback === 'left' ? 'bg-red-300/30' : ''}
            ${swipeFeedback === 'right' ? 'bg-green-300/30' : ''}
        `}>

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

            <div className="w-full max-w-md h-[75vh] sm:h-[70vh] relative mb-4">
                {jobs.length > 0 && jobs.map((job, index) => (
                    <TinderCard
                        ref={childRefs[index]}
                        className='absolute inset-0 cursor-grab'
                        key={job.id}
                        onSwipe={(dir) => swiped(dir, job.id, job.title, index)}
                        onCardLeftScreen={() => outOfFrame(job.id, job.title, index)}
                        preventSwipe={['up', 'down']}
                        swipeRequirementType="position"
                        swipeThreshold={100}
                    >
                        {/* Added 'select-none' to disable text selection */}
                        <div className="select-none relative bg-gradient-to-br from-[#3a394d] to-[#2c2b38] text-white h-full w-full rounded-2xl shadow-xl p-5 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
                            <div className="mb-3 text-center flex-shrink-0">
                                <h2 className="text-xl sm:text-2xl font-semibold mb-2 leading-tight">{job.title}</h2>
                                <div className="flex justify-between items-center text-xs text-gray-300 px-2">
                                    <span>Code : {job.code}</span>
                                    <span>Posted : {formatDate(job.postedDate)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-2 px-1 flex-shrink-0">
                                <DetailItem icon={<FaHome />} label="Tuition Type" value={job.tuitionType} />
                                <DetailItem icon={<FaVenusMars />} label="Student Gender" value={job.studentGender} />
                                <DetailItem icon={<FaUserGraduate />} label="Preferred Tutor" value={job.preferredTutor} />
                                <DetailItem icon={<FaCalendarAlt />} label="Tutoring Time" value={job.tutoringTime} />
                                <DetailItem icon={<FaGraduationCap />} label="Class" value={job.class} />
                                <DetailItem icon={<FaChalkboardTeacher />} label="Medium" value={job.medium} />
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2 mb-3 px-1 flex-shrink-0">
                                <DetailItem icon={<FaCalendarAlt />} label="Days/Week" value={job.daysPerWeek} />
                                <DetailItem icon={<FaUsers />} label="No. of Students" value={job.noOfStudents} />
                                <DetailItem icon={<FaMoneyBillWave />} label="Salary" value={job.salary ? `BDT ${job.salary}` : 'N/A'} />
                                <DetailItem icon={<FaBook />} label="Subjects" value={job.subjects.length > 0 ? job.subjects.join(', ') : 'N/A'} />
                                <DetailItem icon={<FaMapMarkerAlt />} label="Location" value={job.location} />
                                <DetailItem icon={<FaCreditCard />} label="Payment Basis" value={job.paymentBasis} />
                            </div>

                             <div className="flex flex-grow justify-center items-center py-2 my-2 w-full">
                                 <img
                                     src={job.logoUrl || "/previewremovebgpreview-1@2x.png"}
                                     alt="Logo"
                                     className="h-40 sm:h-48 max-h-full w-auto object-contain"
                                     onError={(e) => { e.target.style.display = 'none'; }}
                                 />
                             </div>

                            <div className="text-center text-xs text-gray-300 border-t border-gray-600 pt-3 flex justify-between items-center px-2 flex-shrink-0">
                                <span>← Swipe Left to Decline</span>
                                <span>Right Swipe to Apply →</span>
                            </div>

                             {appliedJobId === job.id && swipeFeedback === 'right' && (
                                 <div className="absolute inset-0 bg-green-500 bg-opacity-70 flex items-center justify-center rounded-2xl pointer-events-none">
                                     <span className="text-white text-3xl font-bold border-4 border-white rounded px-4 py-2">APPLIED</span>
                                 </div>
                             )}
                        </div>
                    </TinderCard>
                ))}

                {!loading && (jobs.length === 0 || (jobs.length > 0 && currentIndex < 0)) && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-gray-300 text-xl p-4 bg-gray-800/80 rounded-2xl">
                        <span className="font-semibold">No more jobs available right now.</span>
                        <span className="text-base mt-2">Please check back later!</span>
                    </div>
                )}
            </div>

            {jobs.length > 0 && currentIndex >= 0 && (
                 <div className="flex justify-between w-full max-w-xs sm:max-w-sm mt-8 sm:mt-10">
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

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-1.5">
        <span className="text-gray-300 mt-0.5 flex-shrink-0 text-xs">{icon}</span>
        <div>
            <span className="block text-[11px] text-gray-300 leading-tight">{label}</span>
            <strong className="text-gray-50 text-sm leading-tight">{String(value) || 'N/A'}</strong>
        </div>
    </div>
);

export default JobCard;
