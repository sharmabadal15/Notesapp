// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem('user');
//     return storedUser ? JSON.parse(storedUser) : null;
//   });
//   const [isLoggedIn, setIsLoggedIn] = useState(
//     localStorage.getItem('isLoggedIn') === 'true'
//   );

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);
  
//   const login = (userData) => {
//     setUser(userData); // Set user state to userData directly
//     setIsLoggedIn(true); // Update isLoggedIn state
//   };
  

//   // Function to clear user information (logout)
//   const logout = () => {
//     setUser(null); // Clear user state
//     setIsLoggedIn(false); // Update isLoggedIn state
//   };
//   useEffect(() => {
//     localStorage.setItem('user', JSON.stringify(user));
//   }, [user]);
  
//   useEffect(() => {
//     // Retrieve user information from localStorage on component mount
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);
//   useEffect(() => {
//     localStorage.setItem('isLoggedIn', isLoggedIn);
//   }, [isLoggedIn]);

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn,user, login, logout  }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);
  

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
