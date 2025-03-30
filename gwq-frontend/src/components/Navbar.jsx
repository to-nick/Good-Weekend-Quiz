import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import Logo from '../assets/images/q-high-resolution-logo-removebg-preview.png';

//Navbar component
function Navbar(){
    const [navIsActive, setNavIsActive] = useState(false);
    const { isLoggedIn, logout } = useContext(AuthContext);

    //To expand and collapse the nav menu on smaller screens
    const activateHamburgerMenu = () => {
        setNavIsActive(prevState => !prevState)
    }

    return(
        <nav className="navbar">
            <Link to="/profile"><img alt="GWQ Logo" className="nav-logo" src={Logo}></img></Link>
            <ul onClick={activateHamburgerMenu} className={`nav-items ${navIsActive ? "active" : ""}`}>
                { isLoggedIn ? 
                <>
                <li><Link to="/submit">Submit Score</Link></li>
                <li><Link to="/leaderboard">Leaderboard</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link onClick={logout} to="/">Logout</Link></li>
                </>
                :
                <>
                <li><Link to="/">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                </>
                }
            </ul>
            <div onClick={activateHamburgerMenu} className={`hamburger ${navIsActive ? "active" : ""}`}>
                <span className='bar'></span>
                <span className='bar'></span>
                <span className='bar'></span>
            </div>
        </nav>
    )
}

export default Navbar;