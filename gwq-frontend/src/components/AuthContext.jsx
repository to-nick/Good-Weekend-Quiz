import { createContext, useState, useEffect } from "react";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [loading, setLoading] = useState(true);

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

        setLoading(false);
    }, []);

    const login = (token, user) => {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user))
        setUserDetails(user)
        setIsLoggedIn(true);
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUserDetails({})
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ userDetails, isLoggedIn, login, logout}} >
            {children}
        </AuthContext.Provider>
    )
}
