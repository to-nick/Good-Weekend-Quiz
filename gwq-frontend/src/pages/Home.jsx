import homeLogo from '../assets/images/home-image-removebg-preview.png';
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import { Eye, EyeOff } from "lucide-react";
import Spinner from '../components/LoadingSpinner';

function Home (){

    const [formData, setFormData] = useState({email: '', password: ''});
    const [loginFailed, setLoginFailed] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const message = sessionStorage.getItem("logoutMessage");
        
        if(message){
            setLogoutMessage(message);
        }
    }, [])


    const handleChange = (event) => {
        setFormData((prevData) =>({
            ...prevData,
            [event.target.name]: event.target.value
            }));
        }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const backendHost = process.env.REACT_APP_BACKEND_HOST;
        try{
            const response = await fetch(`${backendHost}/users/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(
                formData)
            })

            const data = await response.json();
            console.log(data);
            const token = data.token;

            const userDetails = {name: data.name, email: data.email, id: data.id};


            if (!response.ok){
                setResponseMessage(data.message)
                setLoginFailed(true);
                throw new Error (data.message);
            } else if (response.ok){
                login(token, userDetails);
                navigate('/profile');

            }
        } catch (error){
            console.log('There was an error logging in:', error.message)
        }
        setLoading(false);
    }


    return(
        <div className="page-container">
            {logoutMessage ? <p className='session-expired-message'>{logoutMessage}</p> : null}
            <div className="home-image-container">
                <img src={homeLogo} alt="The Good Weekend Quiz Logo" />
            </div>
            <div className='login-container'>
                <form onSubmit={handleSubmit}>
                <h1>Login</h1>
                <input 
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Email'
                >
                </input>
                <div className='password-wrapper'>
                    <input 
                        type= {showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        placeholder='Password' 
                        onChange={handleChange}
                    ></input>
                    <button
                        className='show-password-icon'
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? <Eye className="eye" size={35} /> : <EyeOff className="eye-off" size={35}/>}
                    </button>
                </div>
                {loading ? <Spinner /> : null}
                {loginFailed ? <div className="failed-login"><p>{responseMessage}</p></div> : null}
                <button className='login-button' type='submit'>Login</button>
                <p className='link-to-register'>Don't have an account? Please <Link to='/register'>register.</Link></p>
                </form>
            </div>
        </div>
    )
}

export default Home;