import User from "../models/user.js"
import bcrypt from 'bcryptjs'
import generateToken from '../lib/utils.js'
import cloudinary from "../lib/clodinary.js"


//sign Up A NEW USER
export const signup = async(req,res)=>{
    const {email,fullName,password,bio} = req.body

    try {
        if(!email || !fullName || !password || !bio){
          return res.json({success : false , message : "Missing Details"})
        }
        const user = await User.findOne({email})
        if(user){
            return res.json({success : false , message : "Account Already Exits"})
        }
        const salt = await bcrypt.genSalt(10)
        const hasshedPassword = await bcrypt.hash(password,salt)

        const newUser = await User.create({
            fullName, email, password:hasshedPassword, bio
        })

        const token = generateToken(newUser._id)
        res.json({success : true , userData : newUser, token, message : "Account Created Successfully"})
    } catch (error) {
        console.log(error);
        res.json({success : false, message : error.message})
    }
}

//controller to login function
export const login = async(req,res)=>{
    try {
        const {email,password} = req.body
        const userData = await User.findOne({email})
        const isPasswordCorrect = await bcrypt.compare(password,userData.password)

        if(!isPasswordCorrect){
          return res.json({success:false,message:"Invalid Credenials"})
        }
        const token = generateToken(userData._id)
        res.json({success : true , userData, token, message : "Login Successfull"})
    } catch (error) {
        console.log(error);
        res.json({success : false, message : error.message})
    }
}

//controller to check if user is authenticated
export const checkAuth = (req,res)=>{
    res.json({success:true,user: req.user})
}

//controller to update user profile details
export const updateProfile = async(req,res)=>{
    try {
        const {profilePic,bio,fullName} = req.body
        const userId = req.user._id
        let updatedUser

        if(!profilePic){
         await User.findByIdAndUpdate(userId, {bio,fullName}, {new: true})
        }else{
            const upload = await cloudinary.uploader.upload(profilePic)

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
        }
     res.json({success:true,user:updatedUser})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

