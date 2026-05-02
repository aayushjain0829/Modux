import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Initialize username from localStorage or empty string
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('modux_username') || '';
    }
    return '';
  });

  // Initialize permanent userId from localStorage or generate new one
  const [userId, setUserId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('modux_user_id');
      if (storedId) {
        return storedId;
      }
      // Generate new ID and save to localStorage
      const newId = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('modux_user_id', newId);
      return newId;
    }
    return 'user_' + Math.random().toString(36).substring(2, 9);
  });

  // Persist username to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('modux_username', username);
    }
  }, [username]);

  const updateUsername = (newUsername) => {
    setUsername(newUsername);
  };

  const value = {
    username,
    userId,
    updateUsername,
    setUserId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
