import mongoose from "mongoose"

const Schema = mongoose.Schema

const doctorTimeSlotSchema = new Schema({
    doctor_id : { type : Schema.Types.ObjectId, unique : true, required : true},
    doctor_availability_id : { type : Schema.Types.ObjectId, unique : true, required : true},
    slot_start_time : { type : String, required : true},
    slot_end_time : { type : String, required : true},
},{
    timestamps : true
})

export default doctorTimeSlotSchema