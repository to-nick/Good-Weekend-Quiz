import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";


function LeaguesDisplay() {

    const [leagueDetails, setLeagueDetials] = useState([]);


    const { userDetails, handleExpiredJWT } = useContext(AuthContext)
    const token = sessionStorage.getItem("token");

    const fetchLeagues = useCallback(async () => {

        try{
            const response = await fetch(`http://localhost:5010/profile/display-leagues?userId=${userDetails.id}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();

            console.log(data);

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

    return(
        <div className='leagues-container'>
            <h3>Your leagues:</h3>
            <table className='leagues-table'>
                <thead id="leagues-table-head">
                    <tr>
                        <th>League Name</th>
                        <th>League ID</th>
                        <th>Number of Players</th>
                    </tr>
                </thead>
                <tbody>
                    {leagueDetails ?
                    leagueDetails.map((league, index) => {
                       return <tr key={(index)}>
                                <td>{league.league_name}</td>
                                <td>{league.id}</td>
                                <td>{league.players}</td>
                            </tr>
                    }) : leagueDetails.message}
                </tbody>
            </table>
        </div>
    )
}

export default LeaguesDisplay;