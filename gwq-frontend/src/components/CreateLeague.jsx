import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import Spinner from '../components/LoadingSpinner';


function CreateLeague () {

    const [leagueDetails, setLeagueDetails] = useState({leagueName: '', createdBy: ''})
    const [leagueID, setLeagueID] = useState(null);
    const [creationfailed, setCreationFailed] = useState(false);
    const [leagueFailMessage, setLeagueFailMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const token = sessionStorage.getItem("token");

    const { userDetails, handleExpiredJWT } = useContext(AuthContext);

    useEffect(() => {
        if(userDetails.id){
            setLeagueDetails((prevDetails) => ({
                ...prevDetails, createdBy: userDetails.id
                })
            )
        }
    }, [userDetails])


    const handleChange = (event) => {
        setLeagueDetails((prevDetails) => ({
            ...prevDetails,
            [event.target.name]: event.target.value}))
    }

    console.log(leagueDetails);

    
    const createNewLeague = async (event) => {
        event.preventDefault();
        setLoading(true);
        const backendHost = process.env.REACT_APP_BACKEND_HOST;
        try{
            const response = await fetch(`${backendHost}/profile/create-league`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(
                    leagueDetails
                )
            });
            
            const data = await response.json();

            if(!response.ok){
                setLeagueFailMessage(data.message)
                setCreationFailed(true);
                throw new Error(data.message);
                
            }
            else if(response.ok){
                setLeagueID(data.leagueID)
                setCreationFailed(false)
            }

            console.log(data);
        } catch (error){
        console.log("Error while creating league:", error.message)
        handleExpiredJWT(error);
        }
        setLoading(false);
    }

    return(
        <div className='create-league-container'>
            <form className="create-league-form" onSubmit={createNewLeague}>
                <h3>Create a new League</h3>
                <p>Enter league name and click "Create League" to create a new league</p>
                <input 
                className='create-league-input' 
                placeholder="League Name" 
                name="leagueName" onChange={handleChange} 
                type="text" 
                value={leagueDetails.leagueName
                        .split(' ')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}>
                </input>
                <button className='create-league-button'>Create League</button>
                {loading ? <Spinner /> : null}
            </form>
            <div>
                {creationfailed ? <div><p className='create-league-failure'>{leagueFailMessage}</p></div> : null}
                {leagueID ? <div><p className='create-league-success'>LEAGUE CREATED! Your unique league ID is: {leagueID}</p></div> : null}
            </div>
        </div>
    )
}


export default CreateLeague;