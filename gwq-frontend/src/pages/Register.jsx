import homeLogo from '../assets/images/home-image-removebg-preview.png';
import React, { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";

function Register (){

    const [formData, setFormData] = useState({name: '', email: '', password: ''});
    const [loginFailed, setLoginFailed] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [registrationOk, setRegistrationOk] = useState(false);
    const [registrationMessage, setRegistrationMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    

    const handleChange = (event) => {
        setFormData((prevData) =>({
            ...prevData,
            [event.target.name]: event.target.value
            }));
        }

        console.log(formData);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const backendHost = process.env.REACT_APP_BACKEND_HOST;
        try{
            const response = await fetch(`${backendHost}/users/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify(
                    formData)
            })

            const data = await response.json();
            

            if (!response.ok){
                setResponseMessage(data.message)
                setLoginFailed(true);
                throw new Error(data.message);
            } else if (response.ok){
                console.log(data);
                setRegistrationOk(true);
                setRegistrationMessage(data.message);
                setTimeout(() => {
                    navigate('/')
                }, 2000);
            }
        }catch (error){
            console.log("There was an error registering the user:", error.message)
        }
    }

    return(
        <div className="page-container">
            <div className="register-image-container">
                <img src={homeLogo} alt="The Good Weekend Quiz Logo" />
            </div>
            <div className='register-container'>
                <form onSubmit={handleSubmit}>
                <h1>Register</h1>
                <input
                    type="text"
                    name="name"
                    value={formData.name.charAt(0).toUpperCase() + formData.name.slice(1)}
                    onChange={handleChange}
                    placeholder="Name">
                </input>
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
                    type={showPassword ? "text" : "password"}
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
                
                {registrationOk ? <div className='registration-ok'><p>{registrationMessage}</p></div> : null}
                {loginFailed ? <div className="failed-registration"><p>{responseMessage}</p></div> : null}
                <button className='register-button' type='submit'>Register</button>
                <p className="link-to-signin">Already have an account? Please <Link to='/'>sign in.</Link></p>
                </form>
            </div>
        </div>
    )
}

export default Register;