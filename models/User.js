const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
//const { JsonWebTokenError } = require('jsonwebtoken');
const jwt=require('jsonwebtoken');

const UserSchema=new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please add a name']
    },
    email:{
        type: String,
        required: [true,'Please add an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
            ]
    },
    contact:{
        type: String,
        required: [true,'Please add a telephone number'],
        unique: true,
        minlength: 10,
        maxlength: 10,
        match: [/^[0-9]{10}$/,'Telephone number should contain only digit']
    },
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true,'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createAt: {
        type: Date,
        default: Date.now
    }
});

//Encrypt password using bcrypt
UserSchema.pre('save',async function(next){
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}

UserSchema.methods.matchPassword=async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// change collection name here
module.exports = mongoose.model('User',UserSchema);