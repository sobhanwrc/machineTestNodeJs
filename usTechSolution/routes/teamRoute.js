import express from "express"
import mongoose from "mongoose"
import teamSchema from "../schema/team"
import playerSchema from "../schema/player"
import matchSchema from "../schema/matches"
import pointSchema from "../schema/points"
import { add } from "lodash"

const Team = mongoose.model('Team', teamSchema)
const Player = mongoose.model('Player', playerSchema)
const Match = mongoose.model('Match', matchSchema)
const Point = mongoose.model('Point', pointSchema)

let app = express.Router()

app.post('/addTeam', async (req, res) => {
    try {
        if(req.files != '' && req.body != ''){
            //Get image extension
            var ext = getExtension(req.files.image.name);

            // The name of the input field (i.e. "image") is used to retrieve the uploaded file
            let sampleFile = req.files.image;

            const file_name = `teamLogo-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

            // Use the mv() method to place the file somewhere on your server
            sampleFile.mv(`public/teamLogo/${file_name}`, async function (err) {
                if (err) {
                    res.json({
                        status: false,
                        statusCode: 500,
                        message: 'Internal error',
                        data: {}
                    });
                } else {
                    const addTeamData = new Team({
                        name : req.body.name,
                        logoUri : file_name
                    })
                    const addResponse = await addTeamData.save()
                    res.json({
                        status : true,
                        statusCode: 200,
                        message: 'Team created Successfully',
                        data: addResponse
                    })
                }
            })
        }else{
            return res.json({
                status : false,
                statusCode : 400,
                message : 'Please select logo.'
            })
        }
    } catch (error) {
        res.json({
            status : false,
            statusCode : 500,
            message : "Internal server error."
        })
    }
})

app.get('/teamLists', async (req, res) => {
    try {
       const lists = await Team.find({},{name : 1, logoUri : 1}).sort({name : 1})
       if(lists.length > 0){
        return res.json({
            status : true,
            statusCode : 200,
            message : `${lists.length} teams found successfully.`,
            data : lists
        })
       }
       res.json({
           status : true,
           statusCode : 200,
           message : "No teams found.",
           data : []
       })
    } catch (error) {
        res.json({
            status : false,
            statusCode : 500,
            message : "Internal server error",
        })
    }
})

app.get('/teamDetail/:teamId', async(req, res) => {
    try {
        const teamId = req.params.teamId
        if(teamId){
        const teamId = req.params.teamId
            const teamDetail = await Team.findById(teamId, {name : 1, logoUri : 1})
            if(teamDetail){
                let responseObj = {}

                //#region find team players
                const playerLists = await Player.find({teamId : teamId}).sort({firstName : 1})
                if(playerLists.length > 0){
                    responseObj = {
                        ...teamDetail.toObject(),
                        playerLists : playerLists
                    }
                }else{
                    responseObj = {
                        ...teamDetail.toObject(),
                        playerLists : []
                    }
                }
                //#endregion

                return res.json({
                    status : true,
                    statusCode : 200,
                    message : "Team detail found successfully.",
                    data : responseObj
                })
            }
            res.json({
                status : true,
                statusCode : 200,
                message : "No team found with this teamId",
                data : {}
            })
        }
    } catch (error) {
        res.json({
            status : false,
            statusCode : 500,
            message : "Internal server error",
        })
    }
})

app.post('/addPlayer', async(req, res) => {
    try {
        if(req.files != '' && req.body != ''){
            //Get image extension
            const ext = getExtension(req.files.playerImage.name);

            // The name of the input field (i.e. "image") is used to retrieve the uploaded file
            const sampleFile = req.files.playerImage;

            const file_name = `playerLogo-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

            // Use the mv() method to place the file somewhere on your server
            sampleFile.mv(`public/playerLogo/${file_name}`, async function (err) {
                if (err) {
                    res.json({
                        status: false,
                        statusCode: 500,
                        message: 'Internal error',
                        data: {}
                    });
                } else {
                    const addPlayerData = new Player({
                        firstName : req.body.firstName,
                        lastName : req.body.lastName,
                        imageUri : file_name,
                        jerseyNumber : req.body.jerseyNumber,
                        country : req.body.country,
                        matches : req.body.matches,
                        run : req.body.run,
                        highestScore : req.body.highestScore,
                        fifties : req.body.fifties,
                        hundreds : req.body.hundreds,
                        teamId : req.body.teamId,
                    })
                    const addResponse = await addPlayerData.save()
                    res.json({
                        status: true,
                        statusCode: 200,
                        message: 'Player created Successfully',
                        data: addResponse
                    })
                }
            })
        }else{
            return res.json({
                status : false,
                statusCode : 400,
                message : 'Please select player image or player description.'
            })
        }
    } catch (error) {
        throw error
        res.json({
            status : false,
            statusCode : 500,
            message : "Internal server error."
        })
    }
})

app.get('/matchLists', async (req, res) => {
    try {
        const listOfMatches = await Match.find()
        .populate('teamOneId')
        .populate('teamTwoId')
        .populate('winnerTeam')
        .sort({name : 1})

        if(listOfMatches.length > 0){
            let finalArray = []
            for(let i = 0; i < listOfMatches.length; i++){
                //#region find point for winning 
                const getPoint = await Point.findOne({matchId : listOfMatches[i]._id})
                //#endregion

                let responseObj = {
                    ...listOfMatches[i].toObject(),
                    point : getPoint.point
                }

                //assign responseObj into an array
                finalArray.push(responseObj)
            }

            return res.json({
                status : true,
                statusCode : 200,
                message : "Match lists found successfully.",
                data : finalArray
            })
        }
        res.json({
            status : true,
            statusCode : 200,
            message : "No matches found.",
            data : []
        })
    } catch (error) {
        res.json({
            status : false,
            statusCode : 500,
            message : "Internal server error."
        }) 
    }
})

app.get('/pointTable', async (req,res) => {
    try {
        const list = await Point.find()
        .populate({path: 'matchId', populate: {path: 'teamOneId'}})
        .populate({path: 'matchId', populate: {path: 'teamTwoId'}})
        .populate({path: 'matchId', populate: {path: 'winnerTeam'}})

        if(list.length > 0){
            res.json({
                status : true,
                statusCode : 200,
                message : "Points found successfully.",
                data : list
            }) 
        }else{

            res.json({
                status : true,
                statusCode : 200,
                message : "No points found.",
                data : []
            }) 
        }
    } catch (error) {
        res.json({
            status : false,
            statusCode : 500,
            message : "Internal server error."
        }) 
    }
})

function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}

module.exports = app