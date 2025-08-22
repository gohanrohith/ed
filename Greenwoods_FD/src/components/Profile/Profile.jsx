// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  // Define state to store user data from localStorage
  const [userData, setUserData] = useState(null);

  // Fetch user data from localStorage when the component mounts
    useEffect(() => {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userMobile = localStorage.getItem('userMobile');

    if (userId && userName && userEmail) {
      setUserData({
        userId,
        userName,
        userEmail,
        userMobile: userMobile || 'Not Provided', // Default to 'Not Provided' if mobile is missing
      });
    } else {
      // Handle case where user data is not available in localStorage
      console.error('No user data found in localStorage!');
    }
  }, []);

  return (
    <div>
      <h2>Profile Page</h2>

      {/* Display user information if available */}
      {userData ? (
        <div>
          <p><strong>User ID:</strong> {userData.userId}</p>
          <p><strong>Name:</strong> {userData.userName}</p>
          <p><strong>Email:</strong> {userData.userEmail}</p>
          <p><strong>Mobile:</strong> {userData.userMobile}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default Profile;
