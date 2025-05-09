import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import if needed for fetching data/posting feedback

// Example Icons from react-icons
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaBook, FaMapMarkerAlt, FaCreditCard, FaCommentDots, FaPaperPlane, FaStar } from 'react-icons/fa'; // Added FaStar

// --- Placeholder Data ---
// Replace this with actual data fetching from Supabase
const placeholderJobs = [
  {
    id: 1,
    title: "Need Math Tutor for Class 8 Student 3 Days/Week",
    code: "0001",
    daysPerWeek: "3",
    noOfStudents: "1",
    salary: "5000",
    subjects: ["Mathematics", "Physics"],
    location: "Banasree, Dhaka",
    paymentBasis: "Monthly",
    postedDate: "2025-05-01",
    assignedTutorName: "Taskia Maisha",
    assignedTutorId: "TUT456", // Added example tutor ID
  },
  {
    id: 2,
    title: "Need English Tutor for Class 10 Student 5 Days/Week",
    code: "0002",
    daysPerWeek: "5",
    noOfStudents: "1",
    salary: "8000",
    subjects: ["English"],
    location: "Gulshan, Dhaka",
    paymentBasis: "Monthly",
    postedDate: "2025-04-20",
    assignedTutorName: null,
    assignedTutorId: null,
  },
   {
    id: 3,
    title: "Need Physics Tutor for Class 12 Student 4 Days/Week",
    code: "0003",
    daysPerWeek: "4",
    noOfStudents: "1",
    salary: "10000",
    subjects: ["Physics", "Higher Mathematics"],
    location: "Dhanmondi, Dhaka",
    paymentBasis: "Monthly",
    postedDate: "2025-04-15",
    assignedTutorName: "Nafisa Nahar",
    assignedTutorId: "TUT789", // Added example tutor ID
  },
];

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
        return dateString; // Return original if formatting fails
    }
};

