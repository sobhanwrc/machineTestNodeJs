import mongoose from "mongoose"

const Schema = mongoose.Schema

const doctorAvailabilitiesSchema = new Schema({
    doctor_id : { type : Schema.Types.ObjectId, unique : true, required : true},
    start_time : { type : String, required : true},
    end_time : { type : String, required : true},
    no_of_patients : { type : Number, required : true}
},{
    timestamps : true
})

export default doctorAvailabilitiesSchema