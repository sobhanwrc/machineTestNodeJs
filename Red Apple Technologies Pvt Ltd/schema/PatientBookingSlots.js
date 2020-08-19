import mongoose from "mongoose"

const Schema = mongoose.Schema

const patientBookingSlotSchema = new Schema({
    patient_id : { type : Schema.Types.ObjectId, unique : true, required : true},
    doctor_time_slot_id : { type : Schema.Types.ObjectId, unique : true, required : true},
    appointment_date : { type : Date, required : true}
},{
    timestamps : true
})

export default patientBookingSlotSchema