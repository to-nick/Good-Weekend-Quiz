import { useState, useEffect, useContext, useCallback} from 'react';
import { AuthContext } from '../components/AuthContext';

function Leaderboard (){

    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState();
    const [scoreData, setScoreData] = useState([]);
    const [selectedFormat, setSelectedFormat] = useState('Total Score');
    const [highestScore, setHighestScore] = useState({});

    const { userDetails, handleExpiredJWT } = useContext(AuthContext);
    const token = sessionStorage.getItem('token')


    const fetchLeagues = useCallback(async () => {
        try{
            const leaguesQuery = await fetch(`http://localhost:5010/profile/display-leagues?userId=${userDetails.id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }) 
            const playerLeagues = await leaguesQuery.json();

                if(playerLeagues.length < 1){
                    throw new Error (playerLeagues.message)
                }

                console.log(playerLeagues);
                setLeagues(playerLeagues);
        } catch(error){
            console.log('failed to fetch leagues:', error.message)
            handleExpiredJWT(error);
        }
    }, [userDetails.id, handleExpiredJWT, token])

    useEffect(() => {
        fetchLeagues()
    }, [fetchLeagues, userDetails.id])



    const handleLeagueChange = (event) => {
        setSelectedLeague(event.target.value)
    }

    const handleFormatChange = (event) => {
        setSelectedFormat(event.target.value)
    }

    const fetchLeagueData = useCallback(async () => {
        try{
            const leagueDataQuery = await fetch(`http://localhost:5010/data/scores?leagueId=${selectedLeague}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if(!leagueDataQuery.ok){
                throw new Error(leagueDataQuery.message)
            }
            
            const data = await leagueDataQuery.json();
            console.log(data);
            const scores = data.combinedScores;
            
            const highScore = data.highScore[0];
            setHighestScore(highScore);
            setScoreData(scores);
        } catch(error){
            console.log('Failed to fetch leaderboard:', error.message);
            handleExpiredJWT(error);
        }
    }, [selectedLeague, token, handleExpiredJWT])

        console.log(scoreData);
            
    

    useEffect(() =>{
        if(selectedLeague){
            fetchLeagueData()
        }
        },[fetchLeagueData, selectedLeague])

    const sortedScores = [...scoreData].sort((a, b) => {
        const aScore = selectedFormat === 'Total Score' ? a.totalScore : a.weeklyWins;
        const bScore = selectedFormat === 'Total Score' ? b.totalScore : b.weeklyWins;
        return bScore - aScore;
    });

    return(
        <div className='page-container'>
            <div className='leaderboard-container'>
                <div className='page-heading'>
                    <h1 className='page-title'>LEADERBOARD</h1>
                </div>
                <div className='leaderboard-and-highscore'>
                    <div className='dropdown-and-table-container'>
                        <div className='dropdown-container'>
                            <select className='dropdown' onChange={handleLeagueChange}>
                                {leagues.length > 0 ? (
                                    <>
                                        <option value='' >--Select a league--</option> 
                                        {leagues.map((league, index) => {
                                            return <option key={index} value={league.id}>{league.league_name}</option>
                                        })}
                                    </>
                                )
                                    : 
                                    <option value='' >--Select a league--</option> }
                            </select>
                            <select className="dropdown" onChange={(handleFormatChange)}>
                                <option value={'Total Score'}>Total Score</option>
                                <option value={'Weekly Wins'}>Weekly Wins</option>
                            </select>
                        </div>
                            <table className='leaderboard-table'>
                                <thead id="leaderboard-table-head" className='leaderboard-table-head'>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedScores.map((score, index) => {
                                    return <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{score.player_name}</td>
                                                    <td>{selectedFormat === 'Total Score' ? score.totalScore : score.weeklyWins}</td>
                                            </tr>
                                            })}
                                    </tbody>
                            </table>
                            {leagues.length > 0 ? null : <p className='join-league-warning'>You must join or create a league to display the leaderboard</p>}
                    </div>
                    <div className='highscore-container'>
                        <h2>Highest single score of 2024:</h2>
                        <h3>{highestScore.player_name}</h3>
                        <p className='highscore-week'>{highestScore.week}</p>
                        <p className='highscore-score'>{highestScore.highScore}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Leaderboard;