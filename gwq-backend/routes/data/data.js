const express = require('express');
const router = express.Router();
const authorisation = require('../../middleware/authorisation');

//GET route for score retrieval

router.get('/scores', authorisation, async function(req, res, next){
    const leagueId = req.query.leagueId;

    try{

        const leagueParticipants = await req.db
            .from('user_leagues')
            .select('user_id')
            .where('league_id', '=', leagueId)

        const userIds = leagueParticipants.map((userId) => userId.user_id);

        console.log('league participants:', userIds);

        if (userIds.length === 0) {
            return res.status(409).json({
                error: true,
                message: 'This League has no participants'
            });
        }

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

            console.log('Weekly wins:', weeklyWinsTally)


        const totalScores = await req.db
            .from('submission')
            .select('player_name', 'user_id')
            .sum('score as totalScore')
            .whereIn('user_id', userIds)
            .groupBy('player_name', 'user_id')
            .orderBy('totalScore', 'desc')

            console.log('total scores:', totalScores);

        const combinedScores = totalScores.map((score) => {
            const weeklyWinsEntry = weeklyWinsTally.find((entry) => entry.user_id === score.user_id);
            console.log('weekly wins entry:', weeklyWinsEntry)
               return {
                ...score,
                weeklyWins: weeklyWinsEntry ? weeklyWinsEntry.weekly_wins : 0
               }
        })

            console.log('Combined scores:', combinedScores)

        const highScore = await req.db
            .from('submission')
            .select('user_id', 'player_name', 'week', 'score as highScore')
            .whereIn('user_id', userIds)
            .orderBy('score', 'desc')
            .limit(1);
            
        console.log('High Score:', highScore)

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

//Post route for score submission

router.post('/submit-score', authorisation, async function(req, res, next){
    const weekNumber = req.body.week;
    const userId = req.body.userId;
    const score = req.body.score;
    const players = req.body.players;
    const year = new Date().getFullYear();
    const name = req.body.name;

    if(!score || !players || !userId || !weekNumber || !year || !name){
        res.status(400).json({
            error: true,
            message: 'All fields must be completed'
        })
        return;
    }

    try{
        const scoreSubmission = {user_id: userId, week: weekNumber, year: year, score: score, number_of_players: players, player_name: name};

        console.log(scoreSubmission);

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