// Simple Star Rating Component
const StarRating = ({ rating, onRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`cursor-pointer transition-colors ${
            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRating(star)} // Call the passed function to update state
          size={20} // Adjust size as needed
        />
      ))}
       {rating > 0 && (
            <span className="text-xs text-gray-500 ml-2">({rating}/5)</span>
       )}
    </div>
  );
};


const PostedJob = () => {
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to manage feedback visibility, text, and rating for each job
  const [feedbackState, setFeedbackState] = useState({});

  // --- TODO: Fetch Posted Jobs Data ---
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      // Example Fetching Logic (Keep commented or implement)
      // ... (fetch logic as before) ...

      // Using placeholder data for now:
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      setPostedJobs(placeholderJobs);
       // Initialize feedback state for placeholder jobs
      const initialFeedbackState = {};
      placeholderJobs.forEach(job => {
          // Initialize with showInput: false, empty text, and rating 0
          initialFeedbackState[job.id] = { showInput: false, feedbackText: '', rating: 0 };
      });
      setFeedbackState(initialFeedbackState);


      setLoading(false);
    };

    fetchJobs();
  }, [/* navigate */]);

  // Toggle feedback input visibility for a specific job
  const toggleFeedbackInput = (jobId) => {
    setFeedbackState(prev => ({
        ...prev,
        [jobId]: {
            ...prev[jobId],
            showInput: !prev[jobId]?.showInput
            // Keep existing text/rating when toggling
        }
    }));
  };

  // Handle feedback text change for a specific job
  const handleFeedbackChange = (jobId, text) => {
     setFeedbackState(prev => ({
        ...prev,
        [jobId]: {
            ...prev[jobId],
            feedbackText: text
        }
    }));
  };

  // Handle rating change for a specific job
   const handleRatingChange = (jobId, newRating) => {
     setFeedbackState(prev => ({
        ...prev,
        [jobId]: {
            ...prev[jobId],
            rating: newRating
        }
    }));
  };

  // Handle submitting feedback for a specific job
  const submitFeedback = async (jobId) => {
    const currentFeedback = feedbackState[jobId];
    const feedbackText = currentFeedback?.feedbackText;
    const rating = currentFeedback?.rating;

    if (!rating || rating === 0) {
        alert("Please select a star rating (1-5).");
        return;
    }
    // Optional: Make feedback text required as well?
    // if (!feedbackText || feedbackText.trim() === '') {
    //     alert("Please enter your feedback or complaint.");
    //     return;
    // }

    console.log(`Submitting feedback for Job ID ${jobId}: Rating=${rating}, Text=${feedbackText}`);
    // --- TODO: Implement Supabase insert logic for feedback ---
    // Include both rating and feedback_text in your insert call
    // Example:
    // const { data: { user } } = await supabase.auth.getUser();
    // if (user) {
    //    const { error } = await supabase
    //      .from('job_feedback') // Your feedback table name
    //      .insert({
    //          job_posting_id: jobId,
    //          guardian_user_id: user.id,
    //          assigned_tutor_id: fetched_tutor_id, // You need the assigned tutor's ID here
    //          rating: rating, // Save the rating
    //          feedback_text: feedbackText,
    //          // submitted_at: new Date()
    //      });
    //     if (error) {
    //         alert(`Error submitting feedback: ${error.message}`);
    //     } else {
    //         alert("Feedback submitted successfully!");
    //         // Reset the feedback state for this job
    //         setFeedbackState(prev => ({
    //             ...prev,
    //             [jobId]: { showInput: false, feedbackText: '', rating: 0 }
    //         }));
    //     }
    // } else {
    //     alert("You need to be logged in to submit feedback.");
    // }
    // --- End Supabase Insert Logic ---

     // Placeholder success:
     alert("Feedback submitted successfully! (Placeholder)");
     setFeedbackState(prev => ({
         ...prev,
         [jobId]: { showInput: false, feedbackText: '', rating: 0 } // Reset rating too
     }));
  };


  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-roboto">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">My Posted Jobs</h1>

        {loading && <div className="text-center text-gray-600">Loading jobs...</div>}
        {error && <div className="text-center text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="space-y-6">
            {postedJobs.length === 0 ? (
              <p className="text-center text-gray-500">You haven't posted any jobs yet.</p>
            ) : (
              postedJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Assigned Tutor Header */}
                  <div className="bg-gray-200 px-4 py-3 text-center border-b border-gray-300">
                    <span className="text-base font-semibold text-gray-700">Assigned Tutor : </span>
                    <span className={`text-base font-bold ${ job.assignedTutorName ? 'text-green-600' : 'text-red-600' }`}>
                      {job.assignedTutorName || "NO ONE"}
                    </span>
                  </div>

                  {/* Job Card Content */}
                  <div className="bg-[#3b394d] text-white p-5 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 leading-tight">{job.title}</h2>
                    <div className="flex justify-between items-center text-xs text-gray-300 mb-4">
                      <span>Code : {job.code}</span>
                      <span>Posted Date : {formatDate(job.postedDate)}</span>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="flex items-center gap-2"> <FaCalendarAlt className="text-gray-400" /> <span>Days / Week: <strong className="text-gray-100">{job.daysPerWeek}</strong></span> </div>
                      <div className="flex items-center gap-2"> <FaUsers className="text-gray-400" /> <span>No. of Students: <strong className="text-gray-100">{job.noOfStudents}</strong></span> </div>
                      <div className="flex items-center gap-2"> <FaMoneyBillWave className="text-gray-400" /> <span>Salary: <strong className="text-gray-100">{job.salary ? `BDT ${job.salary}` : 'N/A'}</strong></span> </div>
                      <div className="flex items-start gap-2"> <FaBook className="text-gray-400 mt-0.5 flex-shrink-0" /> <span>Subjects: <strong className="text-gray-100">{Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects}</strong></span> </div>
                      <div className="flex items-start gap-2"> <FaMapMarkerAlt className="text-gray-400 mt-0.5 flex-shrink-0" /> <span>Location: <strong className="text-gray-100">{job.location}</strong></span> </div>
                      <div className="flex items-center gap-2"> <FaCreditCard className="text-gray-400" /> <span>Payment Basis: <strong className="text-gray-100">{job.paymentBasis}</strong></span> </div>
                    </div>
                  </div>

                  {/* Feedback/Complain Section - Conditional Rendering */}
                  {job.assignedTutorName && ( // Only show if tutor is assigned
                    <div className="bg-[#e1e3f0] px-4 py-3"> {/* Slightly different background for feedback area */}
                        {!feedbackState[job.id]?.showInput ? (
                             // Button to show the input field
                            <button
                                onClick={() => toggleFeedbackInput(job.id)}
                                className="w-full text-center text-sm font-semibold text-[#3b394d] hover:text-black cursor-pointer"
                            >
                                Leave Feedback or Complaint
                            </button>
                        ) : (
                             // Feedback input field, rating, and submit button
                            <div className="space-y-3">
                                {/* Star Rating Component */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Rate Tutor (1-5 Stars):</label>
                                    <StarRating
                                        rating={feedbackState[job.id]?.rating || 0}
                                        onRating={(newRating) => handleRatingChange(job.id, newRating)}
                                    />
                                </div>
                                {/* Feedback Text Area */}
                                <div>
                                    <label htmlFor={`feedback-${job.id}`} className="block text-xs font-medium text-gray-700 mb-1">Feedback/Complaint:</label>
                                    <textarea
                                        id={`feedback-${job.id}`}
                                        rows="3"
                                        placeholder={`Enter your feedback or complaint regarding ${job.assignedTutorName}... (optional)`}
                                        value={feedbackState[job.id]?.feedbackText || ''}
                                        onChange={(e) => handleFeedbackChange(job.id, e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#6344cc] focus:outline-none"
                                    ></textarea>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2">
                                     <button
                                        onClick={() => toggleFeedbackInput(job.id)} // Button to hide the input
                                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                     >
                                        Cancel
                                     </button>
                                     <button
                                        onClick={() => submitFeedback(job.id)}
                                        className="flex items-center gap-1 px-3 py-1 bg-[#6344cc] text-white text-xs font-medium rounded hover:bg-[#5238a8]"
                                     >
                                         <FaPaperPlane size={10}/> Submit Feedback
                                     </button>
                                </div>
                            </div>
                        )}
                    </div>
                  )}
                  {/* If no assigned tutor, this section is completely hidden */}

                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostedJob;
