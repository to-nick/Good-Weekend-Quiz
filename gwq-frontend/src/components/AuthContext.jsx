import { createContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const storedUser = sessionStorage.getItem("user");

        if(token && storedUser){

            setUserDetails(JSON.parse(storedUser));
            setIsLoggedIn(true);
        } else {
            setUserDetails({})
            setIsLoggedIn(false);
        }
    }, []);

    const login = (token, user) => {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.removeItem("logoutMessage");
        setUserDetails(user)
        setIsLoggedIn(true);
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUserDetails({})
        setIsLoggedIn(false);
    };

    const handleExpiredJWT = (error) => {
        console.error("Fetch Error:", error)

        if(error.message.includes('JWT has expired')){
            sessionStorage.setItem("logoutMessage", "Your session has expired. Please log in again to continue.")
            logout();
            navigate('/');
        }
    }

    return (
        <AuthContext.Provider value={{ userDetails, isLoggedIn, login, logout, handleExpiredJWT}} >
            {children}
        </AuthContext.Provider>
    )
}
