const express = require('express');
const router = express.Router();
const authorisation = require('../../middleware/authorisation');

//create league POST route
router.post('/create-league', authorisation, async function (req, res, next){
    const name = req.body.leagueName;
    const userId = req.body.createdBy;

    const newLeague = {league_name: name, created_by: userId}

    console.log(newLeague);

    if(!name || !userId){
        res.status(400).json({ 
        error: true, 
        message: "Missing required fields" });
        return;
    }

    try {
        const leagueName = await req.db
            .from('leagues')
            .select('league_name')
            .where('league_name', '=', name).first()

        if(leagueName){
            res.status(409).json({
                error: true,
                message: 'League name already in use. Please select another league name'
            });
            return
        } else if (!leagueName){
            let databaseCheck;
            let createdLeagueId;
            do{
            createdLeagueId = String(Math.floor(Math.random() * 10000)).padStart(5, '0');

            console.log(createdLeagueId)

            databaseCheck = await req.db 
                .from('leagues')
                .select('id')
                .where('id', '=', createdLeagueId).first();
                console.log('database accessed')
                } while (databaseCheck);

                console.log('do While loop completed');
            
            const leagueToInsert = {id: createdLeagueId, league_name: name, created_by: userId}
        
            const leaguesTableUpdate = await req.db
            .from('leagues')
            .insert(leagueToInsert)

            console.log('Leagues table updated');
            
            const usersLeaguesToInsert = {user_id: userId, league_id: createdLeagueId}

            const usersLeaguesUpdate = await req.db
                .from('user_leagues')
                .insert(usersLeaguesToInsert)
            
            console.log("users_leagues table updated");

            res.status(200).json({
                error: false,
                message: "New League Created",
                leagueID: leagueToInsert.id
            });
        }
    } catch(error){
        res.status(400).json({
        error: true,
        message: 'User details failed to load',
        details: error.message
        })
    }

})


//JOIN LEAGUE ROUTE

router.post('/join-league', authorisation, async function(req, res, next){
    const leagueId = req.body.leagueId;
    const userId = req.body.userId

    if(!leagueId || !userId){
        res.status(400).json({
            error: true,
            message: 'League ID must be entered'
        })
        return;
    }

    try{
        const userLeaguesObject = {user_id: userId, league_id: leagueId}

        const leagueExistance = await req.db
            .from('leagues')
            .where('id', '=', leagueId).first()

        if (!leagueExistance){
            res.status(409).json({
                error: true,
                message: `League id ${leagueId} does not exist`
            })
            return;
        } else if (leagueId){
            const userLeaguesQuery = await req.db
                .from('user_leagues')
                .select('user_id', 'league_id')
                .where('user_id', '=', userId)
                .andWhere('league_id', '=', leagueId).first()

            if(userLeaguesQuery){
                res.status(409).json({
                    error: true,
                    message: `User is already in league: ${leagueId}`
                })
                return;
            } else if(!userLeaguesQuery){
                const userLeaguesEntry = await req.db
                    .from('user_leagues')
                    .insert(userLeaguesObject)
            }

                res.status(200).json({
                    error: false,
                    message: `Congratulations! You have joined league ${leagueId}!`
                })
            }
    } catch(error){
        res.status(400).json({
            error: true,
            message: "Could not add user to league",
            details: error.message
        })
    }
})


//Display Leagues Route

router.get('/display-leagues', authorisation, async function(req, res, next){
    const userId = req.query.userId;
    
    try{
        const leagues = await req.db
            .from('user_leagues')
            .select('league_id')
            .where('user_id', '=', userId)


        if(leagues.length === 0){
            res.status(400).json({
                error: true,
                message: `No leagues associated with user ID: ${userId}`
            })
            return;
        }

        const leagueIds = leagues.map((league) => league.league_id)

        const leagueInfo = await req.db
            .from('leagues')
            .select('*')
            .whereIn('id', leagueIds)

        console.log("Response:", leagueInfo);

        const totalPlayers = await req.db
            .from('user_leagues')
            .select('league_id')
            .count('league_id as number_of_players')
            .whereIn('league_id', leagueIds)
            .groupBy('league_id')

        console.log("Total Players:", totalPlayers )

        const combinedLeagueDetails = leagueInfo.map((league) => {
            const numberOfPlayers = totalPlayers.find((player) => league.id === player.league_id)
            return {...league, 
                    players: numberOfPlayers ? numberOfPlayers.number_of_players : 0
            } 
        })
        console.log(combinedLeagueDetails);

        res.status(200).json(
            combinedLeagueDetails
        )
    } catch (error){
        res.status(500).json({
            error: true,
            message: 'Could not retrieve leagues',
            details: error.message
        })
    }
    
})

// Leave Leage Route

router.delete('/leave-league', authorisation, async function(req, res, next){
    const userId = req.query.userId;
    const leagueId = req.query.leagueId;

    try{ 
        const leaveLeague = await req.db
            .from('user_leagues')
            .delete('*')
            .where('user_Id', '=', userId)
            .andWhere('league_id', '=', leagueId)
            
        res.status(200).json({
            error: false,
            message: `User removed from league ${leagueId}`
        })
    } catch (error){
        res.status(500).json({
            error: true,
            message: `There was an error removing the user from league ${leagueId}: ${error.message}`

        })
    }
})

module.exports = router;