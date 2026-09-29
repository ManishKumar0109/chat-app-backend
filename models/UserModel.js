
import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"passord is required"]
    },
    username:{
        type:String,
        required:[true,"username is required"],
        unique:true

    },
    image:{
        type:String,
        default:"https://www.pngitem.com/pimgs/m/504-5040528_empty-profile-picture-png-transparent-png.png"
    }

},{timestamps:true});

userSchema.pre('save',async function(next){
    if (!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password,10);
})
const User=mongoose.model('User',userSchema);

export default User;