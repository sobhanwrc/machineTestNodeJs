import express from "express"
import mongoose from "mongoose"
import teamSchema from "../schema/team"
import playerSchema from "../schema/player"

const Team = mongoose.model('Team', teamSchema)
const Player = mongoose.model('Player', playerSchema)

let app = express.Router()

app.get('/teamLists', async (req, res) => {
    try {
       const lists = await Team.find().sort({name : 1})
       if(lists.length > 0){
        res.send({
            status : true,
            statusCode : 200,
            message : `${lists.length} teams found successfully.`,
            data : lists
        })
       }
       res.send({
           status : true,
           statusCode : 200,
           message : "No teams found.",
           data : []
       })
    } catch (error) {
        res.send({
            status : false,
            statusCode : 500,
            message : "Internal server error",
        })
    }
})

app.get('/teamDetail', async(req, res) => {
    try {
        const teamId = req.params.teamId
        if(teamId){
        const teamId = req.params.teamId
            const teamDetail = await Team.findById(teamId)
            if(teamDetail){
                let responseObj = {}

                //#region find team players
                const playerLists = await Player.find({teamId : teamId}).sort({firstName : 1})
                if(playerLists.length > 0){
                    responseObj = {
                        ...teamDetail,
                        playerLists : playerLists
                    }
                }
                //#endregion

                responseObj = {
                    ...teamDetail,
                    playerLists : []
                }

                res.send({
                    status : true,
                    statusCode : 200,
                    message : "Team detail found successfully.",
                    data : responseObj
                })
            }
            res.send({
                status : true,
                statusCode : 200,
                message : "No team found with this teamId",
                data : {}
            })
        }
    } catch (error) {
        res.send({
            status : false,
            statusCode : 500,
            message : "Internal server error",
        })
    }
})

module.exports = app