import mongoose, { model } from "mongoose"

const Schema = mongoose.Schema

const doctorSchema = new Schema({
    name : {type : String, required : true}
},{
    timestamps : true
})

module.exports = mongoose.model('Doctor', doctorSchema)