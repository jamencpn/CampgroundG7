const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    address:{
        type: String,
        required : [true,'Please add an address']
    },
    contact:{
        type: String,
        required : [true,'Please add a number']
    },
    url:{
        type: String
    },
    province:{
        type: String,
        required : [true,'Please add an province']
    },
    region:{
        type: String,
        required : [true,'Please add an region']
    }
}, {
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
});

// const HospitalSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Please add a name'],
//         unique: true,
//         trim:true,
//         maxlength:[50,'Name can not be more than 50 characters']
//     },
//     address:{
//         type: String,
//         required : [true,'Please add an address']
//     },
//     district:{
//         type: String,
//         required : [true,'Please add a district']
//     },
//     province:{
//         type: String,
//         required : [true,'Please add an province']
//     },
//     postalcode:{
//         type: String,
//         required : [true,'Please add a postalcode'],
//         maxlength:[5,'Postal Code can not be more than 5 digits']
//     },
//     tel:{
//         type: String
//     },
//     region:{
//         type: String,
//         required : [true,'Please add an region']
//     }
// }, {
//     toJSON: {virtuals:true},
//     toObject:{virtuals:true}
// });

//Cascade delete appointments when a camground is deleted

CampgroundSchema.pre('remove',async function(next){
    console.log(`Appointments being removed from campground ${this._id}`);
    await this.model('Appointment').deleteMany({camground: this._id});
    next();
});

//Reverse populate with virtuals
CampgroundSchema.virtual('appointments',{
    ref: 'Appointment',
    localField: '_id',
    foreignField:'camping',
    justOne:false
});

module.exports=mongoose.model('Camping',CampgroundSchema);