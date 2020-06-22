import mongoose from "mongoose"

const Schema = mongoose.Schema

const teamSchema = new Schema({
    name : {type : String, required : true},
    logoUri : {type : String, required : true},
    club : {type :String},
    state : { type : String}
},{
    timestamps : true
})

export default teamSchema