const express = require('express');
const router = express.Router();
const authorisation = require('../../middleware/authorisation');

//GET route for retreiving weekly and total user scores on the leaderboard page
router.get('/scores', authorisation, async function(req, res, next){
    const leagueId = req.query.leagueId;

    try{
        //Finding all user ID's of users within the requested league
        const leagueParticipants = await req.db
            .from('user_leagues')
            .select('user_id')
            .where('league_id', '=', leagueId)

        //Mapping user ID's to get data on all of them
        const userIds = leagueParticipants.map((userId) => userId.user_id);

        ////Handling edge case - No users in the rquested league
        if (userIds.length === 0) {
            return res.status(409).json({
                error: true,
                message: 'This League has no participants'
            });
        }

        /*Query to find the amount of weekly wins each user has had within their league. The weekly winner is the user who had the most
          correct answers of any user for that week*/
        const weeklyWinsTally = await req.db
            .from('submission')
            .select('player_name', 'user_id')
            .count('* as weekly_wins')
            .whereIn('user_id', userIds)
            .whereIn('week', function (){
                this.select('week')
                    .from('submission')
                    .whereIn('user_id', userIds)
                    .groupBy('week')
                    .havingRaw('MAX(score) = score')
            })
            .groupBy('user_id', 'player_name')
            .orderBy('weekly_wins', 'desc')

        /*Query to find the total score of all users within the selected league. 
          Total scores are the cumulative scores of a user across the whole year*/
        const totalScores = await req.db
            .from('submission')
            .select('player_name', 'user_id')
            .sum('score as totalScore')
            .whereIn('user_id', userIds)
            .groupBy('player_name', 'user_id')
            .orderBy('totalScore', 'desc')

        //Combining the total scores and weekly winner tally's into one object
        const combinedScores = totalScores.map((score) => {
            const weeklyWinsEntry = weeklyWinsTally.find((entry) => entry.user_id === score.user_id);
            console.log('weekly wins entry:', weeklyWinsEntry)
               return {
                ...score,
                weeklyWins: weeklyWinsEntry ? weeklyWinsEntry.weekly_wins : 0
               }
        })

        //Query to find the highest single week score of the year, by a users
        const highScore = await req.db
            .from('submission')
            .select('user_id', 'player_name', 'week', 'score as highScore')
            .whereIn('user_id', userIds)
            .orderBy('score', 'desc')
            .limit(1);
            
        res.status(200).json(
            {
                combinedScores, 
                highScore
            }
        )
    }catch(error){
        res.status(400).json({
            error: true,
            message: 'Could not access scores route',
            details: error
        })
    }
})

//Post route for weekly score submission

router.post('/submit-score', authorisation, async function(req, res, next){
    const weekNumber = req.body.week;
    const userId = req.body.userId;
    const score = req.body.score;
    const players = req.body.players;
    const year = new Date().getFullYear();
    const name = req.body.name;

    ////Handling edge case - all fields completed
    if(!score || !players || !userId || !weekNumber || !year || !name){
        res.status(400).json({
            error: true,
            message: 'All fields must be completed'
        })
        return;
    }

    try{
        const scoreSubmission = {user_id: userId, week: weekNumber, year: year, score: score, number_of_players: players, player_name: name};

        //Ensuring the user has not alredy submitted a score for the current week
        const duplicateCheck = await req.db
            .from('submission')
            .select('*')
            .where({user_id: userId, week: weekNumber})
            .first();

        if(duplicateCheck){
            res.status(409).json({
            error: true,
                message: "User has already submitted a score for this week"
            })
            return;
        }

        //Inserting the score into the database
        const submit = await req.db
            .from('submission')
            .insert(scoreSubmission)

        res.status(200).json({
        error: false,
        message: 'Score submitted!'
    })
    } catch(error){
        res.status(400).json({
            error: true,
            message: "submit route access denied",
            details: error.message
        })
    }
})



module.exports = router;