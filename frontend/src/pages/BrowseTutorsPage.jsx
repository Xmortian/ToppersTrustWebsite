import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { supabase } from '../supabase.js'; // Import Supabase client

// Icons
import { FaStar, FaTimes, FaCheck } from 'react-icons/fa';
import { IoClose, IoCheckmark } from "react-icons/io5";

// --- Placeholder Data for Tutors ---
const initialTutorsDb = [
  {
    id: "TUT001",
    name: "Moutmayen Nafis",
    university: "BRAC University",
    grade: "3.4",
    department: "Computer Science & Engineering",
    location: "Moghbazar, Dhaka",
    rating: 5.00,
    sscInfo: "SSC Grade 5 - Ideal School and College",
    hscInfo: "HSC Grade 5 - Dhaka College",
    profileImageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-1@2x.png",
  },
  {
    id: "TUT002",
    name: "Taskia Maisha",
    university: "Dhaka University",
    grade: "3.8",
    department: "English Literature",
    location: "Gulshan, Dhaka",
    rating: 4.5,
    sscInfo: "SSC GPA 5.0 - Viqarunnisa Noon School",
    hscInfo: "HSC GPA 4.8 - Viqarunnisa Noon College",
    profileImageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-7@2x.png",
  },
  { id: "TUT003", name: "Arif Hossain", university: "Jahangirnagar University", grade: "3.9", department: "Mathematics", location: "Mirpur, Dhaka", rating: 4.9, sscInfo: "SSC GPA 5.0 - St. Joseph", hscInfo: "HSC GPA 5.0 - Notre Dame College", profileImageUrl: null },
  { id: "TUT004", name: "Sumaiya Islam", university: "NSU", grade: "3.7", department: "BBA", location: "Uttara, Dhaka", rating: 4.7, sscInfo: "SSC GPA 4.8 - Scholastica", hscInfo: "HSC GPA 4.5 - Mastermind", profileImageUrl: null },
  { id: "TUT005", name: "Rahim Ahmed", university: "BUET", grade: "3.6", department: "Mechanical Engineering", location: "Mohammadpur, Dhaka", rating: 4.6, sscInfo: "SSC GPA 5.0 - Govt. Laboratory", hscInfo: "HSC GPA 5.0 - Dhaka Residential", profileImageUrl: null },
];

