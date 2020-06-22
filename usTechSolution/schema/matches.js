import mongoose from "mongoose"

const Schema = mongoose.Schema

const matchSchema = new Schema({
    matchName : {type : String, required : true},
    matchDate : {type : Date, default : null},
    matchVenue : {type : String, default : null},
    teamOneId : {type : Schema.Types.ObjectId, required : true, ref : 'Team'},
    teamTwoId : {type : Schema.Types.ObjectId, required : true, ref : 'Team'},
    winnerTeam : {type : Schema.Types.ObjectId, required : true, ref : 'Team'},
},{
    timestamps : true
})

export default matchSchema