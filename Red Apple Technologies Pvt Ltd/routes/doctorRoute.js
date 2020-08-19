import express from "express"
import mongoose from "mongoose"
import moment from "moment"
import doctorAvailabilitiesSchema from "../schema/DoctorAvailabilities"
import doctorTimeSlotSchema from "../schema/DoctorTimeSlots"
import patientBookingSlotSchema from "../schema/PatientBookingSlots";

let app = express.Router()

const Doctor_Availability = mongoose.model('Doctor_Availability', doctorAvailabilitiesSchema)
const Doctor_Time_Slot = mongoose.model('Doctor_Time_Slot', doctorTimeSlotSchema)
const Patient_Booking_Slot = mongoose.model('', patientBookingSlotSchema)

app.post('/doctor_availabilities', async(req, res) => {
    try {
        //#region required field validation
        if(req.body.doctor_id === '' || req.body.doctor_id === undefined || req.body.doctor_id === null){
            return res.json({
                status : 403,
                error : {
                    message : "doctor_id is required"
                }
            })
        }

        if(req.body.start_time === '' || req.body.start_time === undefined || req.body.start_time === null){
            return res.json({
                status : 403,
                error : {
                    message : "start_time is required"
                }
            })
        }

        if(req.body.end_time === '' || req.body.end_time === undefined || req.body.end_time === null){
            return res.json({
                status : 403,
                error : {
                    message : "end_time is required"
                }
            })
        }

        if(req.body.no_of_patients === '' || req.body.no_of_patients === undefined || req.body.no_of_patients === null){
            return res.json({
                status : 403,
                error : {
                    message : "no_of_patients is required"
                }
            })
        }
        //#endregion

        const isExist = await Doctor_Availability.findOne({doctor_id : req.body.doctor_id})
        if(isExist){
            return res.json({
                status : 200,
                message : "Already exist.",
                data : {}
            })
        }
        /**save doctor availabilities */
        const addDoctorAvailabilities = await Doctor_Availability.create(req.body)

        if(addDoctorAvailabilities){
            //#region  time conversation
            // start time and end time
            const startTime = moment(req.body.start_time, "HH:mm a");
            const endTime = moment(req.body.end_time, "HH:mm a");
            console.log(startTime,'startTime', endTime, 'endTime')

            // calculate total duration
            const duration = moment.duration(endTime.diff(startTime));

            const durationInMinute = parseInt(moment.duration(duration).asMinutes())
            const slotDuration = parseInt(durationInMinute / Number(req.body.no_of_patients))
            //#endregion

            /**save doctor time slot based on availabilities */
            //#region get time slot
            let x = {
                nextSlot: slotDuration,
                breakTime: [
                    ['00:00', '00:00']
                ],
                startTime: req.body.start_time,
                slotEndTime: req.body.end_time
            };
            
            let slotStartTime = moment(x.startTime, "hh:mm a");
            let slotEndTime = moment(x.slotEndTime, "hh:mm a");
            
            function isInBreak(slotStartTime, breakTimes) {
                return breakTimes.some((br) => {
                  return slotStartTime >= moment(br[0], "hh:mm a") && slotStartTime < moment(br[1], "hh:mm a");
              });
            }

            let times = [];
            while (slotStartTime <= slotEndTime)
            {
                if (!isInBreak(slotStartTime, x.breakTime)) {
                    times.push(slotStartTime.format("hh:mm a"));
                }
                slotStartTime = slotStartTime.add(x.nextSlot, 'minutes');
            }

            //#endregion

            if(times.length > 0){
                for(let i = 0; i < times.length; i++){
                    if(times[i + 1] != undefined){
                        let addDoctorTimeSlotData = new Doctor_Time_Slot({
                            doctor_id : req.body.doctor_id,
                            doctor_availability_id : addDoctorAvailabilities._id,
                            slot_start_time : times[i],
                            slot_end_time : times[i + 1] != undefined ? times[i + 1] : req.body.end_time
                        })
    
                        await addDoctorTimeSlotData.save()
                    }

                    if(times.length === i){
                        break;
                    }
                }
            }

            /**end */
            return res.json({
                status : 200,
                message : "Added successfully.",
                data : addDoctorAvailabilities
            })
        }
    } catch (error) {
        console.log(error, 'error')
        return res.json({
            status : 500,
            error : {
                message : "Something went wrong."
            }
        })
    }
})

app.post('/availableSlots', async(req, res) => {
    try {
        //#region field validation
        if(req.body.appointment_date === '' || req.body.appointment_date === undefined || req.body.appointment_date === null){
            return res.json({
                status : 403,
                error : {
                    message : "appointment_date is required"
                }
            })
        }

        if(req.body.doctor_id === '' || req.body.doctor_id === undefined || req.body.doctor_id === null){
            return res.json({
                status : 403,
                error : {
                    message : "doctor_id is required"
                }
            })
        }

        if(req.body.doctor_time_slot_id === '' || req.body.doctor_time_slot_id === undefined || req.body.doctor_time_slot_id === null){
            return res.json({
                status : 403,
                error : {
                    message : "doctor_time_slot_id is required"
                }
            })
        }

        if(req.body.no_of_patients === '' || req.body.no_of_patients === undefined || req.body.no_of_patients === null){
            return res.json({
                status : 403,
                error : {
                    message : "no_of_patients is required"
                }
            })
        }
        //#endregion

        const fetchListOfAvailableSots = await Doctor_Time_Slot.find({doctor_id : req.body.doctor_id, _id : {
            $ne : req.body.doctor_time_slot_id
        }})

        if(fetchListOfAvailableSots.length > 0){
            return res.json({
                status : 200,
                message : `${fetchListOfAvailableSots.length} slots available.`,
                data : fetchListOfAvailableSots
            })
        }else{
            return res.json({
                status : 200,
                message : "No slots available.",
                data : []
            })
        }
    } catch (error) {
        console.log(error, 'error')
        return res.json({
            status : 500,
            error : {
                message : "Something went wrong."
            }
        })
    }
})

module.exports = app