const BrowseTutorsPage = () => {
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeFeedback, setSwipeFeedback] = useState(null); // 'left', 'right', or null
    const [shortlistedTutorId, setShortlistedTutorId] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const childRefs = useMemo(() => Array(initialTutorsDb.length).fill(0).map(i => React.createRef()), [initialTutorsDb.length]);
    const tutorsStateRef = useRef(tutors);
    useEffect(() => { tutorsStateRef.current = tutors; }, [tutors]);

    useEffect(() => {
        const fetchTutors = async () => {
            setLoading(true); setError(null);
            // --- TODO: Implement actual Supabase fetching for tutors ---
            await new Promise(resolve => setTimeout(resolve, 500));
            setTutors(initialTutorsDb);
            setLoading(false);
        };
        fetchTutors();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    };

    const swiped = async (direction, tutorId, tutorName) => {
        setSwipeFeedback(null); setShortlistedTutorId(null);
        const user = await checkAuth();
        if (!user) {
            setShowLoginPrompt(true);
            const originalIndex = initialTutorsDb.findIndex(t => t.id === tutorId);
            const targetRef = childRefs[originalIndex];
            if (targetRef && targetRef.current) { targetRef.current.restoreCard(); }
            return;
        }

        setSwipeFeedback(direction); // Trigger screen flash
        setTimeout(() => setSwipeFeedback(null), 700); // Flash duration

        if (direction === 'right') {
            console.log(`API Call: Add tutor ${tutorId} to shortlist for user ${user.id}`);
            setShortlistedTutorId(tutorId);
            setTimeout(() => setShortlistedTutorId(null), 1500);
            try {
                const currentShortlist = JSON.parse(localStorage.getItem('shortlistedTutorIds')) || [];
                const updatedShortlist = [tutorId, ...currentShortlist.filter(id => id !== tutorId)].slice(0, 10);
                localStorage.setItem('shortlistedTutorIds', JSON.stringify(updatedShortlist));
            } catch (e) { console.error("Error saving to localStorage:", e); }
            // --- TODO: API call to add tutor to guardian's shortlist in DB ---
        } else if (direction === 'left') {
            console.log(`API Call: Reject tutor ${tutorId} for user ${user.id}`);
            // --- TODO: API call to record rejection (optional) ---
        }
        setTimeout(() => {
             setTutors(currentTutors => currentTutors.filter(t => t.id !== tutorId));
        }, 300);
    };

    const outOfFrame = (tutorId, tutorName) => {
        console.log(`${tutorName} (ID: ${tutorId}) left the screen!`);
    };

    const handleLoginRedirect = () => {
        setShowLoginPrompt(false);
        navigate('/');
    };

    const tutorProfileImageFallback = (name) => `https://placehold.co/150x150/B8860B/FFFFFF?text=${name ? name.split(' ').map(n=>n[0]).join('') : 'T'}`; // Golden-ish fallback

    if (loading) return <div className="flex justify-center items-center min-h-screen text-xl bg-slate-800 text-gray-300">Loading Tutors...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-xl text-red-400 bg-slate-800">Error: {error}</div>;

    return (
        // Main container with a darkish background
        <div className={`w-full min-h-screen bg-slate-800 flex flex-col justify-center items-center p-4 overflow-hidden transition-colors duration-300 // Shorter flash transition
            ${swipeFeedback === 'left' ? 'bg-red-700/40' : ''}
            ${swipeFeedback === 'right' ? 'bg-green-700/40' : ''}
        `}>
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-6 sm:mb-8 text-center">Recommended Tutors from Toppers Trust</h1>

            {/* Login Prompt Modal/Overlay */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Login Required</h3>
                        <p className="text-sm text-gray-600 mb-4">You need to be logged in to shortlist or reject tutors.</p>
                        <button onClick={handleLoginRedirect} className="w-full bg-[#6344cc] text-white py-2 px-4 rounded-md hover:bg-[#5238a8] transition-colors"> Go to Login / Sign Up </button>
                        <button onClick={() => setShowLoginPrompt(false)} className="mt-2 text-xs text-gray-500 hover:underline"> Dismiss </button>
                    </div>
                </div>
            )}

            {/* Card Stack Area */}
            <div className="w-full max-w-xs sm:max-w-sm h-[80vh] sm:h-[75vh] md:h-[70vh] relative">
                {tutors.length > 0 ? tutors.map((tutor) => (
                    <TinderCard
                        ref={childRefs[initialTutorsDb.findIndex(t => t.id === tutor.id)]}
                        className='absolute inset-0 cursor-grab'
                        key={tutor.id}
                        onSwipe={(dir) => swiped(dir, tutor.id, tutor.name)}
                        onCardLeftScreen={() => outOfFrame(tutor.id, tutor.name)}
                        preventSwipe={['up', 'down']}
                        swipeRequirementType="position" // Swipe based on distance
                        swipeThreshold={80} // Pixels card needs to move horizontally
                    >
                        {/* Card Content - Golden Theme */}
                        <div className="relative bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-600 text-slate-900 h-full w-full rounded-2xl shadow-2xl p-5 flex flex-col overflow-y-auto border-2 border-amber-300/70">
                            {/* Top Section: Profile Image */}
                            <div className="flex flex-col items-center pt-2 pb-4"> {/* Increased pb */}
                                <img
                                    src={tutor.profileImageUrl || tutorProfileImageFallback(tutor.name)}
                                    alt={tutor.name}
                                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-200 shadow-lg"
                                />
                            </div>

                            {/* Details Section - Below Image, Centered */}
                            <div className="flex-grow flex flex-col justify-center items-center text-center space-y-2 px-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{tutor.name}</h2>
                                <DetailItemGolden value={`${tutor.university} Grade : ${tutor.grade}`} />
                                <DetailItemGolden value={tutor.department} />
                                <DetailItemGolden value={tutor.location} />
                                <DetailItemGolden value={tutor.rating ? `Rating : ${tutor.rating.toFixed(2)} / 5.00` : 'Rating : N/A'} icon={<FaStar className="text-yellow-200 inline mr-1 text-base" />} /> {/* Brighter star */}
                                <DetailItemGolden value={tutor.sscInfo} />
                                <DetailItemGolden value={tutor.hscInfo} />
                            </div>

                            {/* Bottom Section - Swipe instructions */}
                            <div className="text-center text-xs text-amber-100 border-t border-amber-400/50 pt-3 mt-auto flex justify-between items-center px-2">
                                <span>← REJECT</span>
                                <span>SELECT →</span>
                            </div>

                             {/* "Added to Shortlist!" Overlay */}
                             {shortlistedTutorId === tutor.id && (
                                 <div className="absolute inset-0 bg-green-600 bg-opacity-85 flex items-center justify-center rounded-2xl pointer-events-none z-10 p-4">
                                     <span className="text-white text-xl sm:text-2xl font-bold border-2 border-white rounded px-3 py-1 sm:px-4 sm:py-2 shadow-lg">Added to Shortlist!</span>
                                 </div>
                             )}
                        </div>
                    </TinderCard>
                )) : (
                    !loading &&
                    <div className="absolute inset-0 flex justify-center items-center text-center text-gray-400 text-xl p-4 bg-slate-700/80 rounded-2xl">
                        No more tutors available.
                    </div>
                )}
            </div>

            {/* Side Indicators for Swipe (Visual Cues) */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4 md:pl-8 pointer-events-none z-20">
                 <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-red-700/30 rounded-full border-2 border-red-700/60 text-red-300/90 opacity-70">
                     <FaTimes size={30} />
                 </div>
            </div>
             <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4 md:pr-8 pointer-events-none z-20">
                 <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-700/30 rounded-full border-2 border-green-700/70 text-green-300/90 opacity-70">
                     <FaCheck size={30} />
                 </div>
            </div>
        </div>
    );
};

// Helper component for displaying details with a golden theme
const DetailItemGolden = ({ value, icon = null }) => (
    <div className="w-full text-center">
        {/* Increased text size, adjusted background and text color for visibility */}
        <p className="text-base sm:text-lg md:text-xl text-amber-50 leading-snug break-words py-1.5 px-2 bg-black/20 rounded-lg shadow-md">
            {icon && <span className="mr-1.5 align-middle">{icon}</span>}
            {value || <span className="italic text-amber-200">Not Provided</span>}
        </p>
    </div>
);

export default BrowseTutorsPage;
