import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';

function Navbar(){

    const [navIsActive, setNavIsActive] = useState(false);

    const { isLoggedIn, logout } = useContext(AuthContext);

    const activateHamburgerMenu = () => {
        if(navIsActive === false){
            setNavIsActive(true)
        } else if(navIsActive === true){
            setNavIsActive(false)
        }
    }

    return(
        <nav className="navbar">
            <h2><Link className="nav-logo" to="/profile">GWQ</Link></h2>
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