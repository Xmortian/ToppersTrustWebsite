import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import Supabase client

// Icons
import { FaStar, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";

// --- Placeholder Data for Tutors ---
const initialTutorsDb = [
  { id: "TUT001", name: "Moutmayen Nafis", university: "BRAC University", grade: "3.4", department: "Computer Science & Engineering", location: "Moghbazar, Dhaka", rating: 5.00, sscInfo: "SSC Grade 5 - Ideal School and College", hscInfo: "HSC Grade 5 - Dhaka College", profileImageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-1@2x.png" },
  { id: "TUT002", name: "Taskia Maisha", university: "Dhaka University", grade: "3.8", department: "English Literature", location: "Gulshan, Dhaka", rating: 4.5, sscInfo: "SSC GPA 5.0 - Viqarunnisa Noon School", hscInfo: "HSC GPA 4.8 - Viqarunnisa Noon College", profileImageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-7@2x.png" },
  { id: "TUT003", name: "Arif Hossain", university: "Jahangirnagar University", grade: "3.9", department: "Mathematics", location: "Mirpur, Dhaka", rating: 4.9, sscInfo: "SSC GPA 5.0 - St. Joseph", hscInfo: "HSC GPA 5.0 - Notre Dame College", profileImageUrl: null },
  { id: "TUT004", name: "Sumaiya Islam", university: "NSU", grade: "3.7", department: "BBA", location: "Uttara, Dhaka", rating: 4.7, sscInfo: "SSC GPA 4.8 - Scholastica", hscInfo: "HSC GPA 4.5 - Mastermind", profileImageUrl: null },
  { id: "TUT005", name: "Rahim Ahmed", university: "BUET", grade: "3.6", department: "Mechanical Engineering", location: "Mohammadpur, Dhaka", rating: 4.6, sscInfo: "SSC GPA 5.0 - Govt. Laboratory", hscInfo: "HSC GPA 5.0 - Dhaka Residential", profileImageUrl: null },
];

const MAX_CARDS_IN_ROW = 5;

const TutorCard = () => {
    const navigate = useNavigate();
    const [allTutors, setAllTutors] = useState([]);
    const [currentBatch, setCurrentBatch] = useState([]);
    const [displayTutor, setDisplayTutor] = useState(null); // The single tutor currently on screen
    const [rejectedTutorIds, setRejectedTutorIds] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [showSelectedOverlay, setShowSelectedOverlay] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // --- Fetch Tutors Data ---
    useEffect(() => {
        const fetchTutors = async () => {
            setLoading(true); setError(null);
            // --- TODO: Implement actual Supabase fetching for tutors ---
            await new Promise(resolve => setTimeout(resolve, 500));
            const fetchedTutors = initialTutorsDb;
            setAllTutors(fetchedTutors);
            const initialBatch = fetchedTutors.slice(0, MAX_CARDS_IN_ROW);
            setCurrentBatch(initialBatch);
            if (initialBatch.length > 0) {
                setDisplayTutor(initialBatch[0]);
            } else {
                setDisplayTutor(null);
            }
            setLoading(false);
        };
        fetchTutors();
    }, []);

    // Check Auth Status Function
    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    };

    // Handle Rejecting a Tutor
    const handleReject = async (tutorToRejectId) => {
        const user = await checkAuth();
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }
        if (selectedTutor) return;

        if (!rejectedTutorIds.includes(tutorToRejectId)) {
            const newRejectedIds = [...rejectedTutorIds, tutorToRejectId];
            setRejectedTutorIds(newRejectedIds);

            if (newRejectedIds.length >= currentBatch.length - 1) {
                const remainingTutor = currentBatch.find(t => !newRejectedIds.includes(t.id));
                if (remainingTutor) {
                    setSelectedTutor(remainingTutor);
                    setShowSelectedOverlay(true);
                    console.log("Auto-selected tutor:", remainingTutor.name);
                    alert(`Tutor Selected: ${remainingTutor.name}`);
                    // --- TODO: API call to shortlist/select this tutor ---
                }
            } else {
                const currentDisplayIndexInBatch = currentBatch.findIndex(t => t.id === displayTutor.id);
                let nextIndex = currentDisplayIndexInBatch + 1;
                while(nextIndex < currentBatch.length && newRejectedIds.includes(currentBatch[nextIndex].id)){
                    nextIndex++;
                }
                if(nextIndex < currentBatch.length){
                    setDisplayTutor(currentBatch[nextIndex]);
                } else {
                     const remainingTutor = currentBatch.find(t => !newRejectedIds.includes(t.id));
                     if(remainingTutor) {
                        setSelectedTutor(remainingTutor);
                        setShowSelectedOverlay(true);
                        setDisplayTutor(remainingTutor);
                     }
                }
            }
        }
    };

    const handleLoginRedirect = () => {
        setShowLoginPrompt(false);
        navigate('/');
    };

    const tutorProfileImageFallback = (name) => `https://placehold.co/150x200/777777/FFF?text=${name ? name.split(' ').map(n=>n[0]).join('') : 'T'}`;

    if (loading) return <div className="flex justify-center items-center min-h-screen text-xl bg-[#302f40] text-gray-300">Loading Tutors...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-xl text-red-400 bg-[#302f40]">Error: {error}</div>;

    return (
        <div className={`w-full min-h-screen bg-[#302f40] flex flex-col items-center p-4 sm:p-6 overflow-x-auto`}>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-300 mb-8 mt-4 text-center">Select Your Tutor</h1>

            {/* Login Prompt Modal/Overlay */}
            {showLoginPrompt && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Login Required</h3>
                        <p className="text-sm text-gray-600 mb-4">You need to be logged in to select or reject tutors.</p>
                        <button onClick={handleLoginRedirect} className="w-full bg-[#6344cc] text-white py-2 px-4 rounded-md hover:bg-[#5238a8] transition-colors"> Go to Login / Sign Up </button>
                        <button onClick={() => setShowLoginPrompt(false)} className="mt-2 text-xs text-gray-500 hover:underline"> Dismiss </button>
                    </div>
                </div>
            )}

            {/* Row of Tutor Cards */}
            {currentBatch.length > 0 ? (
                <div className="flex flex-row justify-center items-start gap-4 md:gap-6 lg:gap-8 pb-8 flex-wrap">
                    {currentBatch.map((tutor) => {
                        const isRejected = rejectedTutorIds.includes(tutor.id);
                        const isSelected = selectedTutor && selectedTutor.id === tutor.id;

                        return (
                            <div
                                key={tutor.id}
                                className={`relative bg-[#2c2b38] text-white rounded-2xl shadow-xl p-4 w-64 sm:w-72 md:w-80 flex flex-col transition-all duration-300 ease-in-out
                                            ${isRejected ? 'opacity-20 transform scale-90' : 'opacity-100'}
                                            ${isSelected ? 'border-4 border-green-400 scale-105 shadow-2xl' : 'border-2 border-transparent'}
                                `}
                                style={{ minHeight: '480px' }} // Increased min-height for more content
                            >
                                {/* Main content flex container */}
                                <div className="flex flex-row flex-grow">
                                    {/* Left Column: Profile Image */}
                                    <div className="w-2/5 flex-shrink-0 flex items-start justify-center pt-2 pr-3"> {/* Added pt-2 */}
                                        <img
                                            src={tutor.profileImageUrl || tutorProfileImageFallback(tutor.name)}
                                            alt={tutor.name}
                                            className="w-full h-auto max-h-[180px] sm:max-h-[220px] object-cover rounded-lg shadow-md"
                                        />
                                    </div>

                                    {/* Right Column: Details */}
                                    <div className="w-3/5 flex flex-col justify-start pl-2 space-y-1.5"> {/* Use space-y for vertical spacing */}
                                        <h2 className="text-base sm:text-lg font-semibold text-center mb-1 text-gray-50 truncate">{tutor.name}</h2>
                                        <DetailItemFigma value={`${tutor.university} Grade : ${tutor.grade}`} />
                                        <DetailItemFigma value={tutor.department} />
                                        {/* Removed the central logo here */}
                                        <DetailItemFigma value={tutor.location} />
                                        <DetailItemFigma value={tutor.rating ? `Rating : ${tutor.rating.toFixed(2)} / 5.00` : 'Rating : N/A'} icon={<FaStar className="text-yellow-400 inline mr-1 text-[10px]" />} />
                                        <DetailItemFigma value={tutor.sscInfo} />
                                        <DetailItemFigma value={tutor.hscInfo} />
                                    </div>
                                </div>

                                {/* Reject Button at the bottom of the card */}
                                {!selectedTutor && !isRejected && (
                                    <div className="mt-auto pt-3 flex justify-center">
                                        <button
                                            onClick={() => handleReject(tutor.id)}
                                            className="p-2 bg-red-500/70 hover:bg-red-600/90 rounded-full text-white transition-colors"
                                            aria-label="Reject Tutor"
                                        >
                                            <FaTimes size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* SELECTED Overlay */}
                                {isSelected && showSelectedOverlay && (
                                     <div className="absolute inset-0 bg-green-600 bg-opacity-85 flex flex-col items-center justify-center rounded-2xl pointer-events-none z-10 p-2 text-center">
                                         <FaCheckCircle className="text-white text-5xl sm:text-6xl mb-2" />
                                         <span className="text-white text-2xl sm:text-3xl font-bold">SELECTED!</span>
                                     </div>
                                 )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                !loading && <p className="text-center text-gray-400 text-xl p-4">No tutors to display in this batch.</p>
            )}

            {selectedTutor && (
                 <div className="mt-8 text-center">
                    <p className="text-green-400 font-semibold text-lg">Tutor selection process complete!</p>
                    <p className="text-gray-300">Selected Tutor: {selectedTutor.name}</p>
                     <Link to="/guardian-dashboard" className="mt-4 inline-block px-6 py-2 bg-[#6344cc] text-white font-semibold rounded-lg shadow hover:bg-[#5238a8] transition-colors">
                        Back to Dashboard
                    </Link>
                 </div>
            )}
             {!selectedTutor && currentBatch.length > 0 && rejectedTutorIds.length === currentBatch.length && (
                <div className="mt-8 text-center text-yellow-400 font-semibold text-lg">
                    All tutors in this batch have been reviewed.
                </div>
            )}
        </div>
    );
};

// Helper component for displaying details in Figma style
const DetailItemFigma = ({ value, icon = null }) => (
    <div className="mb-1 text-center"> {/* Ensure items are centered if they wrap */}
        <p className="text-xs sm:text-sm text-gray-100 leading-snug break-words py-1 px-2 bg-white/10 rounded-md shadow"> {/* Brighter text, lighter bg */}
            {icon && <span className="mr-1">{icon}</span>}
            {value || <span className="italic text-gray-400">Not Provided</span>}
        </p>
    </div>
);

export default TutorCard;
