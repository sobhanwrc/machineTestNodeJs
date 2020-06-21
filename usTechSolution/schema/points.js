import mongoose from "mongoose"

const Schema = mongoose.Schema

const pointSchema = new Schema({
    matchId : {type : Schema.Types.ObjectId, required : true, ref : 'Match'},
    point : {type : Number, required : true}
},{
    timestamps : true
})

export default pointSchema