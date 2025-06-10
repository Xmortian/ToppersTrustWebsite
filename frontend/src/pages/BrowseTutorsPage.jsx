import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { supabase } from '../supabase.js'; // Import Supabase client

// Icons
import { FaStar, FaTimes, FaCheck, FaExclamationTriangle, FaBriefcase, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import { IoClose, IoCheckmark } from "react-icons/io5";

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { const options = { year: 'numeric', month: 'short', day: 'numeric' }; return new Date(dateString).toLocaleDateString('en-US', options); }
    catch (e) { return dateString; }
};

// --- FIX: Added a 'transparent' prop to conditionally remove the background ---
const DetailItemGolden = ({ value, icon = null, transparent = false }) => (
    <div className="w-full text-center overflow-hidden">
        {/* Reverted to original, larger font and padding */}
        <p className={`text-base sm:text-lg md:text-xl text-amber-50 leading-snug break-words py-1.5 px-2 ${!transparent ? 'bg-black/20 rounded-lg shadow-md' : ''}`}>
            {icon && <span className="mr-1.5 align-middle">{icon}</span>}
            {value || <span className="italic text-amber-200">Not Provided</span>}
        </p>
    </div>
);

const FifaCardShell = ({ tutor, fallbackImage }) => {
    return (
        <>
<style>{`
    .card-aspect-ratio-box {
        position: relative;
        width: 88%;
        margin: 0 auto;
        height: 0;
        padding-bottom: 170%; /* increased from 155.56% for extra height */
        background-image: url('/tt-card2.png');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        user-select: none;
    }
    .card-content-shell {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        padding: 1.25rem 0.75rem; /* slightly reduced padding */
        font-family: 'Saira Semi Condensed', sans-serif;
    }
`}</style>


            <div className="card-aspect-ratio-box">
                <div className="card-content-shell">
                    {/* Reverted to original, larger image size and spacing */}
                    <div className="flex flex-col items-center pt-2 pb-4 flex-shrink-0">
                        <img
                            src={tutor.profileImageUrl || fallbackImage(tutor.name)}
                            alt={tutor.name}
    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-amber-200 shadow-lg"
                            onError={(e) => { e.target.src = fallbackImage(tutor.name); }}
                        />
                    </div>
                    
                    {/* Reverted to original spacing */ }
                    <div className="flex-grow flex flex-col justify-center items-center text-center space-y-2 px-1 overflow-hidden">
                        {/* Reverted to original font size */}
                        <h2 className="w-full text-2xl sm:text-3xl font-bold text-white mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{tutor.name}</h2>
                        <DetailItemGolden value={`${tutor.university}`} />
                        <DetailItemGolden value={`${tutor.department} -- GPA  ${tutor.grade}`} />
                        <DetailItemGolden value={tutor.location} />
                        <DetailItemGolden 
                            value={tutor.expectedSalary ? `Min. Expected Salary : ${tutor.expectedSalary} BDT` : 'Salary: Negotiable'} 
                            icon={<FaMoneyBillWave className="text-green-300 inline mr-1.5 text-sm" />} 
                        />
                        <DetailItemGolden 
                            value={tutor.availableTime || 'Time: Not Specified'} 
                            icon={<FaClock className="text-blue-300 inline mr-1.5 text-sm" />} 
                        />
                        <DetailItemGolden value={tutor.rating ? `Rating : ${tutor.rating.toFixed(2)} / 5.00` : 'Rating : N/A'} icon={<FaStar className="text-yellow-200 inline mr-1 text-base" />} />
                        <DetailItemGolden value={tutor.sscInfo} />
                        <DetailItemGolden value={tutor.hscInfo} />
                        {/* --- FIX: Added the 'transparent' prop here to remove the background --- */}
                        <DetailItemGolden
                            transparent={true}
                            value={tutor.experience_years != null ? `Experience: ${tutor.experience_years} year${tutor.experience_years !== 1 ? 's' : ''}` : 'Experience: N/A'}
                            icon={<FaBriefcase className="text-amber-100 inline mr-1.5 text-sm" />}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};


const BrowseTutorsPage = () => {
    const navigate = useNavigate();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeFeedback, setSwipeFeedback] = useState(null);
    const [uiFeedbackMessage, setUiFeedbackMessage] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentGuardianDbId, setCurrentGuardianDbId] = useState(null);
    const [showAcceptConfirmModal, setShowAcceptConfirmModal] = useState(false);
    const [tutorToConfirm, setTutorToConfirm] = useState(null);
    const [pendingSwipeAction, setPendingSwipeAction] = useState(null);

    const swipeSoundRef = useRef(null);

    const childRefs = useMemo(() =>
        Array(tutors.length)
            .fill(0)
            .map(() => React.createRef()),
        [tutors.length]
    );

    useEffect(() => {
        swipeSoundRef.current = new Audio('/Right Swipe Sound.mp3');
    }, []);

    const playSwipeSound = () => {
        if (swipeSoundRef.current) {
            swipeSoundRef.current.play().catch(error => console.error("Error playing sound:", error));
        }
    };

    useEffect(() => {
        if (tutors.length > 0) {
            setCurrentIndex(tutors.length - 1);
        } else {
            setCurrentIndex(0);
        }
    }, [tutors]);

    useEffect(() => {
        const fetchCurrentGuardianDbId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                try {
                    const { data: guardianProfile, error: profileError } = await supabase
                        .from('guardian')
                        .select('id')
                        .eq('user_id', user.id)
                        .single();

                    if (profileError) {
                        if (profileError.code !== 'PGRST116') { setError("Could not retrieve your guardian profile information."); }
                        else { setError("Guardian profile not found. Please complete your profile to accept tutors."); }
                    } else if (guardianProfile) {
                        setCurrentGuardianDbId(guardianProfile.id);
                    } else {
                        setError("Guardian profile not found. Please complete your profile to accept tutors.");
                    }
                } catch (e) {
                    setError("An error occurred while fetching your profile.");
                }
            }
        };
        fetchCurrentGuardianDbId();
    }, []);

    useEffect(() => {
        const initFetch = async () => {
            const fetchRecommendedTutors = async () => {
                setLoading(true);
                setError(null);
                setTutors([]);
                try {
                    let alreadyAcceptedTutorIds = new Set();
                    if (currentGuardianDbId) {
                        const { data: acceptedData, error: acceptedError } = await supabase
                            .from('recc_tutors_accepted').select('tutor_id').eq('guardian_id', currentGuardianDbId);
                        if (acceptedError) { console.error("Error fetching already accepted tutors:", acceptedError); }
                        else if (acceptedData) { acceptedData.forEach(item => alreadyAcceptedTutorIds.add(item.tutor_id)); }
                    }

                    const { data: recommendedData, error: recError } = await supabase.from('recommendedtutors').select('id2');
                    if (recError) throw recError;
                    if (!recommendedData || recommendedData.length === 0) { setTutors([]); setLoading(false); return; }

                    const recommendedTutorIntIDs = recommendedData.map(r => r.id2).filter(id => id != null);
                    if (recommendedTutorIntIDs.length === 0) { setTutors([]); setLoading(false); return; }

                    const { data: tutorsDetails, error: fetchError } = await supabase
                        .from('tutor_card')
                        .select('id, name, uni, uni_grade, qualification, preferred_areas, rating, ssc_grade, ssc_school, hsc_grade, hsc_school, photo, experience_years, expected_salary, available_time')
                        .in('id', recommendedTutorIntIDs)
                        .order('rating', { ascending: false, nullsFirst: false });
                    if (fetchError) throw fetchError;

                    const filteredTutors = tutorsDetails.filter(tutor => !alreadyAcceptedTutorIds.has(tutor.id));

                    const mappedTutors = filteredTutors.map(tutor => {
                        let imageUrl = null;
                        if (tutor.photo) {
                            const { data: publicUrlData } = supabase.storage.from('photo').getPublicUrl(tutor.photo);
                            imageUrl = publicUrlData.publicUrl;
                        }
                        return {
                            id: tutor.id,
                            name: tutor.name || 'N/A', 
                            university: tutor.uni || 'N/A',
                            grade: tutor.uni_grade || 'N/A', 
                            department: tutor.qualification || 'N/A',
                            location: Array.isArray(tutor.preferred_areas) ? tutor.preferred_areas.join(', ') : (tutor.preferred_areas || 'Not specified'),
                            rating: tutor.rating ? parseFloat(tutor.rating) : null,
                            sscInfo: `SSC Grade: ${tutor.ssc_grade || 'N/A'}`, 
                            hscInfo: `HSC Grade: ${tutor.hsc_grade || 'N/A'}`,
                            profileImageUrl: imageUrl, 
                            experience_years: tutor.experience_years,
                            expectedSalary: tutor.expected_salary,
                            availableTime: tutor.available_time,
                        };
                    });
                    setTutors(mappedTutors);
                } catch (err) {
                    setError(err.message || 'Failed to fetch recommended tutors.');
                } finally { setLoading(false); }
            };

            const user = await checkAuth();
            if (currentGuardianDbId !== null || !user) { fetchRecommendedTutors(); }
            else { setLoading(false); }
        };

        initFetch();
    }, [currentGuardianDbId]);


    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    };

    const handleAcceptAction = (tutor, index, actionType) => {
        setTutorToConfirm(tutor);
        setPendingSwipeAction({ direction: 'right', tutorId: tutor.id, tutorName: tutor.name, index, actionType });
        setShowAcceptConfirmModal(true);
    };

    const swiped = async (direction, tutorId, tutorName, index) => {
        setSwipeFeedback(null);
        setUiFeedbackMessage(null);
        if (direction === 'right' && showAcceptConfirmModal) { return; }
        const user = await checkAuth();
        if (!user) { setShowLoginPrompt(true); childRefs[index]?.current?.restoreCard(); return; }
        if (!currentGuardianDbId) { setError("Your profile could not be identified. Please complete your profile or re-login."); childRefs[index]?.current?.restoreCard(); return; }

        setCurrentIndex(prevIndex => prevIndex - 1);

        if (direction === 'right') {
            const swipedTutor = tutors.find(t => t.id === tutorId);
            if (swipedTutor) { handleAcceptAction(swipedTutor, index, 'swipe'); }
        } else if (direction === 'left') {
            setSwipeFeedback('left');
            setTimeout(() => setSwipeFeedback(null), 700);
        }
    };

    const triggerSwipe = async (dir) => {
        const user = await checkAuth();
        if (!user) { setShowLoginPrompt(true); return; }
        if (!currentGuardianDbId) { setError("Your profile could not be identified. Please complete your profile or re-login."); return; }

        if (currentIndex >= 0 && currentIndex < tutors.length) {
            const tutorForAction = tutors[currentIndex];
            if (dir === 'right') { handleAcceptAction(tutorForAction, currentIndex, 'button'); }
            else { childRefs[currentIndex]?.current?.swipe('left'); }
        }
    };

    const confirmAcceptTutor = async () => {
        if (!pendingSwipeAction || !currentGuardianDbId || !tutorToConfirm) return;
        const { tutorId, tutorName, index, actionType } = pendingSwipeAction;
        setShowAcceptConfirmModal(false);

        playSwipeSound();

        setSwipeFeedback('right');
        setTimeout(() => setSwipeFeedback(null), 700);
        setUiFeedbackMessage({ type: 'success', text: `${tutorName} has been added to your accepted list!` });
        setTimeout(() => setUiFeedbackMessage(null), 2000);
        try {
            const { error: acceptError } = await supabase.from('recc_tutors_accepted').insert({ guardian_id: currentGuardianDbId, tutor_id: tutorId, accepted_status: true });
            if (acceptError) { setError(`Failed to save choice: ${acceptError.message}`); }
            else { setTutors(prevTutors => prevTutors.filter(t => t.id !== tutorId)); }
        } catch (e) { setError("An unexpected error occurred while saving your choice."); }
        if (actionType === 'button') { childRefs[index]?.current?.swipe('right'); }
        setPendingSwipeAction(null);
        setTutorToConfirm(null);
    };

    const cancelAcceptTutor = () => {
        setShowAcceptConfirmModal(false);
        setPendingSwipeAction(null);
        setTutorToConfirm(null);
    };

    const outOfFrame = (tutorId, tutorName, index) => { console.log(`${tutorName} (ID: ${tutorId}) at index ${index} left the screen!`); };
    const handleLoginRedirect = () => { setShowLoginPrompt(false); navigate('/'); };
    const tutorProfileImageFallback = (name) => `https://placehold.co/150x150/B8860B/FFFFFF?text=${name ? name.split(' ').map(n => n[0]).join('') : 'T'}`;

    if (loading) return <div className="flex justify-center items-center min-h-screen text-xl bg-slate-800 text-gray-300">Loading Tutors...</div>;
    if (error && !showLoginPrompt && !showAcceptConfirmModal) { return <div className="flex justify-center items-center min-h-screen text-xl text-red-400 bg-slate-800 p-4 text-center">Error: {error}</div>; }

    return (
        <div className={`w-full min-h-screen bg-slate-800 flex flex-col justify-center items-center p-4 overflow-hidden`}>

            <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-6 sm:mb-8 text-center">Recommended Tutors from Toppers Trust</h1>

            {showLoginPrompt && (<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4"> <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm"> <h3 className="text-lg font-semibold mb-3 text-gray-800">Login Required</h3> <p className="text-sm text-gray-600 mb-4">You need to be logged in to select tutors.</p> <button onClick={handleLoginRedirect} className="w-full bg-[#6344cc] text-white py-2 px-4 rounded-md hover:bg-[#5238a8] transition-colors"> Go to Login / Sign Up </button> <button onClick={() => setShowLoginPrompt(false)} className="mt-2 text-xs text-gray-500 hover:underline"> Dismiss </button> </div> </div>)}
            {showAcceptConfirmModal && tutorToConfirm && (<div className="fixed inset-0 bg-purple bg-opacity-75 flex items-center justify-center z-[100] p-4"> <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-gray-800"> <div className="flex items-start mb-3"> <FaExclamationTriangle className="text-yellow-500 text-2xl mr-3 mt-1 flex-shrink-0" /> <h3 className="text-xl font-semibold">Confirmation!!!</h3> </div> <p className="text-sm text-gray-700 mb-2"> You're expressing interest in SuperTutor: <strong className="text-[#6344cc]">{tutorToConfirm.name}</strong>. </p> <p className="text-sm text-gray-600 mb-6"> We’ll reach out to the tutor and let them know you’re interested in hiring them. Are you sure you wish to proceed? </p> <div className="flex justify-end gap-3"> <button onClick={cancelAcceptTutor} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white-200 hover:bg-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400" > No, Not Now </button> <button onClick={confirmAcceptTutor} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" > Yes, Select Tutor </button> </div> </div> </div>)}
            {uiFeedbackMessage && (<div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[110] p-3 rounded-md shadow-lg text-white text-sm ${uiFeedbackMessage.type === 'error' ? 'bg-red-600' : 'bg-green-600'} transition-all duration-300 ease-out opacity-100 translate-y-0`}> {uiFeedbackMessage.text} </div>)}
            
            {/* --- FIX: Main container for card and buttons --- */}
            <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
                {/* Card Stacking Area */}
                <div className="w-full relative">
                    {/* Ghost element for sizing the container correctly based on aspect ratio */}
                    <div style={{ paddingBottom: '155.56%' }} /> 

                    {/* The actual cards, positioned absolutely to fill the sized container */}
                    {tutors.length > 0 ? (
                        tutors.map((tutor, index) => (
                            <TinderCard
                                ref={childRefs[index]}
                                className='absolute inset-0'
                                key={tutor.id}
                                onSwipe={(dir) => swiped(dir, tutor.id, tutor.name, index)}
                                onCardLeftScreen={() => outOfFrame(tutor.id, tutor.name, index)}
                                preventSwipe={['up', 'down']}
                                swipeRequirementType="position"
                                swipeThreshold={80}
                            >
                                <FifaCardShell tutor={tutor} fallbackImage={tutorProfileImageFallback} />
                            </TinderCard>
                        ))
                    ) : (
                        !loading &&
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-gray-400 text-xl p-4 bg-slate-700/80 rounded-2xl">
                            <span className="font-semibold">No recommended tutors available right now.</span>
                            <span className="text-base mt-2">Please check back later!</span>
                        </div>
                    )}
                </div>

                {/* Buttons Container now sits safely below the card area */}
                {tutors.length > 0 && currentIndex >= 0 && (
                    <div className="flex justify-around w-full mt-6">
                        <div className="flex flex-col items-center">
                            <button onClick={() => triggerSwipe('left')} className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-700/30 rounded-full border-2 border-red-700/60 text-red-300/90 hover:bg-red-700/40 active:bg-red-700/50 transition-colors shadow-lg" aria-label="Decline" > <IoClose size={30} className="opacity-90" /> </button>
                            <span className="mt-2 text-sm font-semibold text-red-400">REJECT</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <button onClick={() => triggerSwipe('right')} className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-700/30 rounded-full border-2 border-green-700/70 text-green-300/90 hover:bg-green-700/40 active:bg-green-700/50 transition-colors shadow-lg" aria-label="Accept" > <IoCheckmark size={30} className="opacity-90" /> </button>
                            <span className="mt-2 text-sm font-semibold text-green-400">ACCEPT</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseTutorsPage;

