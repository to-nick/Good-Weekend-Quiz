const express = require('express');
const router = express.Router();
const authorisation = require('../../middleware/authorisation');

//POST route to create a new league
router.post('/create-league', authorisation, async function (req, res, next){
    const name = req.body.leagueName;
    const userId = req.body.createdBy;

    const newLeague = {league_name: name, created_by: userId}

    //Handling edge case - all required fields exist
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

        //Handling error if league name is already registered
        if(leagueName){
            res.status(409).json({
                error: true,
                message: 'League name already in use. Please select another league name'
            });
            return;
        //Creating the new league
        } else if (!leagueName){
            let databaseCheck;
            let createdLeagueId;

            //Do while loop to generate a unique number ID to the league. This ensures no duplicate league ID's
            do{
            createdLeagueId = String(Math.floor(Math.random() * 10000)).padStart(5, '0');

            databaseCheck = await req.db 
                .from('leagues')
                .select('id')
                .where('id', '=', createdLeagueId).first();
                } while (databaseCheck);
            
            const leagueToInsert = {id: createdLeagueId, league_name: name, created_by: userId}
        
            //Inserting the new league into the leagues table in the database
            const leaguesTableUpdate = await req.db
            .from('leagues')
            .insert(leagueToInsert)
            
            const usersLeaguesToInsert = {user_id: userId, league_id: createdLeagueId}
            
            //Inserting the data into the user_leagues table
            const usersLeaguesUpdate = await req.db
                .from('user_leagues')
                .insert(usersLeaguesToInsert)
            
            //Responding to the client with the league ID
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


//POST Route to join an existing league

router.post('/join-league', authorisation, async function(req, res, next){
    const leagueId = req.body.leagueId;
    const userId = req.body.userId

    //Handling edge case - all required fields exist
    if(!leagueId || !userId){
        res.status(400).json({
            error: true,
            message: 'League ID must be entered'
        })
        return;
    }

    try{
        const userLeaguesObject = {user_id: userId, league_id: leagueId}
        //Ensuring the league ID provided by the client exists
        const leagueExistance = await req.db
            .from('leagues')
            .where('id', '=', leagueId).first()

        if (!leagueExistance){
            res.status(409).json({
                error: true,
                message: `League id ${leagueId} does not exist`
            })
            return;
        //Ensuring the user is not already in the league
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
            //Adding the user to the league
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


//GET Route to display user leagues on the home profile page

router.get('/display-leagues', authorisation, async function(req, res, next){
    const userId = req.query.userId;
    
    try{
        const leagues = await req.db
            .from('user_leagues')
            .select('league_id')
            .where('user_id', '=', userId)

        //Handling error - user is not part of any leagues yet
        if(leagues.length === 0){
            res.status(400).json({
                error: true,
                message: `No leagues associated with user ID: ${userId}`
            })
            return;
        }

        //Mapping all league ID's to get data on each of them
        const leagueIds = leagues.map((league) => league.league_id)

        const leagueInfo = await req.db
            .from('leagues')
            .select('*')
            .whereIn('id', leagueIds)

        //Calculating total number of players in each league
        const totalPlayers = await req.db
            .from('user_leagues')
            .select('league_id')
            .count('league_id as number_of_players')
            .whereIn('league_id', leagueIds)
            .groupBy('league_id')

        console.log("Total Players:", totalPlayers )

        //Combining the two objects to create the response object
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

// DELETE Route for leaving a league
router.delete('/leave-league', authorisation, async function(req, res, next){
    const userId = req.query.userId;
    const leagueId = req.query.leagueId;
    //deleting the user from the user_leagues table. this will cause a cascade on the database to remove other instances of the user in  the provided league
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