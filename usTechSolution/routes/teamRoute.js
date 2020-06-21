import express from "express"
import mongoose from "mongoose"
import teamSchema from "../schema/team"
import playerSchema from "../schema/player"
import matchSchema from "../schema/matches"
import pointSchema from "../schema/points"

const Team = mongoose.model('Team', teamSchema)
const Player = mongoose.model('Player', playerSchema)
const Match = mongoose.model('Match', matchSchema)
const Point = mongoose.model('Point', pointSchema)

let app = express.Router()

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

module.exports = app