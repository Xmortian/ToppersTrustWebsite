import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { supabase } from '../supabase.js'; // Keep commented if not using yet

// Placeholder Icons
import { FaSignOutAlt } from 'react-icons/fa';

// Placeholder data
const initialGuardianData = {
  name: "Moutmayen Nafis",
  guardianId: "123456",
  profileImageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-8@2x.png",
};

const recommendedTutorsData = [
  { id: 1, name: "Moutmayen Nafis", imageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-2@2x.png" },
  { id: 2, name: "Tahsin Sayed", imageUrl: "/image-15@2x.png" },
  { id: 3, name: "Taskia Maisha", imageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-7@2x.png" },
  { id: 4, name: "Nafisa Nahar", imageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-1@2x.png" },
  { id: 5, name: "Taskia Maisha", imageUrl: "/a38522fd8f3b402eb5da65d82ffc6e5e-5@2x.png" },
];


const Guardian = () => {
  const navigate = useNavigate();
  const [guardianData, setGuardianData] = useState(initialGuardianData);

  const handleSignOut = async () => {
    alert("Sign out functionality to be implemented.");
    // ... Supabase sign out logic ...
  };

  const profileImageFallback = "https://placehold.co/150x200/6344cc/FFF?text=" + (guardianData.name ? guardianData.name.split(' ').map(n=>n[0]).join('') : "G");
  const tutorImageFallback = () => `https://placehold.co/80x80/e0e0e0/7f7f7f?text=Photo`;

  return (
    <div className="min-h-screen bg-gray-100 font-roboto text-[#000] pb-24">
      {/* Header Section */}
      <header className="bg-[#3b394d] text-white p-6 shadow-md relative h-[14.875rem] flex items-center">
        <div className="container mx-auto flex justify-between items-center w-full">
          <div className="text-left text-[#e2c4c4]">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight">
              {guardianData.name.split(' ')[0]} <br />
              {guardianData.name.split(' ').slice(1).join(' ')}
            </h1>
          </div>
          <div className="absolute left-1/2 top-[5.5rem] transform -translate-x-1/2 z-10">
             <img
              src={guardianData.profileImageUrl}
              alt="Guardian Profile"
              onError={(e) => { e.target.onerror = null; e.target.src = profileImageFallback; }}
              className="w-[9rem] h-[12rem] sm:w-[10rem] sm:h-[14rem] md:w-[12rem] md:h-[16rem] rounded-[60px] border-4 border-white shadow-lg object-cover"
            />
          </div>
          <div className="text-right">
            <p className="text-base sm:text-lg text-gray-300 mb-1">Guardian ID</p>
            <p className="text-5xl sm:text-6xl md:text-7xl font-semibold">{guardianData.guardianId}</p>
            <button
              onClick={handleSignOut}
              className="mt-3 text-sm text-gray-300 hover:text-white transition-colors flex items-center ml-auto"
            >
              <FaSignOutAlt className="mr-1" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Buttons Section */}
      <section className="relative py-8 px-4 pt-40 sm:pt-44 md:pt-52">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 relative z-10">
          {[
            { name: "Profile", path: "/guardian/profile", bgColor: "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500" },
            { name: "Short List", path: "/tutor-card", bgColor: "bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600" }, // "Short List" -> /tutor-card (Sequential Reject UI)
            { name: "Post Job", path: "/guardian/post-job", bgColor: "bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700" },
            { name: "Previous Jobs", path: "/guardian/previous-jobs", bgColor: "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500" },
          ].map((button) => (
            <Link
              key={button.name}
              to={button.path}
              className={`p-10 md:p-12 min-h-[10rem] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center text-gray-800 font-semibold text-xl md:text-2xl ${button.bgColor}`}
            >
              <span>{button.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Tutors Section */}
      <section className="pt-8 pb-12 px-4 mt-16 md:mt-24 lg:mt-32">
        <div className="container mx-auto">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Recommended Tutors</h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-5">
            {recommendedTutorsData.map((tutor) => (
              <Link
                key={tutor.id}
                to="/browse-tutors" // "Recommended Tutors" links -> /browse-tutors (Tinder-style swipe)
                className="block bg-white p-1.5 rounded-md shadow hover:shadow-md transition-transform transform hover:scale-105 text-center group"
              >
                <img
                  src={tutor.imageUrl || tutorImageFallback()}
                  alt={tutor.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = tutorImageFallback(); }}
                  className="w-full h-16 sm:h-20 object-cover rounded-sm mb-1.5 mx-auto"
                />
                <h4 className="text-[10px] sm:text-xs font-medium text-gray-600 group-hover:text-blue-600 truncate px-1">{tutor.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Guardian;
