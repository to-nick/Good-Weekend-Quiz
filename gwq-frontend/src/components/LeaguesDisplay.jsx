import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";


function LeaguesDisplay() {

    const [leagueDetails, setLeagueDetials] = useState([]);
    const [leaveLeagueWarning, setLeaveLeagueWarning] = useState(false);
    const [leagueId, setLeagueId] = useState('');
    const [responseFailure, setresponseFailure] = useState(false);
    const [responseSuccess, setResponseSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState('')


    const { userDetails, handleExpiredJWT } = useContext(AuthContext)
    const token = sessionStorage.getItem("token");
    const backendHost = process.env.REACT_APP_BACKEND_HOST;

    const fetchLeagues = useCallback(async () => {    
        console.log('Backend Host:', backendHost)
        try{
            const response = await fetch(`${backendHost}/profile/display-leagues?userId=${userDetails.id}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message)
            }
            setLeagueDetials(data);
        } catch(error){
            console.error("fetch error:", error);
            handleExpiredJWT(error);
        }
    }, [userDetails.id, token, handleExpiredJWT])

    useEffect(() => {
        if (userDetails.id){
            fetchLeagues();
        }
    }, [fetchLeagues, userDetails.id])

    const leaveLeague = async (leagueId) => {
        setLeaveLeagueWarning(true);
        try{
        const deleteResponse = await fetch(`${backendHost}/profile/leave-league?userId=${userDetails.id}&leagueId=${leagueId}`, {
            method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
        });
        const data = await deleteResponse.json();

        console.log(data);
        setResponseMessage(data.message)

        if(!deleteResponse.ok){
            setresponseFailure(true)
            return
        } else if(deleteResponse.ok){
            setResponseSuccess(true)
            
        }
        } catch (error){
            console.error('Unable to remove player from the league:', error.message)
            setLeaveLeagueWarning(false)
        }
    }

    const closeMessage = () =>{
        setResponseSuccess(false);
        setresponseFailure(false);
        setLeaveLeagueWarning(false);
    }

    return(
        <div className='leagues-container'>
            <h3>Your leagues:</h3>
            {leaveLeagueWarning ? (
                <div className="leave-league-warning">
                    {responseSuccess || responseFailure ? ( 
                        <>
                        <p>{responseMessage}</p> 
                        <button className="close-button" onClick={() => {closeMessage()}}>Close</button>
                        </>
                    ) : (
                    <>
                        <p>Are you sure you want to leave this league?</p>
                        <div className="leave-league-button-container">
                            <button 
                                onClick={()=>{leaveLeague(leagueId)}}>
                                Yes
                            </button>
                            <button 
                                onClick={()=>{setLeaveLeagueWarning(false)}}>
                                No
                            </button>
                        </div>
                    </>
                    )}
                </div> 
            ) : 
                 null }
            <table className='leagues-table'>
                <thead id="leagues-table-head">
                    <tr>
                        <th>League Name</th> 
                        <th>League ID</th>
                        <th>Number of Players</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leagueDetails ?
                    leagueDetails.map((league, index) => {
                       return <tr key={(index)}>
                                <td>{league.league_name}</td>
                                <td>{league.id}</td>
                                <td>{league.players}</td>
                                <td>
                                    <button 
                                    onClick={()=>{
                                        setLeaveLeagueWarning(true)
                                        setLeagueId(league.id)}} 
                                    className="leave-league-button">
                                    Leave League
                                    </button>
                                </td>
                            </tr>
                    }) : leagueDetails.message}
                </tbody>
            </table>
        </div>
    )
}

export default LeaguesDisplay;