const Appointment = require('../models/Appointment');

const Campground = require('../models/Campground');

//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Public
exports.getAppointments=async (req,res,next)=>{
    let query;
    //General users can see only their appointments!
    if(req.user.role !== 'admin'){
        query=Appointment.find({user:req.user.id}).populate({
            path:'campground',
            select: 'name address contact'
        });
    }else{//If you are an admin, you can see all!
        if(req.params.campgroundId){
            query=Appointment.find({campground:req.params.campgroundId}).populate({
                path:'campground',
                select: 'name address contact'
            });
        } else{
        query=Appointment.find().populate({
            path:'campground',
            select: 'name address contact'
        });
    }
    }
    try {
        const appointments = await query;

        res.status(200).json({
            success:true,
            count:appointments.length,
            data: appointments
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find Appointment"});
    }
};

//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access   Public
exports.getAppointment=async (req,res,next)=>{
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'campground',
            select: 'name description contact'
        });

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success:true,
            data:appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find Appointment"});
    }
};

//@desc     Add appointment
//@route    POST /api/v1/campgrounds/:campgroundId/appointment
//@access   Private
exports.addAppointment=async (req,res,next)=>{
    try {
        console.log(req.params.campgroundId)
        req.body.campground = req.params.campgroundId;

        const campground = await Campground.findById(req.params.campgroundId);

        if(!campground){
            return res.status(404).json({success:false,message:`No campground with the id of ${req.params.campgroundId}`});
        }

        //add user Id to req.body
        req.body.user=req.user.id;
        //Check for existed appointment
        const existedAppointments=await Appointment.find({user:req.user.id});
        for (let i = 0; i < existedAppointments.length; i++) {
            if(req.body.apptDate.split('T')[0] == existedAppointments[i].apptDate.toISOString().split('T')[0]){
                return res.status(400).json({success:false,message:`Cannot reserve in the same date`});
            }

          }
        ////If the user is not an admin, they can only create 3 appointment
        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 appointments`});
        }
        const appointment = await Appointment.create(req.body);

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create Appointment"});
    }
};

//@desc     Update appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment=async (req,res,next)=>{
    try {
        let appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
        }
        appointment = await Appointment.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });

        res.status(200).json({
            success:true,
            data: appointment
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update Appointment"});
    }
};

//@desc     Update appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment=async (req,res,next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`});
        }
        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this bootcamp`});
        }
        await appointment.remove();

        res.status(200).json({
            success:true,
            data: {}
        });
    } catch (error) { 
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Appointment"});
    }
};