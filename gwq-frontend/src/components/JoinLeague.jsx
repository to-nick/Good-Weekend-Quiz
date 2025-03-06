import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";


function JoinLeague(){

    const [joinDetails, setJoinDetails] = useState({leagueId: '', userId: ''})
    const [joinLeagueFailed, setJoinLeaguefailed] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [joinSuccess, setJoinSuccess] = useState(false);

    const { userDetails, handleExpiredJWT } = useContext(AuthContext);
    const token = sessionStorage.getItem("token");

    useEffect(() => {
        if(userDetails.id){
            setJoinDetails((prevDetails) => ({
                ...prevDetails,
                userId: userDetails.id
            }))
        }
    }, [userDetails]);

    const handleChange = (event) => {
        setJoinDetails((prevDetails) => ({
            ...prevDetails,
            [event.target.name]: event.target.value 
        }))
    }

    console.log(joinDetails);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const backendHost = process.env.REACT_APP_BACKEND_HOST;
        try{
            const response = await fetch(`${backendHost}/profile/join-league`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    joinDetails
                )
            });

            const data = await response.json();

            if(!response.ok){
                setJoinLeaguefailed(true);
                setJoinSuccess(false);
                setResponseMessage(data.message);
                throw new Error(data.message)
            } else if(response.ok){
                setJoinSuccess(true);
                setJoinLeaguefailed(false);
                setResponseMessage(data.message);
            }

            setJoinDetails((prevDetails) => ({
                ...prevDetails,
                leagueId: ''
            }));
        } catch(error){
            console.log("There was an error joining the league:", error.message)
            handleExpiredJWT(error);
        }
    }


    return (
        <div className="join-league-container">
            <form className="join-league-form" onSubmit={handleSubmit}>
                <h3>Join a league</h3>
                <p>Enter the ID of the League you would like to join. League ID is provided by the league Admin</p>
                <input className="join-league-input" placeholder="League ID" name="leagueId" onChange={handleChange} type="text" value={joinDetails.leagueId} />
                <button className="join-league-button" >Join League</button>
            </form>
            <div>
            {joinSuccess ? <p className="join-league-success">{responseMessage}</p> : null}
                {joinLeagueFailed ? <p className="join-league-failure">{responseMessage}</p> : null}
            </div>
        </div>
    )
}

export default JoinLeague;