import mongoose from "mongoose"

const Schema = mongoose.Schema

const playerSchema = new Schema({
    teamId : {type : Schema.Types.ObjectId, default : null},
    firstName : {type : String, required : true},
    lastName : {type : String, required : true},
    imageUri : {type : String, required : true},
    jerseyNumber : {type : Number, required : true},
    country : {type : String, default : ''},
    matches : { type : Number, default : 0},
    run : { type : Number, default : 0},
    highestScore : {type : Number, default : 0},
    fifties : {type : Number, default : 0},
    hundreds : {type : Number, default : 0} 
},{
    timestamps : true
})

export default playerSchema